import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Pharmacy() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  // Session timeout configuration (15 minutes = 900 seconds)
  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 2 * 60 * 1000;
  
  // States
  const [batchId, setBatchId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [batchDetails, setBatchDetails] = useState(null);
  const [message, setMessage] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    try {
      const loggedInEmail = localStorage.getItem('userEmail');
      const loggedInRole = localStorage.getItem('userRole');
      const is3FAVerified = localStorage.getItem('is3FAVerified');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (loggedInEmail && loggedInRole === 'Pharmacist' && is3FAVerified === 'true') {
        if (loginTimestamp) {
          const now = Date.now();
          const elapsed = now - parseInt(loginTimestamp);
          
          if (elapsed > SESSION_TIMEOUT) {
            localStorage.clear();
            window.location.href = "/login";
            return;
          }
          
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
            localStorage.clear();
            alert('⏱️ Your session has expired. Please login again.');
            window.location.href = "/login";
            return;
          }

          setSessionTimeLeft(remaining);

          if (remaining <= WARNING_TIME && !showSessionWarning) {
            setShowSessionWarning(true);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionWarning]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // 1. Search Logic
  const searchBatch = async (id) => {
    setBatchId(id);
    setMessage(null);
    
    if(id.length < 3) { setBatchDetails(null); return; }

    try {
      const res = await axios.get(`http://localhost:5000/api/pharmacy/search/${id}`);
      if (res.data.success) {
        setBatchDetails(res.data);
      }
    } catch (err) {
      setBatchDetails(null);
      if(err.response?.status === 404) {
          setMessage({ type: 'error', text: '⚠️ Batch not found in system.' });
      }
    }
  };

  // 2. Dispense Logic
  const handleDispense = async () => {
    if (!batchId || !prescription) {
      setMessage({ type: 'error', text: '❌ Prescription is required.' });
      return;
    }

    try {
      setMessage({ type: 'info', text: '🔐 Verifying Chain & Encrypting...' });
      
      const res = await axios.post('http://localhost:5000/api/pharmacy/dispense', {
        batchId,
        prescription
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: '✅ Success! Medicine Dispensed.' });
        setPrescription('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Error: ' + (err.response?.data?.error || err.message) });
    }
  };

  if (loading) {
    return <div style={{padding: '40px', textAlign: 'center'}}><h2>Loading...</h2></div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{padding: '40px', textAlign: 'center', background: '#f3f4f6', minHeight: '100vh'}}>
        <div style={{maxWidth: '500px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <h2 style={{color: '#7a1212', marginBottom: '10px'}}>🔐 Authentication Required</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>You must login with 3-Factor Authentication first!</p>
          <ul style={{textAlign: 'left', color: '#555', marginBottom: '30px'}}>
            <li>✓ Factor 1: Enter your password</li>
            <li>✓ Factor 2: Enter OTP from your email</li>
            <li>✓ Factor 3: Answer your security question</li>
          </ul>
          <a href="/login" style={{display: 'inline-block', padding: '12px 30px', background: '#7a1212', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold'}}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Main Form Container - Centered */}
      <div style={styles.mainContainer}>

        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.formIcon}>🏥</div>
            <div>
              <h1 style={styles.formTitle}>Pharmacy Dashboard</h1>
              <p style={styles.formDesc}>Verify authenticity & dispense medicine</p>
            </div>
          </div>

          <div style={styles.contentWrapper}>
            {/* Left Column - Form */}
            <div style={styles.leftColumn}>
              <form style={styles.form}>
                {/* Batch Search */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Scan Batch ID *</label>
                  <input 
                    style={styles.input}
                    placeholder="Enter Batch ID..." 
                    value={batchId} 
                    onChange={(e) => searchBatch(e.target.value)} 
                  />
                </div>

                {/* Prescription Input */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Patient Prescription *</label>
                  <textarea 
                    style={{...styles.input, minHeight: '80px', resize: 'none'}}
                    placeholder="Enter dosage instructions..." 
                    value={prescription} 
                    onChange={(e) => setPrescription(e.target.value)}
                    disabled={batchDetails?.isComplete}
                  />
                </div>

                {message && (
                  <div style={{...styles.messageBox, background: message.type === 'error' ? '#fef2f2' : '#f0fdf4', color: message.type === 'error' ? '#991b1b' : '#166534', borderLeft: `3px solid ${message.type === 'error' ? '#ef4444' : '#22c55e'}`}}>
                    {message.text}
                  </div>
                )}

                <div style={styles.buttonGroup}>
                  <button onClick={handleDispense} disabled={!batchDetails || batchDetails.isComplete} style={styles.submitBtn}>
                    {batchDetails?.isComplete ? 'Batch Closed' : 'Dispense Medicine'}
                  </button>
                  <button type="button" onClick={() => window.history.back()} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Batch Details & QR */}
            <div style={styles.rightColumn}>
              {batchDetails ? (
                <div style={styles.qrCard}>
                  <h3 style={styles.qrTitle}>✅ Batch Found</h3>
                  <div style={{background: 'white', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #e5e7eb', width: '100%', textAlign: 'left', fontSize: '0.75rem', lineHeight: '1.4', color: '#1f2937'}}>
                    <div style={{marginBottom: '6px'}}><strong>Medicine:</strong> {batchDetails.medicineName}</div>
                    <div style={{marginBottom: '6px'}}><strong>Manufacturer:</strong> {batchDetails.manufacturerName}</div>
                    <div style={{marginBottom: '6px'}}><strong>Expiry:</strong> {new Date(batchDetails.expiryDate).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> {batchDetails.isComplete ? "❌ CLOSED" : "✅ Available"}</div>
                  </div>
                  <div style={{padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb'}}>
                    <QRCode value={batchId} size={150} />
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={styles.emptyText}>Enter a Batch ID to view details and verify authenticity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  mainContainer: {
    width: '100%',
    maxWidth: '1200px',
    minHeight: '500px',
    margin: '0 auto',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    flex: '0 0 auto',
  },

  formIcon: {
    fontSize: '1.6rem',
    minWidth: '32px',
    textAlign: 'center',
  },

  formTitle: {
    margin: '0 0 2px 0',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: '-0.3px',
  },

  formDesc: {
    margin: '0',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '400',
  },

  contentWrapper: {
    display: 'flex',
    gap: '32px',
    flex: '1',
    minHeight: 0,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '24px',
    },
  },

  leftColumn: {
    flex: 1,
    overflow: 'auto',
    paddingRight: '8px',
  },

  rightColumn: {
    flex: '0 0 280px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      flex: 'none',
      width: '100%',
    },
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  label: {
    marginBottom: '0',
    color: '#1f2937',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },

  input: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },

  detailsBox: {
    background: '#f0f9ff',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #bae6fd',
    marginBottom: '6px',
  },

  messageBox: {
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    marginTop: '8px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    flex: '0 0 auto',
    justifyContent: 'flex-start',
  },

  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },

  cancelBtn: {
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#666',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },

  qrCard: {
    background: 'linear-gradient(135deg, #f0f4f8 0%, #f9fafb 100%)',
    border: '1px solid #e0e7ff',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  qrTitle: {
    margin: '0 0 12px 0',
    color: '#1f2937',
    fontSize: '0.9rem',
    fontWeight: '700',
  },

  qrContainer: {
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #e5e7eb',
  },

  qrInfo: {
    margin: '0',
    color: '#6b7280',
    fontSize: '0.7rem',
    wordBreak: 'break-all',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #f9fafb 100%)',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
  },

  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    opacity: '0.5',
  },

  emptyText: {
    margin: '0',
    color: '#6b7280',
    fontSize: '0.8rem',
    textAlign: 'center',
    lineHeight: '1.4',
  },
};