import React, { useState } from 'react';
import './Navbar.css';
import logo from '../assets/navbar-logo.png';
import LoginModal from './LoginModal'; // Import the new modal

const Navbar = () => {
  // 1. Create the state
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={logo} alt="UPang Logo" />
          </div>

          <div className="nav-elements">
            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <div className="nav-actions">
              {/* 2. Toggle state on click */}
              <button className="login-btn" onClick={() => setIsModalOpen(true)}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Render Modal */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;