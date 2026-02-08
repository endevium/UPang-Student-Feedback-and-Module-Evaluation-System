import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ArrowLeft, ArrowRight, CheckCircle, Star, Send } from 'lucide-react';

const EvaluationForm = ({ moduleId }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hoverStar, setHoverStar] = useState(null);

  // Mock data matching your second example's structure
  const moduleData = {
    code: "CS401",
    name: "Advanced Database Systems",
    instructor: "Prof. Maria Santos",
  };

  const sections = [
    {
      title: "Instructor Effectiveness",
      description: "Evaluate the instructor's teaching methods and effectiveness",
      questions: [
        { id: "inst_1", category: "Instructor", question: "The instructor demonstrates mastery of the subject matter", type: "scale" },
        { id: "inst_2", category: "Instructor", question: "The instructor explains concepts clearly and effectively", type: "scale" },
      ],
    },
    {
      title: "Course Content",
      description: "Rate the quality and relevance of course materials",
      questions: [
        { id: "cont_1", category: "Content", question: "The course content is relevant to my program of study", type: "scale" },
        { id: "cont_2", category: "Content", question: "Learning materials are helpful and clear", type: "scale" },
      ],
    },
    {
      title: "Overall Rating",
      description: "Provide your overall assessment and feedback",
      questions: [
        { id: "ovr_1", category: "Overall", question: "Overall rating of this course", type: "rating" },
        { id: "feed_1", category: "Feedback", question: "What are the strengths of this course?", type: "text" },
      ],
    },
  ];

  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCount = Object.keys(responses).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const handleResponse = (id, val) => setResponses(prev => ({ ...prev, [id]: val }));
  
  const isSectionComplete = (idx) => sections[idx].questions.every(q => responses[q.id]);

  const handleNext = () => currentSection < sections.length - 1 && setCurrentSection(prev => prev + 1);
  const handlePrevious = () => currentSection > 0 && setCurrentSection(prev => prev - 1);
  
  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
        alert("Please complete all questions");
        return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
        <div className="flex flex-1">
          <Sidebar role="student" activeItem="modules" onLogout={() => {}} />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md bg-white p-12 rounded-3xl border border-slate-200 shadow-xl">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Submitted!</h1>
              <p className="text-slate-500 mb-8">Your feedback for {moduleData.name} has been recorded.</p>
              <button onClick={() => window.history.back()} className="w-full bg-[#1f474d] text-white py-3 rounded-xl font-bold">Back to Modules</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-slate-800 bg-slate-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar role="student" activeItem="modules" onLogout={() => {}} />
        
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Top Navigation */}
            <div className="flex flex-col gap-4">
              <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-teal-700 w-fit">
                <ArrowLeft size={16} /> Back to Modules
              </button>
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold">{moduleData.code}</span>
                <h1 className="text-4xl font-black text-slate-900 mt-2">{moduleData.name}</h1>
                <p className="text-slate-500">{moduleData.instructor}</p>
              </div>
            </div>

            {/* Section Progress Bar Indicators */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {sections.map((section, idx) => {
                const isComplete = isSectionComplete(idx);
                const isCurrent = idx === currentSection;
                return (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSection(idx)}
                    className={`flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all text-left min-w-[160px] ${
                      isCurrent ? "border-[#1f474d] bg-teal-50/30" : isComplete ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isComplete ? <CheckCircle size={14} className="text-emerald-500" /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-teal-500" : "bg-slate-300"}`} />}
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? "text-teal-700" : "text-slate-400"}`}>Section {idx + 1}</span>
                    </div>
                    <p className={`text-sm font-bold truncate ${isCurrent ? "text-slate-900" : "text-slate-500"}`}>{section.title.split(' ')[0]}</p>
                  </button>
                );
              })}
            </div>

            {/* Main Question Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800">{sections[currentSection].title}</h2>
                <p className="text-slate-500 text-sm">{sections[currentSection].description}</p>
              </div>

              <div className="p-8 space-y-10">
                {sections[currentSection].questions.map((q, idx) => (
                  <div key={q.id} className="space-y-4">
                    <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400">{idx + 1}</span>
                        <label className="text-lg font-bold text-slate-800 leading-tight pt-1">{q.question}</label>
                    </div>

                    <div className="pl-12">
                        {q.type === 'scale' && (
                           <div className="flex flex-col gap-2 max-w-md">
                                {[
                                    {v: "5", l: "Strongly Agree", c: "bg-emerald-500"},
                                    {v: "4", l: "Agree", c: "bg-emerald-400"},
                                    {v: "3", l: "Neutral", c: "bg-amber-400"},
                                    {v: "2", l: "Disagree", c: "bg-orange-400"},
                                    {v: "1", l: "Strongly Disagree", c: "bg-red-500"}
                                ].map(s => (
                                    <button 
                                        key={s.v}
                                        onClick={() => handleResponse(q.id, s.v)}
                                        className={`flex items-center p-3 rounded-xl border-2 transition-all ${
                                            responses[q.id] === s.v ? "border-teal-600 bg-teal-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-black mr-4 ${s.c}`}>{s.v}</div>
                                        <span className="text-sm font-bold text-slate-700">{s.l}</span>
                                    </button>
                                ))}
                           </div>
                        )}

                        {q.type === 'rating' && (
                            <div className="flex items-center gap-3">
                                {[1,2,3,4,5].map(star => (
                                    <button 
                                        key={star}
                                        onMouseEnter={() => setHoverStar(star)}
                                        onMouseLeave={() => setHoverStar(null)}
                                        onClick={() => handleResponse(q.id, star.toString())}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star 
                                            size={40} 
                                            className={`${(hoverStar || responses[q.id]) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                                        />
                                    </button>
                                ))}
                                {responses[q.id] && <span className="ml-4 text-xl font-black text-slate-800">{responses[q.id]} / 5</span>}
                            </div>
                        )}

                        {q.type === 'text' && (
                            <textarea 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-[120px]"
                                placeholder="Type your feedback here..."
                                value={responses[q.id] || ""}
                                onChange={(e) => handleResponse(q.id, e.target.value)}
                            />
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <button 
                    disabled={currentSection === 0}
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-slate-400 disabled:opacity-30 hover:text-slate-700"
                >
                    <ArrowLeft size={18} /> Previous
                </button>

                <div className="hidden sm:block">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Section {currentSection + 1} of {sections.length}</p>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{width: `${((currentSection+1)/sections.length)*100}%`}} />
                    </div>
                </div>

                {currentSection === sections.length - 1 ? (
                    <button 
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                    >
                        Submit <Send size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        disabled={!isSectionComplete(currentSection)}
                        className="flex items-center gap-2 px-8 py-3 bg-[#1f474d] text-white rounded-xl font-black hover:bg-[#163539] disabled:opacity-50"
                    >
                        Next Section <ArrowRight size={18} />
                    </button>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EvaluationForm;