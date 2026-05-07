import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import Home from './pages/Home';
import Checklist from './pages/Checklist';
import Score from './pages/Score';
import Summary from './pages/Summary';

function App() {
  return (
    <AuditProvider>
      <Router>
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative overflow-x-hidden shadow-2xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/score" element={<Score />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </div>
      </Router>
    </AuditProvider>
  );
}

export default App;
