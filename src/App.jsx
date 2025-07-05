// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import InsurancePage from './components/Insurance_page';

import NextPage from './components/Devices';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InsurancePage />} />
        <Route path="/next-page" element={<NextPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
