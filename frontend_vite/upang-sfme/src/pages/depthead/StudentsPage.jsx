import React from 'react';
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
  // Hardcoded data matching the uploaded image exactly
  const studentData = [
    { id: "2024-12345", name: "Juan Dela Cruz", program: "BS Computer Science", year: "4th Year", modules: 8, completed: 5, pending: 3, status: "Active" },
    { id: "2024-12346", name: "Maria Garcia", program: "BS Computer Science", year: "4th Year", modules: 8, completed: 6, pending: 2, status: "Active" },
    { id: "2024-12347", name: "Pedro Santos", program: "BS Computer Science", year: "4th Year", modules: 8, completed: 7, pending: 1, status: "Active" },
    { id: "2024-12348", name: "Ana Reyes", program: "BS Information Technology", year: "3rd Year", modules: 7, completed: 4, pending: 3, status: "Active" },
    { id: "2024-12349", name: "Carlos Mendoza", program: "BS Computer Science", year: "4th Year", modules: 8, completed: 3, pending: 5, status: "Active" },
    { id: "2024-12350", name: "Sofia Ramos", program: "BS Information Technology", year: "3rd Year", modules: 7, completed: 7, pending: 0, status: "Active" },
    { id: "2024-12351", name: "Miguel Torres", program: "BS Computer Science", year: "2nd Year", modules: 6, completed: 2, pending: 4, status: "Active" },
    { id: "2024-12352", name: "Isabel Cruz", program: "BS Information Technology", year: "4th Year", modules: 8, completed: 8, pending: 0, status: "Active" },
  ];

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <Header userName="Prof. Ramon Cruz" userRole="Department Head" onLogout={() => alert('Logout')} />
      
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
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">1,245</p>
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
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">1,180</p>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Download size={16} /> Export List
              </button>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentsManagement;