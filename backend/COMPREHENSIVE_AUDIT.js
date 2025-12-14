const CryptoJS = require("crypto-js");

console.log("🔍 COMPREHENSIVE HASH AUDIT\n");

// Test 1: Field order sensitivity
console.log("=== TEST 1: JSON.stringify FIELD ORDER ===");
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { c: 3, b: 2, a: 1 };
console.log("obj1 JSON:", JSON.stringify(obj1));
console.log("obj2 JSON:", JSON.stringify(obj2));
console.log("Same?", JSON.stringify(obj1) === JSON.stringify(obj2));
console.log("");

// Test 2: Date handling
console.log("=== TEST 2: DATE HANDLING ===");
const dateObj = new Date("2024-12-14");
const dateString = "2024-12-14";
const dateISOString = dateObj.toISOString();

console.log("Date object:", dateObj);
console.log("Date string:", dateString);
console.log("ISO string:", dateISOString);
console.log("JSON.stringify(dateObj):", JSON.stringify(dateObj));
console.log("JSON.stringify(dateString):", JSON.stringify(dateString));
console.log("");

// Test 3: Hash of different date formats
console.log("=== TEST 3: HASH DIFFERENCES ===");
const data1 = { batchNumber: "B001", manufacturingDate: new Date("2024-12-14") };
const data2 = { batchNumber: "B001", manufacturingDate: "2024-12-14" };
const data3 = { batchNumber: "B001", manufacturingDate: new Date("2024-12-14").toISOString() };

const hash1 = CryptoJS.SHA256(JSON.stringify(data1)).toString();
const hash2 = CryptoJS.SHA256(JSON.stringify(data2)).toString();
const hash3 = CryptoJS.SHA256(JSON.stringify(data3)).toString();

console.log("Hash with Date object:", hash1.substring(0, 20) + "...");
console.log("Hash with date string:", hash2.substring(0, 20) + "...");
console.log("Hash with ISO string:", hash3.substring(0, 20) + "...");
console.log("");

// Test 4: Field order impact
console.log("=== TEST 4: FIELD ORDER IMPACT ===");
const fieldOrder1 = { batchNumber: "B001", medicineName: "M", manufacturingDate: "2024-12-14", expiryDate: "2025-12-14", manufacturerName: "MFG" };
const fieldOrder2 = { batchNumber: "B001", medicineName: "M", manufacturerName: "MFG", manufacturingDate: "2024-12-14", expiryDate: "2025-12-14" };

const hash4 = CryptoJS.SHA256(JSON.stringify(fieldOrder1)).toString();
const hash5 = CryptoJS.SHA256(JSON.stringify(fieldOrder2)).toString();

console.log("Hash with order [batch, medicine, mfgDate, expDate, mfg]:", hash4.substring(0, 20) + "...");
console.log("Hash with order [batch, medicine, mfg, mfgDate, expDate]:", hash5.substring(0, 20) + "...");
console.log("Same?", hash4 === hash5);
console.log("");

console.log("✅ AUDIT COMPLETE");
console.log("KEY FINDINGS:");
console.log("1. JSON.stringify uses key order → Different order = Different hash");
console.log("2. Date objects stringify differently than ISO strings");
console.log("3. Must normalize all dates to ISO strings BEFORE hashing");
console.log("4. Must use EXACT same field order everywhere");
