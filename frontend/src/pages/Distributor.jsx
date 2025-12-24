import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Distributor() {
  /* ================= AUTH ================= */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 2 * 60 * 1000;

  /* ================= INPUT ================= */
  const [batchId, setBatchId] = useState('');
  const [distributorName, setDistributorName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Regional Warehouse');
  const [isLoading, setIsLoading] = useState(false);

  /* ================= DATA ================= */
  const [batchDetails, setBatchDetails] = useState(null);
  const [message, setMessage] = useState(null);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    try {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');
      const verified = localStorage.getItem('is3FAVerified');
      const loginTimestamp = localStorage.getItem('loginTimestamp');

      if (email && role === 'Distributor' && verified === 'true') {
        if (loginTimestamp) {
          const elapsed = Date.now() - parseInt(loginTimestamp);
          if (elapsed > SESSION_TIMEOUT) {
            localStorage.clear();
            window.location.href = "/login";
            return;
          }
          setSessionTimeLeft(SESSION_TIMEOUT - elapsed);
        }
        setIsAuthenticated(true);
        setUserEmail(email);
      }
    } catch {}
    setLoading(false);
  }, []);

  /* ================= SESSION TIMER ================= */
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      if (!loginTimestamp) return;
      const elapsed = Date.now() - parseInt(loginTimestamp);
      const remaining = SESSION_TIMEOUT - elapsed;

      if (remaining <= 0) {
        localStorage.clear();
        alert("Session expired");
        window.location.href = "/login";
      }
      setSessionTimeLeft(remaining);
      if (remaining <= WARNING_TIME && !showSessionWarning) {
        setShowSessionWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionWarning]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ================= SEARCH ================= */
  const searchBatch = async (id) => {
    setBatchId(id);
    setMessage(null);
    if (id.length < 3) {
      setBatchDetails(null);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/distributor/search/${id}`);
      if (res.data.success) {
        setBatchDetails({
          ...res.data,
          currentStatus: res.data.currentLocation
        });
      }
    } catch {
      setBatchDetails(null);
    }
  };

  /* ================= RECEIVE ================= */
  const handleReceive = async (e) => {
    e.preventDefault();
    if (!batchId || !distributorName || !phone || !location) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: 'info', text: 'Updating batch…' });

      const res = await axios.post('http://localhost:5000/api/distributor/receive', {
        batchId,
        location,
        distributorName,
        phone
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Batch verified & logged successfully' });
        setTimeout(() => {
          setBatchId('');
          setDistributorName('');
          setPhone('');
          setBatchDetails(null);
          setMessage(null);
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Server error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading…</div>;

  if (!isAuthenticated) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authCard}>
          <h2 style={styles.maroon}>Authentication Required</h2>
          <p>Please login using 3-Factor Authentication</p>
          <a href="/login" style={styles.primaryBtn}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Distributor Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.content}>
          {/* LEFT */}
          <form style={styles.form}>
            <label style={styles.label}>Batch ID</label>
            <input style={styles.input} value={batchId} onChange={e => searchBatch(e.target.value)} />

            <label style={styles.label}>Distributor Name</label>
            <input style={styles.input} value={distributorName} onChange={e => setDistributorName(e.target.value)} />

            <label style={styles.label}>Phone</label>
            <input style={styles.input} value={phone} onChange={e => setPhone(e.target.value)} />

            <label style={styles.label}>Location</label>
            <input style={styles.input} value={location} onChange={e => setLocation(e.target.value)} />

            {message && (
              <div style={{
                ...styles.message,
                borderColor: message.type === 'error' ? '#7a1212' : '#5a0e0e'
              }}>
                {message.text}
              </div>
            )}

            <button onClick={handleReceive} disabled={!batchDetails || isLoading} style={styles.primaryBtn}>
              {isLoading ? 'Processing…' : 'Confirm & Update'}
            </button>
          </form>

          {/* RIGHT */}
          <div style={styles.sideCard}>
            {batchDetails ? (
              <>
                <h3 style={styles.maroon}>Batch Details</h3>
                <p><b>Medicine:</b> {batchDetails.medicineName}</p>
                <p><b>Quantity:</b> {batchDetails.quantity}</p>
                <p><b>Manufacturer:</b> {batchDetails.manufacturerName}</p>
                <p><b>Location:</b> {batchDetails.currentStatus}</p>
                <div style={styles.qrBox}>
                  <QRCode value={batchId} size={160} />
                </div>
              </>
            ) : (
              <p style={styles.muted}>Enter Batch ID to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#fdfafa',
    display: 'flex',
    justifyContent: 'center',
    padding: 30
  },

  card: {
    background: '#fff',
    width: '100%',
    maxWidth: 1150,
    padding: 32,
    borderRadius: 14,
    border: '2px solid #7a1212'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },

  title: {
    color: '#7a1212',
    fontSize: '1.5rem',
    fontWeight: 700
  },

  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 32
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },

  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#5a0e0e'
  },

  input: {
    padding: '14px 14px',
    fontSize: '0.95rem',
    borderRadius: 8,
    border: '2px solid #7a1212',
    outline: 'none'
  },

  sideCard: {
    border: '2px solid #7a1212',
    borderRadius: 12,
    padding: 22
  },

  qrBox: {
    marginTop: 18,
    padding: 14,
    border: '2px solid #7a1212',
    display: 'inline-block'
  },

  primaryBtn: {
    marginTop: 18,
    padding: '14px',
    background: '#7a1212',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer'
  },

  logoutBtn: {
    background: '#fff',
    color: '#7a1212',
    border: '2px solid #7a1212',
    padding: '8px 14px',
    borderRadius: 8,
    fontWeight: 600
  },

  message: {
    padding: 12,
    border: '2px solid',
    borderRadius: 8,
    fontSize: '0.9rem'
  },

  maroon: { color: '#7a1212' },
  muted: { color: '#777' },

  loading: { padding: 40, textAlign: 'center' },

  authPage: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  authCard: {
    background: '#fff',
    padding: 32,
    borderRadius: 12,
    border: '2px solid #7a1212',
    textAlign: 'center'
  }
};
