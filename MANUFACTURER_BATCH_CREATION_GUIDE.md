# Manufacturer Batch Creation System - Complete Workflow Guide

## Overview
This document details the complete 7-step secure batch creation workflow for the Medical Supply Chain system using the MERN stack with cryptographic security.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 MANUFACTURER BATCH CREATION                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: Batch Creation                                      │
│  ├─ Validate input fields                                    │
│  └─ Store batch metadata                                     │
│                                                               │
│  Step 2: AES-256 Encryption of Batch Details                │
│  ├─ Encrypt: {batchId, medicineName, quantity, etc}        │
│  └─ Store encrypted blob in database                         │
│                                                               │
│  Step 3: SHA-256 DataHash Generation                         │
│  ├─ Create cryptographic hash of batch data                  │
│  └─ Unique fingerprint for batch contents                    │
│                                                               │
│  Step 4: Hash-Chain Generation                               │
│  ├─ chainHash = SHA256(previousChainHash + dataHash)        │
│  ├─ Genesis: SHA256("GENESIS_BLOCK_HASH" + dataHash)       │
│  └─ Links to blockchain-like history                         │
│                                                               │
│  Step 5: QR Code Generation                                  │
│  ├─ Content: batchId|chainHash                               │
│  ├─ Format: PNG DataURL with error correction (H)            │
│  └─ Physical tracking capability                             │
│                                                               │
│  Step 6: HMAC Signature for Event                            │
│  ├─ HMAC-SHA256 signature of manufacturer event              │
│  ├─ Signs: batchId, dataHash, chainHash, timestamp           │
│  └─ Authenticity verification                                │
│                                                               │
│  Step 7: Final Dispatch Response                             │
│  ├─ Return complete security package                         │
│  └─ Batch + Security + Genesis Event + Encrypted Data       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoint

### POST `/api/manufacturer/create-batch`

**Purpose**: Create a new batch with complete security chain initialization

**Request Body**:
```json
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
```

**Field Descriptions**:
- `batchId` (required): Unique batch identifier (string)
- `medicineName` (required): Name of medicine in batch (string)
- `quantity` (required): Number of units (number)
- `manufacturerName` (required): Company name (string)
- `manufacturerId` (optional): Reference to manufacturer user ID (string)
- `manufacturingDate` (optional): Batch manufacturing date (ISO 8601)
- `expiryDate` (optional): Batch expiry date, defaults to 1 year (ISO 8601)
- `location` (optional): Physical location, defaults to "Factory Output" (string)

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Batch created successfully with complete security chain",
  "batch": {
    "batchId": "BATCH-20251211-001",
    "medicineName": "Aspirin 500mg",
    "quantity": 10000,
    "manufacturerName": "Pharma Corp Ltd",
    "manufacturingDate": "2025-12-11T00:00:00Z",
    "expiryDate": "2026-12-11T00:00:00Z",
    "status": "GENESIS_CREATED"
  },
  "security": {
    "dataHash": "abc123def456...",
    "chainHash": "xyz789uvw012...",
    "hmacSignature": "hmac_signature_value...",
    "qrCode": {
      "dataURL": "data:image/png;base64,...",
      "content": "BATCH-20251211-001|xyz789uvw012...",
      "width": 300,
      "height": 300
    }
  },
  "genesisEvent": {
    "role": "Manufacturer",
    "location": "Factory Output",
    "timestamp": "2025-12-11T10:30:45.123Z",
    "signature": "hmac_signature_value...",
    "chainHash": "xyz789uvw012..."
  },
  "encryptedData": {
    "batchDetails": "U2FsdGVkX1...",
    "encryptionAlgorithm": "AES-256-ECB"
  }
}
```

---

## Step-by-Step Implementation Details

### Step 1: Batch Creation
```javascript
const batchData = {
  batchId: "BATCH-20251211-001",
  medicineName: "Aspirin 500mg",
  quantity: 10000,
  manufacturerName: "Pharma Corp Ltd",
  manufacturingDate: new Date("2025-12-11"),
  expiryDate: new Date("2026-12-11")
};
```
- Validates all required fields
- Checks for duplicate batchId
- Stores metadata for future reference

---

### Step 2: AES-256 Encryption of Batch Details
```javascript
const batchDetailsString = JSON.stringify(batchData);
const encryptedBatchDetails = encryptData(batchDetailsString);
// Result: "U2FsdGVkX1..." (encrypted blob)
```

**Purpose**: 
- Protects batch details from unauthorized access
- Maintains confidentiality throughout supply chain
- Algorithm: AES-256-ECB using CryptoJS library
- Key: Stored in `process.env.AES_SECRET`

---

### Step 3: SHA-256 DataHash Generation
```javascript
const dataHash = generateDataHash({
  batchId: "BATCH-20251211-001",
  medicineName: "Aspirin 500mg",
  quantity: 10000,
  manufacturerName: "Pharma Corp Ltd",
  manufacturingDate: "2025-12-11",
  expiryDate: "2026-12-11"
});
// Result: "a1b2c3d4e5f6..." (64 character hex string)
```

**Purpose**:
- Creates cryptographic fingerprint of batch
- Detects any tampering with batch data
- Used in hash-chain generation
- Algorithm: SHA-256

---

### Step 4: Hash-Chain Generation
```javascript
const previousChainHash = "GENESIS_BLOCK_HASH";
const chainHash = generateChainHash(previousChainHash, dataHash);
// chainHash = SHA256("GENESIS_BLOCK_HASH" + "a1b2c3d4e5f6...")
// Result: "m1n2o3p4q5r6..." (64 character hex string)
```

**Purpose**:
- Implements blockchain-like chain linking
- Ensures chronological integrity
- Future events will use this chainHash as previousChainHash
- Genesis chain: SHA256("GENESIS_BLOCK_HASH" + dataHash)

**Chain Linking Formula**:
```
chainHash(N) = SHA256(chainHash(N-1) + dataHash(N))
```

---

### Step 5: QR Code Generation
```javascript
const qrCodeDataURL = await generateQRCode(
  "BATCH-20251211-001",
  "m1n2o3p4q5r6..."
);
// QR Content: "BATCH-20251211-001|m1n2o3p4q5r6..."
// Result: "data:image/png;base64,iVBORw0KGgo..." (PNG DataURL)
```

**QR Code Specifications**:
- **Content**: `{batchId}|{chainHash}`
- **Error Correction Level**: High (H) - recovers up to 30% loss
- **Format**: PNG image as DataURL (base64 encoded)
- **Dimensions**: 300x300 pixels
- **Quality**: 95%
- **Margin**: 1 module

**Use Cases**:
- Print on batch packaging
- Scan for batch tracking
- Verify authenticity at distribution points

---

### Step 6: HMAC Signature for Manufacturer Event
```javascript
const eventData = {
  batchId: "BATCH-20251211-001",
  dataHash: "a1b2c3d4e5f6...",
  chainHash: "m1n2o3p4q5r6...",
  timestamp: "2025-12-11T10:30:45.123Z",
  role: "Manufacturer"
};

