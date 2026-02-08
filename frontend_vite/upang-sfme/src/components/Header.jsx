import React from 'react';
// 1. Import your logo here
import logo from '../assets/header-logo.png'; 

const Header = ({ userName, userRole }) => {
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
  } catch {
    storedUser = null;
  }

  const resolvedName =
    userName ||
    `${storedUser?.firstname || ''} ${storedUser?.lastname || ''}`.trim() ||
    'User';

  const roleMap = {
    student: 'Student',
    faculty: 'Faculty',
    department_head: 'Department Head',
  };

  const resolvedRole = userRole || roleMap[storedUser?.user_type] || 'Student';

  const homePathMap = {
    Student: '/dashboard',
    Faculty: '/faculty-dashboard',
    'Department Head': '/depthead-dashboard',
  };

  const homePath = homePathMap[resolvedRole] || '/';

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
                 onClick={() => window.location.href = homePath}
             />
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-white font-semibold text-sm">{resolvedName}</p>
               <p className="text-cyan-300 text-[10px] uppercase tracking-wider">{resolvedRole}</p>
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