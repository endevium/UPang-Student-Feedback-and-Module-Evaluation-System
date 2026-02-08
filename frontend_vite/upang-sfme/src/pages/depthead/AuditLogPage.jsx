import React, {useState, useEffect} from 'react';
import Sidebar from '../../components/Sidebar';

const Badge = ({children, className = ''}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const AuditLogPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Activities', value: 0, subtitle: 'Last 24 hours' },
    { title: 'User Management', value: 0, subtitle: 'User changes' },
    { title: 'Form Changes', value: 0, subtitle: 'Form modifications' },
    { title: 'System Tasks', value: 0, subtitle: 'Config & maintenance' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${API_BASE_URL}/audit-logs/`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setLoadError(data?.detail || 'Unable to load audit logs.');
          return;
        }
        const logsList = Array.isArray(data) ? data : [];
        setLogs(logsList);

        // Compute stats from logs
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentLogs = logsList.filter(log => new Date(log.timestamp || log.time) > last24h);

        const userManagement = logsList.filter(log => log.category === 'USER MANAGEMENT').length;
        const formChanges = logsList.filter(log => log.category === 'FORM MANAGEMENT').length;
        const systemTasks = logsList.filter(log => log.category === 'SYSTEM TASKS').length;

        setStats([
          { title: 'Total Activities', value: recentLogs.length, subtitle: 'Last 24 hours' },
          { title: 'User Management', value: userManagement, subtitle: 'User changes' },
          { title: 'Form Changes', value: formChanges, subtitle: 'Form modifications' },
          { title: 'System Tasks', value: systemTasks, subtitle: 'Config & maintenance' },
        ]);
      } catch {
        setLoadError('Unable to reach the server. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="depthead" activeItem="audit-log" onLogout={() => alert('Logging out...')} />
      <div className="flex-1 flex flex-col">
        <main className="container mx-auto px-6 py-8 max-w-6xl flex-1">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Audit Log</h1>
              <p className="text-slate-500 mt-2">Track all system activities and changes</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white text-slate-800 px-3 py-2 rounded-lg shadow-sm hover:opacity-95 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export Logs
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{s.title}</div>
                    <div className="text-2xl font-semibold mt-2 text-slate-900">{isLoading ? '...' : s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.subtitle}</div>
                  </div>
                  <div className="text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Logs Panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Activity Logs</h2>
                <p className="text-sm text-slate-500">Complete history of system events</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by user, action, or details..."
                  className="bg-white border border-slate-200 placeholder-slate-400 text-slate-700 px-4 py-2 rounded-lg w-80 shadow-sm"
                />
                <select className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg">
                  <option>All Categories</option>
                </select>
                <select className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg">
                  <option>All Statuses</option>
                </select>
              </div>
            </div>

            {loadError && (
              <div className="text-red-600 text-center py-4">{loadError}</div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading audit logs...</div>
            ) : (
              <div className="space-y-4">
                {logs.filter(l => (l.user + l.action + l.message + l.category).toLowerCase().includes(query.toLowerCase())).map((log, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-900 font-semibold">{log.user}</div>
                          <Badge className={'bg-amber-100 text-amber-700'}>{log.role}</Badge>
                          <div className="text-slate-600">• {log.action}</div>
                          <Badge className={'bg-purple-100 text-purple-700 ml-2'}>{log.category}</Badge>
                          <Badge className={'bg-emerald-100 text-emerald-700 ml-2'}>{log.status}</Badge>
                        </div>
                        <div className="text-slate-600 mt-2">{log.message}</div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                          <div className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>{log.time}</div>
                          <div className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 10.5a6 6 0 0012 0V6" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>{log.ip}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && !isLoading && !loadError && (
                  <div className="text-center py-8 text-slate-500">No audit logs found.</div>
                )}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default AuditLogPage;
