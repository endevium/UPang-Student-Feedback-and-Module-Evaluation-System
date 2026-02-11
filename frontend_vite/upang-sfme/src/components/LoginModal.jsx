import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/navbar-logo.png';
import studentGroupImg from '../assets/group-student2.png';
import SafeImg from './SafeImg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');

  const handleIdChange = (e) => {
    const value = e.target.value;
    if (loginRole === 'student') {
      const filteredValue = value.replace(/[^0-9-]/g, '');
      setStudentId(filteredValue);
      return;
    }
    setStudentId(value);
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
      setShowPassword(false);
      setErrorMessage('');
      setMustChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setChangeError('');
    };
  }, [isOpen]);

  // If the modal is opened but the user is already authenticated,
  // immediately redirect them to their dashboard and close the modal.
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    } catch {
      storedUser = null;
    }

    const returnedRole = storedUser?.user_type;
    if (returnedRole === 'student') {
      window.history.replaceState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (returnedRole === 'faculty') {
      window.history.replaceState({}, '', '/faculty-dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (returnedRole === 'department_head' || returnedRole === 'depthead') {
      window.history.replaceState({}, '', '/depthead-dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    onClose();
  }, [isOpen]);

  useEffect(() => {
    setErrorMessage('');
    setMustChangePassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setChangeError('');
  }, [loginRole]);

  const getLoginEndpoint = () => {
    if (loginRole === 'faculty') return '/faculty/login/';
    if (loginRole === 'depthead') return '/department-head/login/';
    return '/students/login/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = studentId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId || !trimmedPassword) {
      setErrorMessage('Please enter your ID and password.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const payload =
      loginRole === 'student'
        ? { student_number: trimmedId, password: trimmedPassword, role: loginRole }
        : { email: trimmedId, password: trimmedPassword, role: loginRole };


    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}${getLoginEndpoint()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const errorText =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          'Invalid credentials. Please try again.';
        setErrorMessage(errorText);
        return;
      }

      if (data?.token) {
        // Ensure stored user has a normalized `user_type`
        if (!data.user_type) {
          data.user_type = loginRole === 'depthead' ? 'department_head' : loginRole;
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data));

        // Redirect based on normalized role
        const returnedRole = data.user_type;
        if (returnedRole === 'student') {
          if (data?.must_change_password) {
            setMustChangePassword(true);
            setChangeError('');
            return;
          }
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (returnedRole === 'faculty') {
          if (data?.must_change_password) {
            setMustChangePassword(true);
            setChangeError('');
            return;
          }
          window.history.pushState({}, '', '/faculty-dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (returnedRole === 'department_head' || returnedRole === 'depthead') {
          // Force dept head pages to go to depthead dashboard
          window.history.pushState({}, '', '/depthead-dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }

      onClose();
    } catch {
      setErrorMessage('Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError('');

    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedNewPassword || !trimmedConfirmPassword) {
      setChangeError('Please enter and confirm your new password.');
      return;
    }

    if (trimmedNewPassword.length < 6) {
      setChangeError('New password must be at least 6 characters.');
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setChangeError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = loginRole === 'student' ? '/students/change-password/' : '/faculty/change-password/';
      const payload = loginRole === 'student'
        ? {
            student_number: studentId.trim(),
            old_password: password,
            new_password: trimmedNewPassword,
          }
        : {
            email: studentId.trim(),
            old_password: password,
            new_password: trimmedNewPassword,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const errorText = data?.detail || data?.non_field_errors?.[0] || 'Unable to update password.';
        setChangeError(errorText);
        return;
      }

      const redirectPath = loginRole === 'student' ? '/dashboard' : '/faculty-dashboard';
      window.history.pushState({}, '', redirectPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      onClose();
    } catch {
      setChangeError('Unable to reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <SafeImg
              src={studentGroupImg}
              alt="Students"
              className="w-full h-auto z-0 object-contain translate-x-[10%] scale-[1.3]"
            />
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 lg:flex-[1.2] p-6 sm:p-10 lg:p-12">
            {/* Logo Section */}
            <div className="flex justify-center lg:justify-start items-center mb-6">
              <SafeImg src={logo} alt="Logo" className="w-[220px] sm:w-[300px] lg:w-[400px] h-auto" />
            </div>

            {!mustChangePassword ? (
              <form className="form-content" onSubmit={handleSubmit}>
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
                      type="button"
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
                    {loginRole === 'student' ? 'Student ID' : 'Email'}
                  </label>
                  <div className="flex items-center bg-white rounded-xl py-3 px-4">
                    <User className="text-slate-400 mr-3 shrink-0" size={20} />
                    <input 
                      type={loginRole === 'student' ? 'text' : 'email'}
                      placeholder={loginRole === 'student' ? '00-0000-000' : 'name@upang.edu.ph'}
                      className="flex-1 border-none outline-none font-medium text-slate-800 bg-transparent placeholder:text-slate-300"
                      value={studentId}
                      onChange={handleIdChange}
                      inputMode={loginRole === 'student' ? 'numeric' : 'email'}
                      autoComplete={loginRole === 'student' ? 'username' : 'email'}
                    />
                  </div>
                </div>

                <div>
                  <label className="
                  block mb-2 
                  text-xs font-bold 
                  uppercase tracking-wider 
                  opacity-80">Password</label>
                  <div className="flex items-center bg-white rounded-xl py-3 px-4">
                    <Lock className="text-slate-400 mr-3 shrink-0" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="
                      flex-1 
                      border-none 
                      outline-none 
                      font-medium 
                      text-slate-800
                      bg-transparent 
                      placeholder:text-slate-300"
                      value={password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
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

              {errorMessage && (
                <div className="mt-4 text-sm text-[#ffcc00] font-semibold" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#ffcc00] text-[#041c32] font-black rounded-xl cursor-pointer mt-6 shadow-lg hover:bg-[#e6b800] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'LOGGING IN...' : `LOGIN AS ${loginRole.toUpperCase()}`}
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
              </form>
            ) : (
              <form className="form-content" onSubmit={handleChangePassword}>
                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] mb-2 font-black">Change Password</h1>
                <p className="opacity-70 text-sm mb-6">
                  For your security, please set a new password before continuing.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider opacity-80">New Password</label>
                    <div className="flex items-center bg-white rounded-xl py-3 px-4">
                      <Lock className="text-slate-400 mr-3 shrink-0" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="flex-1 border-none outline-none font-medium text-slate-800 bg-transparent placeholder:text-slate-300"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
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

                  <div>
                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider opacity-80">Confirm Password</label>
                    <div className="flex items-center bg-white rounded-xl py-3 px-4">
                      <Lock className="text-slate-400 mr-3 shrink-0" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="flex-1 border-none outline-none font-medium text-slate-800 bg-transparent placeholder:text-slate-300"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                {changeError && (
                  <div className="mt-4 text-sm text-[#ffcc00] font-semibold" role="alert">
                    {changeError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#ffcc00] text-[#041c32] font-black rounded-xl cursor-pointer mt-6 shadow-lg hover:bg-[#e6b800] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;