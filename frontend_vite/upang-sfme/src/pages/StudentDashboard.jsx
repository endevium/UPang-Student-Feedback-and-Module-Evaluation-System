import React from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  History as HistoryIcon, 
  Users,
  ArrowRight
} from "lucide-react";

const StudentDashboard = () => {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const stats = [
    {
      title: "Total Modules",
      value: "8",
      description: "Enrolled this semester",
      icon: BookOpen,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Instructors",
      value: "8",
      description: "To evaluate",
      icon: Users,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: "Completed",
      value: "10",
      description: "Total evaluations done",
      icon: CheckCircle,
      color: "bg-green-500/20 text-green-400",
    },
    {
      title: "Pending",
      value: "6",
      description: "Awaiting feedback",
      icon: AlertCircle,
      color: "bg-yellow-500/20 text-[#ffcc00]",
    },
  ];

  const recentModules = [
    {
      id: "CS401",
      name: "Advanced Database Systems",
      instructor: "Prof. Maria Santos",
      status: "pending",
    },
    {
      id: "CS402",
      name: "Software Engineering",
      instructor: "Dr. Juan Dela Cruz",
      status: "pending",
    },
    {
      id: "CS403",
      name: "Web Development",
      instructor: "Prof. Ana Reyes",
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="student" activeItem="dashboard" onLogout={() => alert('Logging out...')} />
      
      <div className="flex-1 flex flex-col">

        <main className="container mx-auto px-6 py-12 max-w-6xl space-y-12 flex-1">
        {/* Welcome Section */}
        <header>
          <h1 className="text-4xl font-bold text-[#ffcc00]">Welcome back, Student!</h1>
          <p className="text-white/60 mt-2 text-lg">Here's your evaluation overview for this semester</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-[#1b263b] p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
                    {stat.title}
                  </h3>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-white/40 mt-1">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Modules */}
        <section className="bg-[#1b263b] rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-2xl font-bold">Recent Modules</h2>
              <p className="text-white/50 text-sm">Your enrolled courses for evaluation</p>
            </div>
            <button 
              onClick={() => handleNavigation('/dashboard/modules')}
              className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {recentModules.map((module) => (
              <div key={module.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#0d1b2a] border border-white/5 hover:border-[#ffcc00]/30 transition-all group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-[#ffcc00]">
                      {module.id}
                    </span>
                    {module.status === "completed" ? (
                      <span className="text-[10px] uppercase font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold bg-yellow-500/20 text-[#ffcc00] px-2 py-1 rounded-full border border-yellow-500/20">
                        Pending
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-[#ffcc00] transition-colors">{module.name}</h3>
                  <p className="text-sm text-white/60">{module.instructor}</p>
                </div>
                <div className="flex items-center gap-3">
                  {module.status === "pending" ? (
                    <button 
                      onClick={() => handleNavigation(`/dashboard/evaluate/${module.id}`)}
                      className="bg-[#ffcc00] text-[#041c32] px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                    >
                      Evaluate
                    </button>
                  ) : (
                    <button disabled className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-white/5 text-white/30 cursor-not-allowed border border-white/10">
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-[#1b263b] rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-white/50 text-sm">Common tasks and information</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to: "/dashboard/modules", icon: BookOpen, label: "View All Modules", sub: "See your courses" },
              { to: "/dashboard/instructors", icon: Users, label: "Evaluate Instructors", sub: "Provide feedback" },
              { to: "/dashboard/history", icon: HistoryIcon, label: "Evaluation History", sub: "Past submissions" }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => handleNavigation(action.to)}
                className="group text-left w-full"
              >
                <div className="flex items-center p-4 rounded-xl bg-[#0d1b2a] border border-white/10 group-hover:border-[#ffcc00]/50 group-hover:bg-[#162a3d] transition-all">
                  <div className="p-3 rounded-lg bg-[#ffcc00]/10 text-[#ffcc00] mr-4 group-hover:bg-[#ffcc00] group-hover:text-[#041c32] transition-colors">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-[#ffcc00] transition-colors">{action.label}</div>
                    <div className="text-xs text-white/40">{action.sub}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

     
      </div>
    </div>
  );
};

export default StudentDashboard;