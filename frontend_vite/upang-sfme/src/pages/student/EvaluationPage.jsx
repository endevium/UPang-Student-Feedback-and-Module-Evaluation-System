import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ModulePage from './ModulePage';
import InstructorsPage from './InstructorsPage';

const EvaluationPage = () => {
  const [tab, setTab] = useState('modules');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const deriveFromPath = () => {
      const p = window.location.pathname || '';
      if (p.endsWith('/instructors')) setTab('instructors');
      else setTab('modules');
    };

    deriveFromPath();
    const onPop = () => deriveFromPath();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigateTo = (t) => {
    const path = `/dashboard/evaluation/${t}`;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setTab(t);
  };

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-900 bg-slate-50 flex flex-col">
      <div className="flex flex-1 flex-row relative">
        <Sidebar role="student" activeItem="evaluation" />

        <main className="flex-1 overflow-y-auto px-6 py-12">
          <div className="container mx-auto max-w-6xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-[#1f474d] tracking-tight">Evaluation Form</h1>
              <p className="text-slate-500 mt-1">Choose a category to start an evaluation.</p>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 px-4 pt-4">
                <div className="flex items-end gap-1">
                    {['modules', 'instructors'].map((t) => (
                      <button
                        key={t}
                        onClick={() => navigateTo(t)}
                        className={`-mb-px px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-150 rounded-t-lg ${
                          tab === t
                            ? 'bg-white text-[#1f474d] border border-slate-200 border-b-white shadow-[0_-1px_0_0_rgba(15,23,42,0.02)]'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                        }`}
                        aria-selected={tab === t}
                      >
                        {t}
                      </button>
                    ))}
                </div>

                <div className="flex-1 max-w-md md:ml-6 pb-2">
                  <input
                    type="text"
                    placeholder={`Search ${tab === 'modules' ? 'modules, codes, or instructors' : 'instructors'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200">
                {tab === 'modules' ? (
                  <ModulePage showSidebar={false} searchQuery={searchQuery} />
                ) : (
                  <InstructorsPage showSidebar={false} searchQuery={searchQuery} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EvaluationPage;
