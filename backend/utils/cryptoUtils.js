const CryptoJS = require("crypto-js");

// 1. SHA256 Hash (Creates the unique fingerprint)
const calculateHash = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

// 2. HMAC Signature (Digital Signature to prove identity)
const signData = (data, secretKey) => {
  return CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString();
};

// 3. AES Encryption (Locks the patient prescription)
const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

// 4. AES Decryption (Unlocks the prescription)
const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { calculateHash, signData, encryptData, decryptData };