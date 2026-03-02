import React, { useEffect, useState } from 'react';
import logo from '../assets/navbar-logo.png';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 z-[1000] flex items-center w-full h-20 overflow-hidden transition-all duration-300 ${
          isScrolled
            ? 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg'
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute -top-10 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between w-[90%] max-w-[1200px] mx-auto">
          <div className="py-1.25">
            <img src={logo} alt="UPang Logo" className="h-[60px] w-auto" />
          </div>

          <div className="flex items-center gap-10">
            <ul className="flex list-none gap-[30px] m-0 p-0">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="text-white no-underline font-medium text-base transition-colors duration-300 hover:text-[#fbbf24]"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/about');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="text-white no-underline font-medium text-base transition-colors duration-300 hover:text-[#fbbf24]"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/contact');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="text-white no-underline font-medium text-base transition-colors duration-300 hover:text-[#fbbf24]"
                >
                  Contact
                </a>
              </li>
            </ul>
            <div className="nav-actions">
              {!isLoggedIn && (
                <button 
                  className="bg-white text-[#102a43] border-none py-2 px-6 rounded font-bold cursor-pointer transition-all duration-300 hover:bg-[#fbbf24] hover:-translate-y-0.5" 
                  onClick={() => setIsModalOpen(true)}
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;