import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BookOpen, Star, BarChart3, Calendar, ListFilter, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getResponseList = (item) => {
  if (Array.isArray(item?.responses_out)) return item.responses_out;
  if (Array.isArray(item?.responses)) return item.responses;
  return [];
};

const getResponseCode = (resp) => String(resp?.question_code || resp?.question || '').trim().toLowerCase();

const getResponseQuestion = (resp, idx) => {
  return String(resp?.question_text || resp?.question || `Question ${idx + 1}`).trim();
};

const getResponseGroup = (resp) => {
  const code = getResponseCode(resp);

  // Keep overall questions aligned with their paired explanation prompts.
  if (
    code === 'overall_instructor' ||
    code === 'overall_modules' ||
    code.startsWith('explain_') ||
    code.includes('comment')
  ) {
    return 'Overall Rating & Comments';
  }

  if (code.startsWith('learn_') || code.includes('instructor')) return 'Instructor Effectiveness';
  if (code.includes('module')) return 'Course Content & Materials';
  return 'General Feedback';
};

const ratingLabel = (rating, max) => {
  if (!rating) return '';
  if (max === 10) return `${rating}/10`;
  if (max === 4) {
    if (rating === 4) return 'Rating: Almost Always';
    if (rating === 3) return 'Rating: Often';
    if (rating === 2) return 'Rating: Sometimes';
    return 'Rating: Rarely';
  }
  if (rating >= 5) return 'Strongly Agree';
  if (rating === 4) return 'Agree';
  if (rating === 3) return 'Neutral';
  if (rating === 2) return 'Disagree';
  return 'Strongly Disagree';
};

