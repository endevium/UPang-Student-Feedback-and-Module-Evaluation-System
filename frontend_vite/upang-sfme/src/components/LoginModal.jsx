import React, { useState } from 'react';
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

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle context menu (right-click)
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Disable keyboard shortcuts for developer tools
  const handleKeyDown = (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) ||
      (e.ctrlKey && e.key === 's')
    ) {
      e.preventDefault();
      return false;
    }
  };

  // Disable body scroll and clear sensitive data on unmount
  React.useEffect(() => {
    if (isOpen) {
      // Disable scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Enable scrolling on body when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      // Clean up: restore scrolling and clear sensitive data on unmount
      document.body.style.overflow = 'unset';
      setStudentId('');
      setPassword('');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black/85 flex justify-center items-center z-[9999] backdrop-blur-[5px]" 
      onClick={onClose}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="font-['Optima-Medium','Optima',sans-serif] bg-[#23344E] bg-gradient-to-b from-[#28625C] to-[#23344E] w-[1100px] max-w-[95%] rounded-[20px] relative overflow-hidden text-white" 
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
        <button 
          className="absolute top-5 right-5 bg-none border-none text-white text-[30px] cursor-pointer hover:opacity-80 hover:text-[#ffcc00]" 
          onClick={onClose}
        >
          &times;
        </button>
        
        <div className="flex min-h-[420px] select-none">
          {/* Left Side: Students Image */}
          <div className="flex-1 relative bg-transparent flex items-end justify-center overflow-visible">
            <img 
              src={studentGroupImg} 
              alt="Students" 
              className="w-full h-auto z-0 object-contain 
              translate-x-[15%] 
              translate-y-[-15%] 
              scale-[1.29]" 
            />
          </div>

          {/* Right Side: Form */}
          <div className="flex-[1.2] p-7 ml-[95px]">
            <div className="flex items-center gap-2.5 mb-[20px]">
              <img src={logo} alt="Logo" className="w-[400px]" />
            </div>

            <div className="form-content select-none">
              <h1 className="text-[2rem] mb-1.5 font-bold">
                {loginRole === 'student' && 'Student Login'}
                {loginRole === 'faculty' && 'Faculty Login'}
                {loginRole === 'depthead' && 'Dept Head Login'}
              </h1>
              <p className="opacity-70 text-[0.85rem] mb-[20px]">
                Enter your credentials to access your evaluation dashboard
              </p>

             {/* Login Role Selection */}
              <div className="mb-[15px] inline-flex gap-0 
              w-full
              rounded-full bg-white/20 p-1">
                {['student', 'faculty', 'depthead'].map((role) => {
                  const roleLabels = {
                    student: 'Student',
                    faculty: 'Faculty',
                    depthead: 'Dept Head'
                  };
                  
                  const icons = {
                    student: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    ),
                    faculty: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                      </svg>
                    ),
                    depthead: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  };
                  
                  const isActive = loginRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setLoginRole(role)}
                      className={`flex-1 px-4 py-2 text-xs font-semibold transition-all duration-300 rounded-full flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-white text-[#003d3d] shadow-md'
                          : 'text-white hover:text-white/80'
                      }`}
                    >
                      <span className={isActive ? 'text-[#003d3d]' : 'text-white'}>
                        {icons[role]}
                      </span>
                      {roleLabels[role]}
                    </button>
                  );
                })}
              </div>
              
              {/* Student ID Input */}
              <div className="mb-3.5">
                <label htmlFor="studentId" className="block mb-2 text-[0.8rem]">
                  {loginRole === 'student' && 'Student ID'}
                  {loginRole === 'faculty' && 'Faculty ID'}
                  {loginRole === 'depthead' && 'Employee ID'}
                </label>
                <div className="flex items-center bg-white rounded-[15px] py-2 px-[18px] mt-1.25">
                  <User className="text-[#94A3B8] mr-3 shrink-0 pointer-events-none" size={18} />
                  <input 
                    id="studentId"
                    type="text" 
                    placeholder={loginRole === 'student' ? '00-0000-000' : loginRole === 'faculty' ? 'FID-0000' : 'EID-0000'}
                    className="flex-1 border-none outline-none font-['Optima-Medium',sans-serif] font-medium text-base text-[#1E293B] bg-transparent"
                    value={studentId}
                    onChange={handleIdChange}
                    maxLength={15} 
                    inputMode="numeric"
                    required
                    autoComplete="off"
                    spellCheck="false"
                    onContextMenu={handleContextMenu}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-3.5">
                <label className="block mb-2 text-[0.8rem]">Password</label>
                <div className="flex items-center bg-white rounded-[15px] py-2 px-[18px] mt-1.25">
                  <Lock className="text-[#94A3B8] mr-3 shrink-0 pointer-events-none" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="flex-1 border-none outline-none font-['Optima-Medium',sans-serif] font-medium text-base text-[#1E293B] bg-transparent"
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="off"
                    spellCheck="false"
                    onContextMenu={handleContextMenu}
                    onPaste={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                  />
                  <button 
                    type="button" 
                    className="bg-none border-none p-0 ml-2.5 cursor-pointer text-[#64748B] flex items-center transition-colors duration-200 hover:text-[#0F172A] pointer-events-auto"
                    onClick={() => setShowPassword(!showPassword)}
                    onContextMenu={handleContextMenu}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="font-[inherit] 
              w-full 
              p-1.5
              bg-[#ffcc00] 
              text-[#041c32] 
              font-bold rounded-lg cursor-pointer mt-2.5">
                {loginRole === 'student' && 'Login as Student'}
                {loginRole === 'faculty' && 'Login as Faculty'}
                {loginRole === 'depthead' && 'Login as Dept Head'}
              </button>

              {/* Demo Credentials */}
              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-[0.75rem]">
                <p className="font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                {loginRole === 'student' && (
                  <>
                    <p className="text-blue-800"><span className="font-semibold">Student ID:</span> Any value (e.g., 2024-12345)</p>
                    <p className="text-blue-800"><span className="font-semibold">Password:</span> Any value (min 6 characters)</p>
                  </>
                )}
                {loginRole === 'faculty' && (
                  <>
                    <p className="text-blue-800"><span className="font-semibold">Faculty ID:</span> Any value (e.g., FAC-001)</p>
                    <p className="text-blue-800"><span className="font-semibold">Password:</span> Any value (min 6 characters)</p>
                  </>
                )}
                {loginRole === 'depthead' && (
                  <>
                    <p className="text-blue-800"><span className="font-semibold">Employee ID:</span> Any value (e.g., EMP-001)</p>
                    <p className="text-blue-800"><span className="font-semibold">Password:</span> Any value (min 6 characters)</p>
                  </>
                )}
              </div>

              <div className="flex justify-between mt-3 text-[0.8rem]">
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="appearance-none w-[18px] h-[18px] bg-transparent border-2 border-[#ffcc00] rounded cursor-pointer grid place-content-center m-0 transition-colors duration-200 checked:bg-[#ffcc00] 
                    before:content-[''] before:w-2.5 before:h-2.5 before:scale-0 before:transition-transform before:duration-120 before:ease-in-out before:shadow-[inset_1em_1em_#041c32] before:bg-[CanvasText] before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)] checked:before:scale-100" 
                  /> 
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#forgot" className="font-[inherit] text-inherit no-underline hover:opacity-80 hover:text-[#ffcc00]">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;