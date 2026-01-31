import React from 'react';
import LandingPage from './pages/LandingPage'; // Import your landing page

function App() {
  return (
    <div className="App">
      {/* This ensures the LandingPage is the first thing rendered */}
      <LandingPage />
    </div>
  );
}

export default App;