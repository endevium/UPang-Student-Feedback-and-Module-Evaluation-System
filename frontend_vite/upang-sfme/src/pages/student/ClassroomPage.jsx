import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Plus, Users } from 'lucide-react';

const ClassroomPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const [classrooms, setClassrooms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeView, setActiveView] = useState('active');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const getToken = () => sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  const fetchClassrooms = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoadError('Not logged in');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const res = await fetch(`${API_BASE_URL}/students/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoadError(data?.detail || 'Unable to load classrooms');
        setClassrooms([]);
        return;
      }

      const list = data?.classrooms || data?.modules || data?.enrolled_modules || [];
      const pendingApplications = data?.applications || [];
      setClassrooms(Array.isArray(list) ? list : []);
      setApplications(Array.isArray(pendingApplications) ? pendingApplications : []);
    } catch {
      setLoadError('Unable to reach server');
      setClassrooms([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleJoinClassroom = async () => {
    const token = getToken();
    if (!token) {
      setJoinError('Session expired. Please log in again.');
      return;
    }

    const classroomCode = joinCode.trim().toUpperCase();
    if (!classroomCode) {
      setJoinError('Please enter a class code.');
      return;
    }

    setJoining(true);
    setJoinError('');

    try {
      const res = await fetch(`${API_BASE_URL}/classrooms/join/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classroom_code: classroomCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setJoinError(data?.detail || data?.error || 'Unable to join classroom.');
        return;
      }

      setIsJoinModalOpen(false);
      setJoinCode('');
      setJoinError('');
      fetchClassrooms();
    } catch {
      setJoinError('Unable to reach server.');
    } finally {
      setJoining(false);
    }
  };

  const normalizedClassrooms = useMemo(() => {
    return classrooms.map((item, index) => {
      const code = item?.code || item?.subject_code || item?.module_code || '';
      const name = item?.name || item?.title || item?.module_name || code || `Classroom ${index + 1}`;
      const instructor = item?.instructor || item?.instructor_name || item?.lecturer || 'Instructor TBA';
      const section = item?.section || item?.classroom_code || item?.block || `CS-${index + 1}A`;
      const schedule = item?.schedule || item?.class_schedule || item?.time_slot || 'MWF 10:00 AM - 11:30 AM';
      const room = item?.room || item?.room_name || item?.location || 'TBA';
      const students = Number(item?.students_count ?? item?.student_count ?? item?.enrolled_count ?? 0) || 0;

      const initials = String(instructor)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'CL';

      return {
        id: item?.id || `${code}-${index}`,
        code: code || `CS${400 + index + 1}`,
        section,
        title: name,
        instructor,
        schedule,
        room,
        students,
        initials,
      };
    });
  }, [classrooms]);

  const normalizedApplications = useMemo(() => {
    return applications.map((item, index) => {
      const requestedDate = item?.requested_at ? new Date(item.requested_at) : null;
      const requestedAt = requestedDate && !Number.isNaN(requestedDate.getTime())
        ? requestedDate.toLocaleDateString()
        : 'N/A';

      return {
        id: item?.enrollment_id || `${item?.classroom_code || 'APP'}-${index}`,
        code: item?.subject_code || 'N/A',
        title: item?.module_name || 'Unknown Module',
        classroomCode: item?.classroom_code || 'N/A',
        instructor: item?.instructor || 'Instructor TBA',
        requestedAt,
        status: item?.status || 'Pending',
      };
    });
  }, [applications]);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="student" activeItem="classroom" />

        <main className="flex-1 overflow-y-auto px-6 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#0f2f57] tracking-tight">Classrooms</h1>
                <p className="text-slate-500 mt-1 text-lg">Manage your enrolled classrooms</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setJoinError('');
                  setJoinCode('');
                  setIsJoinModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#020824] text-white rounded-lg text-sm font-semibold hover:bg-[#0b1238] transition-colors"
              >
                <Plus size={16} strokeWidth={2.6} />
                Join Classroom
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <button
                type="button"
                onClick={() => setActiveView('active')}
                className={`text-left rounded-2xl p-5 border transition-colors ${
                  activeView === 'active'
                    ? 'bg-[#020824] border-[#020824] text-white'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                <p className={`text-sm ${activeView === 'active' ? 'text-slate-200' : 'text-slate-500'}`}>Active Classrooms</p>
                <p className="text-4xl font-bold mt-1">{normalizedClassrooms.length}</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('applied')}
                className={`text-left rounded-2xl p-5 border transition-colors ${
                  activeView === 'applied'
                    ? 'bg-[#7a4a06] border-[#7a4a06] text-white'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                <p className={`text-sm ${activeView === 'applied' ? 'text-amber-100' : 'text-slate-500'}`}>Applied Classrooms</p>
                <p className="text-4xl font-bold mt-1">{normalizedApplications.length}</p>
              </button>
            </div>

            {activeView === 'active' ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loading ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
                  Loading classrooms...
                </div>
              ) : loadError ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                  <p className="text-slate-800 font-semibold">Error loading classrooms</p>
                  <p className="text-slate-500 mt-2">{loadError}</p>
                </div>
              ) : normalizedClassrooms.length > 0 ? (
                normalizedClassrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-bold uppercase">
                        {classroom.code}
                      </span>
                      <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
                        {classroom.section}
                      </span>
                    </div>

                    <h2 className="text-[34px] leading-tight font-medium text-slate-900 tracking-tight">{classroom.title}</h2>
                    <p className="text-slate-500 text-[30px] mt-1">{classroom.instructor}</p>

                    <div className="mt-6 space-y-2.5 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">Schedule:</span>{' '}
                        <span>{classroom.schedule}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Room:</span>{' '}
                        <span>{classroom.room}</span>
                      </p>
                      <p className="inline-flex items-center gap-2 text-slate-700 font-semibold">
                        <Users size={14} className="text-slate-400" />
                        {classroom.students} students
                      </p>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-5 bg-[#020824] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0b1238] transition-colors"
                    >
                      View Classroom
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                  <p className="text-slate-700 text-xl font-semibold">No classrooms yet</p>
                  <p className="text-slate-500 mt-2">Join a classroom to get started.</p>
                </div>
              )}
              </div>
            ) : (
              <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-3xl font-semibold text-slate-900">Applied Classrooms</h2>
                <p className="text-slate-500 mt-1 text-base">Track classrooms you are applying to and their status</p>

                {normalizedApplications.length === 0 ? (
                  <div className="mt-4 text-slate-500">No pending applications.</div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-200">
                    {normalizedApplications.map((application) => (
                      <div key={application.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{application.code} - {application.title}</p>
                          <p className="text-slate-600 text-sm">Class Code: {application.classroomCode}</p>
                          <p className="text-slate-600 text-sm">Instructor: {application.instructor}</p>
                          <p className="text-slate-500 text-sm">Requested: {application.requestedAt}</p>
                        </div>
                        <span className="inline-flex items-center self-start md:self-auto px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                          {application.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] bg-[#ededed] rounded-md shadow-xl border border-slate-300">
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-[30px] leading-tight font-semibold text-slate-900">Join Classroom</h2>
                  <p className="text-slate-500 mt-1 text-[22px] leading-tight">Enter the class code provided by your instructor</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700 text-lg leading-none px-2"
                  aria-label="Close join classroom modal"
                >
                  ×
                </button>
              </div>

              <label className="block text-[26px] font-medium text-slate-900 mt-6 mb-1.5">Enter Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError('');
                }}
                placeholder="1234b678"
                maxLength={8}
                className="w-full h-[50px] px-4 rounded-[10px] border border-slate-400 bg-white text-center text-[26px] text-slate-700 focus:outline-none"
              />
              <p className="text-slate-500 text-[20px] mt-1">Class codes are 8 characters long</p>

              {joinError && (
                <p className="text-sm text-rose-600 font-medium mt-2">{joinError}</p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-slate-300 bg-[#efefef] text-slate-900 font-semibold text-[26px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleJoinClassroom}
                  disabled={joining || joinCode.trim().length !== 8}
                  className="flex-1 h-12 rounded-xl bg-[#020824] text-white font-semibold text-[26px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {joining ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;
