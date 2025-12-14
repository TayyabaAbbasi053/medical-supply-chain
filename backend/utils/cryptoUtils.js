const CryptoJS = require("crypto-js");
const QRCode = require("qrcode");

// 1. SHA256 Hash (Generic)
const calculateHash = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

// 2. SHA-256 DataHash (For batch details)
const generateDataHash = (batchData) => {
  const dataString = JSON.stringify({
    batchId: batchData.batchId,
    medicineName: batchData.medicineName,
    quantity: batchData.quantity,
    manufacturerName: batchData.manufacturerName,
    manufacturingDate: batchData.manufacturingDate,
    expiryDate: batchData.expiryDate
  });
  return CryptoJS.SHA256(dataString).toString();
};

// 3. Hash-Chain Generation
const generateChainHash = (previousChainHash, dataHash) => {
  const combinedString = previousChainHash + dataHash;
  return CryptoJS.SHA256(combinedString).toString();
};

// 4. HMAC Signature (Generic)
const signData = (data, secretKey) => {
  return CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString();
};

// 5. HMAC Signature for Events
const generateHMACSignature = (eventData, secretKey) => {
  const signatureData = {
    batchId: eventData.batchId || eventData.batchNumber, // Handle both key names
    dataHash: eventData.dataHash,
    chainHash: eventData.chainHash,
    timestamp: eventData.timestamp,
    role: eventData.role
  };
  return CryptoJS.HmacSHA256(JSON.stringify(signatureData), secretKey).toString();
};

// 6. AES Encryption
const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

// 7. AES Decryption
const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 8. QR Code Generation
const generateQRCode = async (batchId, chainHash) => {
  try {
    const qrData = `${batchId}|${chainHash}`;
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
    });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    throw new Error("Failed to generate QR code");
  }
};

// 9. ⭐ NEW: Validate Chain Integrity (Tamper Check)
const validateChain = (chain) => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // 1. Check if previousHash matches the dataHash of previous block
    if (currentBlock.previousHash !== previousBlock.dataHash) {
      console.log(`❌ Data Link Broken at index ${i}`);
      return false;
    }

    // 2. Check if chainHash is correctly derived from previous chainHash + current dataHash
    const recalculatedChainHash = generateChainHash(previousBlock.chainHash, currentBlock.dataHash);
    if (recalculatedChainHash !== currentBlock.chainHash) {
      console.log(`❌ Chain Hash Mismatch at index ${i}`);
      return false;
    }
  }
  return true;
};

module.exports = {
  calculateHash,
  generateDataHash,
  generateChainHash,
  signData,
  generateHMACSignature,
  encryptData,
  decryptData,
  generateQRCode,
  validateChain
};