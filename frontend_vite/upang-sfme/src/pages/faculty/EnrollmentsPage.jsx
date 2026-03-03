import React, { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Clock3, CheckCircle2, X, CalendarDays, Check } from 'lucide-react';

const MOCK_PENDING = [
  {
    id: 1,
    name: 'John Paner',
    studentId: '2021-00234-MN-0',
    email: 'john.paner@student.upang.edu.ph',
    subjectCode: 'ITE 293',
    subjectName: 'Platform Technologies',
    date: '2/24/26',
  },
  {
    id: 2,
    name: 'Maria Santos',
    studentId: '2021-00235-MN-0',
    email: 'maria.santos@student.upang.edu.ph',
    subjectCode: 'ITE 384',
    subjectName: 'Computer Security',
    date: '2/23/26',
  },
  {
    id: 3,
    name: 'Alden Cruz',
    studentId: '2021-00236-MN-0',
    email: 'alden.cruz@student.upang.edu.ph',
    subjectCode: 'ITE 302',
    subjectName: 'Information Assurance and Security 1',
    date: '2/22/26',
  },
];

const MOCK_HISTORY = [
  {
    id: 101,
    name: 'Angela Reyes',
    studentId: '2021-00240-MN-0',
    email: 'angela.reyes@student.upang.edu.ph',
    subjectCode: 'ITE 383',
    subjectName: 'Network Security',
    date: '2/21/26',
    status: 'Approved',
  },
  {
    id: 102,
    name: 'Mark Dela Cruz',
    studentId: '2021-00241-MN-0',
    email: 'mark.delacruz@student.upang.edu.ph',
    subjectCode: 'ITE 401',
    subjectName: 'Platform Technologies',
    date: '2/20/26',
    status: 'Rejected',
  },
  {
    id: 103,
    name: 'Sofia Lim',
    studentId: '2021-00242-MN-0',
    email: 'sofia.lim@student.upang.edu.ph',
    subjectCode: 'ITE 309',
    subjectName: 'Capstone Project and Research 1',
    date: '2/19/26',
    status: 'Approved',
  },
];

const EnrollmentsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');

  const pendingCount = MOCK_PENDING.length;
  const approvedCount = MOCK_HISTORY.filter((item) => item.status === 'Approved').length;
  const rejectedCount = MOCK_HISTORY.filter((item) => item.status === 'Rejected').length;

  const filteredPending = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_PENDING;
    return MOCK_PENDING.filter((item) =>
      [item.name, item.studentId, item.email, item.subjectCode, item.subjectName]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_HISTORY;
    return MOCK_HISTORY.filter((item) =>
      [item.name, item.studentId, item.email, item.subjectCode, item.subjectName, item.status]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const rows = activeTab === 'pending' ? filteredPending : filteredHistory;

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-100 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="faculty" activeItem="enrollments" />

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-[#0f2f57] tracking-tight">Enrollments</h1>
              <p className="text-slate-600 mt-2 text-lg">Manage student enrollment requests for your classrooms</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center">
                  <Clock3 size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Pending Requests</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{pendingCount}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Approved</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{approvedCount}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <X size={20} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Rejected</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{rejectedCount}</p>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, ID, or subject..."
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              />
            </div>

            <div className="border-b border-slate-300 mb-5">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('pending')}
                  className={`pb-3 text-lg font-semibold transition-colors ${
                    activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600'
                  }`}
                >
                  Pending Approvals ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 text-lg font-semibold transition-colors ${
                    activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600'
                  }`}
                >
                  History ({MOCK_HISTORY.length})
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-3xl font-semibold text-slate-900">
                {activeTab === 'pending' ? 'Pending Approvals' : 'Enrollment History'}
              </h2>
              <p className="text-slate-600 text-lg mt-1 mb-6">
                {activeTab === 'pending'
                  ? 'Review and approve student enrollment requests'
                  : 'View previous enrollment decisions'}
              </p>

              <div className="grid grid-cols-[2.1fr_1.9fr_1.2fr_1fr] gap-4 px-4 py-3 text-base font-semibold text-slate-700 border-b border-slate-200">
                <div>Name</div>
                <div>Subject</div>
                <div>Request Date</div>
                <div className="text-right">Actions</div>
              </div>

              {rows.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-xl">No records found.</div>
              ) : (
                rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[2.1fr_1.9fr_1.2fr_1fr] gap-4 px-4 py-5 border-b border-slate-200 last:border-b-0">
                    <div>
                      <p className="text-3xl font-semibold text-slate-900">{row.name}</p>
                      <p className="text-base text-slate-600">{row.studentId}</p>
                      <p className="text-base text-slate-600 truncate">{row.email}</p>
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-slate-900">{row.subjectCode}</p>
                      <p className="text-base text-slate-600">{row.subjectName}</p>
                      {row.status && (
                        <p className={`text-sm mt-1 font-semibold ${row.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {row.status}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-base text-slate-600">
                      <CalendarDays size={18} className="text-slate-500" />
                      {row.date}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {activeTab === 'pending' ? (
                        <>
                          <button type="button" className="w-12 h-12 rounded-xl border border-emerald-300 text-emerald-600 flex items-center justify-center hover:bg-emerald-50">
                            <Check size={20} />
                          </button>
                          <button type="button" className="w-12 h-12 rounded-xl border border-rose-300 text-rose-600 flex items-center justify-center hover:bg-rose-50">
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <span className="text-base font-semibold text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnrollmentsPage;
