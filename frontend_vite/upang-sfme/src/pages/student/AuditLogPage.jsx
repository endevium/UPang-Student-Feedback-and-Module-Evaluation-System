import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpenText,
  ClipboardList,
  Gauge,
  LogIn,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getAccessToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const detectGroup = (log) => {
  const category = String(log?.category || '').toUpperCase();
  const action = String(log?.action || '').toUpperCase();
  const message = String(log?.message || '').toUpperCase();
  const text = `${category} ${action} ${message}`;

  if (text.includes('EVAL') || text.includes('FEEDBACK') || text.includes('FORM')) return 'Evaluations';
  if (text.includes('LOGIN') || text.includes('AUTH') || text.includes('OTP') || text.includes('PASSWORD')) return 'Auth';
  if (text.includes('CLASSROOM') || text.includes('ENROLL')) return 'Classroom';
  if (text.includes('PROFILE') || text.includes('ACCOUNT') || text.includes('STUDENT')) return 'Profile';
  return 'System';
};

const groupBadgeColor = (group) => {
  if (group === 'Evaluations') return 'bg-fuchsia-100 text-fuchsia-700';
  if (group === 'Auth') return 'bg-blue-100 text-blue-700';
  if (group === 'Classroom') return 'bg-emerald-100 text-emerald-700';
  if (group === 'Profile') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
};

const statusBadgeColor = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('fail') || value.includes('error') || value.includes('denied')) return 'bg-rose-100 text-rose-700';
  if (value.includes('warn') || value.includes('pending')) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

const StudentAuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchLogs = async () => {
      const token = getAccessToken();
      if (!token) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/audit-logs/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setError(data?.detail || 'Unable to load audit logs.');
          setLogs([]);
          return;
        }

        const list = Array.isArray(data) ? data : data?.results || [];
        setLogs(list);
      } catch {
        setError('Unable to reach server.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const normalizedLogs = useMemo(() => {
    return logs.map((log) => ({
      ...log,
      group: detectGroup(log),
    }));
  }, [logs]);

  const stats = useMemo(() => {
    const evaluationCount = normalizedLogs.filter((log) => log.group === 'Evaluations').length;
    const authCount = normalizedLogs.filter((log) => log.group === 'Auth').length;
    const classroomCount = normalizedLogs.filter((log) => log.group === 'Classroom').length;

    return {
      evaluationCount,
      authCount,
      classroomCount,
      totalCount: normalizedLogs.length,
      profileCount: normalizedLogs.filter((log) => log.group === 'Profile').length,
      systemCount: normalizedLogs.filter((log) => log.group === 'System').length,
    };
  }, [normalizedLogs]);

  const filteredLogs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return normalizedLogs.filter((log) => {
      const matchesTab = activeTab === 'All' || log.group === activeTab;
      const matchesSearch = !search || [
        log?.action,
        log?.message,
        log?.category,
        log?.status,
        log?.ip,
      ].join(' ').toLowerCase().includes(search);

      return matchesTab && matchesSearch;
    });
  }, [normalizedLogs, query, activeTab]);

  const tabs = useMemo(() => ([
    { key: 'All', label: 'All', count: stats.totalCount, icon: ClipboardList },
    { key: 'Evaluations', label: 'Evaluations', count: stats.evaluationCount, icon: BookOpenText },
    { key: 'Auth', label: 'Auth', count: stats.authCount, icon: LogIn },
    { key: 'Classroom', label: 'Classroom', count: stats.classroomCount, icon: Users },
    { key: 'Profile', label: 'Profile', count: stats.profileCount, icon: UserRound },
    { key: 'System', label: 'System', count: stats.systemCount, icon: Gauge },
  ]), [stats]);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="student" activeItem="audit-log" />

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#0f2f57] tracking-tight">Audit Log</h1>
              <p className="text-slate-600 mt-2 text-lg">Welcome back, Student</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <BookOpenText size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Evaluations</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.evaluationCount}</p>
                  <p className="text-xs text-slate-400 mt-2">Evaluation-related events</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <LogIn size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Logins</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.authCount}</p>
                  <p className="text-xs text-slate-400 mt-2">Authentication activities</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Classroom</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.classroomCount}</p>
                  <p className="text-xs text-slate-400 mt-2">Classroom actions logged</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Total Activities</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.totalCount}</p>
                  <p className="text-xs text-slate-400 mt-2">All captured audit entries</p>
                </div>
              </div>
            </div>

            <div className="relative mb-6 bg-white border border-slate-200 rounded-2xl p-4">
              <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities, modules, instructors..."
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              />
            </div>

            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex items-center gap-1 p-1 bg-slate-200/60 rounded-full border border-slate-200 shadow-inner min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-slate-700" />
                <h2 className="text-3xl font-semibold text-slate-900">Activity Timeline</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#020824] text-white font-semibold">{filteredLogs.length} entries</span>
              </div>
              <p className="text-slate-500 mb-5">Chronological list of your system activities</p>

              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading audit logs...</div>
              ) : error ? (
                <div className="text-center py-10 text-rose-600">{error}</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No audit logs found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2">
                          <ClipboardList size={16} className="text-slate-500" />
                          <p className="font-semibold text-slate-900">{log.action || 'Activity'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadgeColor(log.status)}`}>
                            {log.status || 'Success'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${groupBadgeColor(log.group)}`}>
                            {log.group}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-slate-700">{log.message || 'No details provided.'}</p>

                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-4">
                        <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}</span>
                        <span>IP: {log.ip || 'Unknown'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentAuditLogPage;
