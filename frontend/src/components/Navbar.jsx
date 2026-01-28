import React from 'react';
import './Navbar.css';
// Import the logo here
import logo from '../assets/navbar-logo.png'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          {/* Use the imported variable inside curly braces */}
          <img src={logo} alt="UPang Logo" />
        </div>

        <div className="nav-elements">
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <button className="login-btn">Log In</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;