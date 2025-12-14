import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import Home from "./pages/Home";
import Manufacturer from "./pages/Manufacturer";
import Distributor from "./pages/Distributor";
import Patient from "./pages/Patient";

import Login from "./pages/Login";

import "./App.css";

function Layout() {
  const location = useLocation();

  // Hide navbar on login and home pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/";

  return (
    <div className="app-container">

      {/* NAVBAR (Hidden on login/home) */}
      {!hideNavbar && (
        <nav className="navbar">
          <h1>💊 SupplyChain Secure</h1>
          <div className="links">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/manufacturer">Manufacturer</Link>
            <Link to="/distributor">Distributor</Link>
            <Link to="/patient">Patient Verification</Link>
          </div>
        </nav>
      )}

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* AUTH PAGE */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARDS */}
          <Route path="/manufacturer" element={<Manufacturer />} />
          <Route path="/distributor" element={<Distributor />} />
          <Route path="/patient" element={<Patient />} />

          {/* DEFAULT FALLBACK */}
          <Route path="*" element={<Home />} />
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
