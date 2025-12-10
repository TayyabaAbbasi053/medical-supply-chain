import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Manufacturer from './pages/Manufacturer';
import Distributor from './pages/Distributor';
import Patient from './pages/Patient';
import './App.css'; // We will add some basic style below

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <h1>💊 SupplyChain Secure</h1>
          <div className="links">
            <Link to="/manufacturer">Manufacturer</Link>
            <Link to="/distributor">Distributor & Pharmacy</Link>
            <Link to="/patient">Patient Verification</Link>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<div className="home-hero"><h2>Select a Role above to begin</h2></div>} />
            <Route path="/manufacturer" element={<Manufacturer />} />
            <Route path="/distributor" element={<Distributor />} />
            <Route path="/patient" element={<Patient />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;