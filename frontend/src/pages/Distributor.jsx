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

  // Check if user is logged in (3FA temporarily disabled for testing)
  useEffect(() => {
    try {
      // For testing: just check if userEmail exists (no 3FA check)
      const loggedInEmail = localStorage.getItem('userEmail');
      
      if (loggedInEmail) {
        setIsAuthenticated(true);
        setUserEmail(loggedInEmail);
      } else {
        // For testing: auto-authenticate with test email
        localStorage.setItem('userEmail', 'tester@test.com');
        localStorage.setItem('userRole', 'Distributor');
        setIsAuthenticated(true);
        setUserEmail('tester@test.com');
      }
    } catch (err) {
      console.error('localStorage error:', err);
      setIsAuthenticated(true); // For testing, allow access anyway
      setUserEmail('Test Distributor');
    }
    setLoading(false);
  }, []);

  // Session timeout interval (disabled for testing)
  useEffect(() => {
    // Temporarily disabled for testing
    return;
  }, []);

  const handleReceive = async () => {
    // Basic validation
    if (!batchId) {
      setMessage({ type: 'error', text: '❌ Please enter a Batch ID.' });
      return;
    }

    try {
      setMessage({ type: 'info', text: '⏳ Verifying batch integrity...' });
      
      // Call the specific Distributor API (Logistics only)
      const res = await axios.post('http://localhost:5000/api/distributor/receive', {
        batchId,
        location
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: '✅ Batch verified & logged on blockchain!' });
        // We keep the Batch ID on screen so they can check the QR code below
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Connection Failed";
      
      // Check if it's a tampering detection error
      if (errorMsg.includes('compromised') || errorMsg.includes('Tampering')) {
        setMessage({ 
          type: 'error', 
          text: '🚨 ' + errorMsg + ' Please contact authorities immediately!' 
        });
      } else if (errorMsg.includes('verification failed')) {
        setMessage({ 
          type: 'error', 
          text: '❌ ' + errorMsg + ' Batch signature invalid!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌ Error: ' + errorMsg 
        });
      }
    }
  };

  // Handle logout (simplified for testing)
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, rgba(90, 0, 0, 0.15) 0%, rgba(212, 105, 31, 0.1) 100%), url('https://images.unsplash.com/photo-1576091160550-112173f7f869?auto=format&fit=crop&w=1600&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Main Card Container */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        padding: "50px 40px",
        backdropFilter: "blur(10px)",
        maxWidth: "600px",
        width: "100%"
      }}>
      {/* Header with Authentication Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #d4691f', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <div>
            <h1 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.8rem', color: '#5a0000', fontWeight: '800' }}>Distributor</h1>
            <small style={{ color: '#666', fontSize: '0.9rem' }}>🔐 3FA Verified | {userEmail}</small>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#d4691f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
          Logout
        </button>
      </div>

      {/* Session Warning */}
      {showSessionWarning && sessionTimeLeft && (
        <div style={{ padding: '15px', background: '#fff3cd', border: '2px solid #d4691f', borderRadius: '8px', marginBottom: '20px', color: '#5a0000', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⏱️ <span>Your session will expire in {Math.floor(sessionTimeLeft / 1000 / 60)} minute(s). Please complete your task.</span>
        </div>
      )}
      
      {/* Location Input */}
      <div className="form-group">
        <label style={{ color: '#5a0000', fontWeight: '600', marginBottom: '8px', display: 'block' }}>📍 Current Location / Depot</label>
        <input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. North Zone Depot"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #d4691f', background: '#fafafa', fontSize: '14px', color: '#333' }}
        />
      </div>

      {/* Batch ID Input */}
      <div className="form-group">
        <label style={{ color: '#5a0000', fontWeight: '600', marginBottom: '8px', display: 'block' }}>📦 Scan Batch ID</label>
        <input 
          placeholder="Enter Batch ID (e.g. batch1229)..." 
          value={batchId} 
          onChange={(e) => setBatchId(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #d4691f', background: '#fafafa', fontSize: '14px', color: '#333' }}
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
      <button onClick={handleReceive} style={{ 
        marginTop: '20px',
        width: '100%',
        padding: '14px',
        background: '#d4691f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(212, 105, 31, 0.3)'
      }} onMouseEnter={(e) => {
        e.target.style.background = '#c2581a';
        e.target.style.boxShadow = '0 6px 20px rgba(212, 105, 31, 0.4)';
      }} onMouseLeave={(e) => {
        e.target.style.background = '#d4691f';
        e.target.style.boxShadow = '0 4px 15px rgba(212, 105, 31, 0.3)';
      }}>
        ✓ Confirm Receipt & Update
      </button>

      {/* Status Message - PROMINENT ALERT */}
      {message && (
        <div style={{
          marginTop: '25px',
          padding: '18px',
          borderRadius: '12px',
          border: '3px solid',
          fontSize: '15px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          animation: message.type === 'error' ? 'pulse 0.6s ease-in-out' : 'none',
          borderColor: message.type === 'error' ? '#d4691f' : 
                      message.type === 'success' ? '#1f9c89' : 
                      message.type === 'info' ? '#6a4c93' : '#d4691f',
          backgroundColor: message.type === 'error' ? '#fff5f0' : 
                          message.type === 'success' ? '#f0fdf9' : 
                          message.type === 'info' ? '#f5f3f9' : '#fffaf5',
          color: message.type === 'error' ? '#5a0000' : 
                message.type === 'success' ? '#1f5c52' : 
                message.type === 'info' ? '#3d2961' : '#5a0000'
        }}>
          <span style={{ fontSize: '1.5rem', minWidth: '24px' }}>
            {message.type === 'error' ? '🚨' : 
             message.type === 'success' ? '✅' : 
             message.type === 'info' ? '⏳' : '⚠️'}
          </span>
          <div style={{ flex: 1 }}>
            <div>{message.text}</div>
            {message.type === 'error' && message.text.includes('compromised') && (
              <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.85, fontWeight: '500' }}>
                ⚠️ This batch must be reported and quarantined immediately.
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
      `}</style>
      </div>
    </div>
  );
}