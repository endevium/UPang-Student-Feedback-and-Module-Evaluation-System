import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  FileEdit, 
  BarChart3, 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2,
  HelpCircle
} from 'lucide-react';

const EvaluationForms = () => {
  // Hardcoded data matching your provided design
  const formsList = [
    { 
      title: "Standard Module Evaluation Form", 
      status: "Active", 
      type: "Module", 
      description: "Default evaluation form for all modules and courses",
      questions: 15,
      usage: 156,
      created: "1/15/2026"
    },
    { 
      title: "Instructor Performance Evaluation", 
      status: "Active", 
      type: "Instructor", 
      description: "Comprehensive instructor evaluation covering teaching effectiveness",
      questions: 12,
      usage: 48,
      created: "1/15/2026"
    },
    { 
      title: "Laboratory Course Evaluation", 
      status: "Active", 
      type: "Module", 
      description: "Specialized form for laboratory and practical courses",
      questions: 18,
      usage: 45,
      created: "1/10/2026"
    },
    { 
      title: "Mid-Semester Feedback Form", 
      status: "Draft", 
      type: "Module", 
      description: "Quick feedback collection for mid-semester reviews",
      questions: 8,
      usage: 0,
      created: "1/26/2026"
    }
  ];

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <Header userName="Prof. Ramon Cruz" userRole="Department Head" onLogout={() => alert('Logout')} />
      
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="depthead" activeItem="forms" onLogout={() => alert('Logout')} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#1f2937]">Evaluation Forms</h1>
              <p className="text-slate-500 mt-1">Create and manage evaluation forms for students</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1f474d] text-white rounded-lg font-bold text-sm hover:bg-[#163539] transition-all shadow-md">
              <Plus size={18} /> Create new Form
            </button>
          </div>

          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Forms", value: "8", icon: <FileText className="text-amber-500" />, sub: "All evaluation forms", bg: "bg-amber-50" },
              { label: "Active Forms", value: "5", icon: <CheckCircle className="text-emerald-500" />, sub: "Currently in use", bg: "bg-emerald-50" },
              { label: "Draft Forms", value: "3", icon: <FileEdit className="text-orange-500" />, sub: "Not yet published", bg: "bg-orange-50" },
              { label: "Total Usage", value: "249", icon: <BarChart3 className="text-slate-700" />, sub: "Times used", bg: "bg-slate-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</h3>
                    <p className="text-3xl font-black mt-1 text-[#1f2937]">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 ${stat.bg} rounded-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Forms List Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">All Forms</h2>
                <p className="text-slate-400 text-sm">Manage your evaluation forms</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search forms..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {formsList.map((form, idx) => (
                <div key={idx} className="group p-5 border border-slate-100 rounded-xl hover:border-teal-100 hover:bg-teal-50/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-slate-800">{form.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${form.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {form.status}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-100 text-slate-600">
                        {form.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{form.description}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-orange-400" /> {form.questions} questions</span>
                      <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-blue-400" /> Used {form.usage} times</span>
                      <span className="flex items-center gap-1.5"><FileEdit size={14} className="text-purple-400" /> Created {form.created}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <Eye size={14} /> Preview
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all">
                      <Copy size={16} />
                    </button>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="font-black text-blue-600 not-italic">Active forms</span> are available for students to use in evaluations
              </li>
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span className="font-black text-orange-600 not-italic">Draft forms</span> are not visible to students until published
              </li>
              <li className="flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Duplicate existing forms to create variations quickly
              </li>
            </ul>
          </div>

        </main>
      </div>
    </div>
  );
};

export default EvaluationForms;