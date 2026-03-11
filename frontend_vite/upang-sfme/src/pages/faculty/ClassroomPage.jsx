import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Plus, School, Users, BookOpen, Copy, Clock3, MapPin, X, ChevronDown } from 'lucide-react';
import { getAccessToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Block/sections and subjects are loaded from the backend via `blockOptions` and `moduleOptions`.

const normalizeKey = (value) => String(value || '').trim().toUpperCase();

const normalizeSemester = (value) => {
  const key = normalizeKey(value);
  if (key === 'FIRST SEMESTER' || key === 'FIRST SEM') return '1ST SEM';
  if (key === 'SECOND SEMESTER' || key === 'SECOND SEM') return '2ND SEM';
  if (key === '1ST SEMESTER' || key === '1ST SEM') return '1ST SEM';
  if (key === '2ND SEMESTER' || key === '2ND SEM') return '2ND SEM';
  if (key === 'SUMMER') return 'SUMMER';
  return key;
};

const normalizeYearLevel = (value) => {
  const key = normalizeKey(value);
  if (!key) return '';

  const wordToDigitMap = {
    FIRST: '1',
    SECOND: '2',
    THIRD: '3',
    FOURTH: '4',
    FIFTH: '5',
  };

  for (const [word, digit] of Object.entries(wordToDigitMap)) {
    if (key.includes(word)) return digit;
  }

  const ordinalMap = {
    '1ST': '1',
    '2ND': '2',
    '3RD': '3',
    '4TH': '4',
    '5TH': '5',
  };

  for (const [ordinal, digit] of Object.entries(ordinalMap)) {
    if (key.includes(ordinal)) return digit;
  }

  const digit = key.match(/[1-9]/)?.[0];
  return digit || key;
};

const ClassroomPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [programOptions, setProgramOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [allModuleOptions, setAllModuleOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [copiedClassId, setCopiedClassId] = useState(null);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    year_level: '',
    subject_code: '',
    subject_name: '',
    program: 'BSIT',
    block: '',
    semester: '',
    schedule: '',
    room: '',
  });

  const parseApiError = async (response, fallback) => {
    const data = await response.json().catch(() => null);
    if (!data) return fallback;
    const extractMessage = (payload) => {
      if (!payload) return '';
      if (typeof payload === 'string') return payload;
      if (Array.isArray(payload)) {
        for (const item of payload) {
          const msg = extractMessage(item);
          if (msg) return msg;
        }
        return '';
      }
      if (typeof payload === 'object') {
        for (const value of Object.values(payload)) {
          const msg = extractMessage(value);
          if (msg) return msg;
        }
      }
      return '';
    };

    if (data.errors) {
      const nestedMessage = extractMessage(data.errors);
      if (nestedMessage) return nestedMessage;
    }

    if (typeof data.detail === 'string') return data.detail;
    if (typeof data === 'string') return data;
    if (Array.isArray(data) && data.length > 0) return String(data[0]);
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (data.errors && typeof data.errors === 'object') {
      const firstNested = Object.entries(data.errors)[0];
      if (firstNested) {
        const [, nestedValue] = firstNested;
        if (Array.isArray(nestedValue) && nestedValue.length > 0) return String(nestedValue[0]);
        if (typeof nestedValue === 'string') return nestedValue;
      }
    }
    if (typeof data === 'object') {
      const firstEntry = Object.entries(data)[0];
      if (!firstEntry) return fallback;
      const [, value] = firstEntry;
      if (Array.isArray(value)) return String(value[0]);
      if (typeof value === 'string') return value;
    }
    return fallback;
  };

  const loadClassrooms = async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/faculty/modules/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setError('Unable to load classrooms');
        setModules([]);
        return;
      }
      const list = Array.isArray(data) ? data : data?.results || [];
      setModules(list);
    } catch {
      setError('Unable to reach server');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModalOptions = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const [programRes, blockRes, moduleRes] = await Promise.all([
        fetch(`${API_BASE_URL}/programs/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/blocks/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/modules/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const programData = await programRes.json().catch(() => []);
      const blockData = await blockRes.json().catch(() => []);
      const moduleData = await moduleRes.json().catch(() => []);

      const programs = (Array.isArray(programData) ? programData : programData?.results || [])
        .map((p) => p?.program_code || p?.program_name)
        .filter(Boolean);

      const blocks = (Array.isArray(blockData) ? blockData : blockData?.results || [])
        .map((b) => ({
          name: b?.block_name || '',
          yearLevel: b?.year_level || '',
        }))
        .filter((b) => Boolean(b.name));

      const moduleList = (Array.isArray(moduleData) ? moduleData : moduleData?.results || [])
        .map((m) => ({
          code: normalizeKey(m?.subject_code),
          name: m?.module_name || m?.name || '',
          yearLevel: m?.year_level || '',
          semester: m?.semester || '',
        }))
        .filter((m) => Boolean(m.code));

      const uniqueModulesMap = new Map();
      moduleList.forEach((m) => {
        const moduleKey = `${normalizeKey(m.code)}|${normalizeYearLevel(m.yearLevel)}|${normalizeSemester(m.semester)}`;
        if (!uniqueModulesMap.has(moduleKey)) uniqueModulesMap.set(moduleKey, m);
      });

      setProgramOptions(Array.from(new Set(programs)));
      const uniqueBlocksMap = new Map();
      blocks.forEach((b) => {
        const blockKey = `${normalizeKey(b.name)}|${normalizeYearLevel(b.yearLevel)}`;
        if (!uniqueBlocksMap.has(blockKey)) uniqueBlocksMap.set(blockKey, b);
      });

      const uniqueModules = Array.from(uniqueModulesMap.values());
      setBlockOptions(Array.from(uniqueBlocksMap.values()));
      setAllModuleOptions(uniqueModules);
      setModuleOptions(uniqueModules);
    } catch {
      setProgramOptions([]);
      setBlockOptions([]);
      setAllModuleOptions([]);
      setModuleOptions([]);
    }
  };

  const fetchModulesFiltered = useCallback(async (yearLevel, semester) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const semesterValueMap = {
        '1st Semester': '1st Sem',
        '2nd Semester': '2nd Sem',
        Summer: 'Summer',
      };
      const sem = semesterValueMap[semester] || semester || '';
      const params = new URLSearchParams();
      if (yearLevel) params.append('year_level', String(yearLevel));
      if (sem) params.append('semester', sem);
      const url = `${API_BASE_URL}/modules/?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data?.results || [];
      const mapped = list
        .map((m) => ({
          code: normalizeKey(m?.subject_code),
          name: m?.module_name || m?.name || '',
          yearLevel: m?.year_level || '',
          semester: m?.semester || '',
        }))
        .filter((m) => Boolean(m.code));
      const uniqueModulesMap = new Map();
      mapped.forEach((m) => {
        const moduleKey = `${normalizeKey(m.code)}|${normalizeYearLevel(m.yearLevel)}|${normalizeSemester(m.semester)}`;
        if (!uniqueModulesMap.has(moduleKey)) uniqueModulesMap.set(moduleKey, m);
      });
      const filteredModules = Array.from(uniqueModulesMap.values());
      // Some backends store year_level as labels like "1st Year"; if API filtering returns nothing,
      // keep the full catalog so client-side filtering can still populate the dropdown.
      if (filteredModules.length > 0) {
        setModuleOptions(filteredModules);
      } else {
        setModuleOptions(allModuleOptions);
      }
    } catch {
      // Keep existing options on network/filter mismatch.
    }
  }, [allModuleOptions]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    loadClassrooms();
    loadModalOptions();
  }, []);

  const handleCreateClassroom = async () => {
    setCreateError('');

    if (!formData.year_level || !formData.subject_code || !formData.program || !formData.block || !formData.semester) {
      setCreateError('Please complete all required fields.');
      return;
    }

    if (programOptions.length > 0) {
      const selectedProgram = normalizeKey(formData.program);
      const validProgramSet = new Set(programOptions.map((program) => normalizeKey(program)));
      if (!validProgramSet.has(selectedProgram)) {
        setCreateError('Selected program is not available in your department.');
        return;
      }
    }

    if (blockOptions.length > 0) {
      const selectedBlock = normalizeKey(formData.block);
      const validBlockSet = new Set(sectionOptions.map((block) => normalizeKey(block)));
      if (!validBlockSet.has(selectedBlock)) {
        setCreateError('Selected block/section is not available in your department.');
        return;
      }
    }

    if (moduleOptions.length > 0) {
      const selectedCode = normalizeKey(formData.subject_code);
      const validCodeSet = new Set(moduleOptions.map((module) => normalizeKey(module.code)));
      if (!validCodeSet.has(selectedCode)) {
        setCreateError('Selected subject code is not available in your department.');
        return;
      }
    }

    const token = getAccessToken();
    if (!token) {
      setCreateError('Session expired. Please login again.');
      return;
    }

    setCreating(true);
    try {
      const semesterValueMap = {
        '1st Semester': '1st Sem',
        '2nd Semester': '2nd Sem',
        Summer: 'Summer',
      };

      const payload = {
        year_level: Number(formData.year_level),
        subject_code: formData.subject_code,
        program: formData.program,
        block: formData.block,
        semester: semesterValueMap[formData.semester] || formData.semester,
        schedule: formData.schedule.trim() || null,
        room: formData.room.trim() || null,
      };

      const res = await fetch(`${API_BASE_URL}/classrooms/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await parseApiError(res, 'Unable to create classroom');
        setCreateError(msg);
        return;
      }

      setIsCreateModalOpen(false);
      setFormData({
        year_level: '',
        subject_code: '',
        subject_name: '',
        program: 'BSIT',
        block: '',
        semester: '',
        schedule: '',
        room: '',
      });
      loadClassrooms();
    } catch {
      setCreateError('Unable to create classroom right now.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyClassCode = async (classCode, classId) => {
    const text = String(classCode || '').trim();
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedClassId(classId);
      window.setTimeout(() => {
        setCopiedClassId((prev) => (prev === classId ? null : prev));
      }, 1200);
    } catch {
      // noop: avoid blocking UI if clipboard access is denied
    }
  };

  const cards = useMemo(() => {
    return modules.map((item, index) => {
      const code = (item?.subject_code || item?.module_code || item?.code || `CS${400 + index}`).toUpperCase();
      const section = item?.section || item?.block || `BSCS-${(index % 4) + 1}`;
      const title = item?.module_name || item?.name || item?.title || code;
      const classCode = item?.classroom_code || item?.class_code || `UP-FB2S25-${section}-${code.replace(/\s+/g, '')}-01`;
      const schedule = item?.schedule || item?.class_schedule || item?.time_slot || 'TTH 1:00 PM - 2:30 PM';
      const room = item?.room || item?.location || 'CS Lab 1';
      const students = Number(item?.students_count ?? item?.student_count ?? 0) || 0;

      return {
        id: item?.module_id || item?.id || `${code}-${index}`,
        classroomId: item?.classroom_id || item?.id || null,
        code,
        section,
        title,
        classCode,
        schedule,
        room,
        students,
      };
    });
  }, [modules]);

  const sectionOptions = useMemo(() => {
    if (!formData.year_level) return [];
    const selectedYear = normalizeYearLevel(formData.year_level);
    return blockOptions
      .filter((b) => normalizeYearLevel(b?.yearLevel) === selectedYear)
      .map((b) => b.name);
  }, [formData.year_level, blockOptions]);

  const programDropdownOptions = useMemo(() => {
    return Array.from(new Set(['BSIT', ...programOptions]));
  }, [programOptions]);

  const filteredModuleOptions = useMemo(() => {
    if (!formData.year_level || !formData.semester) return [];
    const selectedYear = normalizeYearLevel(formData.year_level);
    const selectedSemester = normalizeSemester(formData.semester);
    return moduleOptions.filter((m) => (
      normalizeYearLevel(m?.yearLevel) === selectedYear &&
      normalizeSemester(m?.semester) === selectedSemester
    ));
  }, [moduleOptions, formData.year_level, formData.semester]);

  const subjectCodeOptions = useMemo(() => {
    return Array.from(new Set(filteredModuleOptions.map((m) => m.code).filter(Boolean)));
  }, [filteredModuleOptions]);

  const subjectNameOptions = useMemo(() => {
    if (!formData.subject_code) return [];
    return Array.from(
      new Set(
        filteredModuleOptions
          .filter((m) => normalizeKey(m?.code) === normalizeKey(formData.subject_code))
          .map((m) => m?.name)
          .filter(Boolean)
      )
    );
  }, [filteredModuleOptions, formData.subject_code]);

  useEffect(() => {
    if (!formData.subject_code) {
      if (formData.subject_name) {
        setFormData((prev) => ({ ...prev, subject_name: '' }));
      }
      return;
    }

    if (subjectNameOptions.length === 0) {
      if (formData.subject_name) {
        setFormData((prev) => ({ ...prev, subject_name: '' }));
      }
      return;
    }

    if (!subjectNameOptions.includes(formData.subject_name)) {
      setFormData((prev) => ({ ...prev, subject_name: subjectNameOptions[0] }));
    }
  }, [formData.subject_code, formData.subject_name, subjectNameOptions]);

  // When year level or semester changes, fetch modules scoped to those filters
  useEffect(() => {
    if (!formData.year_level) return;
    // only fetch when semester is selected too (optional: still fetch with year only)
    fetchModulesFiltered(formData.year_level, formData.semester);
  }, [fetchModulesFiltered, formData.year_level, formData.semester]);

  const isFormComplete = useMemo(() => {
    return Boolean(
      formData.year_level &&
      formData.program &&
      formData.semester &&
      formData.block &&
      formData.subject_code &&
      formData.subject_name
    );
  }, [formData]);

  const totalStudents = cards.reduce((sum, card) => sum + card.students, 0);

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="faculty" activeItem="classroom" />

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#0f2f57] tracking-tight">My Classrooms</h1>
                <p className="text-slate-600 mt-2 text-lg">Manage your classes and view enrolled students</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateError('');
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f474d] text-white rounded-lg text-sm font-semibold hover:bg-[#2a5d65] transition-colors"
              >
                <Plus size={14} strokeWidth={2.8} />
                Create Classroom
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <School size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Total Classrooms</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{cards.length}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Total Students</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{totalStudents}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0f2f57] flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Active Semester</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">2nd Sem 2025-26</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
                Loading classrooms...
              </div>
            ) : error ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <p className="text-slate-800 font-semibold">Error loading classrooms</p>
                <p className="text-slate-500 mt-2">{error}</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <p className="text-slate-700 text-xl font-semibold">No classrooms yet</p>
                <p className="text-slate-500 mt-2">Create your first classroom to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {cards.map((card) => (
                  <div key={card.id} className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-bold uppercase">
                        {card.code}
                      </span>
                      <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
                        {card.section}
                      </span>
                    </div>

                    <h2 className="text-xl leading-tight font-bold text-slate-900 tracking-tight">{card.title}</h2>

                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Class Code</p>
                        <p className="font-mono text-sm font-bold text-slate-800 truncate">{card.classCode}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyClassCode(card.classCode, card.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-700"
                        aria-label="Copy class code"
                        title={copiedClassId === card.id ? 'Copied' : 'Copy class code'}
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p className="inline-flex items-center gap-2"><Clock3 size={14} className="text-slate-400" /> {card.schedule}</p>
                      <p className="inline-flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {card.room}</p>
                      <p className="inline-flex items-center gap-2"><Users size={14} className="text-slate-400" /> {card.students} students enrolled</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextPath = card.classroomId
                          ? `/faculty-dashboard/classroom/students?classroom_id=${encodeURIComponent(card.classroomId)}`
                          : '/faculty-dashboard/classroom/students';
                        window.history.pushState({ classroom: card }, '', nextPath);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="w-full mt-auto h-11 inline-flex items-center justify-center px-4 rounded-xl bg-[#1f474d] text-white text-sm font-semibold hover:bg-[#2a5d65] transition-colors"
                    >
                      View Students
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[520px] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-5 max-h-[88vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#0f2f57] tracking-tight">Create New Classroom</h2>
                  <p className="text-slate-500 mt-1.5 text-sm">Set up a new classroom and generate a class code for students to join.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
                  aria-label="Close create classroom modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5 space-y-4.5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year Level</label>
                  <div className="relative">
                    <select
                      value={formData.year_level}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        year_level: e.target.value,
                        block: '',
                        subject_code: '',
                        subject_name: '',
                      }))}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                    >
                      <option value="" disabled>e.g., 3rd Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Program</label>
                  <div className="relative">
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                    >
                      {programDropdownOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Semester</label>
                  <div className="relative">
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        semester: e.target.value,
                        subject_code: '',
                        subject_name: '',
                      }))}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                    >
                      <option value="" disabled>e.g., 2nd Semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Block/Section</label>
                  <div className="relative">
                    <select
                      value={formData.block}
                      disabled={!formData.year_level}
                      onChange={(e) => setFormData((prev) => ({ ...prev, block: e.target.value }))}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="" disabled>e.g., BSCS-4A</option>
                      {sectionOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject Code</label>
                  <div className="relative">
                    <select
                      value={formData.subject_code}
                      disabled={!formData.year_level || !formData.semester}
                      onChange={(e) => {
                        const nextCode = e.target.value;
                        const matchedNames = filteredModuleOptions
                          .filter((m) => normalizeKey(m?.code) === normalizeKey(nextCode))
                          .map((m) => m?.name)
                          .filter(Boolean);
                        const nextName = matchedNames[0] || '';

                        setFormData((prev) => ({
                          ...prev,
                          subject_code: nextCode,
                          subject_name: nextName,
                        }));
                      }}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="" disabled>e.g., CS401</option>
                      {subjectCodeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject Name</label>
                  <div className="relative">
                    <select
                      value={formData.subject_name}
                      disabled
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 appearance-none focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="" disabled>e.g., Advanced Database Systems</option>
                      {subjectNameOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Schedule</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData((prev) => ({ ...prev, schedule: e.target.value }))}
                    placeholder="e.g., TTH 1:00 PM - 2:30 PM"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                    placeholder="e.g., CS Lab 1"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                  />
                </div>

                {createError && (
                  <p className="text-sm text-rose-600 font-medium">{createError}</p>
                )}
              </div>

              <div className="mt-7 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setCreateError('');
                    setIsCreateModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateClassroom}
                  disabled={creating || !isFormComplete}
                  className="px-5 py-2.5 rounded-lg bg-[#1f474d] text-white font-semibold hover:bg-[#2a5d65] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Classroom'}
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
