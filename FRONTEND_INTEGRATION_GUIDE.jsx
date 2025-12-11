// ============================================================
// FRONTEND INTEGRATION GUIDE
// For Manufacturer Dashboard Integration
// ============================================================

// ============================================================
// EXAMPLE 1: Basic Form Component (React)
// ============================================================

import { useState } from 'react';
import axios from 'axios';
import './ManufacturerForm.css';

export default function ManufacturerForm() {
  const [formData, setFormData] = useState({
    batchId: '',
    medicineName: '',
    quantity: '',
    manufacturerName: '',
    manufacturerId: '',
    manufacturingDate: '',
    expiryDate: '',
    location: 'Factory Output'
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.batchId || !formData.medicineName || 
          !formData.quantity || !formData.manufacturerName) {
        setError('All required fields must be filled');
        setLoading(false);
        return;
      }

      // Send request to backend
      const result = await axios.post(
        'http://localhost:5000/api/manufacturer/create-batch',
        {
          ...formData,
          quantity: parseInt(formData.quantity)
        }
      );

      // Store response
      setResponse(result.data);
      setFormData({
        batchId: '',
        medicineName: '',
        quantity: '',
        manufacturerName: '',
        manufacturerId: '',
        manufacturingDate: '',
        expiryDate: '',
        location: 'Factory Output'
      });
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to create batch. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manufacturer-form-container">
      <div className="form-section">
        <h1>Create New Batch</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="batchId">Batch ID *</label>
            <input
              type="text"
              id="batchId"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              placeholder="e.g., BATCH-20251211-001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="medicineName">Medicine Name *</label>
            <input
              type="text"
              id="medicineName"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              placeholder="e.g., Aspirin 500mg"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 10000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturerName">Manufacturer Name *</label>
            <input
              type="text"
              id="manufacturerName"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              placeholder="e.g., Pharma Corp Ltd"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturerId">Manufacturer ID</label>
            <input
              type="text"
              id="manufacturerId"
              name="manufacturerId"
              value={formData.manufacturerId}
              onChange={handleChange}
              placeholder="e.g., MFG-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturingDate">Manufacturing Date</label>
            <input
              type="datetime-local"
              id="manufacturingDate"
              name="manufacturingDate"
              value={formData.manufacturingDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="datetime-local"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating Batch...' : 'Create Batch'}
          </button>
        </form>
      </div>

      {response && (
        <div className="response-section">
          <SuccessDisplay response={response} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 2: Success Display Component
// ============================================================

function SuccessDisplay({ response }) {
  const handlePrintQR = () => {
    const printWindow = window.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${response.batch.batchId}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            h1 { margin-bottom: 20px; }
            img { max-width: 400px; }
            .info { margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${response.batch.batchId}</h1>
          <img src="${response.security.qrCode.dataURL}" />
          <div class="info">
            <p><strong>Medicine:</strong> ${response.batch.medicineName}</p>
            <p><strong>Quantity:</strong> ${response.batch.quantity}</p>
            <p><strong>Manufacturer:</strong> ${response.batch.manufacturerName}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.print();
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = response.security.qrCode.dataURL;
    link.download = `${response.batch.batchId}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyBatchId = () => {
    navigator.clipboard.writeText(response.batch.batchId);
    alert('Batch ID copied to clipboard!');
  };

  return (
    <div className="success-container">
      <div className="success-header">
        <h2>✅ Batch Created Successfully!</h2>
        <p className="status-badge">{response.batch.status}</p>
      </div>

      <div className="batch-info">
        <h3>Batch Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Batch ID:</label>
            <div className="batch-id-display">
              <span>{response.batch.batchId}</span>
              <button onClick={handleCopyBatchId} className="copy-btn">
                📋 Copy
              </button>
            </div>
          </div>
          <div className="info-item">
            <label>Medicine:</label>
            <span>{response.batch.medicineName}</span>
          </div>
          <div className="info-item">
            <label>Quantity:</label>
            <span>{response.batch.quantity} units</span>
          </div>
          <div className="info-item">
            <label>Manufacturer:</label>
            <span>{response.batch.manufacturerName}</span>
          </div>
          <div className="info-item">
            <label>Manufacturing Date:</label>
            <span>{new Date(response.batch.manufacturingDate).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Expiry Date:</label>
            <span>{new Date(response.batch.expiryDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="security-section">
        <h3>Security Information</h3>
        <div className="security-grid">
          <div className="security-item">
            <label>Data Hash (SHA-256):</label>
            <code>{response.security.dataHash.substring(0, 32)}...</code>
          </div>
          <div className="security-item">
            <label>Chain Hash (SHA-256):</label>
            <code>{response.security.chainHash.substring(0, 32)}...</code>
          </div>
          <div className="security-item">
            <label>HMAC Signature:</label>
            <code>{response.security.hmacSignature.substring(0, 32)}...</code>
          </div>
        </div>
      </div>

      <div className="qr-section">
        <h3>QR Code</h3>
        <div className="qr-container">
          <img 
            src={response.security.qrCode.dataURL} 
            alt="Batch QR Code"
            className="qr-image"
          />
        </div>
        <div className="qr-content">
          <p><strong>Content:</strong></p>
          <code>{response.security.qrCode.content}</code>
        </div>
      </div>

      <div className="actions">
        <button onClick={handlePrintQR} className="action-btn print-btn">
          🖨️ Print QR Code
        </button>
        <button onClick={handleDownloadQR} className="action-btn download-btn">
          ⬇️ Download QR Code
        </button>
        <button className="action-btn view-batch-btn">
          👁️ View Batch Details
        </button>
      </div>

      <div className="encrypted-data">
        <h3>Encrypted Batch Details</h3>
        <p className="encryption-info">
          Algorithm: {response.encryptedData.encryptionAlgorithm}
        </p>
        <code className="encrypted-text">
          {response.encryptedData.batchDetails.substring(0, 100)}...
        </code>
        <p className="note">
          ℹ️ Batch details are encrypted with AES-256 for security
        </p>
      </div>
    </div>
  );
}

// ============================================================
// EXAMPLE 3: CSS Styling
// ============================================================

/*
.manufacturer-form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
}

.form-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.form-section h1 {
  color: #fff;
  margin-bottom: 25px;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ddd;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.1);
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.response-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  max-height: 100vh;
  overflow-y: auto;
}

.success-container h2 {
  color: #4ade80;
  margin-bottom: 15px;
}

.status-badge {
  display: inline-block;
  background: #4ade80;
  color: #1a1a2e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.batch-info,
.security-section,
.qr-section,
.encrypted-data {
  margin-bottom: 25px;
}

.batch-info h3,
.security-section h3,
.qr-section h3,
.encrypted-data h3 {
  color: #60a5fa;
  margin-bottom: 15px;
  font-size: 16px;
}

.info-grid,
.security-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-item,
.security-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 15px;
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
}

.info-item label,
.security-item label {
  color: #999;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 5px;
}

.info-item span,
.security-item code {
  color: #fff;
  font-size: 14px;
  word-break: break-all;
}

.batch-id-display {
  display: flex;
  gap: 10px;
  align-items: center;
}

.copy-btn {
  padding: 6px 12px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.qr-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: inline-block;
  margin: 15px 0;
}

.qr-image {
  max-width: 200px;
  height: auto;
}

.qr-content {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.qr-content p {
  color: #999;
  font-size: 12px;
  margin-bottom: 5px;
}

.qr-content code {
  color: #fff;
  word-break: break-all;
  font-size: 12px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  padding: 12px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

.encrypted-data {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  padding: 15px;
  border-radius: 8px;
}

.encryption-info {
  color: #999;
  font-size: 12px;
  margin: 10px 0;
}

.note {
  color: #60a5fa;
  font-size: 12px;
  margin-top: 10px;
}
*/

// ============================================================
// EXAMPLE 4: API Service Utility
// ============================================================

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/manufacturer';

export const batchService = {
  // Create a new batch
  createBatch: async (batchData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/create-batch`,
        batchData
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Get batch details
  getBatch: async (batchId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/batch/${batchId}`
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Verify batch integrity
  verifyBatch: async (batchId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify-batch`,
        { batchId }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
};

// ============================================================
// EXAMPLE 5: Usage in Component
// ============================================================

/*
import { batchService } from './services/batchService';

// In your component:
const handleCreateBatch = async (formData) => {
  const result = await batchService.createBatch(formData);
  
  if (result.success) {
    console.log('Batch created:', result.data);
    // Display success UI
  } else {
    console.error('Error:', result.error);
    // Display error message
  }
};

const handleVerifyBatch = async (batchId) => {
  const result = await batchService.verifyBatch(batchId);
  
  if (result.success) {
    console.log('Verification:', result.data);
    // Show verification results
  } else {
    console.error('Verification failed:', result.error);
  }
};
*/

export default {
  batchService
};
