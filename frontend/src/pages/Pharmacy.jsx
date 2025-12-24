import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Pharmacy() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const SESSION_TIMEOUT = 15 * 60 * 1000;

  const [batchId, setBatchId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [batchDetails, setBatchDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const verified = localStorage.getItem('is3FAVerified');
    const loginTime = localStorage.getItem('loginTimestamp');

    if (email && (role === 'Pharmacy' || role === 'Pharmacist') && verified === 'true') {
      if (Date.now() - parseInt(loginTime) > SESSION_TIMEOUT) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const searchBatch = async (id) => {
    setBatchId(id);
    setMessage(null);
    if (id.length < 3) {
      setBatchDetails(null);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/pharmacy/search/${id}`);
      if (res.data.success) setBatchDetails(res.data);
    } catch {
      setBatchDetails(null);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    if (!batchId || !prescription) {
      setMessage({ type: 'error', text: 'Prescription is required' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: 'info', text: 'Verifying & Encrypting…' });

      const res = await axios.post('http://localhost:5000/api/pharmacy/dispense', {
        batchId,
        prescription
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Medicine Dispensed Successfully' });
        setPrescription('');
        searchBatch(batchId);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading…</div>;

  if (!isAuthenticated) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authCard}>
          <h2>Authentication Required</h2>
          <a href="/login" style={styles.primaryBtn}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Pharmacy Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.layout}>
          {/* LEFT */}
          <div>
            <label style={styles.label}>Batch ID</label>
            <input
              style={styles.input}
              value={batchId}
              onChange={(e) => searchBatch(e.target.value)}
              placeholder="Enter Batch ID"
            />

            <label style={styles.label}>Prescription</label>
            <textarea
              style={styles.textarea}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              disabled={batchDetails?.isComplete}
            />

            {message && (
              <div style={{
                ...styles.message,
                borderColor: message.type === 'error' ? '#7a1212' : '#7a1212'
              }}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleDispense}
              disabled={!batchDetails || batchDetails.isComplete || isLoading}
              style={styles.primaryBtn}
            >
              {isLoading ? 'Processing…' : batchDetails?.isComplete ? 'Batch Closed' : 'Dispense Medicine'}
            </button>
          </div>

          {/* RIGHT */}
          <div>
            {batchDetails ? (
              <div style={styles.card}>
                <p><b>Medicine:</b> {batchDetails.medicineName}</p>
                <p><b>Manufacturer:</b> {batchDetails.manufacturerName}</p>
                <p><b>Expiry:</b> {new Date(batchDetails.expiryDate).toLocaleDateString()}</p>
                <p><b>Status:</b> {batchDetails.isComplete ? 'CLOSED' : 'AVAILABLE'}</p>
                <QRCode value={batchId} size={150} />
              </div>
            ) : (
              <div style={styles.card}>Enter Batch ID to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { minHeight: '100vh', background: '#fff', padding: 30 },
  container: { maxWidth: 1100, margin: 'auto', border: '2px solid #7a1212', padding: 30 },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: 30 },
  layout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30 },

  label: { fontWeight: 700, color: '#7a1212', marginTop: 12 },
  input: { width: '100%', padding: 14, fontSize: 15, border: '2px solid #7a1212', marginBottom: 14 },
  textarea: { width: '100%', minHeight: 120, padding: 14, border: '2px solid #7a1212' },

  primaryBtn: {
    marginTop: 20,
    padding: 14,
    width: '100%',
    background: '#7a1212',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer'
  },

  logoutBtn: {
    background: '#fff',
    color: '#7a1212',
    border: '2px solid #7a1212',
    padding: '8px 14px',
    cursor: 'pointer'
  },

  card: { border: '2px solid #7a1212', padding: 20, textAlign: 'center' },
  message: { marginTop: 12, padding: 10, border: '2px solid #7a1212' },

  loading: { textAlign: 'center', padding: 50 },
  authPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authCard: { border: '2px solid #7a1212', padding: 40 }
};
