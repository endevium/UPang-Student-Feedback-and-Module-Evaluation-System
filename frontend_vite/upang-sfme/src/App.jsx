import React, { useEffect, useState } from 'react';

// Main Pages
import LandingPage from './pages/LandingPage.jsx';
import About from './pages/About.jsx';
import ContactPage from './pages/ContactPage.jsx';

// Dept Head Pages
import DeptHeadDashboard from './pages/depthead/DeptHeadDashboard.jsx';
import AuditLogPage from './pages/depthead/AuditLogPage.jsx';
import FacultyPages from './pages/depthead/FacultyPages.jsx';
import Forms from './pages/depthead/Forms.jsx';
import ReportsPage from './pages/depthead/ReportsPage.jsx';
import StudentsPage from './pages/depthead/StudentsPage.jsx';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import HistoryPage from './pages/student/HistoryPage.jsx';
import InstructorsPage from './pages/student/InstructorsPage.jsx';
import ModulePage from './pages/student/ModulePage.jsx';
import EvaluationForm from './pages/student/EvaluationForm.jsx';

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Routing Logic
  const renderContent = () => {
    // Basic Pages
    if (route === '/about') return <About />;
    if (route === '/contact') return <ContactPage />;

    // Dept Head Nested Routes
    if (route.startsWith('/depthead-dashboard')) {
      if (route === '/depthead-dashboard/audit-log') return <AuditLogPage />;
      if (route === '/depthead-dashboard/faculty') return <FacultyPages />;
      if (route === '/depthead-dashboard/forms') return <Forms />;
      if (route === '/depthead-dashboard/reports') return <ReportsPage />;
      if (route === '/depthead-dashboard/students') return <StudentsPage />;
      return <DeptHeadDashboard />;
    }

    // Faculty Routes
    if (route === '/faculty-dashboard') return <FacultyDashboard />;

    // Student Nested Routes
    if (route.startsWith('/dashboard')) {
      if (route === '/dashboard/history') return <HistoryPage />;
      if (route === '/dashboard/instructors') return <InstructorsPage />;
      if (route === '/dashboard/modules') return <ModulePage />;
      if (route.startsWith('/dashboard/evaluate/')) {
        const moduleId = route.split('/')[3];
        return <EvaluationForm moduleId={moduleId} />;
      }
      
      return <StudentDashboard />;
    }

    // Fallback to LandingPage
    return <LandingPage />;
  };

  return (
    <div className="App">
      {/* If LandingPage fails, this div will show us the app is at least alive */}
      {renderContent() || <div className="p-10 text-black">Route not found or component failed to load.</div>}
    </div>
  );
}

export default App;