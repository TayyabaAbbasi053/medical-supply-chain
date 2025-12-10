import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import Manufacturer from "./pages/Manufacturer";
import Distributor from "./pages/Distributor";
import Patient from "./pages/Patient";

import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function Layout() {
  const location = useLocation();

  // Hide navbar on login and register pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="app-container">

      {/* NAVBAR (Hidden on login/register) */}
      {!hideNavbar && (
        <nav className="navbar">
          <h1>💊 SupplyChain Secure</h1>
          <div className="links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/manufacturer">Manufacturer</Link>
            <Link to="/distributor">Distributor & Pharmacy</Link>
            <Link to="/patient">Patient Verification</Link>
          </div>
        </nav>
      )}

      <div className="content">
        <Routes>
          <Route path="/" element={<div></div>} />

          {/* AUTH PAGES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* DASHBOARDS */}
          <Route path="/manufacturer" element={<Manufacturer />} />
          <Route path="/distributor" element={<Distributor />} />
          <Route path="/patient" element={<Patient />} />

          {/* DEFAULT FALLBACK */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
