import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, ClipboardList, Building2, LogIn, UserRoundCheck, Activity, FileText, Gauge } from 'lucide-react';
import { getAccessToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const detectGroup = (log) => {
  const category = String(log?.category || '').toUpperCase();
  const action = String(log?.action || '').toUpperCase();
  const message = String(log?.message || '').toUpperCase();
  const text = `${category} ${action} ${message}`;

  if (text.includes('ENROLL')) return 'Enroll';
  if (text.includes('CLASSROOM')) return 'Classroom';
  if (text.includes('LOGIN') || text.includes('AUTH') || text.includes('OTP') || text.includes('PASSWORD')) return 'Auth';
  if (text.includes('EVAL') || text.includes('FORM')) return 'Eval';
  return 'System';
};

const groupBadgeColor = (group) => {
  if (group === 'Enroll') return 'bg-emerald-100 text-emerald-700';
  if (group === 'Classroom') return 'bg-fuchsia-100 text-fuchsia-700';
  if (group === 'Auth') return 'bg-blue-100 text-blue-700';
  if (group === 'Eval') return 'bg-violet-100 text-violet-700';
  return 'bg-slate-100 text-slate-700';
};

const FacultyAuditLogPage = () => {
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
        const res = await fetch(`${API_BASE_URL}/audit-logs/faculty/`, {
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
    const classroomCount = normalizedLogs.filter((log) => log.group === 'Classroom').length;
    const authCount = normalizedLogs.filter((log) => log.group === 'Auth').length;
    const enrollCount = normalizedLogs.filter((log) => log.group === 'Enroll').length;

    return {
      classroomCount,
      authCount,
      enrollCount,
      totalCount: normalizedLogs.length,
      evalCount: normalizedLogs.filter((log) => log.group === 'Eval').length,
      systemCount: normalizedLogs.filter((log) => log.group === 'System').length,
    };
  }, [normalizedLogs]);

  const filteredLogs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return normalizedLogs.filter((log) => {
      const matchesTab = activeTab === 'All' || log.group === activeTab;
      const matchesSearch = !search || (
      [log?.action, log?.message, log?.category, log?.status, log?.ip]
        .join(' ')
        .toLowerCase()
        .includes(search)
      );
      return matchesTab && matchesSearch;
    });
  }, [normalizedLogs, query, activeTab]);

  const tabs = useMemo(() => ([
    { key: 'All', label: 'All', count: stats.totalCount, icon: ClipboardList },
    { key: 'Classroom', label: 'Classroom', count: stats.classroomCount, icon: Building2 },
    { key: 'Auth', label: 'Auth', count: stats.authCount, icon: LogIn },
    { key: 'Enroll', label: 'Enroll', count: stats.enrollCount, icon: UserRoundCheck },
    { key: 'Eval', label: 'Eval', count: stats.evalCount, icon: FileText },
    { key: 'System', label: 'System', count: stats.systemCount, icon: Gauge },
  ]), [stats]);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-100 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="faculty" activeItem="audit-log" />

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-[#0f2f57] tracking-tight">Audit Log</h1>
              <p className="text-slate-600 mt-2 text-lg">Track all your actions in the system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Classroom</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.classroomCount}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <LogIn size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Logins</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.authCount}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserRoundCheck size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Enrollments</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.enrollCount}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Total Activities</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{stats.totalCount}</p>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, categories, status, or IP..."
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                      active ? 'bg-[#020824] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-3xl font-semibold text-slate-900">Activity Timeline</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#020824] text-white font-semibold">{filteredLogs.length} entries</span>
              </div>

              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading audit logs...</div>
              ) : error ? (
                <div className="text-center py-10 text-rose-600">{error}</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No audit logs found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2">
                          <ClipboardList size={16} className="text-slate-500" />
                          <p className="font-semibold text-slate-900">{log.action || 'Activity'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${groupBadgeColor(log.group)}`}>
                            {log.group}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                            {log.status || 'Success'}
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

export default FacultyAuditLogPage;
