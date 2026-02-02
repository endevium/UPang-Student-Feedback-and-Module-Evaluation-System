import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Star, 
  BarChart3, 
  FileText, 
  LogOut 
} from 'lucide-react';

const DeptHeadDashboard = () => {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const [deptHeadInfo] = useState({
    name: 'Prof. Ramon Cruz',
    position: 'Department Head',
    department: 'Computer Science',
    email: 'ramon.cruz@upang.edu.ph'
  });

  const stats = [
    {
      title: "Total Students",
      value: "1,245",
      description: "Active enrolled students",
      icon: GraduationCap,
      color: "bg-blue-500/20 text-blue-400",
      change: "+12% from last semester"
    },
    {
      title: "Total Faculty",
      value: "48",
      description: "Active teaching staff",
      icon: Users,
      color: "bg-purple-500/20 text-purple-400",
      change: "+3 new instructors"
    },
    {
      title: "Total Modules",
      value: "156",
      description: "Courses this semester",
      icon: BookOpen,
      color: "bg-green-500/20 text-green-400",
      change: "Across all programs"
    },
    {
      title: "Evaluation Rate",
      value: "87%",
      description: "Completion rate",
      icon: TrendingUp,
      color: "bg-yellow-500/20 text-[#ffcc00]",
      change: "+5% from last semester"
    },
  ];

  const recentEvaluations = [
    {
      student: "Juan Dela Cruz",
      studentId: "2024-12345",
      module: "CS401 - Advanced Database",
      instructor: "Prof. Maria Santos",
      rating: 5,
      date: "2026-01-26",
    },
    {
      student: "Maria Garcia",
      studentId: "2024-12346",
      module: "CS402 - Software Engineering",
      instructor: "Dr. Juan Dela Cruz",
      rating: 4,
      date: "2026-01-26",
    },
    {
      student: "Pedro Santos",
      studentId: "2024-12347",
      module: "CS403 - Web Development",
      instructor: "Prof. Ana Reyes",
      rating: 5,
      date: "2026-01-25",
    },
  ];

  const topRatedFaculty = [
    {
      name: "Prof. Ana Reyes",
      department: "Computer Science",
      rating: 4.8,
      evaluations: 45,
      modules: 3
    },
    {
      name: "Prof. Carlos Ramos",
      department: "Computer Science",
      rating: 4.7,
      evaluations: 42,
      modules: 2
    },
    {
      name: "Prof. Maria Santos",
      department: "Computer Science",
      rating: 4.6,
      evaluations: 48,
      modules: 3
    },
  ];

  const handleLogout = () => {
    alert('Logging out...');
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="depthead" activeItem="dashboard" onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
     

        <div className="flex-1">
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-r from-[#1b263b] to-[#16395b] py-12 border-b border-white/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Department Head Dashboard</h1>
              <p className="text-white/70 text-sm mb-1">{deptHeadInfo.name} • {deptHeadInfo.position}</p>
              <p className="text-[#ffcc00] font-semibold">{deptHeadInfo.department}</p>
            </div>
            {/* <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button> */}
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="py-8 bg-[#0d1b2a]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-[#1b263b] p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">{stat.title}</h3>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-white/40 mt-1">{stat.description}</p>
                  <p className="text-xs text-green-400 mt-2 font-medium">{stat.change}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT TABLES/CARDS */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Evaluations */}
            <div className="bg-[#1b263b] rounded-xl border border-white/10 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Recent Evaluations</h2>
                  <p className="text-white/50 text-xs">Latest student submissions</p>
                </div>
                <button 
                  onClick={() => handleNavigation('/dept-head/reports')}
                  className="text-[#ffcc00] text-xs font-bold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="p-6 space-y-4">
                {recentEvaluations.map((evaluation, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-[#0d1b2a] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white truncate">{evaluation.student}</p>
                        <span className="text-[10px] text-white/40">({evaluation.studentId})</span>
                      </div>
                      <p className="text-xs text-[#ffcc00] truncate font-medium">{evaluation.module}</p>
                      <p className="text-[10px] text-white/50 italic">{evaluation.instructor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-[#ffcc00] text-[#ffcc00]" />
                        <span className="text-sm font-bold">{evaluation.rating}</span>
                      </div>
                      <span className="text-[10px] text-white/30">{new Date(evaluation.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Rated Faculty */}
            <div className="bg-[#1b263b] rounded-xl border border-white/10 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Top Rated Faculty</h2>
                  <p className="text-white/50 text-xs">Highest evaluation scores</p>
                </div>
                <button 
                  onClick={() => handleNavigation('/dept-head/faculty')}
                  className="text-[#ffcc00] text-xs font-bold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="p-6 space-y-4">
                {topRatedFaculty.map((faculty, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-[#0d1b2a] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/40 to-purple-600/40 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{faculty.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{faculty.department}</p>
                      <p className="text-[10px] text-[#ffcc00] font-medium">
                        {faculty.evaluations} evaluations • {faculty.modules} modules
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#ffcc00] text-[#ffcc00]" />
                      <span className="text-lg font-bold text-white">{faculty.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="bg-[#1b263b] rounded-xl border border-white/10 p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { to: "/dept-head/students", icon: GraduationCap, label: "Manage Students", sub: "View all students" },
                { to: "/dept-head/faculty", icon: Users, label: "Manage Faculty", sub: "View all instructors" },
                { to: "/dept-head/reports", icon: BarChart3, label: "View Reports", sub: "Analytics & insights" },
                { to: "#", icon: FileText, label: "Export Data", sub: "Download reports", isButton: true }
              ].map((action, i) => (
                <div key={i} className="group">
                  <div className="flex flex-col p-4 h-full rounded-xl bg-[#0d1b2a] border border-white/10 group-hover:border-[#ffcc00]/50 group-hover:bg-[#162a3d] transition-all cursor-pointer">
                    <div className="p-3 w-fit rounded-lg bg-[#ffcc00]/10 text-[#ffcc00] mb-4 group-hover:bg-[#ffcc00] group-hover:text-[#041c32] transition-colors">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="font-bold text-white text-sm mb-1 group-hover:text-[#ffcc00] transition-colors">{action.label}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{action.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
        </div>

        </div>
    </div>
  );
};

export default DeptHeadDashboard;