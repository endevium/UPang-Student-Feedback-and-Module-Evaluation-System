import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Users } from 'lucide-react';

const InstructorsPage = () => {
  return (
    // Root: bg-slate-50 for that soft, modern light feel
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      
      {/* Header: Full width */}
      <Header 
        userName="Gabriel Esperanza" 
        userRole="Student" 
        onLogout={() => alert('Logging out...')} 
      />

      <div className="flex flex-1 flex-row relative">
        {/* Sidebar */}
        <Sidebar 
          role="student" 
          activeItem="instructors" 
          onLogout={() => alert('Logging out...')} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-12">
          <div className="container mx-auto max-w-6xl">
            {/* Title: Using brand teal for a professional academic look */}
            <h1 className="text-4xl font-bold text-[#1f474d] tracking-tight">Instructors</h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage and view the faculty members assigned to your modules.
            </p>

            {/* Placeholder for Instructor Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* Card: White background with slate border and soft shadow */}
               <div className="bg-white border border-slate-200 p-10 rounded-2xl text-center shadow-sm">
                  <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-100">
                    <Users className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No Instructors Assigned</h3>
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                    Once your modules are finalized for the current semester, your instructors will appear here for evaluation.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="mt-6 text-sm font-bold text-[#1f474d] hover:underline"
                  >
                    Return to Dashboard
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorsPage;