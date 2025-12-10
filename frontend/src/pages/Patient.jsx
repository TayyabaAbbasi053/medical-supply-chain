import React, { useState } from 'react';
import axios from 'axios';

export default function Patient() {
  const [batchId, setBatchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [decryptedNote, setDecryptedNote] = useState('');
  const [error, setError] = useState('');

  const verifyProduct = async () => {
    try {
      setError('');
      setBatchData(null);
      setDecryptedNote('');
      
      const res = await axios.get(`http://localhost:5000/api/batch/${batchId}`);
      setBatchData(res.data);
    } catch (err) {
      setError('❌ Batch not found or Fake Product!');
    }
  };

  const decryptPrescription = async () => {
    if(!batchData?.prescriptionEncrypted) return;
    try {
      const res = await axios.post('http://localhost:5000/api/decrypt', { 
        encryptedText: batchData.prescriptionEncrypted 
      });
      setDecryptedNote(res.data.decrypted);
    } catch (err) {
      alert('Decryption Failed!');
    }
  };

  return (
    <div className="card">
      <h2>🔍 Patient Verification</h2>
      
      <div className="search-box">
        <input 
          placeholder="Enter Batch ID from Box" 
          value={batchId}
          onChange={e => setBatchId(e.target.value)} 
        />
        <button onClick={verifyProduct}>Verify</button>
      </div>

      {error && <h3 style={{color: 'red'}}>{error}</h3>}

      {batchData && (
        <div className="result-area">
          <div className="success-badge">✅ Authentic Product</div>
          <h3>{batchData.medicineName} <small>({batchData.quantity} units)</small></h3>
          <p><strong>Manufacturer:</strong> {batchData.manufacturerName}</p>
          
          <h4>⛓️ Supply Chain Journey:</h4>
          <ul className="timeline">
            {batchData.chain.map((event, index) => (
              <li key={index}>
                <strong>{event.role}</strong> <br/> 
                <span>📍 {event.location}</span> <br/>
                <small>{new Date(event.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>

          {batchData.prescriptionEncrypted && (
            <div className="encryption-box">
              <h4>🔒 Private Data</h4>
              <p>This batch has an encrypted prescription.</p>
              {!decryptedNote ? (
                <button onClick={decryptPrescription} className="decrypt-btn">Decrypt My Data</button>
              ) : (
                <div className="secret-note">
                  <strong>Rx:</strong> {decryptedNote}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}