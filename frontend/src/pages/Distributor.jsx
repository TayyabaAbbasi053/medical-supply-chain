import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Distributor() {
  // Input State
  const [batchId, setBatchId] = useState('');
  const [distributorName, setDistributorName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Regional Warehouse');
  
  // Data State
  const [batchDetails, setBatchDetails] = useState(null);
  const [message, setMessage] = useState(null);

  // 1. Function to Search for Batch Details
  const searchBatch = async (id) => {
    setBatchId(id);
    setMessage(null);
    if(id.length < 3) {
        setBatchDetails(null); 
        return;
    }

    try {
      // Call the new GET endpoint
      const res = await axios.get(`http://localhost:5000/api/distributor/search/${id}`);
      if(res.data.success) {
        setBatchDetails(res.data);
      }
    } catch (err) {
      setBatchDetails(null); // Clear details if not found
    }
  };

  // 2. Function to Submit Update
  const handleReceive = async () => {
    if (!batchId || !distributorName || !phone) {
      setMessage({ type: 'error', text: '❌ All fields are required!' });
      return;
    }

    try {
      setMessage({ type: 'info', text: '⏳ Verifying Chain & Updating...' });
      
      const res = await axios.post('http://localhost:5000/api/distributor/receive', {
        batchId,
        location,
        distributorName,
        phone
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: '✅ Batch Logged Successfully!' });
        // Optional: Clear form
        // setBatchId(''); setBatchDetails(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Error: ' + (err.response?.data?.error || "Connection Failed") });
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <span style={{ fontSize: '2.5rem' }}>📦</span>
        <div>
          <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.5rem' }}>Distributor Dashboard</h2>
          <small style={{ color: '#6b7280' }}>Receive & Forward Goods</small>
        </div>
      </div>

      {/* --- Batch Search Section --- */}
      <div className="form-group">
        <label>Scan Batch ID</label>
        <input 
          placeholder="Enter Batch ID (e.g. B001)..." 
          value={batchId} 
          onChange={(e) => searchBatch(e.target.value)} 
          style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
        />
      </div>

      {/* --- Batch Details Preview (Only shows if found) --- */}
      {batchDetails && (
        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>✅ Batch Found</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                <div><strong>Medicine:</strong> {batchDetails.medicineName}</div>
                <div><strong>Quantity:</strong> {batchDetails.quantity}</div>
                <div><strong>Manufacturer:</strong> {batchDetails.manufacturerName}</div>
                <div><strong>Last Location:</strong> {batchDetails.currentStatus}</div>
            </div>
        </div>
      )}

      {/* --- Dynamic QR --- */}
      {batchId && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
           <QRCode value={batchId} size={80} />
        </div>
      )}

      {/* --- Distributor Details Form --- */}
      <div className="form-group">
        <label>Distributor Name / Company</label>
        <input 
          placeholder="e.g. FastTrack Logistics" 
          value={distributorName} 
          onChange={(e) => setDistributorName(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Contact Phone Number</label>
        <input 
          placeholder="e.g. +1 234 567 890" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Current Location</label>
        <input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
        />
      </div>

      <button onClick={handleReceive} disabled={!batchDetails}>
        Confirm Receipt & Update
      </button>

      {message && (
        <div className={`status-box ${message.type === 'error' ? 'status-error' : 'status-success'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}