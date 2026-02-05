import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/navbar-logo.png';
import studentGroupImg from '../assets/group-student2.png';

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('student');

  const handleIdChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9-]/g, '');
    setStudentId(filteredValue);
  };

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleContextMenu = (e) => e.preventDefault();

  const handleKeyDown = (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) ||
      (e.ctrlKey && e.key === 's')
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      setStudentId('');
      setPassword('');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black/85 flex justify-center items-center z-[9999] backdrop-blur-[5px] p-4" 
      onClick={onClose}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="font-upang bg-[#23344E] bg-gradient-to-b from-[#28625C] to-[#23344E] w-full max-w-[1100px] max-h-[95vh] rounded-[20px] relative overflow-y-auto lg:overflow-hidden text-white shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Close Button */}
        <button 
          className="absolute top-4 right-5 z-50 text-white text-[32px] hover:text-[#ffcc00] transition-colors" 
          onClick={onClose}
        >
          &times;
        </button>
        
        <div className="flex flex-col lg:flex-row min-h-[420px] select-none">
          
          {/* Left Side: Students Image (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex lg:flex-1 relative bg-transparent items-end justify-center overflow-visible p-12">
            <img 
              src={studentGroupImg} 
              alt="Students" 
              className="w-full h-auto z-0 object-contain translate-x-[10%] scale-[1.3]" 
            />
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 lg:flex-[1.2] p-6 sm:p-10 lg:p-12">
            {/* Logo Section */}
            <div className="flex justify-center lg:justify-start items-center mb-6">
              <img src={logo} alt="Logo" className="w-[220px] sm:w-[300px] lg:w-[400px] h-auto" />
            </div>

            <div className="form-content">
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] mb-2 font-black">
                {loginRole === 'student' && 'Student Login'}
                {loginRole === 'faculty' && 'Faculty Login'}
                {loginRole === 'depthead' && 'Dept Head Login'}
              </h1>
              <p className="opacity-70 text-sm mb-6">
                Enter your credentials to access your evaluation dashboard
              </p>

              {/* Login Role Selection (Responsive Toggle) */}
              <div className="mb-6 flex flex-wrap sm:flex-nowrap rounded-2xl sm:rounded-full bg-white/10 p-1 gap-1">
                {['student', 'faculty', 'depthead'].map((role) => {
                  const roleLabels = { student: 'Student', faculty: 'Faculty', depthead: 'Dept Head' };
                  const isActive = loginRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setLoginRole(role)}
                      className={`flex-1 min-w-[100px] px-3 py-2.5 text-xs font-bold transition-all duration-300 rounded-xl sm:rounded-full flex items-center justify-center gap-2 ${
                        isActive ? 'bg-white text-[#003d3d] shadow-lg' : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {roleLabels[role]}
                    </button>
                  );
                })}
              </div>
              
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider opacity-80">
                    {loginRole === 'student' ? 'Student ID' : loginRole === 'faculty' ? 'Faculty ID' : 'Employee ID'}
                  </label>
                  <div className="flex items-center bg-white rounded-xl py-3 px-4">
                    <User className="text-slate-400 mr-3 shrink-0" size={20} />
                    <input 
                      type="text" 
                      placeholder={loginRole === 'student' ? '00-0000-000' : 'ID-0000'}
                      className="flex-1 border-none outline-none font-medium text-slate-800 bg-transparent placeholder:text-slate-300"
                      value={studentId}
                      onChange={handleIdChange}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold uppercase tracking-wider opacity-80">Password</label>
                  <div className="flex items-center bg-white rounded-xl py-3 px-4">
                    <Lock className="text-slate-400 mr-3 shrink-0" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex-1 border-none outline-none font-medium text-slate-800 bg-transparent placeholder:text-slate-300"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button" 
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-[#ffcc00] text-[#041c32] font-black rounded-xl cursor-pointer mt-6 shadow-lg hover:bg-[#e6b800] active:scale-[0.98] transition-all">
                LOGIN AS {loginRole.toUpperCase()}
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 accent-[#ffcc00]" /> 
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#forgot" className="text-white/70 hover:text-[#ffcc00] no-underline">
                  Forgot Password?
                </a>
              </div>
              
              {/* Responsive Demo Credentials */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-[11px] leading-relaxed">
                <p className="font-bold text-[#ffcc00] mb-1">Demo Access:</p>
                <p className="opacity-80">ID: Any numeric value | Pass: Any (min 6 chars)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;