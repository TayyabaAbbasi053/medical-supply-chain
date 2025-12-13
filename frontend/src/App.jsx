import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Manufacturer from "./pages/Manufacturer";
import Distributor from "./pages/Distributor";
import Patient from "./pages/Patient";

import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARDS */}
        <Route path="/manufacturer" element={<Manufacturer />} />
        <Route path="/distributor" element={<Distributor />} />
        <Route path="/patient" element={<Patient />} />

        {/* DEFAULT */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
