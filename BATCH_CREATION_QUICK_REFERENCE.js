// ============================================================
// MANUFACTURER BATCH CREATION - QUICK REFERENCE
// ============================================================

// ============================================================
// STEP 1: Batch Creation
// ============================================================
// Input Validation & Storage
// Fields: batchId, medicineName, quantity, manufacturerName, dates
// Database: Creates document with metadata

const batchData = {
  batchId: "BATCH-20251211-001",
  medicineName: "Aspirin 500mg",
  quantity: 10000,
  manufacturerName: "Pharma Corp Ltd",
  manufacturingDate: new Date("2025-12-11"),
  expiryDate: new Date("2026-12-11")
};

// ============================================================
// STEP 2: AES-256 Encryption of Batch Details
// ============================================================
// Encrypts sensitive batch information
// Algorithm: AES-256-ECB
// Key: process.env.AES_SECRET

const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

const batchDetailsString = JSON.stringify(batchData);
const encryptedBatchDetails = encryptData(batchDetailsString);
// Result: "U2FsdGVkX1..." (encrypted cipher text)

// ============================================================
// STEP 3: SHA-256 DataHash Generation
// ============================================================
// Creates cryptographic fingerprint of batch
// Non-reversible, detects tampering
// Result: 64-character hex string

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

const dataHash = generateDataHash(batchData);
// Result: "a1b2c3d4e5f6..." (64 char hex)

// ============================================================
// STEP 4: Hash-Chain Generation
// ============================================================
// Creates blockchain-like chain linking
// Formula: chainHash = SHA256(previousChainHash + dataHash)
// Genesis: previousChainHash = "GENESIS_BLOCK_HASH"

const generateChainHash = (previousChainHash, dataHash) => {
  const combinedString = previousChainHash + dataHash;
  return CryptoJS.SHA256(combinedString).toString();
};

const previousChainHash = "GENESIS_BLOCK_HASH";
const chainHash = generateChainHash(previousChainHash, dataHash);
// Result: "m1n2o3p4q5r6..." (64 char hex)

// Visual representation:
// Genesis: SHA256("GENESIS_BLOCK_HASH" + "a1b2c3d4e5f6...")
//           = "m1n2o3p4q5r6..."
//
// Event 2:  SHA256("m1n2o3p4q5r6..." + "dataHash2")
//           = "chainHash2"
//
// Event 3:  SHA256("chainHash2" + "dataHash3")
//           = "chainHash3"

// ============================================================
// STEP 5: QR Code Generation
// ============================================================
// Encodes batchId|chainHash for physical tracking
// Format: PNG DataURL (base64 encoded image)
// Error Correction: High level (recovers up to 30% loss)

