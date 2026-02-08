import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Search, 
  Download, 
  Eye 
} from 'lucide-react';

const StudentsManagement = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const [studentData, setStudentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formValues, setFormValues] = useState({
    student_number: '',
    email: '',
    firstname: '',
    middlename: '',
    lastname: '',
    department: '',
    program: '',
    year_level: '',
    birthdate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormValues({
      student_number: '',
      email: '',
      firstname: '',
      middlename: '',
      lastname: '',
      department: '',
      program: '',
      year_level: '',
      birthdate: '',
    });
    setErrorMessage('');
  };

  const closeModal = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const formatYearLabel = (level) => {
    const value = Number(level);
    if (!value) return '';
    if (value === 1) return '1st Year';
    if (value === 2) return '2nd Year';
    if (value === 3) return '3rd Year';
    return `${value}th Year`;
  };

  const mapStudent = (student) => ({
    id: student.student_number,
    name: `${student.firstname || ''} ${student.lastname || ''}`.trim(),
    program: student.program || 'N/A',
    year: formatYearLabel(student.year_level),
    modules: 0,
    completed: 0,
    pending: 0,
    status: 'Active',
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch(`${API_BASE_URL}/students/`);
      const data = await response.json();
      if (!response.ok) {
        setLoadError('Unable to load students.');
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setStudentData(list.map(mapStudent));
    } catch {
      setLoadError('Unable to reach the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const requiredFields = ['student_number', 'email', 'firstname', 'lastname', 'department', 'program', 'year_level', 'birthdate'];
    const missingField = requiredFields.find((key) => !formValues[key].trim());
    if (missingField) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formValues,
        year_level: Number(formValues.year_level),
      };

      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const fieldErrors = Object.entries(data || {})
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
          .join(' | ');
        const errorText =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          fieldErrors ||
          'Unable to add student. Please check the details.';
        setErrorMessage(errorText);
        return;
      }

      const newStudent = mapStudent({
        student_number: data.student_number || formValues.student_number,
        firstname: data.firstname || formValues.firstname,
        lastname: data.lastname || formValues.lastname,
        program: data.program || formValues.program,
        year_level: data.year_level || formValues.year_level,
      });

      setStudentData((prev) => [newStudent, ...prev]);
      closeModal();
    } catch {
      setErrorMessage('Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">      
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="students" onLogout={() => alert('Logout')} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1f2937]">Students Management</h1>
            <p className="text-slate-500 mt-1">View and manage all enrolled students</p>
          </div>

          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Total Students</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">{studentData.length}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <Users className="text-[#1f474d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled this semester</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Active Students</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">{studentData.length}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <TrendingUp className="text-[#1f474d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currently enrolled</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Avg. Completion</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">84%</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <Star className="text-[#1f474d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evaluation rate</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">All Students</h2>
                <p className="text-slate-400 text-sm">Complete list of enrolled students</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#1f474d] text-white rounded-lg text-sm font-bold hover:bg-[#18393e] transition-all"
                  onClick={() => setIsAddOpen(true)}
                >
                  + Add Student
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Download size={16} /> Export List
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name, student ID, or program..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1f474d]/20 transition-all bg-white"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Program</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Year</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Modules</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Completed</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Pending</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentData.map((student, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{student.id}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.program}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold">{student.year}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold">{student.modules}</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 text-center font-black">{student.completed}</td>
                      <td className="px-6 py-4 text-sm text-amber-500 text-center font-black">{student.pending}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-lg tracking-wider">
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(isLoading || loadError || studentData.length === 0) && (
              <div className="p-6 text-sm text-slate-500">
                {isLoading && 'Loading students...'}
                {!isLoading && loadError}
                {!isLoading && !loadError && studentData.length === 0 && 'No students found.'}
              </div>
            )}
          </div>
        </main>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Add Student</h3>
                <p className="text-sm text-slate-400">Default password is generated from name + birthdate.</p>
              </div>
              <button className="text-slate-400 hover:text-slate-700 text-2xl" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleAddStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Number</label>
                  <input
                    name="student_number"
                    value={formValues.student_number}
                    onChange={handleInputChange}
                    placeholder="00-0000-000"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="student@upang.edu.ph"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                  <input
                    name="firstname"
                    value={formValues.firstname}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Middle Name</label>
                  <input
                    name="middlename"
                    value={formValues.middlename}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                  <input
                    name="lastname"
                    value={formValues.lastname}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Birthdate</label>
                  <input
                    name="birthdate"
                    type="date"
                    value={formValues.birthdate}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</label>
                  <input
                    name="department"
                    value={formValues.department}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Program</label>
                  <input
                    name="program"
                    value={formValues.program}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Year Level</label>
                  <select
                    name="year_level"
                    value={formValues.year_level}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Select</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>
              </div>

              {errorMessage && (
                <div className="text-sm text-rose-600 font-semibold" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="px-4 py-2 text-sm font-bold text-slate-500" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-[#1f474d] text-white rounded-lg hover:bg-[#18393e] disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;