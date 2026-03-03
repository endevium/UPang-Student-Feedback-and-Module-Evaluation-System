import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Plus, School, Users, BookOpen, Copy, Clock3, MapPin, X, ChevronDown } from 'lucide-react';
import { getAccessToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const YEAR_SECTIONS = {
  1: [
    'BSIT1-01', 'BSIT1-02', 'BSIT1-03', 'BSIT1-04', 'BSIT1-05',
    'BSIT1-06', 'BSIT1-07', 'BSIT1-08', 'BSIT1-09',
  ],
  2: [
    'BSIT2-01', 'BSIT2-02', 'BSIT2-03', 'BSIT2-04', 'BSIT2-05',
    'BSIT2-06', 'BSIT2-07', 'BSIT2-08', 'BSIT2-09', 'BSIT2-10',
  ],
  3: [
    'BSIT3-SYSDEV-01', 'BSIT3-SYSDEV-02',
    'BSIT3-BUSINFO-01', 'BSIT3-BUSINFO-02',
    'BSIT3-DIGIARTS-01', 'BSIT3-DIGIARTS-02',
    'BSIT3-COMSEC-01', 'BSIT3-COMSEC-02',
  ],
  4: [
    'BSIT4-SYSDEV', 'BSIT4-BUSINFO', 'BSIT4-DIGIARTS', 'BSIT4-COMSEC',
  ],
};

const CURRICULUM_SUBJECTS = {
  '1|1st Semester': [
    { code: 'ITE366', name: 'Introduction to Computing (Including IT Fundamentals)' },
    { code: 'ITE260', name: 'Computer programming 1' },
    { code: 'GEN002', name: 'Understanding the Self' },
    { code: 'MAT152', name: 'Mathematics in the Modern World' },
    { code: 'GEN001', name: 'Purposive Communication' },
    { code: 'GEN006', name: 'Ethics' },
    { code: 'PED025', name: 'Movement Enhancement' },
    { code: 'NST021', name: 'National Service Training Program 1' },
  ],
  '1|2nd Semester': [
    { code: 'ITE186', name: 'Computer Programming 2' },
    { code: 'ITE399', name: 'Human Computer Interaction 1' },
    { code: 'ITE048', name: 'Discrete Structures' },
    { code: 'GEN008', name: 'Living in the IT Era' },
    { code: 'ART002', name: 'Art Appreciation' },
    { code: 'GEN005', name: 'The Contemporary World' },
    { code: 'PED026', name: 'Fitness Exercise' },
    { code: 'NST022', name: 'National Service Training Program 2' },
  ],
  '2|1st Semester': [
    { code: 'ITE298', name: 'Information Management (Including Fundamentals of Database Systems)' },
    { code: 'ITE300', name: 'Object-Oriented Programming' },
    { code: 'ITE292', name: 'Networking 1' },
    { code: 'ITE031', name: 'Data Structures and Algorithms' },
    { code: 'ITE083', name: 'IT Project Management' },
    { code: 'GEN003', name: 'Science, Technology, and Society' },
    { code: 'HIS007', name: 'Life and Works of Rizal' },
    { code: 'PED027', name: 'Physical Activities Towards Health & Fitness 1' },
    { code: 'SSP005', name: 'Student Success Program 1' },
  ],
  '2|2nd Semester': [
    { code: 'ITE393', name: 'Applications Development and Emerging Technologies (Including Event-Driven Programming)' },
    { code: 'ITE400', name: 'Systems Integration and Architecture' },
    { code: 'ITE308', name: 'Web Systems and Technologies' },
    { code: 'ITE380', name: 'Human Computer Interaction 2' },
    { code: 'GEN004', name: 'Readings in Philippine History' },
    { code: 'GEN009', name: 'The Entrepreneurial Mind' },
    { code: 'GEN013', name: "People and the Earth's Ecosystems" },
    { code: 'PED028', name: 'Physical Activities Towards Health & Fitness 2' },
    { code: 'SSP006', name: 'Student Success Program 2' },
  ],
  '3|1st Semester': [
    { code: 'ITE359', name: 'Networking 2' },
    { code: 'ITE302', name: 'Information Assurance and Security 1' },
    { code: 'ITE353', name: 'Data Scalability and Analytics' },
    { code: 'ITE307', name: 'Quantitative Methods' },
    { code: 'ITE314', name: 'Advanced Database Systems' },
    { code: 'ITE383', name: 'Network Security' },
    { code: 'ITE382', name: 'Intelligent Systems' },
    { code: 'ITE387', name: 'Advanced Programming' },
    { code: 'ITE391', name: 'Freehand and Digital Drawing' },
    { code: 'SSP007', name: 'Student Success Program 3' },
  ],
  '3|2nd Semester': [
    { code: 'ITE309', name: 'Capstone Project and Research 1' },
    { code: 'ITE293', name: 'Systems Administration and Maintenance' },
    { code: 'ITE370', name: 'Information Assurance and Security 2' },
    { code: 'ITE401', name: 'Platform Technologies' },
    { code: 'ITE384', name: 'Computer Forensics' },
    { code: 'ITE385', name: 'Ethical Hacking' },
    { code: 'BAM285', name: 'Business Analysis for IT' },
    { code: 'BAM286', name: 'Applied Analytics in Business for IT' },
    { code: 'SSP008', name: 'Student Success Program 4' },
  ],
  '4|1st Semester': [
    { code: 'ITE310', name: 'Capstone Project and Research 2' },
    { code: 'ITE381', name: 'IT Business Solutions' },
    { code: 'ITE367', name: 'Managing IT Resources (Including Social & Professional Issues)' },
  ],
  '4|2nd Semester': [
    { code: 'ITE311', name: 'IT Practicum' },
  ],
};

const normalizeKey = (value) => String(value || '').trim().toUpperCase();

const ClassroomPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [programOptions, setProgramOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    year_level: '',
    subject_code: '',
    subject_name: '',
    program: 'BSIT',
    block: '',
    semester: '',
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
        .map((b) => b?.block_name)
        .filter(Boolean);

      const moduleList = (Array.isArray(moduleData) ? moduleData : moduleData?.results || [])
        .map((m) => ({
          code: normalizeKey(m?.subject_code),
          name: m?.module_name || m?.name || '',
        }))
        .filter((m) => Boolean(m.code));

      const uniqueModulesMap = new Map();
      moduleList.forEach((m) => {
        if (!uniqueModulesMap.has(m.code)) uniqueModulesMap.set(m.code, m);
      });

      setProgramOptions(Array.from(new Set(programs)));
      setBlockOptions(Array.from(new Set(blocks)));
      setModuleOptions(Array.from(uniqueModulesMap.values()));
    } catch {
      setProgramOptions([]);
      setBlockOptions([]);
      setModuleOptions([]);
    }
  };

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
      const validBlockSet = new Set(blockOptions.map((block) => normalizeKey(block)));
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
      });
      loadClassrooms();
    } catch {
      setCreateError('Unable to create classroom right now.');
    } finally {
      setCreating(false);
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
    const yearKey = Number(formData.year_level);
    const yearSections = YEAR_SECTIONS[yearKey];
    if (yearSections?.length) {
      if (blockOptions.length === 0) return yearSections;
      const validBlocks = new Set(blockOptions.map((option) => normalizeKey(option)));
      const matchedSections = yearSections.filter((section) => validBlocks.has(normalizeKey(section)));
      if (matchedSections.length > 0) return matchedSections;
    }
    return blockOptions;
  }, [formData.year_level, blockOptions]);

  const selectedCurriculumSubjects = useMemo(() => {
    const key = `${formData.year_level}|${formData.semester}`;
    return CURRICULUM_SUBJECTS[key] || [];
  }, [formData.year_level, formData.semester]);

  const availableModuleCodes = useMemo(() => {
    return new Set(moduleOptions.map((m) => normalizeKey(m?.code)).filter(Boolean));
  }, [moduleOptions]);

  const validCurriculumSubjects = useMemo(() => {
    if (selectedCurriculumSubjects.length === 0) return [];
    if (availableModuleCodes.size === 0) return selectedCurriculumSubjects;
    return selectedCurriculumSubjects.filter((subject) => availableModuleCodes.has(normalizeKey(subject.code)));
  }, [selectedCurriculumSubjects, availableModuleCodes]);

  const programDropdownOptions = useMemo(() => {
    return Array.from(new Set(['BSIT', ...programOptions]));
  }, [programOptions]);

  const subjectCodeOptions = useMemo(() => {
    if (validCurriculumSubjects.length > 0) {
      return validCurriculumSubjects.map((subject) => subject.code);
    }
    return moduleOptions.map((m) => m.code).filter(Boolean);
  }, [moduleOptions, validCurriculumSubjects]);

  const subjectNameOptions = useMemo(() => {
    if (!formData.subject_code) return [];

    if (validCurriculumSubjects.length > 0) {
      const matched = validCurriculumSubjects.find(
        (subject) => normalizeKey(subject.code) === normalizeKey(formData.subject_code)
      );
      return matched ? [matched.name] : [];
    }

    return Array.from(
      new Set(
        moduleOptions
          .filter((m) => normalizeKey(m?.code) === normalizeKey(formData.subject_code))
          .map((m) => m?.name)
          .filter(Boolean)
      )
    );
  }, [moduleOptions, formData.subject_code, validCurriculumSubjects]);

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
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#0f2f57] tracking-tight">My Classrooms</h1>
                <p className="text-slate-500 mt-1 text-lg">Manage your classes and view enrolled students</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateError('');
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#020824] text-white rounded-lg text-sm font-semibold hover:bg-[#0b1238] transition-colors"
              >
                <Plus size={14} strokeWidth={2.8} />
                Create Classroom
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <School size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Total Classrooms</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{cards.length}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Total Students</p>
                  <p className="text-4xl leading-none font-bold text-slate-900 mt-1">{totalStudents}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {cards.map((card) => (
                  <div key={card.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-bold uppercase">
                        {card.code}
                      </span>
                      <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
                        {card.section}
                      </span>
                    </div>

                    <h2 className="text-3xl leading-tight font-medium text-slate-900 tracking-tight">{card.title}</h2>

                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Class Code</p>
                        <p className="font-mono text-sm font-bold text-slate-800 truncate">{card.classCode}</p>
                      </div>
                      <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700" aria-label="Copy class code">
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
                        window.history.pushState({ classroom: card }, '', '/faculty-dashboard/classroom/students');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="w-full mt-5 bg-[#020824] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0b1238] transition-colors"
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
                  <h2 className="text-[30px] leading-tight font-semibold text-slate-900">Create New Classroom</h2>
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
                      onChange={(e) => {
                        const nextCode = e.target.value;
                        const matchedNames = validCurriculumSubjects.length > 0
                          ? validCurriculumSubjects
                            .filter((subject) => normalizeKey(subject.code) === normalizeKey(nextCode))
                              .map((subject) => subject.name)
                          : moduleOptions
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
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
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
                  className="px-5 py-2.5 rounded-lg bg-[#020824] text-white font-semibold hover:bg-[#0b1238] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