const generateQRCode = async (batchId, chainHash) => {
  try {
    const qrData = `${batchId}|${chainHash}`;
    // Example: "BATCH-20251211-001|m1n2o3p4q5r6..."
    
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
    // Result: "data:image/png;base64,iVBORw0KGgo..." (PNG image)
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

const qrCodeDataURL = await generateQRCode(batchId, chainHash);

// ============================================================
// STEP 6: HMAC Signature for Manufacturer Event
// ============================================================
// Digitally signs the manufacturer's action
// Algorithm: HMAC-SHA256
// Key: process.env.SECRET_KEY
// Proves authenticity & detects tampering

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

const eventData = {
  batchId: "BATCH-20251211-001",
  dataHash: "a1b2c3d4e5f6...",
  chainHash: "m1n2o3p4q5r6...",
  timestamp: new Date(),
  role: "Manufacturer"
};

const hmacSignature = generateHMACSignature(eventData, process.env.SECRET_KEY);
// Result: "signature_hash..." (64 char hex)

// ============================================================
// STEP 7: Final Dispatch Response Object
// ============================================================
// Returns complete security package to frontend

const dispatchResponse = {
  success: true,
  message: "Batch created successfully with complete security chain",
  
  // Batch Information
  batch: {
    batchId: "BATCH-20251211-001",
    medicineName: "Aspirin 500mg",
    quantity: 10000,
    manufacturerName: "Pharma Corp Ltd",
    manufacturingDate: "2025-12-11T00:00:00Z",
    expiryDate: "2026-12-11T00:00:00Z",
    status: "GENESIS_CREATED"
  },
  
  // Security Package
  security: {
    dataHash: "a1b2c3d4e5f6...",
    chainHash: "m1n2o3p4q5r6...",
    hmacSignature: "signature_hash...",
    qrCode: {
      dataURL: "data:image/png;base64,...",
      content: "BATCH-20251211-001|m1n2o3p4q5r6...",
      width: 300,
      height: 300
    }
  },
  
  // Genesis Event (First event in chain)
  genesisEvent: {
    role: "Manufacturer",
    location: "Factory Output",
    timestamp: "2025-12-11T10:30:45.123Z",
    signature: "signature_hash...",
    chainHash: "m1n2o3p4q5r6..."
  },
  
  // Encrypted Data
  encryptedData: {
    batchDetails: "U2FsdGVkX1...",
    encryptionAlgorithm: "AES-256-ECB"
  }
};

// ============================================================
// API ENDPOINT
// ============================================================

/*
POST /api/manufacturer/create-batch

Request:
{
  "batchId": "BATCH-20251211-001",
  "medicineName": "Aspirin 500mg",
  "quantity": 10000,
  "manufacturerName": "Pharma Corp Ltd",
  "manufacturerId": "MFG-001",
  "manufacturingDate": "2025-12-11T00:00:00Z",
  "expiryDate": "2026-12-11T00:00:00Z",
  "location": "Factory Output"
}

Response: (See dispatchResponse above)
*/

// ============================================================
// SUPPORTING ENDPOINTS
// ============================================================

// GET /api/manufacturer/batch/:batchId
// - Retrieves batch info and chain history
// - No sensitive data exposed
// - Useful for tracking

// POST /api/manufacturer/verify-batch
// - Verifies batch integrity
// - Compares stored vs calculated hashes
// - Returns verification report

// ============================================================
// WORKFLOW SUMMARY
// ============================================================

/*
FRONTEND ACTION:
  ↓
SEND REQUEST TO: POST /api/manufacturer/create-batch
  ↓
BACKEND PROCESSES (7 STEPS):
  1. Batch Creation        → Validate & store metadata
  2. AES Encryption        → Encrypt batch details with AES-256
  3. SHA-256 DataHash      → Generate fingerprint with SHA-256
  4. Hash-Chain            → Generate chainHash with blockchain logic
  5. QR Code Generation    → Create QR code with batchId|chainHash
  6. HMAC Signature        → Sign event with HMAC-SHA256
  7. Response Object       → Return complete security package
  ↓
SEND RESPONSE WITH:
  - Batch metadata
  - Security hashes (dataHash, chainHash)
  - QR code (PNG DataURL)
  - HMAC signature
  - Genesis event details
  - Encrypted batch data
  ↓
FRONTEND ACTIONS:
  - Display/save batch ID
  - Display QR code for printing
  - Store security hashes
  - Show confirmation
  - Redirect to dashboard
*/

// ============================================================
// DEPLOYMENT & TESTING
// ============================================================

/*
REQUIRED ENVIRONMENT VARIABLES (.env):
  MONGO_URI=mongodb://localhost:27017/medical-supply-chain
  AES_SECRET=your_aes_256_secret_key_here
  SECRET_KEY=your_hmac_secret_key_here
  PORT=5000

REQUIRED NPM PACKAGES:
  npm install express mongoose cors dotenv
  npm install crypto-js qrcode nodemailer bcrypt

INSTALLED VERSION:
  qrcode: ^4.0.0+ (or latest)
  crypto-js: ^4.2.0
  mongoose: ^9.0.1
  dotenv: ^17.2.3

START SERVER:
  npm start
  or
  node server.js

TEST ENDPOINT:
  curl -X POST http://localhost:5000/api/manufacturer/create-batch \
    -H "Content-Type: application/json" \
    -d '{
      "batchId": "TEST-001",
      "medicineName": "Test Med",
      "quantity": 1000,
      "manufacturerName": "Test Corp"
    }'
*/

// ============================================================
// DATABASE DOCUMENT STRUCTURE
// ============================================================

/*
Collection: batches

{
  _id: ObjectId("..."),
  batchId: "BATCH-20251211-001",
  medicineName: "Aspirin 500mg",
  quantity: 10000,
  manufacturerName: "Pharma Corp Ltd",
  manufacturerId: "MFG-001",
  manufacturingDate: ISODate("2025-12-11T00:00:00Z"),
  expiryDate: ISODate("2026-12-11T00:00:00Z"),
  batchDetails: "U2FsdGVkX1...",  // AES encrypted
  genesisDataHash: "a1b2c3d4e5f6...",
  genesisChainHash: "m1n2o3p4q5r6...",
  genesisQRCode: "data:image/png;base64,...",
  isComplete: false,
  prescriptionEncrypted: null,
  chain: [
    {
      _id: ObjectId("..."),
      role: "Manufacturer",
      location: "Factory Output",
      timestamp: ISODate("2025-12-11T10:30:45.123Z"),
      signature: "...",
      previousHash: "GENESIS",
      dataHash: "a1b2c3d4e5f6...",
      chainHash: "m1n2o3p4q5r6...",
      qrCode: "data:image/png;base64,...",
      hmacSignature: "signature_hash..."
    }
  ],
  createdAt: ISODate("2025-12-11T10:30:45.123Z"),
  updatedAt: ISODate("2025-12-11T10:30:45.123Z")
}
*/
