import React, { useState, useEffect } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";

export default function Patient() {

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const [patientName, setPatientName] = useState("Patient");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const [batchNumber, setBatchNumber] = useState("");
  const [trackBatchNumber, setTrackBatchNumber] = useState("");

  const [result, setResult] = useState("");

  // Session timeout configuration (15 minutes = 900 seconds)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning at 2 minutes remaining

  /* ---------------------------------------------------------
     CHECK 3FA AUTHENTICATION ON MOUNT
  --------------------------------------------------------- */
  useEffect(() => {
    try {
      const loggedInEmail = localStorage.getItem('userEmail');
      const loggedInRole = localStorage.getItem('userRole');
      const is3FAVerified = localStorage.getItem('is3FAVerified');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (loggedInEmail && loggedInRole === 'Patient' && is3FAVerified === 'true') {
        // Check if session has expired
        if (loginTimestamp) {
          const now = Date.now();
          const elapsed = now - parseInt(loginTimestamp);
          
          if (elapsed > SESSION_TIMEOUT) {
            // Session expired
            localStorage.clear();
            window.location.href = "/";
            return;
          }
          
          // Calculate remaining session time
          const remaining = SESSION_TIMEOUT - elapsed;
          setSessionTimeLeft(remaining);
        }
        
        setIsAuthenticated(true);
        setUserEmail(loggedInEmail);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('localStorage error:', err);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  // Session timeout interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      try {
        const loginTimestamp = localStorage.getItem('loginTimestamp');
        if (loginTimestamp) {
          const now = Date.now();
          const elapsed = now - parseInt(loginTimestamp);
          const remaining = SESSION_TIMEOUT - elapsed;

          if (remaining <= 0) {
            // Session expired - logout
            localStorage.clear();
            alert('⏱️ Your session has expired. Please login again.');
            window.location.href = "/";
            return;
          }

          setSessionTimeLeft(remaining);

          // Show warning when 2 minutes left
          if (remaining <= WARNING_TIME && !showSessionWarning) {
            setShowSessionWarning(true);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionWarning]);

  if (loading) {
    return <div style={styles.page}><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2>❌ Access Denied</h2>
          <p>You are not authorized to access this page. Please login as a Patient first.</p>
          <button onClick={() => window.location.href = "/"} style={{ padding: '10px 20px', background: '#5a0000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     LOAD PATIENT NAME
  --------------------------------------------------------- */
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    axios
      .get(`http://localhost:5000/api/auth/me?email=${email}`)
      .then((res) => {
        if (res.data.success && res.data.user?.name) {
          setPatientName(res.data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  /* ---------------------------------------------------------
     VERIFY BATCH (CORE)
  --------------------------------------------------------- */
  const verifyBatchByValue = async (value) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/modules/patient/batch/${value}`,
        {
          headers: {
            "x-user-email": localStorage.getItem("userEmail")
          }
        }
      );

      const b = res.data.batch;
      const v = res.data.verification;

      setResult(
        (v.isAuthentic ? "✔ AUTHENTIC MEDICINE\n\n" : "❌ COUNTERFEIT MEDICINE\n\n") +
        `Medicine: ${b.medicineName}\n` +
        `Manufacturer: ${b.manufacturerName}\n` +
        `Mfg Date: ${new Date(b.manufacturingDate).toLocaleDateString()}\n` +
        `Expiry: ${new Date(b.expiryDate).toLocaleDateString()}\n\n` +
        `Events in Supply Chain: ${v.chainLength}`
      );
    } catch {
      setResult("❌ Batch not found or counterfeit.");
    }
  };

  /* ---------------------------------------------------------
     VERIFY BATCH (MANUAL)
  --------------------------------------------------------- */
  const verifyBatch = async () => {
    if (!batchNumber.trim()) {
      setResult("❌ Enter a batch number.");
      return;
    }

    await verifyBatchByValue(batchNumber);
    setShowBatchModal(false);
  };

  /* ---------------------------------------------------------
     VERIFY QR FROM FILE (NEW FEATURE)
  --------------------------------------------------------- */
  const handleQRFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const qr = new Html5Qrcode("qr-file-reader");
      const decodedText = await qr.scanFile(file, true);
      await verifyBatchByValue(decodedText);
      await qr.clear();
    } catch {
      setResult("❌ Unable to read QR code from image.");
    }
    setShowBatchModal(false);
  };

  /* ---------------------------------------------------------
     TRACK SUPPLY CHAIN
  --------------------------------------------------------- */
  const trackSupplyChain = async () => {
    if (!trackBatchNumber.trim()) {
      setResult("❌ Enter a batch number.");
      setShowTrackModal(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/modules/patient/batch/${trackBatchNumber}/chain`,
        {
          headers: {
            "x-user-email": localStorage.getItem("userEmail")
          }
        }
      );

      let output = `✔ SUPPLY CHAIN TIMELINE\n\n`;

      res.data.chain.forEach((e, i) => {
        output += `#${i + 1} — ${e.role}\n`;
        output += `Location: ${e.location}\n`;
        output += `Time: ${new Date(e.timestamp).toLocaleString()}\n`;
        output += `---------------------------------\n`;
      });

      setResult(output);
      setTrackBatchNumber("");
    } catch {
      setResult("❌ No supply chain timeline found.");
    }
    setShowTrackModal(false);
  };

  /* ---------------------------------------------------------
     LOGOUT
  --------------------------------------------------------- */
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------------------------------------------------
     STYLING (UNCHANGED)
  --------------------------------------------------------- */

  const GLASS = {
    background: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(90,0,0,0.4)",
    borderRadius: "18px",
  };

  const styles = {
    page: { height: "100vh", width: "100vw", background: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center" },
    container: { width: "80%", maxWidth: "1200px", textAlign: "center", border: "2px solid #5a0000", borderRadius: "18px", padding: "40px" },
    title: { fontSize: "34px", fontWeight: 800, color: "#5a0000" },
    welcome: { fontSize: "18px", color: "#5a0000", marginBottom: "30px" },
    cardRow: { display: "flex", justifyContent: "center", gap: "40px", marginBottom: "30px" },
    card: { width: "300px", height: "200px", padding: "25px", borderRadius: "18px", border: "2px solid #5a0000", cursor: "pointer" },
    cardTitle: { fontSize: "22px", fontWeight: "700", color: "#5a0000" },
    cardText: { marginTop: "10px", color: "#333" },
    resultBox: { background: "#ffeaea", border: "1px solid #5a0000", borderRadius: "10px", width: "60%", margin: "0 auto 20px auto", padding: "20px", color: "#5a0000", whiteSpace: "pre-wrap", textAlign: "left" },
    footer: { marginTop: "20px", color: "#5a0000" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { width: "350px", background: "white", padding: "25px", textAlign: "center", borderRadius: "12px" },
    modalTitle: { fontSize: "20px", fontWeight: 700, color: "#5a0000" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" },
    btnPrimary: { width: "100%", padding: "12px", background: "#7a1212", color: "white", borderRadius: "8px", border: "none", marginBottom: "10px" },
    btnSecondary: { width: "100%", padding: "12px", background: "#bbb", borderRadius: "8px", border: "none" },
  };

  /* ---------------------------------------------------------
     JSX UI
  --------------------------------------------------------- */

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={styles.title}>👤 Patient Dashboard</h1>
            <p style={styles.welcome}>Welcome, <b>{patientName}</b> | 🔐 3FA Verified</p>
            <small style={{ color: '#999' }}>Email: {userEmail}</small>
          </div>
          <button onClick={logout} style={{ padding: '10px 20px', background: '#1f9c89', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Logout
          </button>
        </div>

        {/* Session Warning */}
        {showSessionWarning && sessionTimeLeft && (
          <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', marginBottom: '15px', color: '#856404' }}>
            ⏱️ Your session will expire in {Math.floor(sessionTimeLeft / 1000 / 60)} minute(s). Please complete your task.
          </div>
        )}

        <div style={styles.cardRow}>
          <div style={{ ...styles.card, ...GLASS }} onClick={() => setShowBatchModal(true)}>
            <h2 style={styles.cardTitle}>Verify Batch</h2>
            <p style={styles.cardText}>Check authenticity.</p>
          </div>

          <div style={{ ...styles.card, ...GLASS }}>
            <h2 style={styles.cardTitle}>Verify Medicine</h2>
            <p style={styles.cardText}>Upload QR image</p>
            <input type="file" accept="image/*" onChange={handleQRFileUpload} />
          </div>

          <div style={{ ...styles.card, ...GLASS }} onClick={() => setShowTrackModal(true)}>
            <h2 style={styles.cardTitle}>Track Supply</h2>
            <p style={styles.cardText}>View entire journey.</p>
          </div>

          <div style={{ ...styles.card, ...GLASS }} onClick={logout}>
            <h2 style={styles.cardTitle}>Logout</h2>
            <p style={styles.cardText}>End Session</p>
          </div>
        </div>

        {result && <pre style={styles.resultBox}>{result}</pre>}

        <footer style={styles.footer}>
          © 2025 SupplyChain Secure — All Rights Reserved
        </footer>
      </div>

      {showBatchModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Verify Batch Number</h3>
            <input style={styles.input} onChange={(e) => setBatchNumber(e.target.value)} />
            <button style={styles.btnPrimary} onClick={verifyBatch}>Verify</button>
            <button style={styles.btnSecondary} onClick={() => setShowBatchModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showTrackModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Track Supply</h3>
            <input style={styles.input} onChange={(e) => setTrackBatchNumber(e.target.value)} />
            <button style={styles.btnPrimary} onClick={trackSupplyChain}>Track</button>
            <button style={styles.btnSecondary} onClick={() => setShowTrackModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* hidden container required by html5-qrcode */}
      <div id="qr-file-reader" style={{ display: "none" }} />
    </div>
  );
}
