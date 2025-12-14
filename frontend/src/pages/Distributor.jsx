import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Distributor() {
  const [batchId, setBatchId] = useState('');
  const [location, setLocation] = useState('Regional Warehouse');
  const [message, setMessage] = useState(null);

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
      {/* Header with Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <span style={{ fontSize: '2.5rem' }}>📦</span>
        <div>
          <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.5rem' }}>Distributor Dashboard</h2>
          <small style={{ color: '#6b7280', fontSize: '0.9rem' }}>Logistics & Supply Chain Tracking</small>
        </div>
      </div>
      
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