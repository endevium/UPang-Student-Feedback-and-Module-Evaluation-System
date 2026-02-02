import React, { useState } from 'react';
import { BookOpen, Users, History as HistoryIcon, BarChart3, FileText, LogOut, Menu, X } from 'lucide-react';
import logo from '../assets/navbar-logo.png';

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
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/faculty-dashboard' },
          { id: 'modules', label: 'My Modules', icon: BookOpen, path: '/faculty-dashboard/modules' },
          { id: 'feedback', label: 'Feedback', icon: FileText, path: '/faculty-dashboard/feedback' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/faculty-dashboard/analytics' }
        ];
      case 'depthead':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/depthead-dashboard' },
          { id: 'faculty', label: 'Faculty', icon: Users, path: '/depthead-dashboard/faculty' },
          { id: 'reports', label: 'Reports', icon: FileText, path: '/depthead-dashboard/reports' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/depthead-dashboard/analytics' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-40 bg-[#ffcc00] text-[#041c32] p-3 rounded-full shadow-lg hover:bg-yellow-300 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#1b263b] border-r border-white/10 transform transition-transform duration-300 z-40 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto flex flex-col`}>
        <div className="p-6 flex-1 flex flex-col">
          {/* Logo/Brand */}
          <div className="mb-8">
            <img 
                src={logo} 
                alt="UPang Logo" 
                className="h-12 w-auto mb-2 object-contain" 
            />
            {/* <span className="text-sm text-white/60">Role: {roleLabel}</span> */}
            </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-[#ffcc00] text-[#041c32]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 mt-6" />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors font-medium mt-6"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
};

export default Sidebar;
