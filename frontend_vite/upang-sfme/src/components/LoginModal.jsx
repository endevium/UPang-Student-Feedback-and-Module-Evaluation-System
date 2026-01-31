import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react'; 
import './LoginModal.css';
import logo from '../assets/navbar-logo.png';
import studentGroupImg from '../assets/group-student2.png';
import shootingStar from '../assets/shooting-star.png';


const LoginModal = ({ isOpen, onClose }) => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');

  const handleIdChange = (e) => {
    const value = e.target.value;
    // Regular Expression: Allow only numbers (0-9) and hyphens (-)
    const filteredValue = value.replace(/[^0-9-]/g, '');
    setStudentId(filteredValue);
  };
  

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="login-flex">
          {/* Left Side: Students Image */}

         <div className="login-image-side">
            <img src={shootingStar} alt="Decoration" className="shooting-star-icon" />
            <img src={studentGroupImg} alt="Students" className="main-student-img" />
        </div>

          {/* Right Side: Form */}
          <div className="login-form-side">
            <div className="login-header">
              <img src={logo} alt="Logo" className="mini-logo" />
            </div>

            <div className="form-content">
              <h1>Student Login</h1>
              <p className="subtitle">Enter your credentials to access your evaluation dashboard</p>
              
              {/* Student ID Input with User Icon */}
              <div className="input-group">
                <label htmlFor="studentId">Student ID</label>
                <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                    id="studentId"
                    type="text" 
                    placeholder="00-0000-000"
                    value={studentId}
                    onChange={handleIdChange}
                    /* Security attributes */
                    maxLength={15} 
                    inputMode="numeric" // Triggers numeric keypad on mobile phones
                    required 
                    />
                </div>
             </div>

              {/* Password Input with Lock and Eye Icons */}
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                  />
                  <button 
                    type="button" 
                    className="toggle-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="submit-login">Login</button>

              <div className="form-footer">
                <label className="remember-me">
                    <input type="checkbox" /> 
                    <span>Remember me</span>
                </label>
                <a href="#forgot">Forgot Password?</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;