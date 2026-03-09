import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getRatingCategoryFromQuestionId = (questionIdRaw) => {
  const questionId = String(questionIdRaw || '').trim().toLowerCase();
  if (!questionId) return null;

  if (questionId.startsWith('inst_')) return 'Instructor Effectiveness';
  if (questionId.startsWith('content_')) return 'Course Content & Materials';
  if (questionId.startsWith('assess_')) return 'Assessment & Feedback';
  if (questionId.startsWith('env_')) return 'Learning Environment';
  if (questionId === 'overall_rating' || questionId === 'overall_instructor') return 'Overall Rating';

  if (questionId.startsWith('comp_')) return 'Teaching Competence';
  if (questionId.startsWith('method_')) return 'Teaching Methods & Delivery';
  if (questionId.startsWith('engage_')) return 'Student Engagement & Interaction';
  if (questionId.startsWith('feedback_')) return 'Assessment & Feedback';
  if (questionId.startsWith('prof_')) return 'Professionalism & Availability';
  if (questionId === 'overall_recommend') return 'Overall Rating';

  return null;
};

const getTokenFromStorage = () => sessionStorage.getItem('authAccessToken') || sessionStorage.getItem('authToken') || localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || null;

const getAuthHeaders = () => {
  const token = getTokenFromStorage();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const stripMarkdown = (value) => String(value || '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/`(.*?)`/g, '$1')
  .trim();

const parseAiRecommendationSections = (rawText) => {
  const text = String(rawText || '').replace(/\r/g, '').trim();
  if (!text) return [];

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let current = null;

  const headerRegex = /^(?:\d+\)\s*)?(Key Findings|Priority Actions(?:\s*\(.*?\))?|Longer-Term Improvements)\s*:?$/i;

  for (const line of lines) {
    const normalizedLine = stripMarkdown(line).replace(/^[-*•]\s*/, '').trim();
    const headerMatch = normalizedLine.match(headerRegex);

    if (headerMatch) {
      current = {
        title: headerMatch[1],
        items: [],
      };
      sections.push(current);
      continue;
    }

    if (!current) continue;

    const bulletText = stripMarkdown(line).replace(/^[-*•]\s*/, '').trim();
    if (!bulletText) continue;
    current.items.push(bulletText);
  }

  if (sections.length > 0) {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item && !/^\d+\)\s*/.test(item)),
      }))
      .filter((section) => section.items.length > 0);
  }

  const fallbackItems = lines
    .map((line) => stripMarkdown(line).replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line && !/^here are the recommendations/i.test(line));

  return fallbackItems.length
    ? [{ title: 'Recommendation', items: fallbackItems }]
    : [];
};

