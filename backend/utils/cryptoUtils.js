const CryptoJS = require("crypto-js");
const QRCode = require("qrcode");

// --- 🛠️ HELPER: Safe Date Conversion ---
// Prevents "Invalid time value" crashes
const safeISO = (dateInput) => {
    try {
        if (!dateInput) return new Date().toISOString(); // Fallback for null
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return new Date().toISOString(); // Fallback for invalid date
        return d.toISOString();
    } catch (e) {
        return new Date().toISOString();
    }
};

// Helper: Sort object keys
const sortObj = (obj) => {
  return Object.keys(obj).sort().reduce((result, key) => {
    if (obj[key] instanceof Date) {
        result[key] = safeISO(obj[key]); // Use Safe Conversion
    } else {
        result[key] = obj[key];
    }
    return result;
  }, {});
};

// 1. SHA256 Hash
const calculateHash = (data) => {
  return CryptoJS.SHA256(JSON.stringify(sortObj(data))).toString();
};

// 2. Hash-Chain
const generateChainHash = (previousChainHash, dataHash) => {
  return CryptoJS.SHA256(previousChainHash + dataHash).toString();
};

// 3. HMAC Signature
const generateHMACSignature = (data, secretKey) => {
  return CryptoJS.HmacSHA256(JSON.stringify(sortObj(data)), secretKey).toString();
};

// 4. AES Encryption
const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

const decryptData = (ciphertext) => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) { return null; }
};

// 5. QR Code
const generateQRCode = async (batchId, chainHash) => {
  try {
    return await QRCode.toDataURL(`${batchId}|${chainHash}`, { errorCorrectionLevel: 'H' });
  } catch (error) { return ""; }
};

// --- 🛡️ THE TRUTH: CANONICAL PAYLOAD HELPER ---
const createCanonicalPayload = (block, batchNumber) => {
    // A. Manufacturer Block (Genesis)
    if (block.role === "Manufacturer") {
        return {
            batchNumber: batchNumber || block.batchNumber,
            medicineName: block.medicineName,
            manufacturerName: block.manufacturerName,
            quantity: Number(block.quantity), 
            // 👇 USE SAFE ISO CONVERSION HERE
            manufacturingDate: safeISO(block.manufacturingDate),
            expiryDate: safeISO(block.expiryDate),
            timestamp: safeISO(block.timestamp),
            role: "Manufacturer"
        };
    }
    
    // B. Distributor / Pharmacy Block
    return {
        batchNumber: batchNumber || block.batchNumber,
        role: block.role,
        location: block.location,
        handlerDetails: block.handlerDetails,
        contactInfo: block.contactInfo,
        // 👇 USE SAFE ISO CONVERSION HERE
        timestamp: safeISO(block.timestamp),
        previousHash: block.previousHash
    };
};

// --- 6. Sign Generic Data (Legacy support)
const signData = (data, secretKey) => {
    return CryptoJS.HmacSHA256(JSON.stringify(sortObj(data)), secretKey).toString();
};

// --- ⭐ STRICT VALIDATION ---
const validateChain = (chain, batchNumber) => {
  for (let i = 0; i < chain.length; i++) {
    const currentBlock = chain[i];

    // 1. DATA INTEGRITY (Re-hash using Canonical Payload)
    const payload = createCanonicalPayload(currentBlock, batchNumber);
    const freshHash = calculateHash(payload);

    if (freshHash !== currentBlock.dataHash) {
        console.error(`🚨 TAMPER DETECTED at Block ${i} (${currentBlock.role})`);
        console.error(`Reason: Data content mismatch.`);
        return false;
    }

    // 2. LINK INTEGRITY
    if (i > 0) {
        const previousBlock = chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.dataHash) return false; 
        
        const freshChainHash = generateChainHash(previousBlock.chainHash, currentBlock.dataHash);
        if (freshChainHash !== currentBlock.chainHash) return false;
    }
  }
  return true;
};

module.exports = {
  calculateHash, generateChainHash, generateHMACSignature, signData,
  encryptData, decryptData, generateQRCode, validateChain, createCanonicalPayload
};