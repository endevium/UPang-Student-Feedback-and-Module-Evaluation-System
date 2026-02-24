import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getTokenFromStorage = () => {
  const candidates = ['authToken','token','access','accessToken','jwt'];
  let raw = null;
  for (const k of candidates) {
    const v = sessionStorage.getItem(k) || localStorage.getItem(k);
    if (v) { raw = v; break; }
  }
  if (!raw) return null;
  const maybeObj = safeJsonParse(raw);
  if (maybeObj) {
    if (typeof maybeObj === 'string') raw = maybeObj;
    else if (typeof maybeObj === 'object') raw = maybeObj.token || maybeObj.access || maybeObj.authToken || maybeObj.accessToken || maybeObj.jwt || Object.values(maybeObj)[0] || '';
  }
  raw = String(raw).trim().replace(/^"|"$/g, '');
  if (raw.toLowerCase().startsWith('bearer ')) raw = raw.split(' ').slice(1).join(' ');
  return raw || null;
};

const getAuthHeaders = () => {
  const token = getTokenFromStorage();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLoadError] = useState('');
  const [completedEvaluationsData, setCompletedEvaluationsData] = useState([]);
  const [stats, setStats] = useState({ totalEvaluations: 0, averageRating: null, responseRate: 0, satisfactoryRate: 0 });
  const [evaluationTrend, setEvaluationTrend] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [feedbackResponses, setFeedbackResponses] = useState([]);
  const [moduleFormsById, setModuleFormsById] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleInsightsById, setModuleInsightsById] = useState({});
  const [aiLoadingModuleId, setAiLoadingModuleId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const extractList = (payload) => {
          if (Array.isArray(payload)) return payload;
          if (payload && Array.isArray(payload.results)) return payload.results;
          if (payload && Array.isArray(payload.data)) return payload.data;
          return [];
        };

        const formsRes = await fetch(`${API_BASE_URL}/module-evaluation-forms/`, { headers: getAuthHeaders() });
        if (formsRes.status === 401) {
          setLoadError('Unauthorized: please sign in as department head.');
          setIsLoading(false);
          return;
        }
        const formsPayload = await formsRes.json();
        const forms = extractList(formsPayload);
        if (forms.length === 0 && !Array.isArray(formsPayload)) {
          setLoadError('Unexpected response from server');
          setIsLoading(false);
          return;
        }

        const formsById = forms.reduce((acc, form) => {
          acc[String(form.id)] = form;
          return acc;
        }, {});
        setModuleFormsById(formsById);

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
            setFeedbackResponses(
              allResponses.map((resp) => ({
                ...resp,
                resolved_module_form_id: resolveModuleFormIdFromResponse(resp),
                matched_form: formsById[String(resolveModuleFormIdFromResponse(resp))] || null,
              }))
            );
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

        // Any remaining groups in responsesByForm are forms that were referenced by feedback but not returned in the forms list (e.g., created on feedback submission)
        for (const [k, group] of responsesByForm.entries()) {
          // create a synthetic form object
          const syntheticForm = { id: k, title: `Form ${k}`, subject_code: null, subject_description: null, description: null, created_at: group[0]?.submitted_at || null };
          ctResponses.push({ form: syntheticForm, responses: group });
        }

        // Aggregate
        let totalResponses = 0;
        let totalRatingSum = 0;
        let totalRatingCount = 0;
        let satisfactoryCount = 0;
        const completedList = ctResponses.map(({form, responses}) => {
          // compute average rating for this form
          let sum = 0, cnt = 0;
          for (const r of responses) {
            const respList = Array.isArray(r.responses) ? r.responses : [];
            for (const it of respList) {
              const rv = Number(it.rating);
              if (!isNaN(rv)) { sum += rv; cnt += 1; }
            }
          }
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
          };
        });

        // compute distribution of ratings across all responses
        const ratingBuckets = { very_good: 0, good: 0, fair: 0, poor: 0 };
        for (const {responses} of ctResponses) {
          for (const r of responses) {
            const respList = Array.isArray(r.responses) ? r.responses : [];
            for (const it of respList) {
              const rv = Number(it.rating);
              if (isNaN(rv)) continue;
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

      } catch {
        setLoadError('Unable to reach server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  // derive lists for UI from loaded data
  const departmentData = completedEvaluationsData.slice().sort((a,b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0,5).map(m => ({ name: m.module, rating: m.average_rating || 0 }));

  const topPerformers = completedEvaluationsData.slice().sort((a,b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0,5).map((m, idx) => ({ id: idx+1, name: m.module, department: '', rating: m.average_rating || 0, students: `${m.responses_count} responses` }));

  const performanceIssues = completedEvaluationsData.slice().sort((a,b) => (a.average_rating || 0) - (b.average_rating || 0)).filter(m => m.average_rating !== null).slice(0,5).map((m, idx) => ({ id: idx+1, name: m.module, department: '', rating: m.average_rating || 0, status: 'attention' }));

  const recommendations = performanceIssues.map(p => ({ title: `Review ${p.name}`, description: `Consider targeted actions for ${p.name} (average rating ${p.rating}).` }));

  const getModuleAggregate = (moduleId, moduleMeta) => {
    const moduleKey = String(moduleId);
    const rows = feedbackResponses.filter((resp) => {
      const a = resp?.resolved_module_form_id;
      const b = resp?.form_object_id;
      const c = resp?.form_id;
      return String(a ?? '') === moduleKey || String(b ?? '') === moduleKey || String(c ?? '') === moduleKey;
    });

    let sum = 0;
    let count = 0;
    const comments = [];
    const ratingBreakdown = { very_good: 0, good: 0, fair: 0, poor: 0 };

    for (const row of rows) {
      const respList = Array.isArray(row.responses) ? row.responses : [];
      for (const item of respList) {
        const rv = Number(item?.rating);
        if (!isNaN(rv)) {
          sum += rv;
          count += 1;
          if (rv >= 5) ratingBreakdown.very_good += 1;
          else if (rv >= 4) ratingBreakdown.good += 1;
          else if (rv >= 3) ratingBreakdown.fair += 1;
          else ratingBreakdown.poor += 1;
        }
        const commentText = String(item?.comment || '').trim();
        if (commentText) comments.push(commentText);
      }
    }

    return {
      module_name: moduleMeta?.module || `Form ${moduleKey}`,
      average_rating: count > 0 ? Number((sum / count).toFixed(2)) : null,
      responses_count: rows.length,
      rating_breakdown: ratingBreakdown,
      comments: comments.slice(0, 8),
    };
  };

  const handleShowModuleInsights = async (moduleMeta) => {
    const moduleId = String(moduleMeta.id);

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      return;
    }

    setSelectedModuleId(moduleId);

    if (moduleInsightsById[moduleId]) return;

    const aggregate = getModuleAggregate(moduleId, moduleMeta);
    setAiLoadingModuleId(moduleId);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/module-recommendation/`, {
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4"> Module Evaluations</h3>
            <p className="text-slate-500 text-sm mb-6">List of module evaluations and average ratings</p>
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
                  </div>

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

                        <p className="text-sm font-semibold text-slate-900 mb-2">Gemini AI Recommendation</p>
                        {aiLoadingModuleId === String(ev.id) && <p className="text-xs text-slate-500">Generating recommendation…</p>}
                        {!aiLoadingModuleId && insight?.error_message && (
                          <p className="text-xs text-amber-700 mb-2">{insight.error_message}</p>
                        )}
                        {!aiLoadingModuleId && insight?.recommendation && (
                          <pre className="whitespace-pre-wrap text-xs text-slate-700 bg-white border border-slate-200 rounded-md p-3">{insight.recommendation}</pre>
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

          {/* All Feedback Responses (raw) */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">All Feedback Responses</h3>
            <p className="text-slate-500 text-sm mb-4">Raw records from feedback_responses table</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Form Obj</th>
                    <th className="px-3 py-2">Matched Form</th>
                    <th className="px-3 py-2">Pseudonym / Student</th>
                    <th className="px-3 py-2">Avg Rating</th>
                    <th className="px-3 py-2">Sentiment</th>
                    <th className="px-3 py-2">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackResponses.length === 0 && !isLoading && (
                    <tr><td colSpan="7" className="px-3 py-2 text-slate-500">No feedback responses found.</td></tr>
                  )}
                  {feedbackResponses.map((fr) => {
                    const respList = Array.isArray(fr.responses) ? fr.responses : [];
                    let sum = 0, cnt = 0;
                    for (const it of respList) {
                      const rv = Number(it.rating);
                      if (!isNaN(rv)) { sum += rv; cnt += 1; }
                    }
                    const avg = cnt > 0 ? (sum / cnt).toFixed(1) : '-';
                    return (
                      <tr key={fr.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 align-top">{fr.id}</td>
                        <td className="px-3 py-2 align-top">{fr.form_object_id ?? '-'}</td>
                        <td className="px-3 py-2 align-top">{fr.matched_form?.title || moduleFormsById[String(fr.resolved_module_form_id)]?.title || moduleFormsById[String(fr.form_object_id)]?.title || '-'}</td>
                        <td className="px-3 py-2 align-top">{fr.pseudonym || (fr.student ? String(fr.student) : '-')}</td>
                        <td className="px-3 py-2 align-top">{avg}</td>
                        <td className="px-3 py-2 align-top">{fr.sentiment || '-'}</td>
                        <td className="px-3 py-2 align-top">{fr.submitted_at ? new Date(fr.submitted_at).toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Department Performance</h3>
            <p className="text-slate-500 text-sm mb-6">Average ratings by department</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#e2e8f0' }}
                />
                <Bar dataKey="rating" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Rated Instructors</h3>
              <p className="text-slate-500 text-sm mb-6">Best performing instructors this semester</p>
              <div className="space-y-4">
                {topPerformers.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{instructor.name}</p>
                        <p className="text-xs text-slate-500">{instructor.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{instructor.rating}</p>
                      <p className="text-xs text-slate-500">{instructor.students}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Issues */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
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
