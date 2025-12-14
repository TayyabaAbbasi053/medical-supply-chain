import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");

  const [questionStage, setQuestionStage] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");

  const [message, setMessage] = useState("");

  // Check selected role on mount
  useEffect(() => {
    const role = localStorage.getItem("selectedRole");
    if (role) {
      setSelectedRole(role);
    }
  }, []);

  /* -----------------------------
        STEP 1 — LOGIN
  ------------------------------*/
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (!res.data.success) return setMessage("❌ " + res.data.error);

      setMessage("✔ OTP sent to your email!");
      setOtpStage(true);
    } catch (err) {
      setMessage("❌ Login failed");
    }
  };

  /* -----------------------------
      STEP 2 — VERIFY OTP
  ------------------------------*/
  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );

      if (!res.data.success) return setMessage("❌ " + res.data.error);

      setSecurityQuestion(res.data.question);
      setMessage("✔ OTP Verified! Answer your security question.");
      setQuestionStage(true);
    } catch (err) {
      setMessage("❌ OTP verification failed");
    }
  };

  /* -----------------------------
      STEP 3 — VERIFY QUESTION
  ------------------------------*/
  const handleVerifyAnswer = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-question",
        { email, answer: securityAnswer }
      );

      if (!res.data.success) return setMessage("❌ " + res.data.error);

      setMessage("✔ Login Successful!");
      
      // Verify role matches
      if (res.data.role !== selectedRole) {
        setMessage(`❌ Your account is registered as ${res.data.role}, not ${selectedRole}`);
        return;
      }
      
      // Store authentication info in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.name || '');
      localStorage.setItem('is3FAVerified', 'true'); // Mark 3FA as complete
      localStorage.setItem('loginTimestamp', Date.now().toString()); // Set login time for session timeout

      // Redirect based on role after 1 second
      setTimeout(() => {
        if (res.data.role === "Manufacturer") window.location.href = "/manufacturer";
        else if (res.data.role === "Distributor") window.location.href = "/distributor";
        else if (res.data.role === "Pharmacist") window.location.href = "/pharmacist";
        else if (res.data.role === "Patient") window.location.href = "/patient";
      }, 1000);
    } catch (err) {
      setMessage("❌ Security answer failed");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.bgOverlay}></div>

      <div style={styles.centerContainer}>
        <div style={styles.cardWrapper}>

          {/* LEFT PANEL */}
          <div style={styles.leftPanel}>
            <button
              onClick={() => {
                localStorage.removeItem("selectedRole");
                navigate("/");
              }}
              style={styles.backBtn}
            >
              ← Back
            </button>
            <h2 style={styles.heading}>Login {selectedRole && `- ${selectedRole}`}</h2>
            <p style={styles.subheading}>Access your account with 3-Factor Authentication</p>

            {message && <p style={styles.msg}>{message}</p>}

            {/* STEP 1 */}
            {!otpStage && !questionStage && (
              <>
                <input
                  type="email"
                  placeholder="Email Address"
                  style={styles.input}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Password"
                  style={styles.input}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button style={styles.btn} onClick={handleLogin}>
                  Login
                </button>
              </>
            )}

            {/* STEP 2 */}
            {otpStage && !questionStage && (
              <>
                <input
                  placeholder="Enter OTP"
                  style={styles.input}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button style={styles.btn} onClick={handleVerifyOTP}>
                  Verify OTP
                </button>
              </>
            )}

            {questionStage && (
              <>
                <p style={styles.questionText}>{securityQuestion}</p>

                <input
                  placeholder="Your Answer"
                  style={styles.input}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />

                <button style={styles.btn} onClick={handleVerifyAnswer}>
                  Submit Answer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Patient-Only Registration Link */}
        {selectedRole === "Patient" && (
          <div style={styles.registerSection}>
            <p style={styles.registerText}>
              Don't have an account?{" "}
              <a href="/register-patient" style={styles.registerLink}>
                Create Patient Account
              </a>
            </p>
          </div>
        )}

/* ------------------ MATCHING REGISTER STYLES ------------------ */

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
      "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
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
    background: "rgba(255, 200, 200, 0.6)",
    color: MAROON,
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
  },

  questionText: {
    color: MAROON,
    fontWeight: "600",
    marginBottom: "10px",
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
  },

  registerSection: {
    marginTop: "20px",
    textAlign: "center",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "8px",
  },

  registerText: {
    fontSize: "14px",
    color: MAROON,
    margin: 0,
  },

  registerLink: {
    color: DEEP_MAROON,
    fontWeight: "700",
    textDecoration: "none",
    cursor: "pointer",
  },
};
