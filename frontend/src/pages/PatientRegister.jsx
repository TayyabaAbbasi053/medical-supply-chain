import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PatientRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", // Auto-selected
    securityAnswer: ""
  });

  const [msg, setMsg] = useState("");
  const FIXED_QUESTION = "What is the name of your pet?";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validation
    if (!form.name || !form.email || !form.password || !form.securityAnswer) {
      setMsg("❌ All fields are required");
      return;
    }

    try {
      const payload = { ...form, securityQuestion: FIXED_QUESTION };
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload
      );

      if (res.data.success) {
        setMsg("✅ Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
          localStorage.setItem("selectedRole", "Patient");
        }, 2000);
      }
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
            <p style={styles.leftText}>Create your patient account</p>
          </div>

          {/* RIGHT PANEL */}
          <div style={styles.rightPanel}>
            <button
              onClick={() => navigate("/login")}
              style={styles.backBtn}
            >
              ← Back to Login
            </button>
            <h2 style={styles.heading}>Patient Registration</h2>
            <p style={styles.subheading}>Create your account to verify medicines</p>

            {msg && <p style={{...styles.msg, color: msg.includes("✅") ? "#155724" : "#721c24", background: msg.includes("✅") ? "#d4edda" : "#f8d7da"}}>{msg}</p>}

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

              {/* Role - Auto-selected, Read-only */}
              <input
                type="text"
                value="Patient"
                disabled
                style={{...styles.input, background: "#f0f0f0", cursor: "not-allowed"}}
                title="Patient role is auto-selected"
              />

              <label style={styles.label}>{FIXED_QUESTION}</label>

              <input
                name="securityAnswer"
                placeholder="Answer"
                onChange={handleChange}
                style={styles.input}
                required
              />

              <button type="submit" style={styles.btn}>
                Create Account
              </button>
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

/* ==================== STYLES ==================== */

const MAROON = "#5a0000";
const DEEP_MAROON = "#7a1212";

const styles = {
  pageWrapper: {
    position: "fixed",
    inset: 0,
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  bgOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url('https://images.unsplash.com/photo-1576091160550-112173f7f869?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 0,
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
    minHeight: "500px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  leftPanel: {
    flex: 1.1,
    padding: "60px 45px",
    background: "rgba(255,255,255,0.40)",
  },

  logo: {
    fontSize: "42px",
    fontWeight: "800",
    color: MAROON,
  },

  leftText: {
    marginTop: "10px",
    fontSize: "16px",
    color: MAROON,
  },

  rightPanel: {
    flex: 1,
    padding: "50px",
    position: "relative",
    overflowY: "auto",
  },

  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "transparent",
    border: "none",
    color: MAROON,
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "background 0.2s",
  },

  heading: {
    fontSize: "28px",
    fontWeight: "800",
    color: MAROON,
    marginTop: "20px",
  },

  subheading: {
    marginBottom: "18px",
    fontSize: "15px",
    color: MAROON,
  },

  msg: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontWeight: "600",
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
    boxSizing: "border-box",
  },

  label: {
    color: MAROON,
    fontWeight: "600",
    marginTop: "10px",
    display: "block",
  },

  btn: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: DEEP_MAROON,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  bottomText: {
    marginTop: "14px",
    fontSize: "13px",
    color: MAROON,
  },

  link: {
    color: DEEP_MAROON,
    fontWeight: "700",
  },
};
