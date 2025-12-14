const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const QRCode = require("qrcode");

// 1. SHA256 Hash (Creates the unique fingerprint)
const calculateHash = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

// 2. SHA-256 DataHash (For batch details - cryptographic hash)
const generateDataHash = (batchData) => {
  // Convert dates to ISO strings for consistent hashing
  const normalizedData = {
    batchNumber: batchData.batchNumber,
    medicineName: batchData.medicineName,
    manufacturingDate: batchData.manufacturingDate instanceof Date 
      ? batchData.manufacturingDate.toISOString() 
      : batchData.manufacturingDate,
    expiryDate: batchData.expiryDate instanceof Date 
      ? batchData.expiryDate.toISOString() 
      : batchData.expiryDate,
    manufacturerName: batchData.manufacturerName
  };
  
  const dataString = JSON.stringify(normalizedData);
  return CryptoJS.SHA256(dataString).toString();
};

// 3. Hash-Chain Generation (SHA256(previousChainHash + dataHash))
const generateChainHash = (previousChainHash, dataHash) => {
  const combinedString = previousChainHash + dataHash;
  return CryptoJS.SHA256(combinedString).toString();
};

// 4. HMAC Signature (Digital Signature to prove identity)
const signData = (data, secretKey) => {
  return CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString();
};

// 4b. Verify Signature (Check if signature matches data)
const verifySignature = (data, signature, secretKey) => {
  const recalculatedSignature = signData(data, secretKey);
  return recalculatedSignature === signature;
};

// 5. HMAC Signature for Manufacturer Event
const generateHMACSignature = (eventData, secretKey) => {
  const signatureData = {
    batchId: eventData.batchId,
    dataHash: eventData.dataHash,
    chainHash: eventData.chainHash,
    timestamp: eventData.timestamp,
    role: "Manufacturer"
  };
  return CryptoJS.HmacSHA256(JSON.stringify(signatureData), secretKey).toString();
};

// 6. AES Encryption (Locks the batch details)
const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

// 7. AES Decryption (Unlocks the batch details)
const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 8. QR Code Generation (Encodes batchId + chainHash)
const generateQRCode = async (batchId, chainHash) => {
  try {
    const qrData = `${batchId}|${chainHash}`;
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCode;
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    throw new Error("Failed to generate QR code");
  }
};

module.exports = {
  calculateHash,
  generateDataHash,
  generateChainHash,
  signData,
  verifySignature,
  generateHMACSignature,
  encryptData,
  decryptData,
  generateQRCode
};