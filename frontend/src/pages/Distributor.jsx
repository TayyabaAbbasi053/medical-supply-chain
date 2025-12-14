import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Distributor() {
  const [batchId, setBatchId] = useState('');
  const [location, setLocation] = useState('Regional Warehouse');
  const [message, setMessage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session timeout configuration (15 minutes = 900 seconds)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning at 2 minutes remaining

  // Check if user is logged in with 3FA verification
  useEffect(() => {
    try {
      const loggedInEmail = localStorage.getItem('userEmail');
      const loggedInRole = localStorage.getItem('userRole');
      const is3FAVerified = localStorage.getItem('is3FAVerified');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (loggedInEmail && loggedInRole === 'Distributor' && is3FAVerified === 'true') {
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

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="card">
        <h2>❌ Access Denied</h2>
        <p>You are not authorized to access this page. Please login as a Distributor first.</p>
        <button onClick={() => window.location.href = "/"}>Go to Login</button>
      </div>
    );
  }

  const handleReceive = async () => {
    // Basic validation
    if (!batchId) {
      setMessage({ type: 'error', text: '❌ Please enter a Batch ID.' });
      return;
    }

    try {
      setMessage({ type: 'info', text: '⏳ Verifying Chain & Updating...' });
      
      // Call the specific Distributor API (Logistics only)
      const res = await axios.post('http://localhost:5000/api/distributor/receive', {
        batchId,
        location
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: '✅ Batch Received & Logged on Blockchain!' });
        // We keep the Batch ID on screen so they can check the QR code below
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '❌ Error: ' + (err.response?.data?.error || "Connection Failed") });
    }
  };

  return (
    <div className="card">
      {/* Header with Authentication Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>📦</span>
          <div>
            <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.5rem' }}>Distributor Dashboard</h2>
            <small style={{ color: '#6b7280', fontSize: '0.9rem' }}>🔐 3FA Verified | Email: {userEmail}</small>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#d4691f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Session Warning */}
      {showSessionWarning && sessionTimeLeft && (
        <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', marginBottom: '15px', color: '#856404' }}>
          ⏱️ Your session will expire in {Math.floor(sessionTimeLeft / 1000 / 60)} minute(s). Please complete your task.
        </div>
      )}
      
      {/* Location Input */}
      <div className="form-group">
        <label>Current Location / Depot Name</label>
        <input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. North Zone Depot"
        />
      </div>

      {/* Batch ID Input */}
      <div className="form-group">
        <label>Scan Batch ID</label>
        <input 
          placeholder="Enter Batch ID (e.g. B001)..." 
          value={batchId} 
          onChange={(e) => setBatchId(e.target.value)} 
        />
      </div>

      {/* Dynamic QR Code Display */}
      {batchId && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          margin: '20px 0', 
          padding: '20px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '10px',
          border: '1px dashed #cbd5e1'
        }}>
          <span style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Verification Label
          </span>
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <QRCode value={batchId} size={120} />
          </div>
          <code style={{ marginTop: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9rem', color: '#334155' }}>
            {batchId}
          </code>
        </div>
      )}

      {/* Action Button */}
      <button onClick={handleReceive} style={{ marginTop: '10px' }}>
        Confirm Receipt & Update Location
      </button>

      {/* Status Message */}
      {message && (
        <div className={`status-box ${message.type === 'error' ? 'status-error' : 'status-success'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}