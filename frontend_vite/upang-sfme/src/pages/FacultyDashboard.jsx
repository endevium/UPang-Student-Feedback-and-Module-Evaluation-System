import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { BookOpen, Users, Star, TrendingUp, MessageSquare, LogOut, ChevronRight } from 'lucide-react';

const FacultyDashboard = () => {
  const [facultyInfo] = useState({
    name: "Prof. Ana Reyes",
    employeeId: "FAC-001",
    department: "Computer Science",
    specialization: "Web Development",
    overallRating: 4.7,
    totalEvaluations: 145,
    totalStudents: 135,
  });

  const [modules] = useState([
    {
      id: "mod_001",
      code: "CS403",
      name: "Web Development",
      semester: "2nd Semester 2025-2026",
      students: 45,
      evaluations: 42,
      averageRating: 4.8,
      responseRate: 93,
      status: "active"
    },
    {
      id: "mod_002",
      code: "CS406",
      name: "Computer Networks",
      semester: "2nd Semester 2025-2026",
      students: 42,
      evaluations: 38,
      averageRating: 4.7,
      responseRate: 90,
      status: "active"
    },
    {
      id: "mod_003",
      code: "CS401",
      name: "Advanced Database Systems",
      semester: "2nd Semester 2025-2026",
      students: 48,
      evaluations: 45,
      averageRating: 4.6,
      responseRate: 94,
      status: "active"
    },
  ]);

  const handleLogout = () => {
    alert('Logging out...');
  };

  const handleViewDetails = (moduleId) => {
    alert(`Viewing detailed feedback for ${moduleId}`);
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="faculty" activeItem="dashboard" onLogout={() => alert('Logging out...')} />
      
      <div className="flex-1 flex flex-col">

        <div className="flex-1">
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-r from-[#1b263b] to-[#16395b] py-12 border-b border-white/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {facultyInfo.name}</h1>
              <p className="text-white/70 text-sm mb-1">{facultyInfo.department} • {facultyInfo.specialization}</p>
              <p className="text-white/60 text-xs">Employee ID: <span className="text-[#ffcc00]">{facultyInfo.employeeId}</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* PERFORMANCE OVERVIEW STATS */}
      <section className="bg-[#0d1b2a] py-8 border-b border-white/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1b263b] to-[#254148] p-6 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm mb-2">Overall Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold text-[#ffcc00]">{facultyInfo.overallRating}</p>
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1b263b] to-[#254148] p-6 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm mb-2">Total Students</p>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold">{facultyInfo.totalStudents}</p>
                <Users className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1b263b] to-[#254148] p-6 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm mb-2">Evaluations</p>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold">{facultyInfo.totalEvaluations}</p>
                <MessageSquare className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1b263b] to-[#254148] p-6 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm mb-2">Response Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold text-purple-400">92%</p>
                <TrendingUp className="text-purple-400" size={32} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Your Modules</h2>
              <p className="text-white/60 mt-2">Select a module to view detailed ratings and feedback</p>
            </div>
            <span className="bg-white/10 px-4 py-2 rounded-full border border-white/10 text-sm">
              {modules.length} Active Modules
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-gradient-to-r from-[#1b263b] to-[#16395b] p-8 rounded-xl border border-white/10 hover:border-white/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[#ffcc00] font-mono font-bold text-sm tracking-widest">{module.code}</span>
                    <h3 className="text-2xl font-bold mt-1">{module.name}</h3>
                    <p className="text-white/50 text-sm mt-1">{module.semester}</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] uppercase font-bold border border-green-500/20">
                    {module.status}
                  </span>
                </div>

                <div className="bg-[#0d1b2a]/50 p-6 rounded-lg border border-white/5 mb-6">
                  <p className="text-white/60 text-xs mb-2">Average Rating</p>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className={`${s <= Math.floor(module.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">{module.averageRating}</span>
                    <span className="text-white/40 text-sm">/ 5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                  <div>
                    <p className="text-2xl font-bold">{module.students}</p>
                    <p className="text-[10px] text-white/50 uppercase">Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{module.evaluations}</p>
                    <p className="text-[10px] text-white/50 uppercase">Responses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{module.responseRate}%</p>
                    <p className="text-[10px] text-white/50 uppercase">Rate</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(module.id)}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffcc00] text-[#041c32] py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
                >
                  View Detailed Feedback
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK HIGHLIGHTS SECTION */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-2xl font-bold mb-8">Recent Highlights</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-green-500/5 border-l-4 border-green-500 rounded-r-lg">
              <div className="flex-1">
                <p className="font-bold text-green-400">Strong Performance</p>
                <p className="text-white/70 text-sm mt-1">
                  CS403 - Web Development received excellent ratings (4.8/5.0) for course content and delivery.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg">
              <div className="flex-1">
                <p className="font-bold text-blue-400">High Engagement</p>
                <p className="text-white/70 text-sm mt-1">
                  92% average response rate across all modules shows strong student participation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-purple-500/5 border-l-4 border-purple-500 rounded-r-lg">
              <div className="flex-1">
                <p className="font-bold text-purple-400">Positive Feedback</p>
                <p className="text-white/70 text-sm mt-1">
                  Students appreciate your teaching methodology and clear explanations in recent comments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>

      
        </div>
    </div>
  );
};

export default FacultyDashboard;