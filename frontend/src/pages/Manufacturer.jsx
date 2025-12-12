import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Manufacturer() {
  const [formData, setFormData] = useState({ 
    batchNumber: '',
    medicineName: '',
    strength: '',
    quantityProduced: 0,
    distributorId: '',
    dispatchDate: '',
    manufacturingDate: '',
    expiryDate: '',
    manufacturerName: ''
  });
  const [qrValue, setQrValue] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

  // Session timeout configuration (15 minutes = 900 seconds)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning at 2 minutes remaining
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    try {
      const loggedInEmail = localStorage.getItem('userEmail');
      const loggedInRole = localStorage.getItem('userRole');
      const is3FAVerified = localStorage.getItem('is3FAVerified');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (loggedInEmail && loggedInRole === 'Manufacturer' && is3FAVerified === 'true') {
        // Check if session has expired
        if (loginTimestamp) {
          const now = Date.now();
          const elapsed = now - parseInt(loginTimestamp);
          
          if (elapsed > SESSION_TIMEOUT) {
            // Session expired
            localStorage.clear();
            window.location.href = "/login";
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
            window.location.href = "/login";
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const createBatch = async () => {
    try {
      setIsCreating(true);
      const batchData = {
        ...formData,
        email: userEmail
      };

      const res = await axios.post('http://localhost:5000/api/modules/manufacturer/create-batch', batchData);
      if(res.data.success) {
        setQrValue(formData.batchNumber);
        alert('✅ Batch Created Successfully!');
        setFormData({ 
          batchNumber: '',
          medicineName: '',
          strength: '',
          quantityProduced: 0,
          distributorId: '',
          dispatchDate: '',
          manufacturingDate: '',
          expiryDate: '',
          manufacturerName: ''
        });
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error: ' + (err.response?.data?.error || "Server connection failed"));
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div style={styles.loadingContainer}><h2>Loading...</h2></div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h2 style={styles.authTitle}>🔐 Authentication Required</h2>
          <p style={styles.authText}>You must login with 3-Factor Authentication first!</p>
          <ul style={styles.authList}>
            <li>✓ Factor 1: Enter your password</li>
            <li>✓ Factor 2: Enter OTP from your email</li>
            <li>✓ Factor 3: Answer your security question</li>
          </ul>
          <a href="/login" style={styles.authLink}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🏭 Manufacturer Dashboard</h1>
          <p style={styles.subtitle}>Create and manage medicine batches</p>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userEmail}>{userEmail}</span>
          {sessionTimeLeft && (
            <span style={{
              ...styles.sessionTimer,
              background: sessionTimeLeft <= WARNING_TIME ? '#ff6b6b' : 'rgba(255,255,255,0.2)'
            }}>
              ⏱️ {Math.floor(sessionTimeLeft / 60)}:{String(Math.floor((sessionTimeLeft % 60))).padStart(2, '0')}
            </span>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Session Warning */}
      {showSessionWarning && (
        <div style={styles.warningBanner}>
          <p style={styles.warningText}>
            ⚠️ Your session will expire in {Math.floor(sessionTimeLeft / 60)} minutes. Please complete your work.
          </p>
        </div>
      )}

      {/* Main Form Container */}
      <div style={styles.mainContainer}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>📋 Create New Batch</h2>
          <p style={styles.formDesc}>Fill in all details to create a new medicine batch</p>

          <form style={styles.form}>
            {/* Row 1: Batch Number & Medicine Name */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Batch Number *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. BATCH-2025-001" 
                  value={formData.batchNumber} 
                  onChange={e => setFormData({...formData, batchNumber: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Medicine Name *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. Paracetamol Plus" 
                  value={formData.medicineName} 
                  onChange={e => setFormData({...formData, medicineName: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Row 2: Strength & Quantity */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Strength / Dosage *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. 500mg Paracetamol + 65mg Caffeine" 
                  value={formData.strength} 
                  onChange={e => setFormData({...formData, strength: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity Produced (Units) *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. 5000" 
                  type="number" 
                  value={formData.quantityProduced} 
                  onChange={e => setFormData({...formData, quantityProduced: parseInt(e.target.value) || 0})} 
                  required 
                />
              </div>
            </div>

            {/* Row 3: Distributor & Dispatch Date */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Distributor ID *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. DIST-001" 
                  value={formData.distributorId} 
                  onChange={e => setFormData({...formData, distributorId: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Dispatch Date *</label>
                <input 
                  style={styles.input} 
                  type="date" 
                  value={formData.dispatchDate} 
                  onChange={e => setFormData({...formData, dispatchDate: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Row 4: Manufacturing & Expiry Date */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Manufacturing Date *</label>
                <input 
                  style={styles.input} 
                  type="date" 
                  value={formData.manufacturingDate} 
                  onChange={e => setFormData({...formData, manufacturingDate: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date *</label>
                <input 
                  style={styles.input} 
                  type="date" 
                  value={formData.expiryDate} 
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Row 5: Manufacturer Name */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Manufacturer Name *</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g. Pharma Corp Industries" 
                  value={formData.manufacturerName} 
                  onChange={e => setFormData({...formData, manufacturerName: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="button" 
              onClick={createBatch} 
              disabled={isCreating}
              style={styles.submitBtn}
            >
              {isCreating ? '⏳ Creating...' : '✅ Create Batch'}
            </button>
          </form>
        </div>

        {/* QR Code Section */}
        {qrValue && (
          <div style={styles.qrCard}>
            <h3 style={styles.qrTitle}>📱 QR Code Generated</h3>
            <div style={styles.qrContainer}>
              <QRCode value={qrValue} size={256} level="H" />
            </div>
            <p style={styles.qrInfo}>Batch Number: <strong>{qrValue}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    padding: '0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px'
  },

  authContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px'
  },

  authCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    textAlign: 'center',
    maxWidth: '380px',
    width: '100%'
  },

  authTitle: {
    color: '#333',
    marginBottom: '8px',
    fontSize: '20px'
  },

  authText: {
    color: '#666',
    fontSize: '13px',
    marginBottom: '15px'
  },

  authList: {
    listStyle: 'none',
    padding: '0',
    marginBottom: '15px',
    color: '#666',
    fontSize: '13px',
    textAlign: 'left'
  },

  authLink: {
    display: 'inline-block',
    padding: '10px 25px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '7px',
    marginTop: '8px',
    fontSize: '13px',
    transition: 'background 0.3s ease'
  },

  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '12px'
  },

  headerContent: {
    flex: 1,
    minWidth: '250px'
  },

  title: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '600'
  },

  subtitle: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    opacity: '0.9'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    fontSize: '11px'
  },

  userEmail: {
    background: 'rgba(255,255,255,0.2)',
    padding: '5px 10px',
    borderRadius: '18px',
    fontSize: '11px',
    fontWeight: '500'
  },

  logoutBtn: {
    padding: '5px 12px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    transition: 'background 0.3s ease'
  },

  sessionTimer: {
    background: 'rgba(255,255,255,0.2)',
    padding: '5px 10px',
    borderRadius: '18px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'monospace',
    transition: 'background 0.3s ease'
  },

  warningBanner: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
    color: 'white',
    padding: '10px 20px',
    textAlign: 'center',
    boxShadow: '0 3px 10px rgba(255, 107, 107, 0.25)',
    fontSize: '12px'
  },

  warningText: {
    margin: '0',
    fontSize: '12px',
    fontWeight: '500'
  },

  mainContainer: {
    padding: '18px 15px',
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },

  formCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
  },

  formTitle: {
    margin: '0 0 6px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },

  formDesc: {
    margin: '0 0 14px 0',
    color: '#999',
    fontSize: '12px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },

  label: {
    marginBottom: '4px',
    color: '#333',
    fontSize: '12px',
    fontWeight: '500'
  },

  input: {
    padding: '8px 10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    outline: 'none'
  },

  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '6px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 3px 12px rgba(102, 126, 234, 0.3)'
  },

  qrCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '320px',
    margin: '0 auto'
  },

  qrTitle: {
    margin: '0 0 12px 0',
    color: '#333',
    fontSize: '15px',
    fontWeight: '600'
  },

  qrContainer: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '7px',
    marginBottom: '10px'
  },

  qrInfo: {
    margin: '0',
    color: '#666',
    fontSize: '11px'
  }
};