import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    securityAnswer: ""
  });

  const [msg, setMsg] = useState("");
  const FIXED_QUESTION = "What is the name of your pet?";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const payload = { ...form, securityQuestion: FIXED_QUESTION };
      const res = await axios.post("http://localhost:5000/api/auth/register", payload);

      if (res.data.success) setMsg("✅ Registered Successfully!");
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.error || "Registration failed"));
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.bgOverlay}></div>

      <div style={styles.centerContainer}>
        <div style={styles.cardWrapper}>

          {/* LEFT PANEL */}
          <div style={styles.leftPanel}>
            <h1 style={styles.logo}>SupplyChain<br />Secure</h1>
            <p style={styles.leftText}>Create your account to continue</p>
          </div>

          {/* RIGHT PANEL */}
          <div style={styles.rightPanel}>
            <h2 style={styles.heading}>Register</h2>
            <p style={styles.subheading}>Create your account</p>

            {msg && <p style={styles.msg}>{msg}</p>}

            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                style={styles.input}
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                style={styles.input}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                style={styles.input}
                required
              />

              {/* 🔥 MAROON DROPDOWN WITH WHITE TEXT */}
              <select
                name="role"
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select Role</option>
                <option>Manufacturer</option>
                <option>Distributor</option>
                <option>Pharmacist</option>
                <option>Patient</option>
              </select>

              <label style={styles.label}>{FIXED_QUESTION}</label>

              <input
                name="securityAnswer"
                placeholder="Answer"
                onChange={handleChange}
                style={styles.input}
                required
              />

              <button type="submit" style={styles.btn}>Create Account</button>
            </form>

            <p style={styles.bottomText}>
              Already have an account?{" "}
              <a href="/login" style={styles.link}>Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ STYLES ------------------ */

const MAROON = "#5a0000";
const DEEP_MAROON = "#7a1212";

const styles = {
  pageWrapper: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  bgOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  centerContainer: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  cardWrapper: {
    display: "flex",
    width: "90%",
    maxWidth: "1100px",
    minHeight: "550px",
    background: "rgba(255, 255, 255, 0.75)",
    borderRadius: "18px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  leftPanel: {
    flex: 1.1,
    padding: "60px 45px",
    background: "rgba(255,255,255,0.38)",
  },

  logo: {
    fontSize: "42px",
    fontWeight: "800",
    color: MAROON,
  },

  leftText: {
    fontSize: "15px",
    color: MAROON,
  },

  rightPanel: {
    flex: 1,
    padding: "50px",
  },

  heading: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "5px",
    color: MAROON,
  },

  subheading: {
    marginBottom: "18px",
    color: MAROON,
  },

  msg: {
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "10px",
    fontWeight: "600",
    color: MAROON,
    background: "rgba(255,220,220,0.6)",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #bbb",
    background: "#f6f6f6",
    fontSize: "15px",
    color: MAROON,
  },

  /* 🔥 MAROON DROPDOWN STYLING */
  select: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    background: DEEP_MAROON,
    color: "white",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
  },

  label: {
    marginTop: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: MAROON,
  },

  btn: {
    width: "100%",
    padding: "12px",
    background: DEEP_MAROON,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "20px",
    cursor: "pointer",
  },

  bottomText: {
    marginTop: "14px",
    fontSize: "13px",
    color: MAROON,
  },

  link: {
    color: DEEP_MAROON,
    fontWeight: "700",
    textDecoration: "none",
  },
};
