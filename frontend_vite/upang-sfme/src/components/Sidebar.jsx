import React, { useState } from 'react';
import { BookOpen, Users, History as HistoryIcon, GraduationCap, ClipboardList, BarChart3, FileText, LogOut, Menu, X } from 'lucide-react';
// import logo from '../assets/header-logo.png';

const Sidebar = ({ role, activeItem, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsOpen(false);
  };

  const getMenuItems = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
          { id: 'modules', label: 'My Modules', icon: BookOpen, path: '/dashboard/modules' },
          { id: 'instructors', label: 'Instructors', icon: Users, path: '/dashboard/instructors' },
          { id: 'history', label: 'History', icon: HistoryIcon, path: '/dashboard/history' }
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/faculty-dashboard' }
        ];
      case 'depthead':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/depthead-dashboard' },
          { id: 'students', label: 'Students', icon: GraduationCap, path: '/depthead-dashboard/students' },
          { id: 'faculty', label: 'Faculty', icon: Users, path: '/depthead-dashboard/faculty' },
          { id: 'forms', label: 'Forms', icon: BookOpen, path: '/depthead-dashboard/forms' },
          { id: 'reports', label: 'Reports', icon: FileText, path: '/depthead-dashboard/reports' },
          { id: 'audit-log', label: 'Audit Log', icon: ClipboardList, path: '/depthead-dashboard/audit-log' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Menu Button - Kept yellow for visibility */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-40 bg-[#ffcc00] text-[#0d1b2a] p-3 rounded-full shadow-xl hover:bg-yellow-300 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Changed to White Theme */}
      <aside className={`fixed left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto flex flex-col shadow-sm lg:top-[80px] top-0`}>
        <div className="p-6 flex-1 flex flex-col">
          
          {/* Logo Container - Added bg if logo has white text, otherwise remove bg-gray-50 */}
          {/* <div className="mb-8 p-2 rounded-lg bg-gray-50 flex items-center justify-center">
            {/* <img 
              src={logo} 
              alt="UPang Logo" 
              className="h-10 w-auto object-contain" 
            />
          </div> */}

          {/* Menu Items */}
          <nav className="space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-[#ffcc00] text-[#0d1b2a] shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#0d1b2a]' : 'text-gray-400'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-6 mt-6" />

          {/* Logout Button */}
        <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold mt-6 shadow-md shadow-red-200"
            >
            <LogOut size={18} />
            Logout
        </button>
        </div>
      </aside>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block lg:w-64 shrink-0" />
    </>
  );
};

export default Sidebar;