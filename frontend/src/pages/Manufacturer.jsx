import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      {/* Main Form Container - Centered */}
      <div style={styles.mainContainer}>

        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.formIcon}>📝</div>
            <div>
              <h1 style={styles.formTitle}>Create New Batch</h1>
              <p style={styles.formDesc}>Fill in batch details</p>
            </div>
          </div>

          {/* Form */}
          <div style={styles.contentWrapper}>
            <div style={styles.formWrapper}>
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
                    <label style={styles.label}>Quantity *</label>
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

                {/* Button Group */}
                <div style={styles.buttonGroup}>
                  <button 
                    type="button" 
                    onClick={createBatch} 
                    disabled={isCreating}
                    style={styles.submitBtn}
                  >
                    {isCreating ? '⏳ Creating...' : 'Create Batch'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => window.history.back()}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
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

  formWrapper: {
    flex: 1,
    overflow: 'auto',
    paddingRight: '8px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
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

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.1rem',
    color: '#666',
  },

  authContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px',
  },

  authCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    textAlign: 'center',
    maxWidth: '380px',
    width: '100%',
  },

  authTitle: {
    color: '#333',
    marginBottom: '8px',
    fontSize: '18px',
  },

  authText: {
    color: '#666',
    marginBottom: '16px',
    fontSize: '14px',
  },

  authList: {
    textAlign: 'left',
    color: '#666',
    fontSize: '13px',
    marginBottom: '16px',
  },

  authLink: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
  },
};