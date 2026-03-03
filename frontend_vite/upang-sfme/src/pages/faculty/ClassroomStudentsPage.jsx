import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ArrowLeft, Users, Clock3, MapPin, GraduationCap, Search, Copy } from 'lucide-react';
import { getAccessToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const MOCK_STUDENTS = [
  { id: 1, name: 'Juan Dela Cruz', studentNumber: '2021-00001-MN-0', email: 'juan.delacruz@student.upang.edu.ph' },
  { id: 2, name: 'Maria Santos', studentNumber: '2021-00002-MN-0', email: 'maria.santos@student.upang.edu.ph' },
  { id: 3, name: 'Pedro Garcia', studentNumber: '2021-00003-MN-0', email: 'pedro.garcia@student.upang.edu.ph' },
  { id: 4, name: 'Ana Reyes', studentNumber: '2021-00004-MN-0', email: 'ana.reyes@student.upang.edu.ph' },
  { id: 5, name: 'Carlos Ramos', studentNumber: '2021-00005-MN-0', email: 'carlos.ramos@student.upang.edu.ph' },
  { id: 6, name: 'Student 6', studentNumber: '2021-00006-MN-0', email: 'student6@student.upang.edu.ph' },
];

const initialsFromName = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';

const ClassroomStudentsPage = () => {
  const [search, setSearch] = useState('');
  const [dbClassroom, setDbClassroom] = useState(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);
  const [classroomError, setClassroomError] = useState('');
  const classroom = useMemo(() => window.history.state?.classroom || {}, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setClassroomError('Session expired. Please login again.');
      setLoadingClassroom(false);
      return;
    }

    const fetchClassroomFromDb = async () => {
      setLoadingClassroom(true);
      setClassroomError('');
      try {
        const res = await fetch(`${API_BASE_URL}/classrooms/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setClassroomError(data?.detail || 'Unable to load classroom details.');
          setDbClassroom(null);
          return;
        }

        const list = Array.isArray(data) ? data : data?.results || [];
        const byId = list.find((item) => Number(item?.id) === Number(classroom?.classroomId));
        const byCode = list.find(
          (item) => String(item?.classroom_code || '').toUpperCase() === String(classroom?.classCode || '').toUpperCase()
        );
        const bySubjectAndBlock = list.find(
          (item) =>
            String(item?.subject_code || '').toUpperCase() === String(classroom?.code || '').toUpperCase() &&
            String(item?.block || '').toUpperCase() === String(classroom?.section || '').toUpperCase()
        );

        setDbClassroom(byId || byCode || bySubjectAndBlock || list[0] || null);
      } catch {
        setClassroomError('Unable to reach server.');
        setDbClassroom(null);
      } finally {
        setLoadingClassroom(false);
      }
    };

    fetchClassroomFromDb();
  }, [classroom?.classCode, classroom?.classroomId, classroom?.code, classroom?.section]);

  const classInfo = useMemo(() => {
    const yearLabelMap = {
      1: '1st Year',
      2: '2nd Year',
      3: '3rd Year',
      4: '4th Year',
    };

    const dbCode = dbClassroom?.subject_code;
    const dbSection = dbClassroom?.block;
    const dbTitle = dbClassroom?.module_name;
    const dbSemester = dbClassroom?.semester;
    const dbClassCode = dbClassroom?.classroom_code;
    const dbYearLevel = Number(dbClassroom?.year_level || 0);

    return {
      subjectCode: dbCode || classroom.code || 'ITE 384',
      section: dbSection || classroom.section || 'BSIT-3',
      title: dbTitle || classroom.title || 'IT Elective 2: Computer Security',
      semester:
        dbSemester && dbYearLevel
          ? `${dbSemester} • ${yearLabelMap[dbYearLevel] || `${dbYearLevel}th Year`}`
          : dbSemester || classroom.semester || '2nd Semester 2025-2026',
      schedule: classroom.schedule || 'MWF 10:00 AM - 11:30 AM',
      room: classroom.room || 'IT Lab 3',
      classCode: dbClassCode || classroom.classCode || 'UP-FB2S25-BSIT3-COMSEC-01',
      students: Number(classroom.students ?? MOCK_STUDENTS.length) || MOCK_STUDENTS.length,
    };
  }, [classroom, dbClassroom]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_STUDENTS;
    return MOCK_STUDENTS.filter((student) =>
      [student.name, student.studentNumber, student.email].join(' ').toLowerCase().includes(query)
    );
  }, [search]);

  const goBack = () => {
    window.history.pushState({}, '', '/faculty-dashboard/classroom');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const copyClassCode = async () => {
    try {
      await navigator.clipboard.writeText(classInfo.classCode);
    } catch {
      // no-op
    }
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-100 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="faculty" activeItem="classroom" />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="container mx-auto max-w-7xl">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-300"
            >
              <ArrowLeft size={14} />
              Back to Classrooms
            </button>

            <div className="mt-4 rounded-2xl p-6 text-white bg-gradient-to-r from-blue-600 to-blue-700">
              {loadingClassroom && (
                <p className="text-sm text-blue-100 mb-2">Loading classroom details...</p>
              )}
              {!loadingClassroom && classroomError && (
                <p className="text-sm text-rose-100 mb-2">{classroomError}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] px-2 py-1 rounded-md bg-white/15 border border-white/20 font-bold uppercase">{classInfo.subjectCode}</span>
                <span className="text-[11px] px-2 py-1 rounded-md bg-white/15 border border-white/20 font-bold uppercase">{classInfo.section}</span>
              </div>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight">{classInfo.title}</h1>
              <p className="mt-2 text-blue-100 text-lg">{classInfo.semester}</p>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={18} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Students</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{classInfo.students}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Clock3 size={18} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Schedule</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{classInfo.schedule}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><MapPin size={18} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Room</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{classInfo.room}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><GraduationCap size={18} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Section</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{classInfo.section}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 text-sm">Share this code with students</p>
                <p className="mt-1 text-2xl font-mono font-bold text-slate-900">{classInfo.classCode}</p>
              </div>
              <button
                type="button"
                onClick={copyClassCode}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020824] text-white font-semibold hover:bg-[#0b1238]"
              >
                <Copy size={16} />
                Copy Code
              </button>
            </div>

            <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} className="text-slate-700" />
                <h2 className="text-3xl font-semibold text-slate-900">Enrolled Students</h2>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-[#020824] text-white font-semibold">{classInfo.students}</span>
              </div>
              <p className="text-slate-500">Students enrolled in this classroom</p>

              <div className="relative mt-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, student ID, or email..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                      {initialsFromName(student.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-semibold text-slate-900 truncate">{student.name}</p>
                      <p className="text-sm text-slate-600">{student.studentNumber}</p>
                      <p className="text-sm text-slate-600 truncate mt-1">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomStudentsPage;
