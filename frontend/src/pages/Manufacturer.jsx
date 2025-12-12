import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Manufacturer() {
  const [formData, setFormData] = useState({ 
    batchId: '',
    medicineName: '',
    activeIngredients: '',
    quantity: 0,
    manufacturerName: '',
    manufacturerId: '',
    manufacturingDate: '',
    expiryDate: ''
  });
  const [qrValue, setQrValue] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    try {
      const loggedInEmail = localStorage.getItem('userEmail');
      const loggedInRole = localStorage.getItem('userRole');
      
      if (loggedInEmail && loggedInRole === 'Manufacturer') {
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const createBatch = async () => {
    try {
      // Include authenticated user email
      const batchData = {
        ...formData,
        email: userEmail  // Add authenticated email
      };

      // Connecting to the Node Backend
      const res = await axios.post('http://localhost:5000/api/modules/manufacturer/create-batch', batchData);
      if(res.data.success) {
        setQrValue(formData.batchId);
        alert('Batch Created! Check MongoDB Atlas.');
        // Reset form
        setFormData({ 
          batchId: '', 
          medicineName: '', 
          activeIngredients: '',
          quantity: 0, 
          manufacturerName: '',
          manufacturerId: '',
          manufacturingDate: '',
          expiryDate: ''
        });
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.response?.data?.error || "Server connection failed"));
    }
  };

  // If not authenticated, show login message
  if (loading) {
    return <div style={{ padding: 20 }}><h2>Loading...</h2></div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>🔐 Authentication Required</h2>
        <p style={{ fontSize: 16, color: '#d32f2f' }}>
          ❌ You must login with 3-Factor Authentication first!
        </p>
        <p style={{ fontSize: 14, color: '#666' }}>
          Please go to Login page and complete all 3 authentication factors:
        </p>
        <ul style={{ fontSize: 14, color: '#666', textAlign: 'left', maxWidth: 400, margin: '20px auto' }}>
          <li>✓ Factor 1: Enter your password</li>
          <li>✓ Factor 2: Enter OTP from your email</li>
          <li>✓ Factor 3: Answer your security question</li>
        </ul>
        <a href="/login" style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: '#1976d2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🏭 Manufacturer Dashboard</h2>
      <div style={{ 
        padding: '10px', 
        background: '#e8f5e9', 
        borderRadius: '5px', 
        marginBottom: '20px',
        color: '#2e7d32',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>✅ Authenticated as: <strong>{userEmail}</strong> (3FA Verified)</span>
        <button onClick={handleLogout} style={{
          padding: '5px 15px',
          background: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      <h3>📋 Batch Creation Form (All Fields Required)</h3>
      
      <label><strong>Batch ID:</strong></label>
      <input placeholder="e.g. B001" value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} required /><br/><br/>
      
      <label><strong>Medicine Name:</strong></label>
      <input placeholder="e.g. Paracetamol 500mg" value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} required /><br/><br/>
      
      <label><strong>🔒 Active Ingredients (Will be Encrypted):</strong></label>
      <textarea placeholder="e.g. Paracetamol 500mg, Caffeine 65mg" value={formData.activeIngredients} onChange={e => setFormData({...formData, activeIngredients: e.target.value})} required style={{width: '100%', padding: '8px'}} /><br/><br/>
      
      <label><strong>Quantity (Units):</strong></label>
      <input placeholder="e.g. 5000" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} required /><br/><br/>
      
      <label><strong>Manufacturer Name:</strong></label>
      <input placeholder="e.g. Pharma Corp" value={formData.manufacturerName} onChange={e => setFormData({...formData, manufacturerName: e.target.value})} required /><br/><br/>
      
      <label><strong>🔒 Manufacturer ID (Will be Encrypted):</strong></label>
      <input placeholder="e.g. MFG-001" value={formData.manufacturerId} onChange={e => setFormData({...formData, manufacturerId: e.target.value})} required /><br/><br/>
      
      <label><strong>Manufacturing Date:</strong></label>
      <input type="date" value={formData.manufacturingDate} onChange={e => setFormData({...formData, manufacturingDate: e.target.value})} required /><br/><br/>
      
      <label><strong>Expiry Date:</strong></label>
      <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required /><br/><br/>
      
      <button onClick={createBatch} style={{padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px'}}>Create Batch</button>

      {qrValue && (
        <div style={{ marginTop: 20 }}>
          <h3>📱 QR Code Generated:</h3>
          <QRCode value={qrValue} />
        </div>
      )}
    </div>
  );
}