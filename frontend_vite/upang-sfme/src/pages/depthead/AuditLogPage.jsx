import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const AuditLogPage = () => {
  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] overflow-x-hidden flex flex-col lg:flex-row">
      <Sidebar role="depthead" activeItem="audit-log" onLogout={() => alert('Logging out...')} />
      <div className="flex-1 flex flex-col">
        <Header userName="Admin User" userRole="Department Head" onLogout={() => alert('Logging out...')} />
        <main className="container mx-auto px-6 py-12 max-w-6xl flex-1">
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-white/60 mt-4">System audit logs will appear here.</p>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AuditLogPage;
