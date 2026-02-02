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

const FacultyPages = () => {
  // Hardcoded data matching the visual design in the provided images
  const facultyData = [
    { id: "FAC-001", name: "Prof. Maria Santos", title: "Professor", dept: "Computer Science", modules: 3, students: 145, evaluations: 48, rating: 4.6, status: "Active" },
    { id: "FAC-002", name: "Dr. Juan Dela Cruz", title: "Associate Professor", dept: "Computer Science", modules: 2, students: 120, evaluations: 42, rating: 4.5, status: "Active" },
    { id: "FAC-003", name: "Prof. Ana Reyes", title: "Assistant Professor", dept: "Computer Science", modules: 3, students: 135, evaluations: 45, rating: 4.8, status: "Active" },
    { id: "FAC-004", name: "Dr. Pedro Garcia", title: "Associate Professor", dept: "Computer Science", modules: 2, students: 110, evaluations: 38, rating: 4.4, status: "Active" },
    { id: "FAC-005", name: "Prof. Lisa Gonzales", title: "Professor", dept: "Mathematics", modules: 2, students: 100, evaluations: 35, rating: 4.3, status: "Active" },
    { id: "FAC-006", name: "Prof. Robert Cruz", title: "Assistant Professor", dept: "English", modules: 4, students: 180, evaluations: 52, rating: 4.2, status: "Active" },
    { id: "FAC-007", name: "Dr. Sofia Mendoza", title: "Professor", dept: "Computer Science", modules: 2, students: 95, evaluations: 32, rating: 4.7, status: "Active" },
    { id: "FAC-008", name: "Prof. Carlos Ramos", title: "Associate Professor", dept: "Computer Science", modules: 2, students: 105, evaluations: 42, rating: 4.7, status: "Active" },
  ];

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <Header userName="Prof. Ramon Cruz" userRole="Department Head" onLogout={() => alert('Logout')} />
      
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="faculty" onLogout={() => alert('Logout')} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1f2937]">Faculty Management</h1>
            <p className="text-slate-500 mt-1">View and manage all teaching staff</p>
          </div>

          {/* Statistics Grid - Matching Reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Total Faculty</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">48</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <Users className="text-[#1b2d3d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teaching staff</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Active Faculty</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">45</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <TrendingUp className="text-[#1b2d3d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currently teaching</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Avg. Rating</h3>
                  <p className="text-3xl font-black mt-2 text-[#1f2937]">4.5</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <Star className="text-[#1b2d3d]" size={24} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall average</p>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">All Faculty Members</h2>
                <p className="text-slate-400 text-sm">Complete list of teaching staff</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Download size={16} /> Export List
              </button>
            </div>

            {/* Search Filters */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name, faculty ID, department, or specialization..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1f474d]/20 transition-all bg-white"
                />
              </div>
            </div>

            {/* Faculty Table - Design details from Reference */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Faculty ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Modules</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Students</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Evaluations</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyData.map((faculty, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{faculty.id}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{faculty.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{faculty.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{faculty.dept}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold">{faculty.modules}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold">{faculty.students}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold">{faculty.evaluations}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-400 fill-amber-400" size={14} />
                          <span className="text-sm font-black text-slate-800">{faculty.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-lg tracking-wider">
                          {faculty.status}
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

export default FacultyPages;