require("dotenv").config();
const CryptoJS = require("crypto-js");

// Try different combinations to find which one matches the stored hash
const storedHash = "5388c90b6a4d9a121adafe2c615dce0bb9c76ae4612f5969217deb89c227ed16";

const testData = {
  batchNumber: "batch001",
  quantityProduced: 2,
  medicineName: "paracetamol",
  manufacturerName: "lulu",
  manufacturingDate: "2025-12-02T00:00:00.000Z",
  expiryDate: "2025-12-30T00:00:00.000Z"
};

console.log("🔍 TRYING DIFFERENT FIELD COMBINATIONS:\n");

// Test 1: Current order
const test1 = {
  batchNumber: testData.batchNumber,
  medicineName: testData.medicineName,
  quantityProduced: testData.quantityProduced,
  manufacturerName: testData.manufacturerName,
  manufacturingDate: testData.manufacturingDate,
  expiryDate: testData.expiryDate
};
const hash1 = CryptoJS.SHA256(JSON.stringify(test1)).toString();
console.log(`Test 1 (current order):`);
console.log(`Hash: ${hash1}`);
console.log(`Match: ${hash1 === storedHash ? "✅ YES!" : "❌ NO"}\n`);

// Test 2: With strength field (since it's encrypted)
const test2 = {
  batchNumber: testData.batchNumber,
  strength: "unknown", // doesn't exist in batch001
  medicineName: testData.medicineName,
  quantityProduced: testData.quantityProduced,
  manufacturerName: testData.manufacturerName,
  manufacturingDate: testData.manufacturingDate,
  expiryDate: testData.expiryDate
};
const hash2 = CryptoJS.SHA256(JSON.stringify(test2)).toString();
console.log(`Test 2 (with strength):`);
console.log(`Hash: ${hash2}`);
console.log(`Match: ${hash2 === storedHash ? "✅ YES!" : "❌ NO"}\n`);

// Test 3: Old naming - batchId instead of batchNumber
const test3 = {
  batchId: testData.batchNumber,
  medicineName: testData.medicineName,
  quantity: testData.quantityProduced,
  manufacturerName: testData.manufacturerName,
  manufacturingDate: testData.manufacturingDate,
  expiryDate: testData.expiryDate
};
const hash3 = CryptoJS.SHA256(JSON.stringify(test3)).toString();
console.log(`Test 3 (batchId/quantity naming):`);
console.log(`Hash: ${hash3}`);
console.log(`Match: ${hash3 === storedHash ? "✅ YES!" : "❌ NO"}\n`);

// Test 4: Alphabetical order
const test4 = {};
["batchNumber", "expiryDate", "manufacturerName", "manufacturingDate", "medicineName", "quantityProduced"].sort().forEach(key => {
  test4[key] = testData[key];
});
const hash4 = CryptoJS.SHA256(JSON.stringify(test4)).toString();
console.log(`Test 4 (alphabetical order):`);
console.log(`Hash: ${hash4}`);
console.log(`Match: ${hash4 === storedHash ? "✅ YES!" : "❌ NO"}\n`);

process.exit(0);
