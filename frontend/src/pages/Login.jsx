import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [questionStage, setQuestionStage] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [message, setMessage] = useState("");

  /* ================= AUTH LOGIC (UNCHANGED) ================= */

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      if (!res.data.success) return setMessage("❌ " + res.data.error);
      setMessage("✔ OTP sent to your email");
      setOtpStage(true);
    } catch {
      setMessage("❌ Login failed");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );
      if (!res.data.success) return setMessage("❌ " + res.data.error);
      setSecurityQuestion(res.data.question);
      setMessage("✔ OTP verified");
      setQuestionStage(true);
    } catch {
      setMessage("❌ OTP verification failed");
    }
  };

  const handleVerifyAnswer = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-question",
        { email, answer: securityAnswer }
      );
      if (!res.data.success) return setMessage("❌ " + res.data.error);

      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("is3FAVerified", "true");
      localStorage.setItem("loginTimestamp", Date.now().toString());

      setTimeout(() => {
        if (res.data.role === "Manufacturer") window.location.href = "/manufacturer";
        else if (res.data.role === "Distributor") window.location.href = "/distributor";
        else if (res.data.role === "Patient") window.location.href = "/patient";
        else window.location.href = "/pharmacy";
      }, 800);
    } catch {
      setMessage("❌ Security answer failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Medical Supply Chain</h1>
        <p style={styles.subtitle}>Secure Login Portal</p>

        {message && <div style={styles.msg}>{message}</div>}

        {!otpStage && !questionStage && (
          <>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={styles.button} onClick={handleLogin}>
              Login
            </button>
          </>
        )}

        {otpStage && !questionStage && (
          <>
            <label style={styles.label}>OTP</label>
            <input
              style={styles.input}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button style={styles.button} onClick={handleVerifyOTP}>
              Verify OTP
            </button>
          </>
        )}

        {questionStage && (
          <>
            <div style={styles.question}>{securityQuestion}</div>
            <input
              style={styles.input}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            <button style={styles.button} onClick={handleVerifyAnswer}>
              Submit Answer
            </button>
          </>
        )}

        <div style={styles.register}>
          {roleFromUrl === "Patient" ? (
            <a href="/register" style={styles.link}>
              Create Account
            </a>
          ) : (
            <div style={styles.disabled}>Contact administrator</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#ffffff",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },

  card: {
    width: "430px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    border: "3px solid #5a0e0e",
    boxShadow: "0 12px 30px rgba(90,14,14,0.25)",
  },

  title: {
    textAlign: "center",
    color: "#5a0e0e",
    fontSize: "1.45rem",
    fontWeight: "700",
    marginBottom: "6px",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "0.85rem",
    marginBottom: "26px",
    color: "#7a1212",
  },

  label: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#5a0e0e",
    marginBottom: "4px",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "11px",
    borderRadius: "6px",
    border: "2px solid #7a1212",
    marginBottom: "16px",
    fontSize: "0.85rem",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#5a0e0e",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "4px",
  },

  msg: {
    background: "#fff5f5",
    color: "#5a0e0e",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    marginBottom: "16px",
    border: "1.5px solid #5a0e0e",
  },

  question: {
    background: "#ffffff",
    border: "2px solid #5a0e0e",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontWeight: "600",
    color: "#5a0e0e",
  },

  register: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "0.8rem",
  },

  link: {
    color: "#5a0e0e",
    fontWeight: "700",
    textDecoration: "none",
  },

  disabled: {
    color: "#999",
    border: "1px solid #ccc",
    padding: "8px",
    borderRadius: "6px",
  },
};