const getRatingMax = (resp) => {
  const code = getResponseCode(resp);
  if (code === 'overall_instructor' || code === 'overall_modules') return 10;
  if (code.startsWith('learn_')) return 4;
  const value = Number(resp?._rating || resp?.rating || 0);
  return value > 5 ? 10 : 5;
};

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    fetch(`${API_BASE_URL}/feedback/history/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setHistoryData(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setHistoryData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = historyData.length;
  const averageRating =
    total > 0
      ? (
          historyData
            .map((r) =>
              Array.isArray(r.responses_out)
                ? r.responses_out
                    .filter((q) => typeof q.rating === 'number')
                    .reduce((sum, q) => sum + q.rating, 0)
                : 0
            )
            .reduce((a, b) => a + b, 0) / total
        ).toFixed(2)
      : 'N/A';

  const stats = [
    { title: 'Total Evaluations', value: total, sub: 'All time submissions', icon: BookOpen },
    { title: 'Average Rating', value: averageRating, sub: 'Your average score', icon: Star },
    { title: 'Completion Rate', value: total > 0 ? '100%' : '0%', sub: 'On-time submissions', icon: BarChart3 },
    { title: 'This Semester', value: '-', sub: 'Evaluations complete', icon: Calendar },
  ];

  const filteredHistory = historyData.filter((item) => {
    if (activeTab === 'all') return true;
    return activeTab === 'modules'
      ? item.form_type === 'module'
      : item.form_type === 'instructor';
  });

  const openDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setIsDetailsOpen(false);
  };

  const detailResponses = getResponseList(selectedItem);
  const groupedResponses = detailResponses.reduce((acc, resp, idx) => {
    const group = getResponseGroup(resp);
    if (!acc[group]) acc[group] = [];
    acc[group].push({
      ...resp,
      _idx: idx,
      _question: getResponseQuestion(resp, idx),
      _rating: Number(resp?.rating) || 0,
      _comment: String(resp?.comment || '').trim(),
    });
    return acc;
  }, {});

  const instructorOverall = detailResponses.find((r) => getResponseCode(r).includes('overall_instructor'));
  const moduleOverall = detailResponses.find((r) => getResponseCode(r).includes('overall_modules'));

  const detailDate = selectedItem?.submitted_at
    ? new Date(selectedItem.submitted_at).toLocaleDateString()
    : 'N/A';

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5 mt-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          fill={i < Math.floor(rating) ? "#fbbf24" : "none"} 
          className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"} 
        />
      ))}
      <span className="text-xs text-gray-500 ml-1 font-medium">{rating}/5</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="student" activeItem="history" onLogout={() => {}} />

        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="container mx-auto max-w-6xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-[#1f474d] tracking-tight">Evaluation History</h1>
              <p className="text-slate-500 mt-1">View your submitted evaluations and feedback</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-600 font-medium text-sm">{stat.title}</h3>
                    <div className="p-1.5 bg-slate-100 rounded-lg text-[#1f474d]">
                      <stat.icon size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Tab Navigation (Based on Image 1) */}
            <div className="mb-8">
              <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-full border border-slate-200 shadow-inner">
                {['all', 'modules', 'instructors'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                      activeTab === tab 
                        ? "bg-white text-[#1f474d] shadow-sm ring-1 ring-slate-200" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab} {tab === 'all' ? `(${historyData.length})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div>Loading…</div>
              ) : (
                filteredHistory
                  .map((item, idx) => {
                    const date = item.submitted_at
                      ? new Date(item.submitted_at).toLocaleDateString()
                      : '';
                      const respList =
                        Array.isArray(item.responses_out)
                          ? item.responses_out
                          : Array.isArray(item.responses)
                          ? item.responses
                          : [];

                      const overall =
                        respList.length > 0
                          ? (
                              respList
                                .filter((q) => typeof q.rating === 'number')
                                .reduce((sum, q) => sum + q.rating, 0) /
                              respList.filter((q) => typeof q.rating === 'number').length
                            ).toFixed(1)
                          : 0;

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-500 font-bold uppercase">
                            {item.form_code}
                          </span>
                          <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-bold flex items-center gap-1 uppercase">
                            <CheckCircle size={10} /> Reviewed
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800">
                          {item.form_label || item.form_model || item.form_id || ''}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">{item.form_description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Overall Rating
                            </span>
                            <StarRating rating={overall} />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-medium">
                          <span>{date}</span>
                          <span>•</span>
                          <span>{/* semester if you have it */}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1f474d] text-white rounded-lg font-bold hover:bg-[#2a5d65] transition-colors"
                        >
                          <ListFilter size={16} />
                          View Details
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </main>
      </div>

      {isDetailsOpen && selectedItem && (
        <div className="fixed inset-0 z-[9999] bg-black/45 flex items-center justify-center p-4" onClick={closeDetails}>
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-500 font-bold uppercase">
                    {selectedItem.form_code}
                  </span>
                  <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-bold uppercase">
                    Reviewed
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{selectedItem.form_label || 'Evaluation Details'}</h3>
                <p className="text-slate-500 mt-1">{selectedItem.form_instructor || 'N/A'} • Submitted on {detailDate}</p>
              </div>
              <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-700" onClick={closeDetails}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="text-sm text-slate-500">Overall Course Rating</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{moduleOverall?.rating ? `${moduleOverall.rating}/10` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Instructor Rating</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{instructorOverall?.rating ? `${instructorOverall.rating}/10` : 'N/A'}</p>
                </div>
              </div>

              <h4 className="text-xl font-semibold text-slate-900 mb-4">Detailed Responses</h4>
              <div className="space-y-6">
                {Object.entries(groupedResponses).map(([groupName, responses]) => (
                  <div key={groupName}>
                    <h5 className="text-lg font-semibold text-slate-800 mb-3">{groupName}</h5>
                    <div className="space-y-4">
                      {responses.map((resp) => {
                        const max = getRatingMax(resp);
                        const isLearningScale = max === 4;
                        return (
                          <div key={`${groupName}-${resp._idx}`} className="rounded-xl border border-slate-200 p-4">
                            <p className="text-slate-800 font-medium">{resp._question}</p>

                            {resp._rating > 0 && (
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isLearningScale && (
                                    <span className="text-xs font-semibold text-slate-500 mr-1">Rarely</span>
                                  )}
                                  {Array.from({ length: max }, (_, i) => {
                                    const value = i + 1;
                                    const selected = value === resp._rating;
                                    return (
                                      <span
                                        key={value}
                                        className={`w-8 h-8 rounded-md text-xs font-bold inline-flex items-center justify-center border ${
                                          selected
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'
                                        }`}
                                      >
                                        {value}
                                      </span>
                                    );
                                  })}
                                  {isLearningScale && (
                                    <span className="text-xs font-semibold text-slate-500 ml-1">Almost Always</span>
                                  )}
                                </div>
                                <span className="text-sm text-slate-600 ml-auto text-right whitespace-nowrap">{ratingLabel(resp._rating, max)}</span>
                              </div>
                            )}

                            {resp._comment && (
                              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
                                {resp._comment}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(groupedResponses).length === 0 && (
                  <p className="text-slate-500">No saved responses found for this submission.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Helper Component for Icon Consistency
const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default HistoryPage;