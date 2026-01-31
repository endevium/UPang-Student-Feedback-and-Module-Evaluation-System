import React from 'react';
import Navbar from '../components/Navbar';
import './LandingPage.css';
import studentCutout from '../assets/students-cutout.png';
import heroTextPng from '../assets/hero-text.png';
import studentGroupImg from '../assets/group-students.png';
import starDoodleImg from '../assets/star-doodle.png';
import sectionText from '../assets/text2.png';
import sectionText2 from '../assets/text3.png';
import sectionText3 from '../assets/text4.png';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      <Navbar />

      {/* HERO */}
      <header className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <img 
              src={heroTextPng} 
              alt="YOUR VOICE SHAPES OUR FUTURE" 
              className="hero-title-img" 
            />
            <div className="hero-btns">
              <button className="btn-primary">Get Started →</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>

          <div className="hero-image-container">
            <img src={studentCutout} alt="Students" className="hero-img" />
          </div>
        </div>
      </header>

      {/* WHY SECTION */}
      <section className="features-section">
        <div className="container">
          <img 
              src={sectionText2} 
              alt="YOUR VOICE SHAPES OUR FUTURE" 
              className="hero-title-img" 
            />
          <p className="section-subtitle">
            A modern, streamlined approach to course evaluation designed with students in mind.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <p>
                Covers instructor effectiveness, course content, and learning environment.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              
              <p>
                View submission history and track feedback status with ease.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              
              <p>
                Your responses remain anonymous and protected at all times.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              
              <p>
                Get reminders and notifications so you stay on track.
              </p>
            </div>
          </div>
          <div className="features-decoration-container">
            <img src={studentGroupImg} alt="Students" className="features-student-img" />
            <img src={starDoodleImg} alt="Decoration" className="features-doodle-img" />
          </div>
        </div>
      </section>

      {/* MAKE YOUR VOICE HEARD */}
      <section className="cta-section">
        <div className="container cta-flex">
          <div className="cta-left">
            <img 
              src={sectionText} 
              alt="YOUR VOICE SHAPES OUR FUTURE" 
              className="hero-title-img" 
            />
            <p className="cta-description">
              Your feedback is crucial in helping Upang maintain high educational standards and continuously improve the learning experience for all student.
            </p>
            <ul className="check-list">
              <li> Easy-to-use interface with step-by-step evaluation process</li>
              <li> Mobile-responsive design for evaluations on any device</li>
              <li> Instant submission confirmation and history tracking</li>
              <li> Contribute to improving course quality and teaching methods</li>
              <li> Help shape the future of education at UPANG</li>
            </ul>
          </div>

          <div className="cta-card">
            <h3>READY TO GET STARTED?</h3>
            <p>Sign in using your Student Number and Start your evaluation</p>
            <button className="btn-primary full-width">Get Started →</button>
            <p className="cta-note">
              Note: All evaluations are anonymous and confidential. Your honest feedback help improve our university
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="container">
           <img 
              src={sectionText3} 
              alt="YOUR VOICE SHAPES OUR FUTURE" 
              className="hero-title-img" 
            />
          <p className="section-subtitle">Simple, straightforward evaluation process in just a few steps.</p>

          <div className="how-grid">
            <div className="how-item">
              <div className="how-circle">👤</div>
              <h4>Log In</h4>
              <p>Access your account using your student credentials</p>
            </div>
            <div className="how-item">
              <div className="how-circle">📝</div>
              <h4>Select Module</h4>
              <p>Choose from your enrolled courses ready for evaluation</p>
            </div>
            <div className="how-item">
              <div className="how-circle">📨</div>
              <h4>Submit Feedback</h4>
              <p>Complete the evaluation form and submit your responses</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-container">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <h3 className="footer-title">UNIVERSITY OF PANGASINAN</h3>
              <p className="footer-subtitle">Students Feedback | Module Evaluation</p>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-column">
              <p>
                We believe in the power of connection and shared growth. Join us in shaping better education.
              </p>
              <h5>Features</h5>
              <p>Fast evaluations, anonymous submissions, secure platform.</p>
            </div>
            <div className="footer-column">
              <p>
                Need help? Our support team is here to guide you through the evaluation process.
              </p>
              <h5>Support</h5>
              <p>Help Center • FAQs • Contact Support</p>
            </div>
            <div className="footer-column">
              <h5>Follow Us</h5>
              <div className="social-links">
                <span>Facebook</span>
                <span>Twitter</span>
                <span>Instagram</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 UPang SFME • Home • About • Events • Contact
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
