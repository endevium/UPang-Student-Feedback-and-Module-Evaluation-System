import React from 'react';
import { LogOut } from 'lucide-react';
// 1. Import your logo here
import logo from '../assets/header-logo.png'; 

const Header = ({ userName = 'User', userRole = 'Student' }) => {
  return (
    <header className="w-full bg-[#1f474d] shadow-lg sticky top-0 z-50 h-[80px] flex items-center border-b border-white/10">
      <div className="w-full px-8"> 
        <div className="flex justify-between items-center">
          
          {/* Left: Brand Logo Area */}
          <div className="flex items-center gap-3">
             <img 
                src={logo} 
                alt="UPang SFME Logo" 
                className="h-12 w-auto object-contain cursor-pointer"
                onClick={() => window.location.href = '/dashboard'}
             />
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-white font-semibold text-sm">{userName}</p>
               <p className="text-cyan-300 text-[10px] uppercase tracking-wider">{userRole}</p>
             </div>
             
             <div className="relative">
               <img
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                 className="w-10 h-10 rounded-full border-2 border-[#ffcc00]/50 object-cover"
                 alt="avatar"
               />
             </div>

             
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;