// Some text/comment responses are stored with rating=0; treat only >=1 as real scored answers.
const toValidRating = (rawRating) => {
  const rating = Number(rawRating);
  return Number.isFinite(rating) && rating >= 1 ? rating : null;
};

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [completedEvaluationsData, setCompletedEvaluationsData] = useState([]);
  const [stats, setStats] = useState({ totalEvaluations: 0, averageRating: null, responseRate: 0, satisfactoryRate: 0 });
  const [evaluationTrend, setEvaluationTrend] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleInsightsById, setModuleInsightsById] = useState({});
  const [aiLoadingModuleId, setAiLoadingModuleId] = useState(null);
  const [blockchainStatusById, setBlockchainStatusById] = useState({});
  const [blockchainLoadingId, setBlockchainLoadingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const extractList = (payload) => {
          if (Array.isArray(payload)) return payload;
          if (payload && Array.isArray(payload.results)) return payload.results;
          if (payload && Array.isArray(payload.data)) return payload.data;
          return [];
        };

        const formsRes = await fetch(`${API_BASE_URL}/module-evaluation-forms/`, { headers: getAuthHeaders() });
        if (formsRes.status === 401) {
          setIsLoading(false);
          return;
        }
        const formsPayload = await formsRes.json();
        const forms = extractList(formsPayload);
        if (forms.length === 0 && !Array.isArray(formsPayload)) {
          setIsLoading(false);
          return;
        }

        const formsById = forms.reduce((acc, form) => {
          acc[String(form.id)] = form;
          return acc;
        }, {});

        const resolveModuleFormIdFromResponse = (resp) => {
          const modelName = String(resp?.form_model || '').toLowerCase();
          if (modelName && modelName !== 'moduleevaluationform') {
            return null;
          }

          const primary = resp?.form_object_id;
          if (primary !== null && primary !== undefined && formsById[String(primary)]) {
            return String(primary);
          }

          const secondary = resp?.form_id;
          if (secondary !== null && secondary !== undefined && formsById[String(secondary)]) {
            return String(secondary);
          }

          const legacy = resp?.form;
          if (legacy !== null && legacy !== undefined) {
            if (typeof legacy === 'object') {
              const legacyId = legacy.id ?? legacy.pk;
              if (legacyId !== null && legacyId !== undefined && formsById[String(legacyId)]) {
                return String(legacyId);
              }
            } else if (formsById[String(legacy)]) {
              return String(legacy);
            }
          }

          return null;
        };

        // Fetch all feedback responses once and group by referenced form id.
        let allResponses = [];
        try {
          const allRes = await fetch(`${API_BASE_URL}/feedback/submissions/`, { headers: getAuthHeaders() });
          if (allRes.ok) {
            const allData = await allRes.json();
            allResponses = extractList(allData);
          }
        } catch {
          // continue with empty responses
          allResponses = [];
        }

        // Prefer form_object_id from response; fall back for compatibility when backend omits it.
        const formKeyFromResp = (r) => resolveModuleFormIdFromResponse(r);

        const responsesByForm = new Map();
        for (const r of allResponses) {
          const key = formKeyFromResp(r);
          if (!key) continue;
          const k = String(key);
          if (!responsesByForm.has(k)) responsesByForm.set(k, []);
          responsesByForm.get(k).push(r);
        }

        // Build ctResponses including forms from API and any extra groups referenced only by responses
        const ctResponses = [];

        for (const f of forms) {
          const key = String(f.id);
          const responses = responsesByForm.get(key) || [];
          ctResponses.push({ form: f, responses });
          // mark used
          if (responsesByForm.has(key)) responsesByForm.delete(key);
        }

        // Aggregate
        let totalResponses = 0;
        let totalRatingSum = 0;
        let totalRatingCount = 0;
        let satisfactoryCount = 0;
        const overallCategoryAccumulator = new Map();
        const completedList = ctResponses.map(({form, responses}) => {
          // compute average rating for this form
          let sum = 0, cnt = 0;
          const comments = [];
          const categoryAccumulator = new Map();
          const ratingBreakdown = { very_good: 0, good: 0, fair: 0, poor: 0 };
          for (const r of responses) {
            const respList = Array.isArray(r.responses) ? r.responses : [];
            for (const it of respList) {
              const rv = toValidRating(it.rating);
              if (rv !== null) {
                sum += rv;
                cnt += 1;

                if (rv >= 5) ratingBreakdown.very_good += 1;
                else if (rv >= 4) ratingBreakdown.good += 1;
                else if (rv >= 3) ratingBreakdown.fair += 1;
                else ratingBreakdown.poor += 1;

                const questionId = it?.question || it?.question_code || it?.question_id;
                const category = getRatingCategoryFromQuestionId(questionId);
                if (category) {
                  const prev = categoryAccumulator.get(category) || { sum: 0, count: 0 };
                  prev.sum += rv;
                  prev.count += 1;
                  categoryAccumulator.set(category, prev);

                  const overallPrev = overallCategoryAccumulator.get(category) || { sum: 0, count: 0 };
                  overallPrev.sum += rv;
                  overallPrev.count += 1;
                  overallCategoryAccumulator.set(category, overallPrev);
                }
              }

              const commentText = String(it?.comment || '').trim();
              if (commentText) comments.push(commentText);
            }
          }

          const category_rates = Array.from(categoryAccumulator.entries())
            .map(([name, v]) => ({
              name,
              rating: v.count > 0 ? Number((v.sum / v.count).toFixed(2)) : 0,
            }))
            .sort((a, b) => b.rating - a.rating);

          const avg = cnt > 0 ? sum / cnt : null;
          totalResponses += responses.length;
          totalRatingSum += sum;
          totalRatingCount += cnt;
          if (avg !== null && avg >= 4) satisfactoryCount += 1;
          return {
            id: form.id,
            module: form.title || form.subject_code || `Form ${form.id}`,
            description: form.subject_description || form.description || '',
            created_at: form.created_at,
            responses_count: responses.length,
            average_rating: avg,
            rating_breakdown: ratingBreakdown,
            category_rates,
            comments: comments.slice(0, 8),
          };
        });

        // compute distribution of ratings across all responses
        const ratingBuckets = { very_good: 0, good: 0, fair: 0, poor: 0 };
        for (const {responses} of ctResponses) {
          for (const r of responses) {
            const respList = Array.isArray(r.responses) ? r.responses : [];
            for (const it of respList) {
              const rv = toValidRating(it.rating);
              if (rv === null) continue;
              if (rv >= 5) ratingBuckets.very_good += 1;
              else if (rv >= 4) ratingBuckets.good += 1;
              else if (rv >= 3) ratingBuckets.fair += 1;
              else ratingBuckets.poor += 1;
            }
          }
        }

        const distTotal = ratingBuckets.very_good + ratingBuckets.good + ratingBuckets.fair + ratingBuckets.poor;
        const dist = [
          { name: 'Very Good', value: distTotal ? Math.round((ratingBuckets.very_good / distTotal) * 100) : 0, color: '#10b981' },
          { name: 'Good', value: distTotal ? Math.round((ratingBuckets.good / distTotal) * 100) : 0, color: '#3b82f6' },
          { name: 'Fair', value: distTotal ? Math.round((ratingBuckets.fair / distTotal) * 100) : 0, color: '#f59e0b' },
          { name: 'Poor', value: distTotal ? Math.round((ratingBuckets.poor / distTotal) * 100) : 0, color: '#ef4444' },
        ];

        // evaluation trend: last 5 forms by created_at with responses_count
        const trend = completedList.slice().sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).slice(-5).map((f) => ({ name: f.module, completion: f.responses_count }));

        setCompletedEvaluationsData(completedList);
        setStats({
          totalEvaluations: forms.length,
          averageRating: totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(2) : null,
          responseRate: forms.length ? Math.round((totalResponses / (forms.length || 1)) * 100) : 0,
          satisfactoryRate: forms.length ? Math.round((satisfactoryCount / (forms.length || 1)) * 100) : 0,
        });
        setEvaluationTrend(trend);
        setRatingDistribution(dist);
      } catch (error) {
        console.error('Failed to load reports data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  // derive lists for UI from loaded data
  const performanceIssues = useMemo(() => (
    completedEvaluationsData
      .slice()
      .sort((a, b) => (a.average_rating || 0) - (b.average_rating || 0))
      .filter((m) => m.average_rating !== null)
      .slice(0, 5)
      .map((m, idx) => ({ id: idx + 1, name: m.module, department: '', rating: m.average_rating || 0, status: 'attention' }))
  ), [completedEvaluationsData]);

  const recommendations = useMemo(() => (
    completedEvaluationsData
      .slice()
      .sort((a, b) => (a.average_rating || 0) - (b.average_rating || 0))
      .filter((m) => m.average_rating !== null)
      .slice(0, 5)
      .map((p) => ({ title: `Review ${p.module}`, description: `Consider targeted actions for ${p.module} (average rating ${p.average_rating || 0}).` }))
  ), [completedEvaluationsData]);

  const handleShowModuleInsights = async (moduleMeta) => {
    const moduleId = String(moduleMeta.id);

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      return;
    }

    setSelectedModuleId(moduleId);

    if (moduleInsightsById[moduleId]) return;

    const aggregate = {
      module_name: moduleMeta?.module || `Form ${moduleId}`,
      average_rating: moduleMeta?.average_rating ?? null,
      responses_count: moduleMeta?.responses_count ?? 0,
      rating_breakdown: moduleMeta?.rating_breakdown || { very_good: 0, good: 0, fair: 0, poor: 0 },
      category_rates: Array.isArray(moduleMeta?.category_rates) ? moduleMeta.category_rates : [],
      comments: Array.isArray(moduleMeta?.comments) ? moduleMeta.comments : [],
    };
    setAiLoadingModuleId(moduleId);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/recommendation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(aggregate),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModuleInsightsById((prev) => ({
          ...prev,
          [moduleId]: {
            aggregate,
            recommendation: data?.recommendation || 'No recommendation available at the moment.',
            source: 'error',
            error_message: data?.detail || 'Unable to generate AI recommendation.',
            sentiment_summary: data?.sentiment_summary || null,
          },
        }));
        return;
      }

      setModuleInsightsById((prev) => ({
        ...prev,
        [moduleId]: {
          aggregate,
          recommendation: data?.recommendation || 'No recommendation available at the moment.',
          source: data?.source || 'gemini',
          error_message: data?.detail || '',
          sentiment_summary: data?.sentiment_summary || null,
        },
      }));
    } catch {
      setModuleInsightsById((prev) => ({
        ...prev,
        [moduleId]: {
          aggregate,
          recommendation: 'No recommendation available at the moment.',
          source: 'error',
          error_message: 'Unable to reach AI service. Please try again.',
        },
      }));
    } finally {
      setAiLoadingModuleId(null);
    }
  };

  const StatCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {unit && <p className="text-xs text-slate-500 mt-1">{unit}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  const handleStoreOnBlockchain = async (moduleMeta) => {
    const moduleId = String(moduleMeta.id);
    const insight = moduleInsightsById[moduleId];

    if (!insight?.recommendation) {
      alert('Please generate the AI recommendation first before storing it on the blockchain.');
      return;
    }

    setBlockchainLoadingId(moduleId);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/store-recommendation-hash/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          module_name: moduleMeta.module,
          recommendation: insight.recommendation,
          average_rating: insight.aggregate?.average_rating ?? null,
          responses_count: insight.aggregate?.responses_count ?? 0,
          rating_breakdown: insight.aggregate?.rating_breakdown || {},
          sentiment_summary: insight.sentiment_summary || {},
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setBlockchainStatusById((prev) => ({
          ...prev,
          [moduleId]: { success: false, message: data?.detail || 'Failed to store on blockchain.' },
        }));
        return;
      }

      setBlockchainStatusById((prev) => ({
        ...prev,
        [moduleId]: {
          success: true,
          already_stored: data.already_stored,
          tx_hash: data.tx_hash,
          hash: data.hash,
          message: data.already_stored
            ? 'Already stored on blockchain.'
            : 'Successfully stored on blockchain.',
        },
      }));
    } catch (err) {
      setBlockchainStatusById((prev) => ({
        ...prev,
        [moduleId]: { success: false, message: err.message || 'Network error.' },
      }));
    } finally {
      setBlockchainLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="depthead" activeItem="reports" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-slate-500 text-sm mt-1">Comprehensive evaluation insights and trends</p>
            </div>
            <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Total Evaluation Forms" 
              value={isLoading ? '…' : stats.totalEvaluations} 
              unit="forms"
              icon={TrendingUp}
              color="bg-yellow-500"
            />
            <StatCard 
              label="Average Rating" 
              value={isLoading ? '…' : (stats.averageRating ?? '-')}
              unit="avg. rating"
              color="bg-green-500"
            />
            <StatCard 
              label="Response Rate" 
              value={isLoading ? '…' : `${stats.responseRate}%`} 
              unit="avg responses per form"
              color="bg-orange-500"
            />
            <StatCard 
              label="Satisfactory Rate" 
              unit="% forms >= 4.0"
              value={isLoading ? '…' : `${stats.satisfactoryRate}%`} 
              color="bg-slate-400"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Evaluation Completion Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Evaluation Completion Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evaluationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                    cursor={{ stroke: '#cbd5e1' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completion" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completed Module Evaluations */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4"> Evaluations</h3>
            <p className="text-slate-500 text-sm mb-6">List of evaluations and average ratings</p>
            <div className="space-y-3">
              {isLoading && <p className="text-slate-500 text-sm">Loading evaluations…</p>}
              {!isLoading && completedEvaluationsData.length === 0 && <p className="text-slate-500 text-sm">No completed evaluations found.</p>}
              {completedEvaluationsData.map((ev) => (
                <div key={ev.id} className="py-3 border-b border-slate-200 last:border-b-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{ev.module}</p>
                      <p className="text-xs text-slate-500">{ev.description || ''} • {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{ev.average_rating !== null && ev.average_rating !== undefined ? ev.average_rating.toFixed(1) : '-'}</p>
                      <p className="text-xs text-slate-500">{ev.responses_count} responses</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleShowModuleInsights(ev)}
                        className="px-3 py-2 text-xs font-medium rounded-md bg-slate-800 text-white hover:bg-slate-700 transition"
                      >
                        {aiLoadingModuleId === String(ev.id)
                          ? 'Generating…'
                          : selectedModuleId === String(ev.id)
                            ? 'Hide Recommendation'
                            : 'View AI Recommendation'}
                      </button>

                      {/* Show blockchain button only when recommendation is available */}
                      {moduleInsightsById[String(ev.id)]?.recommendation && (
                        <button
                          type="button"
                          onClick={() => handleStoreOnBlockchain(ev)}
                          disabled={blockchainLoadingId === String(ev.id)}
                          className="px-3 py-2 text-xs font-medium rounded-md bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-50"
                        >
                          {blockchainLoadingId === String(ev.id)
                            ? 'Storing…'
                            : blockchainStatusById[String(ev.id)]?.success
                              ? '✓ Stored on Chain'
                              : 'Store on Blockchain'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Blockchain status message */}
                  {blockchainStatusById[String(ev.id)] && (
                    <div className={`mt-2 text-xs px-3 py-2 rounded-md ${
                      blockchainStatusById[String(ev.id)].success
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className="font-semibold">
                        {blockchainStatusById[String(ev.id)].message}
                      </span>
                      {blockchainStatusById[String(ev.id)].tx_hash && (
                        <p className="mt-1 font-mono break-all">
                          TX: {blockchainStatusById[String(ev.id)].tx_hash}
                        </p>
                      )}
                      {blockchainStatusById[String(ev.id)].hash && (
                        <p className="mt-1 font-mono break-all">
                          Hash: {blockchainStatusById[String(ev.id)].hash}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedModuleId === String(ev.id) && (() => {
                    const insight = moduleInsightsById[String(ev.id)];
                    const aggregate = insight?.aggregate;
                    const sentimentSummary = insight?.sentiment_summary;
                    const totalRatings = aggregate
                      ? aggregate.rating_breakdown.very_good + aggregate.rating_breakdown.good + aggregate.rating_breakdown.fair + aggregate.rating_breakdown.poor
                      : 0;

                    return (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Aggregated Results</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 mb-3">
                          <p>Average Rating: <span className="font-semibold">{aggregate?.average_rating ?? '-'}</span></p>
                          <p>Total Response Records: <span className="font-semibold">{aggregate?.responses_count ?? '-'}</span></p>
                          <p>Very Good (5): <span className="font-semibold">{aggregate?.rating_breakdown?.very_good ?? 0}</span></p>
                          <p>Good (4): <span className="font-semibold">{aggregate?.rating_breakdown?.good ?? 0}</span></p>
                          <p>Fair (3): <span className="font-semibold">{aggregate?.rating_breakdown?.fair ?? 0}</span></p>
                          <p>Poor (1-2): <span className="font-semibold">{aggregate?.rating_breakdown?.poor ?? 0}</span></p>
                          <p>Rated Items Count: <span className="font-semibold">{totalRatings}</span></p>
                          {sentimentSummary && (
                            <p className="md:col-span-2">
                              Comment Sentiment: <span className="font-semibold">Positive {sentimentSummary.positive ?? 0}</span>, <span className="font-semibold">Neutral {sentimentSummary.neutral ?? 0}</span>, <span className="font-semibold">Negative {sentimentSummary.negative ?? 0}</span>, <span className="font-semibold">Unknown {sentimentSummary.unknown ?? 0}</span>
                            </p>
                          )}
                        </div>

                        {Array.isArray(aggregate?.category_rates) && aggregate.category_rates.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-slate-900 mb-2">Category Ratings</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                              {aggregate.category_rates.map((item) => (
                                <p key={item.name}>
                                  {item.name}: <span className="font-semibold">{item.rating.toFixed(2)}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-sm font-semibold text-slate-900 mb-2">Gemini AI Recommendation</p>
                        {aiLoadingModuleId === String(ev.id) && <p className="text-xs text-slate-500">Generating recommendation…</p>}
                        {!aiLoadingModuleId && insight?.error_message && (
                          <p className="text-xs text-amber-700 mb-2">{insight.error_message}</p>
                        )}
                        {!aiLoadingModuleId && insight?.recommendation && (
                          (() => {
                            const sections = parseAiRecommendationSections(insight.recommendation);

                            if (sections.length === 0) {
                              return (
                                <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-md p-3 whitespace-pre-wrap">
                                  {insight.recommendation}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                {sections.map((section, sectionIdx) => (
                                  <div key={`${section.title}-${sectionIdx}`} className="bg-white border border-slate-200 rounded-md p-3">
                                    <p className="text-xs font-semibold text-slate-900 mb-2">{section.title}</p>
                                    <ul className="space-y-2">
                                      {section.items.map((item, itemIdx) => (
                                        <li key={`${section.title}-${itemIdx}`} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        )}
                        {!aiLoadingModuleId && !insight?.recommendation && (
                          <p className="text-xs text-rose-600">No recommendation available.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Issues */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Review</h3>
              <p className="text-slate-500 text-sm mb-6">Instructors requiring attention</p>
              <div className="space-y-4">
                {performanceIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                        {issue.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{issue.name}</p>
                        <p className="text-xs text-slate-500">{issue.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{issue.rating}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">⚠ Notify</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Actions</h3>
            <p className="text-slate-500 text-sm mb-6">Suggested improvements based on student feedback</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="font-medium text-yellow-900">{rec.title}</p>
                  <p className="text-sm text-yellow-800 mt-2">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
