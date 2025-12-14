import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [questionStage, setQuestionStage] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [message, setMessage] = useState("");

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

  const handleVerifyAnswer = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-question",
        { email, answer: securityAnswer }
      );
      if (!res.data.success) return setMessage("❌ " + res.data.error);
      setMessage("✔ Login Successful!");
      
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.name || '');
      localStorage.setItem('is3FAVerified', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());

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

  const styles = {
    pageWrapper: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      justifyContent: "center",
      alignItems: "center",
    },
    cardContainer: {
      position: "relative",
      width: "1000px",
      maxHeight: "450px",
      padding: "0",
      display: "flex",
      flexDirection: "column",
    },
    backLink: {
      position: "absolute",
      top: "20px",
      left: "20px",
      fontSize: "0.9rem",
      color: "#1a73e8",
      textDecoration: "none",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      zIndex: 10,
    },
    card: {
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    cardHeader: {
      textAlign: "center",
      marginBottom: "28px",
    },
    logoBadge: {
      fontSize: "2.5rem",
      marginBottom: "12px",
      display: "inline-block",
    },
    cardTitle: {
      fontSize: "1.3rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: "0 0 4px 0",
      letterSpacing: "-0.3px",
    },
    cardSubtitle: {
      fontSize: "0.85rem",
      color: "#6b7280",
      margin: "0",
      fontWeight: "400",
    },
    formSection: {
      width: "100%",
    },
    heading: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: "0 0 6px 0",
      letterSpacing: "-0.3px",
    },
    msg: {
      padding: "10px 14px",
      background: "#fef2f2",
      color: "#991b1b",
      borderLeft: "3px solid #ef4444",
      borderRadius: "6px",
      marginBottom: "16px",
      fontWeight: "500",
      fontSize: "0.85rem",
    },
    inputGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "0.8rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "6px",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    inputIcon: {
      position: "absolute",
      left: "12px",
      fontSize: "1rem",
      pointerEvents: "none",
    },
    input: {
      width: "100%",
      padding: "10px 10px 10px 38px",
      fontSize: "0.9rem",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      background: "#f9fafb",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      color: "#1f2937",
    },
    questionText: {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "14px",
      padding: "12px",
      background: "#f0f4f8",
      borderRadius: "6px",
      borderLeft: "3px solid #1a73e8",
    },
    rememberSection: {
      marginTop: "4px",
      marginBottom: "16px",
    },
    btn: {
      width: "100%",
      padding: "11px 16px",
      marginBottom: "16px",
      background: "linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    registrationSection: {
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid #e5e7eb",
      textAlign: "center",
    },
    registrationText: {
      fontSize: "0.8rem",
      color: "#6b7280",
      margin: "0 0 8px 0",
    },
    registerButton: {
      display: "inline-block",
      padding: "8px 16px",
      background: "white",
      color: "#1a73e8",
      border: "1.5px solid #1a73e8",
      borderRadius: "6px",
      textDecoration: "none",
      fontWeight: "600",
      fontSize: "0.85rem",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    registerButtonDisabled: {
      display: "inline-block",
      padding: "8px 16px",
      background: "white",
      color: "#6b7280",
      border: "1.5px solid #d1d5db",
      borderRadius: "6px",
      fontWeight: "600",
      fontSize: "0.85rem",
      cursor: "not-allowed",
      opacity: "0.6",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        <a href="/" style={styles.backLink}>← Back to Home</a>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoBadge}>💊</div>
            <h1 style={styles.cardTitle}>Medical Supply Chain</h1>
            <p style={styles.cardSubtitle}>Secure Access Portal</p>
          </div>

          <div style={styles.formSection}>
            <h2 style={styles.heading}>Login</h2>
            {message && <p style={styles.msg}>{message}</p>}

            {!otpStage && !questionStage && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>✉️</span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      style={styles.input}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      style={styles.input}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.rememberSection}>
                  <button style={styles.btn} onClick={handleLogin}>
                    Login to Dashboard
                  </button>
                </div>
              </>
            )}

            {otpStage && !questionStage && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Enter OTP</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🔑</span>
                    <input
                      placeholder="Enter OTP from your email"
                      style={styles.input}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
                <button style={styles.btn} onClick={handleVerifyOTP}>
                  Verify OTP
                </button>
              </>
            )}

            {questionStage && (
              <>
                <p style={styles.questionText}>{securityQuestion}</p>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Answer</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>❓</span>
                    <input
                      placeholder="Enter your answer"
                      style={styles.input}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                    />
                  </div>
                </div>
                <button style={styles.btn} onClick={handleVerifyAnswer}>
                  Submit Answer
                </button>
              </>
            )}

            <div style={styles.registrationSection}>
              <p style={styles.registrationText}>Don't have an account?</p>
              {roleFromUrl === 'Patient' ? (
                <a href="/register" style={styles.registerButton}>
                  Create Account
                </a>
              ) : (
                <p style={styles.registerButtonDisabled}>
                  Contact administrator to create account
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}