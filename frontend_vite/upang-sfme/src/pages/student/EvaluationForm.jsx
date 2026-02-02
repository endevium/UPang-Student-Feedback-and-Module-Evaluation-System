import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

const EvaluationForm = ({ moduleId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const module = {
    id: moduleId,
    code: 'CS403',
    name: 'Web Development',
    instructor: 'Prof. Ana Reyes',
  };

  const questions = [
    { id: 1, category: 'Instructor', question: 'How well did the instructor explain the course content?', type: 'rating' },
    { id: 2, category: 'Instructor', question: 'Was the instructor available for questions and support?', type: 'rating' },
    { id: 3, category: 'Course Content', question: 'How relevant was the course content to real-world applications?', type: 'rating' },
    { id: 4, category: 'Course Content', question: 'Was the course material well-organized and easy to follow?', type: 'rating' },
    { id: 5, category: 'Course Difficulty', question: 'Was the course difficulty level appropriate for your skill level?', type: 'rating' },
    { id: 6, category: 'General Feedback', question: 'What did you like most about this course?', type: 'text' },
    { id: 7, category: 'General Feedback', question: 'What could be improved in this course?', type: 'text' },
  ];

  const handleRatingChange = (value) => setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  const handleTextChange = (value) => setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  const handleNext = () => currentQuestion < questions.length - 1 && setCurrentQuestion(currentQuestion + 1);
  const handlePrevious = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);
  const handleSubmit = () => { setSubmitted(true); console.log('Submitted answers:', answers); };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id] || '';

  // SUCCESS STATE
  if (submitted) {
    return (
      <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] flex flex-col">
        <Header userName="Gabriel Esperanza" userRole="Student" onLogout={() => alert('Logging out...')} />
        <div className="flex flex-1 flex-row relative">
          <Sidebar role="student" activeItem="modules" onLogout={() => alert('Logging out...')} />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
              <p className="text-white/60 text-lg mb-8">
                Your evaluation for <strong>{module.name}</strong> has been submitted.
              </p>
              <button
                onClick={() => { window.history.pushState({}, '', '/dashboard/modules'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="w-full bg-[#ffcc00] text-[#0d1b2a] py-3 rounded-md hover:bg-yellow-400 font-bold transition-colors"
              >
                Back to Modules
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // FORM STATE
  return (
    <div className="min-h-screen w-full font-['Optima-Medium','Optima','Candara','sans-serif'] text-white bg-[#0d1b2a] flex flex-col">
      {/* 1. Full-width Header */}
      <Header userName="Gabriel Esperanza" userRole="Student" onLogout={() => alert('Logging out...')} />

      <div className="flex flex-1 flex-row relative">
        {/* 2. Sidebar aligned under header */}
        <Sidebar role="student" activeItem="modules" onLogout={() => alert('Logging out...')} />

        {/* 3. Main Content Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="container mx-auto max-w-2xl">
            {/* Back Button and Info */}
            <button
              onClick={() => { window.history.pushState({}, '', '/dashboard/modules'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Modules
            </button>

            <h1 className="text-3xl font-bold mb-2">Module Evaluation</h1>
            <div className="bg-[#1b263b] rounded-lg p-5 mb-8 border border-white/10 shadow-lg">
              <p className="font-semibold text-[#ffcc00] mb-1">{module.code}</p>
              <h2 className="text-xl font-bold">{module.name}</h2>
              <p className="text-white/60 text-sm">Instructor: {module.instructor}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-white/60">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="font-semibold text-[#ffcc00]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div className="bg-[#ffcc00] h-full transition-all duration-300 shadow-[0_0_10px_rgba(255,204,0,0.3)]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#1b263b] rounded-xl p-8 border border-white/10 mb-8 shadow-2xl">
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#ffcc00] text-[#0d1b2a] font-black uppercase tracking-widest">
                {question.category}
              </span>
              <h3 className="text-2xl font-bold mt-6 mb-8 leading-tight">{question.question}</h3>

              {question.type === 'rating' ? (
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleRatingChange(num)}
                      className={`aspect-square sm:aspect-auto py-6 rounded-xl border-2 font-black text-xl transition-all transform hover:scale-105 ${
                        currentAnswer === num
                          ? 'border-[#ffcc00] bg-[#ffcc00] text-[#0d1b2a] shadow-lg shadow-yellow-400/20'
                          : 'border-white/10 bg-[#0d1b2a] text-white/40 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded-xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]/50 min-h-[160px] resize-none transition-all"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                  currentQuestion === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Previous
              </button>

              <button
                onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
                className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  currentQuestion === questions.length - 1 
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20' 
                  : 'bg-[#ffcc00] hover:bg-yellow-400 text-[#0d1b2a] shadow-lg shadow-yellow-400/20'
                }`}
              >
                {currentQuestion === questions.length - 1 ? <><Send className="h-4 w-4" /> Submit</> : 'Next'}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EvaluationForm;