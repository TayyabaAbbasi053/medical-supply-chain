import React, { useState } from 'react';
import axios from 'axios';

export default function Distributor() {
  const [batchId, setBatchId] = useState('');
  const [role, setRole] = useState('Distributor'); // Default role
  const [prescription, setPrescription] = useState('');
  const [status, setStatus] = useState('');

  const updateChain = async () => {
    try {
      setStatus('Processing...');
      const response = await axios.post('http://localhost:5000/api/update-batch', {
        batchId,
        role,
        location: role === 'Distributor' ? 'Regional Warehouse' : 'City Pharmacy',
        patientPrescription: role === 'Pharmacy' ? prescription : null
      });
      
      if(response.data.success) {
        setStatus(`✅ Success: Batch updated by ${role}`);
        setBatchId(''); // Clear input
        setPrescription('');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error: ' + (err.response?.data?.error || "Connection Failed"));
    }
  };

  return (
    <div className="card">
      <h2>🚚 Logistics Dashboard</h2>
      
      <div className="form-group">
        <label>Current Handler Role:</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="Distributor">Distributor</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>

      <div className="form-group">
        <label>Scan/Enter Batch ID:</label>
        <input 
          placeholder="e.g. B001" 
          value={batchId} 
          onChange={e => setBatchId(e.target.value)} 
        />
      </div>

      {role === 'Pharmacy' && (
        <div className="form-group" style={{border: '1px dashed #666', padding: 10, borderRadius: 5}}>
          <label>💊 Patient Prescription (Will be Encrypted):</label>
          <textarea 
            placeholder="Enter dosage info..." 
            value={prescription} 
            onChange={e => setPrescription(e.target.value)} 
          />
        </div>
      )}

      <button onClick={updateChain}>Receive & Update Chain</button>
      
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}