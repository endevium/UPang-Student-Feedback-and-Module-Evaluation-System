import React, { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import ContactPage from './pages/ContactPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import DeptHeadDashboard from './pages/DeptHeadDashboard';

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="App">
      {route.startsWith('/about') ? <About /> : route.startsWith('/contact') ? <ContactPage /> : route.startsWith('/faculty-dashboard') ? <FacultyDashboard /> : route.startsWith('/depthead-dashboard') ? <DeptHeadDashboard /> : route.startsWith('/dashboard') ? <StudentDashboard /> : <LandingPage />}
    </div>
  );
}

export default App;