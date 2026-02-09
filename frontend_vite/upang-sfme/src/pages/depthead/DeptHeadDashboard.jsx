import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Star, 
  BarChart3, 
  FileText, 
  ChevronRight,
  ArrowUpRight
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
      color: "bg-blue-50 text-blue-600",
      change: "+12% growth"
    },
    {
      title: "Total Faculty",
      value: "48",
      description: "Active teaching staff",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      change: "+3 new staff"
    },
    {
      title: "Total Modules",
      value: "156",
      description: "Courses this semester",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
      change: "All programs"
    },
    {
      title: "Evaluation Rate",
      value: "87%",
      description: "Completion rate",
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      change: "+5% increase"
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

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="dashboard" />
        
        <main className="flex-1 overflow-y-auto">
          
          {/* TOP WELCOME SECTION */}
          <section className="bg-white border-b border-slate-200 py-10">
            <div className="container mx-auto px-8 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#1f474d] tracking-tight">Department Overview</h1>
                  <p className="text-slate-500 mt-1">{deptHeadInfo.name} • {deptHeadInfo.department} Head</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-[#1f474d] text-white rounded-lg font-bold text-sm hover:bg-[#2a5d65] transition-colors shadow-lg shadow-teal-100">
                        Generate Analytics
                    </button>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-8 max-w-6xl py-10">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</h3>
                      <div className={`p-2 rounded-xl ${stat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {stat.change.split(' ')[0]}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{stat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MAIN CONTENT TABLES/CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Recent Evaluations */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Recent Evaluations</h2>
                    <p className="text-slate-400 text-xs">Latest student submissions</p>
                  </div>
                  <button onClick={() => handleNavigation('/dept-head/reports')} className="text-[#1f474d] text-xs font-bold hover:underline flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {recentEvaluations.map((evaluation, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-800 truncate text-sm">{evaluation.student}</p>
                          <span className="text-[10px] text-slate-400 font-mono">#{evaluation.studentId}</span>
                        </div>
                        <p className="text-xs text-[#1f474d] truncate font-bold">{evaluation.module}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">{evaluation.instructor}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-slate-800">{evaluation.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{evaluation.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Rated Faculty */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Top Rated Faculty</h2>
                    <p className="text-slate-400 text-xs">Department performance leaders</p>
                  </div>
                  <button onClick={() => handleNavigation('/dept-head/faculty')} className="text-[#1f474d] text-xs font-bold hover:underline flex items-center gap-1">
                    Faculty List <ChevronRight size={14} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {topRatedFaculty.map((faculty, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[#1f474d] font-black text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{faculty.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                          {faculty.evaluations} Reviews • {faculty.modules} Courses
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold text-slate-800">{faculty.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                  <BarChart3 className="text-[#1f474d]" size={24} />
                  <h2 className="text-xl font-bold text-slate-800">Management Portal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { to: "/dept-head/students", icon: GraduationCap, label: "Manage Students", sub: "Roster & Enrollment" },
                  { to: "/dept-head/faculty", icon: Users, label: "Manage Faculty", sub: "Load & Assignments" },
                  { to: "/dept-head/reports", icon: BarChart3, label: "Analytics Hub", sub: "Performance Trends" },
                  { to: "#", icon: FileText, label: "Export Archives", sub: "CSV & PDF Formats" },
                ].map((action, i) => (
                  <div key={i} className="group">
                    <div className="flex flex-col p-5 h-full rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#1f474d]/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
                      <div className="p-3 w-fit rounded-xl bg-white text-[#1f474d] mb-4 border border-slate-100 group-hover:bg-[#1f474d] group-hover:text-white transition-all duration-300">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-[#1f474d] transition-colors">{action.label}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{action.sub}</div>
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

export default DeptHeadDashboard;