import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Pharmacy() {
  // States
  const [batchId, setBatchId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [batchDetails, setBatchDetails] = useState(null);
  const [message, setMessage] = useState(null);

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

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <span style={{ fontSize: '2.5rem' }}>🏥</span>
        <div>
          <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.5rem' }}>Pharmacy Dashboard</h2>
          <small style={{ color: '#6b7280' }}>Verify Authenticity & Dispense</small>
        </div>
      </div>

      {/* --- Batch Input --- */}
      <div className="form-group">
        <label>Scan Batch ID</label>
        <input 
          placeholder="Enter Batch ID..." 
          value={batchId} 
          onChange={(e) => searchBatch(e.target.value)} 
          style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
        />
      </div>

      {/* --- DETAILS PREVIEW SECTION --- */}
      {batchDetails && (
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
            
            {/* Manufacturer Info */}
            <h4 style={{ margin: '0 0 10px 0', color: '#166534', borderBottom: '1px solid #bbf7d0', paddingBottom: '5px' }}>
                🏭 Manufacturer Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', marginBottom: '15px' }}>
                <div><strong>Medicine:</strong> {batchDetails.medicineName}</div>
                <div><strong>Manufacturer:</strong> {batchDetails.manufacturerName}</div>
                <div><strong>Expiry:</strong> {new Date(batchDetails.expiryDate).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {batchDetails.isComplete ? "❌ ALREADY DISPENSED" : "✅ Available"}</div>
            </div>

            {/* Distributor Chain Info */}
            <h4 style={{ margin: '0 0 10px 0', color: '#166534', borderBottom: '1px solid #bbf7d0', paddingBottom: '5px' }}>
                🚚 Supply Chain History
            </h4>
            {batchDetails.history.length > 0 ? (
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                    {batchDetails.history.map((dist, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>
                            <strong>{dist.handler}</strong> <br/>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                📍 {dist.location} • {new Date(dist.date).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.9rem' }}>Direct from Manufacturer (No Intermediaries)</p>
            )}
        </div>
      )}

      {/* --- QR Code --- */}
      {batchId && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
           <div style={{ background: '#fff', padding: '10px', display: 'inline-block', border: '1px solid #eee', borderRadius: '8px' }}>
             <QRCode value={batchId} size={100} />
           </div>
        </div>
      )}

      {/* --- Prescription Input --- */}
      <div className="form-group">
        <label>💊 Patient Prescription</label>
        <textarea 
          rows="4"
          placeholder="Enter dosage instructions..." 
          value={prescription} 
          onChange={(e) => setPrescription(e.target.value)}
          disabled={batchDetails?.isComplete} // Disable if already sold
        />
        <small style={{ color: '#2563eb', display: 'block', marginTop: '5px' }}>
          🔒 AES-256 Encrypted
        </small>
      </div>

      <button onClick={handleDispense} disabled={!batchDetails || batchDetails.isComplete}>
        {batchDetails?.isComplete ? 'Batch Closed' : 'Dispense Medicine'}
      </button>

      {message && (
        <div className={`status-box ${message.type === 'error' ? 'status-error' : 'status-success'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}