const hmacSignature = generateHMACSignature(eventData, process.env.SECRET_KEY);
// Result: "signature_hash_value..." (64 character hex string)
```

**Purpose**:
- Cryptographically signs the manufacturer's action
- Proves the batch was created by authorized manufacturer
- Detects any tampering with event metadata
- Algorithm: HMAC-SHA256
- Key: Stored in `process.env.SECRET_KEY`

**What Gets Signed**:
- batchId
- dataHash
- chainHash
- timestamp
- role ("Manufacturer")

---

### Step 7: Final Dispatch Response Object
```javascript
const dispatchResponse = {
  success: true,
  message: "Batch created successfully with complete security chain",
  batch: {
    batchId,
    medicineName,
    quantity,
    manufacturerName,
    manufacturingDate,
    expiryDate,
    status: "GENESIS_CREATED"
  },
  security: {
    dataHash,
    chainHash,
    hmacSignature,
    qrCode: {
      dataURL,
      content: `${batchId}|${chainHash}`,
      width: 300,
      height: 300
    }
  },
  genesisEvent: {
    role: "Manufacturer",
    location,
    timestamp,
    signature: hmacSignature,
    chainHash
  },
  encryptedData: {
    batchDetails: encryptedBatchDetails,
    encryptionAlgorithm: "AES-256-ECB"
  }
};
```

---

## Database Schema

### Batch Collection
```javascript
{
  _id: ObjectId,
  batchId: String (unique),
  medicineName: String,
  quantity: Number,
  manufacturerName: String,
  manufacturerId: String,
  manufacturingDate: Date,
  expiryDate: Date,
  batchDetails: String (AES encrypted),
  genesisDataHash: String (SHA-256),
  genesisChainHash: String (SHA-256),
  genesisQRCode: String (PNG DataURL),
  isComplete: Boolean,
  prescriptionEncrypted: String,
  chain: [
    {
      role: String,
      location: String,
      timestamp: Date,
      signature: String (HMAC),
      previousHash: String,
      dataHash: String,
      chainHash: String,
      qrCode: String,
      hmacSignature: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Additional Endpoints

### GET `/api/manufacturer/batch/:batchId`
Retrieves batch information and chain history

**Response**:
```json
{
  "success": true,
  "batch": {
    "batchId": "BATCH-20251211-001",
    "medicineName": "Aspirin 500mg",
    "quantity": 10000,
    "manufacturerName": "Pharma Corp Ltd",
    "manufacturingDate": "2025-12-11T00:00:00Z",
    "expiryDate": "2026-12-11T00:00:00Z",
    "genesisDataHash": "a1b2c3d4e5f6...",
    "genesisChainHash": "m1n2o3p4q5r6...",
    "chainLength": 1,
    "status": "IN_TRANSIT"
  },
  "chainHistory": [
    {
      "role": "Manufacturer",
      "location": "Factory Output",
      "timestamp": "2025-12-11T10:30:45.123Z",
      "signature": "signature_hash...",
      "chainHash": "m1n2o3p4q5r6...",
      ...
    }
  ]
}
```

---

### POST `/api/manufacturer/verify-batch`
Verifies batch integrity and authenticity

**Request Body**:
```json
{
  "batchId": "BATCH-20251211-001"
}
```

**Response**:
```json
{
  "success": true,
  "verification": {
    "batchId": "BATCH-20251211-001",
    "isGenesisHashValid": true,
    "chainIntegrity": {
      "genesisDataHash": {
        "stored": "a1b2c3d4e5f6...",
        "calculated": "a1b2c3d4e5f6...",
        "match": true
      },
      "genesisChainHash": "m1n2o3p4q5r6..."
    },
    "eventCount": 1,
    "timestamp": "2025-12-11T10:35:12.456Z"
  }
}
```

---

## Security Features

### 1. **AES-256 Encryption**
- Encrypts sensitive batch details
- Uses secure key stored in environment variables
- Algorithm: AES-256-ECB via CryptoJS

### 2. **SHA-256 Hashing**
- Generates cryptographic fingerprints
- Detects any data tampering
- Non-reversible (one-way hashing)

### 3. **Hash-Chain (Blockchain-like)**
- Links events chronologically
- `chainHash = SHA256(previousChainHash + dataHash)`
- Prevents unauthorized modification of past events

### 4. **QR Codes**
- Physical tracking capability
- Encodes batchId + chainHash
- High error correction level (30% recovery)

### 5. **HMAC Signatures**
- Authenticates manufacturer identity
- Signs all critical event data
- Algorithm: HMAC-SHA256
- Detects tampering with event metadata

### 6. **Unique Batch IDs**
- Prevents duplicate batches
- Database constraint ensures uniqueness

---

## Environment Variables Required

```bash
# .env file
MONGO_URI=mongodb://localhost:27017/medical-supply-chain
AES_SECRET=your_aes_256_secret_key_here
SECRET_KEY=your_hmac_secret_key_here
PORT=5000
```

---

## Example Request Flow

### 1. Frontend Calls Create Batch
```javascript
const response = await axios.post('/api/manufacturer/create-batch', {
  batchId: 'BATCH-20251211-001',
  medicineName: 'Aspirin 500mg',
  quantity: 10000,
  manufacturerName: 'Pharma Corp Ltd',
  manufacturerId: 'MFG-001',
  manufacturingDate: '2025-12-11T00:00:00Z',
  expiryDate: '2026-12-11T00:00:00Z'
});
```

### 2. Backend Processes (7 Steps)
- ✅ Step 1: Batch Creation
- ✅ Step 2: AES Encryption
- ✅ Step 3: SHA-256 DataHash
- ✅ Step 4: Hash-Chain Generation
- ✅ Step 5: QR Code Generation
- ✅ Step 6: HMAC Signature
- ✅ Step 7: Response Object

### 3. Frontend Receives Response
```javascript
{
  success: true,
  batch: {...},
  security: {
    dataHash: "...",
    chainHash: "...",
    hmacSignature: "...",
    qrCode: {
      dataURL: "data:image/png;base64,...",
      content: "BATCH-20251211-001|...",
      ...
    }
  },
  genesisEvent: {...},
  encryptedData: {...}
}
```

### 4. Frontend Actions
- Display QR code for printing
- Store batch ID for reference
- Show confirmation message
- Redirect to batch tracking dashboard

---

## Testing the Endpoint

### Using cURL
```bash
curl -X POST http://localhost:5000/api/manufacturer/create-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "TEST-BATCH-001",
    "medicineName": "Test Medicine",
    "quantity": 5000,
    "manufacturerName": "Test Pharma",
    "manufacturingDate": "2025-12-11T00:00:00Z",
    "expiryDate": "2026-12-11T00:00:00Z"
  }'
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:5000/api/manufacturer/create-batch`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON): See request body above
5. Click Send

---

## Next Steps in Supply Chain

1. **Distributor Updates Batch**
   - Add distribution event to chain
   - Generate new chainHash for this event
   - Sign with distributor HMAC

2. **Pharmacy/Pharmacist Updates Batch**
   - Add pharmacy event to chain
   - Encrypt patient prescription
   - Mark batch as complete

3. **Patient Retrieves Batch Info**
   - View complete chain history
   - Verify batch authenticity
   - Access their prescription

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Batch ID already exists" | Use unique batchId, check database |
| "Missing required fields" | Ensure all required fields provided |
| "QR code generation failed" | Check server logs, verify dependencies |
| "AES encryption failed" | Verify AES_SECRET in .env |
| "HMAC signature failed" | Verify SECRET_KEY in .env |

---

## Security Best Practices

✅ **DO**:
- Store keys securely in .env (never commit)
- Use HTTPS in production
- Validate all inputs on backend
- Log all batch creation events
- Implement rate limiting on API
- Use authenticated routes (add JWT)

❌ **DON'T**:
- Hardcode secrets in code
- Send encryption keys in responses
- Skip input validation
- Trust client-side verification alone
- Expose sensitive batch details unnecessarily

---

**Document Version**: 1.0  
**Last Updated**: December 11, 2025  
**Author**: Medical Supply Chain Team
