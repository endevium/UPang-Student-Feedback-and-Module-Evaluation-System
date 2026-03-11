import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Users, X, ChevronDown } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const parseApiError = async (response, fallback = 'Request failed.') => {
  const data = await response.json().catch(() => null);
  if (!data) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data) && data.length > 0) return String(data[0]);
  if (typeof data === 'object') {
    const firstEntry = Object.entries(data)[0];
    if (firstEntry) {
      const [, value] = firstEntry;
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string') return value;
    }
  }
  return fallback;
};

const formatSubjectCode = (value) => String(value || '').toUpperCase().replace(/\s+/g, '');

const formatTitleCase = (value) => {
  const s = String(value || '').trim();
  if (!s) return '';
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
};

const formatTitleCaseForInput = (value) => {
  const v = String(value || '');
  const hasTrailingSpace = /\s$/.test(v);
  // Collapse multiple spaces to single space for display, but preserve a trailing space while typing
  const normalized = v.replace(/\s+/g, ' ').split(' ').map((w) => {
    if (!w) return '';
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
  return normalized + (hasTrailingSpace ? ' ' : '');
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('ALL');
  const [formData, setFormData] = useState({
    department: '',
    subject_code: '',
    module_name: '',
    year_level: '',
    semester: '',
    academic_year: '2025-2026',
  });

  const fetchPrograms = async (token) => {
    const res = await fetch(`${API_BASE_URL}/programs/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : data?.results || [];
  };

  const fetchCourses = async (token) => {
    const res = await fetch(`${API_BASE_URL}/modules/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const msg = await parseApiError(res, 'Unable to load courses.');
      throw new Error(msg);
    }
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : data?.results || [];
  };

  const loadData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const [programList, courseList] = await Promise.all([
        fetchPrograms(token),
        fetchCourses(token),
      ]);
      setPrograms(programList);
      setCourses(courseList);
    } catch (err) {
      setError(err.message || 'Unable to load courses.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Intentionally load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = useMemo(() => {
    let list = courses || [];
    if (selectedYearLevel !== 'ALL') {
      list = list.filter((course) => String(course?.year_level || '').trim() === selectedYearLevel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((course) => {
        const code = String(course?.subject_code || '').toLowerCase();
        const name = String(course?.module_name || '').toLowerCase();
        return code.includes(q) || name.includes(q);
      });
    }
    return list;
  }, [courses, searchQuery, selectedYearLevel]);

  const yearLevels = useMemo(() => {
    const levels = Array.from(new Set((courses || []).map((c) => String(c?.year_level || '').trim()).filter(Boolean)));
    return levels;
  }, [courses]);

  const departmentOptions = useMemo(() => {
    const fromPrograms = programs
      .map((program) => String(program?.department || '').trim())
      .filter(Boolean);
    const fromCourses = courses
      .map((course) => String(course?.department || '').trim())
      .filter(Boolean);
    const unique = Array.from(new Set([...fromPrograms, ...fromCourses]));
    return unique;
  }, [programs, courses]);

  const departmentCounts = useMemo(() => {
    const counts = { ALL: courses.length };
    departmentOptions.forEach((department) => {
      counts[department] = courses.filter((c) => String(c?.department || '').trim() === department).length;
    });
    return counts;
  }, [courses, departmentOptions]);

  useEffect(() => {
    if (departmentOptions.length === 0) return;
    setFormData((prev) => {
      if (prev.department) return prev;
      return { ...prev, department: departmentOptions[0] };
    });
  }, [departmentOptions]);

  const isFormComplete = Boolean(
    formData.subject_code.trim() &&
    formData.module_name.trim() &&
    formData.semester.trim() &&
    formData.academic_year.trim()
  );

  const handleCreateCourse = async () => {
    setCreateError('');
    if (!isFormComplete) {
      setCreateError('Please complete all required fields.');
      return;
    }

    const token = getToken();
    if (!token) {
      setCreateError('Session expired. Please login again.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        subject_code: formatSubjectCode(formData.subject_code),
        module_name: formatTitleCase(formData.module_name.trim()),
        year_level: formData.year_level.trim(),
        semester: formData.semester,
        academic_year: formData.academic_year.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/modules/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await parseApiError(res, 'Unable to create course.');
        setCreateError(msg);
        return;
      }

      setIsCreateOpen(false);
      setFormData({
        department: departmentOptions[0] || '',
        subject_code: '',
        module_name: '',
        year_level: '',
        semester: '',
        academic_year: '2025-2026',
      });
      await loadData();
    } catch {
      setCreateError('Unable to reach the server.');
    } finally {
      setCreating(false);
    }
  };

  const cardData = filteredCourses.map((course, index) => ({
    id: course?.id || `${course?.subject_code || 'course'}-${index}`,
    subject_code: course?.subject_code || 'N/A',
    module_name: formatTitleCase(course?.module_name || 'Untitled Course'),
    semester: course?.semester || 'N/A',
    year_level: course?.year_level || 'N/A',
    enrolled: Number(course?.student_count || 0),
  }));

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="courses" />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-[#1f2937]">Courses Management</h1>
                <p className="text-slate-500 mt-1">View and manage all courses by department</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateError('');
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#020824] text-white rounded-lg text-sm font-semibold hover:bg-[#0b1238]"
              >
                <Plus size={15} />
                Create Course
              </button>
            </div>

            <section className="mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by code or title"
                    className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div className="w-60">
                  <select
                    value={selectedYearLevel}
                    onChange={(e) => setSelectedYearLevel(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                  >
                    <option value="ALL">All Year Levels</option>
                    {yearLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              {loading ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-500">Loading courses...</div>
              ) : error ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-rose-600">{error}</div>
              ) : cardData.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-500">No courses found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cardData.map((course) => (
                    <article key={course.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                      <span className="inline-flex px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono">
                        {course.subject_code}
                      </span>
                      <h3 className="text-3xl leading-tight mt-3 font-semibold text-slate-900">{course.module_name}</h3>
                      <div className="mt-3 pt-3 border-t border-slate-100 text-slate-600 text-sm flex items-center justify-between">
                        <span>{course.year_level}</span>
                        <span>{course.semester}</span>
                      </div>
                      <p className="mt-2 text-slate-600 inline-flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        {course.enrolled} students enrolled
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-4xl font-bold text-slate-800">Create New Course</h3>
                <p className="text-sm text-slate-500 mt-1">Add a new course to the system.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none"
                  >
                    {departmentOptions.length === 0 ? (
                      <option value="">No departments available</option>
                    ) : (
                      departmentOptions.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course Code</label>
                <input
                  type="text"
                  value={formData.subject_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject_code: formatSubjectCode(e.target.value) }))}
                  placeholder="e.g., ITE 401"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course Name</label>
                <input
                  type="text"
                  value={formData.module_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, module_name: formatTitleCaseForInput(e.target.value) }))}
                  placeholder="e.g., Platform Technologies"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year Level</label>
                <div className="relative">
                  <select
                    value={formData.year_level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year_level: e.target.value }))}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none"
                  >
                    <option value="">Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                  <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Semester</label>
                <div className="relative">
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none"
                  >
                    <option value="">Select semester</option>
                    <option value="1st Sem">1st Semester</option>
                    <option value="2nd Sem">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                  <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Academic Year</label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="e.g., 2025-2026"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              {createError && <p className="text-sm text-rose-600 font-medium">{createError}</p>}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creating || !isFormComplete}
                  onClick={handleCreateCourse}
                  className="px-5 py-2.5 rounded-lg bg-[#020824] text-white font-semibold hover:bg-[#0b1238] disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
