import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

/* ===== PAGE IMPORTS (VERIFIED) ===== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Patient from "./pages/Patient";
import Distributor from "./pages/Distributor";
import Admin from "./pages/Admin";
import Manufacturer from "./pages/Manufacturer";
import Pharmacy from "./pages/Pharmacy";
import Register from "./pages/Register";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/patient" element={<Patient />} />
          <Route path="/distributor" element={<Distributor />} />
          <Route path="/manufacturer" element={<Manufacturer />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}
