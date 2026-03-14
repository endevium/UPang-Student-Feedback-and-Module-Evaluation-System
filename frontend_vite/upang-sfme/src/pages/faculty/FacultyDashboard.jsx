import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Users, Star, TrendingUp, MessageSquare, ChevronRight } from 'lucide-react';
import { getAccessToken, getUser } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const FacultyDashboard = () => {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  const [facultyInfo, setFacultyInfo] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (moduleId) => {
    // navigate to module details route if available
    window.history.pushState({}, '', `/faculty/modules/${moduleId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();
    if (!token) return; // already handled by initial auth check

    setFacultyInfo({
      name: user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : user?.email || 'Faculty',
      department: user?.department || '',
      specialization: user?.specialization || '',
      employeeId: user?.employee_id || user?.employeeId || user?.id || null,
      overallRating: null,
      totalEvaluations: null,
      totalStudents: null,
      responseRate: null,
    });

    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/faculty/modules/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load modules (${res.status})`);
        const data = await res.json();

        // Map backend module-assignment objects into the module shape used by this page
        const mapped = (Array.isArray(data) ? data : data.results || []).map((m) => {
          const students = toNumber(m.enrolled_students ?? m.students_count);
          const evaluations = toNumber(m.responses_count);
          const averageRating = m.average_rating == null ? null : Number(m.average_rating);
          const responseRate = students > 0 ? Math.min(100, Math.round((evaluations / students) * 100)) : 0;

          return {
          id: m.module_id || m.id || m.subject_code,
          code: (m.subject_code || '').toUpperCase(),
          name: m.module_name || m.subject_code || 'Untitled',
          semester: m.semester || m.academic_year || '',
          students,
          evaluations,
          averageRating,
          responseRate,
          status: 'active',
        }});

        setModules(mapped);

        const totalStudents = mapped.reduce((sum, module) => sum + module.students, 0);
        const totalEvaluations = mapped.reduce((sum, module) => sum + module.evaluations, 0);
        const ratedModules = mapped.filter((module) => module.averageRating != null);
        const overallRating = ratedModules.length > 0
          ? (ratedModules.reduce((sum, module) => sum + module.averageRating, 0) / ratedModules.length)
          : null;
        const responseRate = totalStudents > 0 ? Math.min(100, Math.round((totalEvaluations / totalStudents) * 100)) : 0;

        setFacultyInfo((prev) => prev ? ({
          ...prev,
          overallRating,
          totalEvaluations,
          totalStudents,
          responseRate,
        }) : prev);
      } catch (err) {
        console.error('FacultyDashboard fetch error', err);
        setError(err.message || 'Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="faculty" activeItem="dashboard" />

        {/* MAIN CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto">
          
          <section className="py-10 px-8">
            <div className="max-w-6xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold text-[#0f2f57] tracking-tight">Welcome, {facultyInfo?.name || 'Faculty'}</h1>
                <p className="text-slate-500 mt-1">{facultyInfo?.department || ''}{facultyInfo?.department && facultyInfo?.specialization ? ' • ' : ''}{facultyInfo?.specialization || ''}</p>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-8 py-8">
            
            {/* OVERALL PERFORMANCE */}
            <div className="mb-12 rounded-2xl border border-[#b6cff2] bg-[#f5f7ff] p-6 md:p-7">
              <h2 className="text-3xl font-bold text-slate-900">Your Overall Performance</h2>
              <p className="text-slate-500 mt-1">Aggregated ratings from all your modules</p>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-stretch">
                <div className="rounded-xl p-2">
                  <p className="text-2xl font-semibold text-slate-800">Overall Rating</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const rating = facultyInfo?.overallRating || 0;
                      return (
                        <Star
                          key={s}
                          size={22}
                          className={s <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-200 text-amber-200'}
                        />
                      );
                    })}
                  </div>
                  <p className="text-5xl font-black text-[#0f2f57] mt-2">
                    {facultyInfo?.overallRating != null ? `${facultyInfo.overallRating.toFixed(1)}/5.0` : '-'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/70 p-6 text-center border border-white/80">
                    <Users className="mx-auto text-blue-600" size={28} />
                    <p className="text-5xl font-black text-[#0f2f57] mt-3">{facultyInfo?.totalStudents ?? '-'}</p>
                    <p className="text-2xl text-slate-700 mt-1">Total Students</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-6 text-center border border-white/80">
                    <MessageSquare className="mx-auto text-emerald-600" size={28} />
                    <p className="text-5xl font-black text-[#0f2f57] mt-3">{facultyInfo?.totalEvaluations ?? '-'}</p>
                    <p className="text-2xl text-slate-700 mt-1">Evaluations</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-6 text-center border border-white/80">
                    <TrendingUp className="mx-auto text-violet-600" size={28} />
                    <p className="text-5xl font-black text-[#0f2f57] mt-3">{facultyInfo?.responseRate ?? 0}%</p>
                    <p className="text-2xl text-slate-700 mt-1">Response Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULES SECTION */}
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Modules</h2>
                <p className="text-slate-500 text-sm mt-1">Select a module to view detailed ratings and feedback</p>
              </div>
              <span className="bg-[#1f474d]/10 text-[#1f474d] px-4 py-1.5 rounded-full text-xs font-bold">
                {modules.length} Active Modules
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {loading ? (
                <div className="col-span-full text-center text-slate-500 py-10">Loading modules...</div>
              ) : error ? (
                <div className="col-span-full text-center text-rose-600 py-10">{error}</div>
              ) : modules.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10">No modules assigned yet.</div>
              ) : modules.map((module) => (
                <div key={module.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-amber-600 font-mono font-bold text-xs tracking-widest">{module.code}</span>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">{module.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{module.semester}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold border border-emerald-200">
                      {module.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Module Average</p>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={18} className={`${s <= Math.floor(module.averageRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-slate-800">{module.averageRating != null ? module.averageRating.toFixed(1) : 'N/A'}</span>
                      <span className="text-slate-400 text-sm font-medium">/ 5.0</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8 text-center border-t border-slate-100 pt-6">
                    <div>
                      <p className="text-xl font-bold text-slate-800">{module.students}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-600">{module.evaluations}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Responses</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-600">{module.responseRate}%</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleViewDetails(module.id)}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-[#1f474d] text-white text-sm font-semibold hover:bg-[#2a5d65] transition-colors"
                  >
                    View Detailed Feedback
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;