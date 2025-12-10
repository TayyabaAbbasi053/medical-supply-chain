import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

export default function Manufacturer() {
  const [formData, setFormData] = useState({ 
    batchId: '', medicineName: '', quantity: 0, manufacturerName: '' 
  });
  const [qrValue, setQrValue] = useState(null);

  const createBatch = async () => {
    try {
      // Connecting to the Node Backend
      const res = await axios.post('http://localhost:5000/api/create-batch', formData);
      if(res.data.success) {
        setQrValue(formData.batchId);
        alert('Batch Created! Check MongoDB Atlas.');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.response?.data?.error || "Server connection failed"));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🏭 Manufacturer Dashboard</h2>
      <input placeholder="Batch ID (e.g. B001)" onChange={e => setFormData({...formData, batchId: e.target.value})} /><br/><br/>
      <input placeholder="Medicine Name" onChange={e => setFormData({...formData, medicineName: e.target.value})} /><br/><br/>
      <input placeholder="Manufacturer Name" onChange={e => setFormData({...formData, manufacturerName: e.target.value})} /><br/><br/>
      <button onClick={createBatch}>Create Batch</button>

      {qrValue && (
        <div style={{ marginTop: 20 }}>
          <QRCode value={qrValue} />
        </div>
      )}
    </div>
  );
}