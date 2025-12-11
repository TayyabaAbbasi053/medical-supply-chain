# Manufacturer Batch Creation - Visual Workflow Diagrams

## 1. Overall Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Vite)                       │
│                   Manufacturer Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Batch Creation Form                                 │       │
│  │  - Batch ID                                          │       │
│  │  - Medicine Name                                     │       │
│  │  - Quantity                                          │       │
│  │  - Manufacturer Details                              │       │
│  │  - Dates (Manufacturing & Expiry)                    │       │
│  └──────────────────────────────────────────────────────┘       │
│              ↓                                                    │
│       [Submit Button]                                            │
│              ↓                                                    │
│       axios.post('/api/manufacturer/create-batch')              │
│              ↓                                                    │
└─────────────────────────────────────────────────────────────────┘
              │
              │ HTTP POST
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
│              Manufacturer Routes Handler                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/manufacturer/create-batch                             │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 1: Batch Creation                              │        │
│  │ - Validate input fields                             │        │
│  │ - Check for duplicate batchId                       │        │
│  │ - Prepare batch metadata                            │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 2: AES-256 Encryption                          │        │
│  │ Input:  {batchId, medicineName, quantity, ...}     │        │
│  │ Output: "U2FsdGVkX1..."                             │        │
│  │ Algorithm: AES-256-ECB                              │        │
│  │ Key: process.env.AES_SECRET                         │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 3: SHA-256 DataHash Generation                 │        │
│  │ Input:  {batchId, medicineName, quantity, ...}     │        │
│  │ Output: "a1b2c3d4e5f6..."                           │        │
│  │ Algorithm: SHA-256                                  │        │
│  │ Result: 64-character hex string                     │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 4: Hash-Chain Generation                       │        │
│  │ Input:  previousChainHash + dataHash                │        │
│  │         "GENESIS_BLOCK_HASH" + "a1b2c3d4e5f6..."   │        │
│  │ Output: "m1n2o3p4q5r6..."                           │        │
│  │ Formula: SHA256(previous + current)                 │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 5: QR Code Generation                          │        │
│  │ Input:  batchId + chainHash                         │        │
│  │ Content: "BATCH-001|m1n2o3p4q5r6..."               │        │
│  │ Output:  "data:image/png;base64,..."                │        │
│  │ Format:  PNG (300x300px, Error Correction: High)   │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 6: HMAC Signature Generation                   │        │
│  │ Input:  {batchId, dataHash, chainHash, timestamp}  │        │
│  │ Output: "signature_hash..."                         │        │
│  │ Algorithm: HMAC-SHA256                              │        │
│  │ Key: process.env.SECRET_KEY                         │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ STEP 7: Save to Database                            │        │
│  │ - Create genesis event                              │        │
│  │ - Store all security hashes                         │        │
│  │ - Store encrypted batch details                     │        │
│  │ - Store QR code                                     │        │
│  │ - Initialize chain array                            │        │
│  └─────────────────────────────────────────────────────┘        │
│       ↓                                                           │
│  Return Complete Response Object                                 │
│       ↓                                                           │
└─────────────────────────────────────────────────────────────────┘
              │
              │ HTTP 201 + JSON Response
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│                  Batches Collection                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Batch Document:                                                 │
│  {                                                               │
│    _id: ObjectId("..."),                                        │
│    batchId: "BATCH-20251211-001",                               │
│    medicineName: "Aspirin 500mg",                               │
│    quantity: 10000,                                             │
│    batchDetails: "U2FsdGVkX1..." (AES encrypted),              │
│    genesisDataHash: "a1b2c3d4e5f6...",                          │
│    genesisChainHash: "m1n2o3p4q5r6...",                         │
│    genesisQRCode: "data:image/png;base64,...",                  │
│    chain: [{                                                     │
│      role: "Manufacturer",                                       │
│      timestamp: ISODate("..."),                                  │
│      dataHash: "a1b2c3d4e5f6...",                               │
│      chainHash: "m1n2o3p4q5r6...",                              │
│      hmacSignature: "signature_hash...",                         │
│      qrCode: "data:image/png;base64,..."                        │
│    }],                                                           │
│    createdAt: ISODate("...")                                     │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
              ↑
              │ Persisted Data
              │
        ┌─────────────┐
        │  Response   │
        │  Object     │
        │  displayed  │
        │  in UI      │
        └─────────────┘
```

---

## 2. Hash Generation Flow

```
Input Batch Data:
┌─────────────────────────────────┐
│ {                               │
│   batchId: "BATCH-001",         │
│   medicineName: "Aspirin",      │
│   quantity: 10000,              │
│   manufacturingDate: "2025-12-11"│
│   expiryDate: "2026-12-11"      │
│ }                               │
└─────────────────────────────────┘
         ↓
    ╔═══════════════════════════════╗
    ║  STRINGIFY & HASH WITH SHA256  ║
    ╚═══════════════════════════════╝
         ↓
    ┌─────────────────────────────┐
    │     DataHash (Step 3)        │
    │  "a1b2c3d4e5f6g7h8i9j0..." │ ← 64 char hex
    └─────────────────────────────┘
         ↓
         ├─────────────────────────────────────────┐
         │                                         │
         ↓                                         ↓
    ┌─────────────────┐             ┌──────────────────────┐
    │ Used in ChainHash│             │ Used in HMAC Signature│
    │      (Step 4)    │             │      (Step 6)        │
    └─────────────────┘             └──────────────────────┘
         ↓                                    ↓
    "GENESIS_BLOCK_HASH"              {batchId, dataHash,
    + "a1b2c3d4e5f6..."                chainHash, timestamp,
         ↓                             role: "Manufacturer"}
    ╔═══════════════════════════════╗         ↓
    ║  SHA256 CONCATENATION          ║   ╔═══════════════════════╗
    ╚═══════════════════════════════╝   ║ HMAC-SHA256 SIGNATURE   ║
         ↓                              ║ (using SECRET_KEY)      ║
    ┌─────────────────────────────┐   ╚═══════════════════════╝
    │    ChainHash (Step 4)        │        ↓
    │  "m1n2o3p4q5r6t7u8v9w0..." │   ┌──────────────────┐
    │  (64 char hex string)        │   │   HMAC Signature │
    └─────────────────────────────┘   │ "sig_hash..." │
         ↓                              └──────────────────┘
    ┌─────────────────────────────┐
    │  Used in QR Code (Step 5)    │
    │  "BATCH-001|m1n2o3p4q5r6..." │
    │         ↓                     │
    │   PNG DataURL                │
    └─────────────────────────────┘
```

---

## 3. Hash-Chain Evolution (Blockchain-like)

```
GENESIS BLOCK (Event 0):
┌──────────────────────────────────────────┐
│ previousChainHash: "GENESIS_BLOCK_HASH"  │
│ dataHash: "a1b2c3d4e5f6..."             │
│                ↓                          │
│ SHA256(GENESIS_BLOCK_HASH + a1b2c3...)  │
│                ↓                          │
│ chainHash: "m1n2o3p4q5r6..."            │
└──────────────────────────────────────────┘
         ↓
         │ (This chainHash becomes previousChainHash for next event)
         ↓
EVENT 1 (Distributor Pickup):
┌──────────────────────────────────────────┐
│ previousChainHash: "m1n2o3p4q5r6..."    │
│ dataHash: "b2c3d4e5f6g7h8i9j0k1..."    │
│                ↓                          │
│ SHA256(m1n2o3... + b2c3d4...)           │
│                ↓                          │
│ chainHash: "n2o3p4q5r6s7t8u9v0w1..."   │
└──────────────────────────────────────────┘
         ↓
         │ (This chainHash becomes previousChainHash for next event)
         ↓
EVENT 2 (Distributor Delivery):
┌──────────────────────────────────────────┐
│ previousChainHash: "n2o3p4q5r6s7t8..."  │
│ dataHash: "c3d4e5f6g7h8i9j0k1l2..."    │
│                ↓                          │
│ SHA256(n2o3p4... + c3d4e5...)           │
│                ↓                          │
│ chainHash: "o3p4q5r6s7t8u9v0w1x2..."   │
└──────────────────────────────────────────┘
         ↓
         │ (This chainHash becomes previousChainHash for next event)
         ↓
EVENT 3 (Pharmacy Receipt):
┌──────────────────────────────────────────┐
│ previousChainHash: "o3p4q5r6s7t8u9..."  │
│ dataHash: "d4e5f6g7h8i9j0k1l2m3..."    │
│                ↓                          │
│ SHA256(o3p4q5... + d4e5f6...)           │
│                ↓                          │
│ chainHash: "p4q5r6s7t8u9v0w1x2y3..."   │
└──────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
KEY INSIGHT:
If any historical data is tampered with:
- The dataHash for that event changes
- Which changes the chainHash for that event
- Which invalidates all subsequent chainHashes
- Therefore: TAMPERING IS IMMEDIATELY DETECTABLE
═══════════════════════════════════════════════════════════════
```

---

## 4. Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: AES-256 Encryption (Confidentiality)             │
│  ────────────────────────────────────────────────          │
│  ┌─────────────────────────────────────────┐              │
│  │ Batch Details (Plaintext)              │              │
│  │ {batchId, medicineName, quantity, ...} │              │
│  │              ↓                          │              │
│  │ Encrypt with AES-256                  │              │
│  │ Key: AES_SECRET from .env              │              │
│  │              ↓                          │              │
│  │ Encrypted Blob                         │              │
│  │ "U2FsdGVkX1..." (stored in DB)         │              │
│  └─────────────────────────────────────────┘              │
│  Purpose: Protect batch details from unauthorized access   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Layer 2: SHA-256 Data Integrity (Integrity)               │
│  ────────────────────────────────────────────             │
│  ┌─────────────────────────────────────────┐              │
│  │ Batch Data                              │              │
│  │              ↓                          │              │
│  │ Generate SHA-256 Hash                 │              │
│  │              ↓                          │              │
│  │ DataHash                                │              │
│  │ "a1b2c3d4e5f6..." (64 char hex)        │              │
│  └─────────────────────────────────────────┘              │
│  Purpose: Detect any modifications to batch data          │
│  Property: Non-reversible, unique per data               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Layer 3: Hash-Chain (Tamper Evidence)                     │
│  ────────────────────────────────────────                 │
│  ┌─────────────────────────────────────────┐              │
│  │ previousChainHash + dataHash            │              │
│  │              ↓                          │              │
│  │ SHA256(concatenated)                   │              │
│  │              ↓                          │              │
│  │ chainHash                               │              │
│  │ "m1n2o3p4q5r6..." (64 char hex)        │              │
│  │              ↓                          │              │
│  │ (Becomes previousChainHash for         │              │
│  │  next event)                           │              │
│  └─────────────────────────────────────────┘              │
│  Purpose: Blockchain-like chain linking                   │
│  Property: Invalidates all subsequent hashes if           │
│            any historical data is modified                │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Layer 4: HMAC Signature (Authentication)                  │
│  ───────────────────────────────────────────             │
│  ┌─────────────────────────────────────────┐              │
│  │ Event Data:                             │              │
│  │ {batchId, dataHash, chainHash,         │              │
│  │  timestamp, role: "Manufacturer"}       │              │
│  │              ↓                          │              │
│  │ HMAC-SHA256 with SECRET_KEY            │              │
│  │              ↓                          │              │
│  │ HMAC Signature                         │              │
│  │ "sig_hash..." (64 char hex)            │              │
│  └─────────────────────────────────────────┘              │
│  Purpose: Prove manufacturer identity & prevent           │
│           tampering with event metadata                   │
│  Property: Only someone with SECRET_KEY can generate      │
│            valid signature                                 │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Layer 5: QR Code (Physical Verification)                  │
│  ──────────────────────────────────────────              │
│  ┌─────────────────────────────────────────┐              │
│  │ batchId | chainHash                     │              │
│  │ "BATCH-001|m1n2o3p4q5r6..."            │              │
│  │              ↓                          │              │
│  │ Generate PNG QR Code                   │              │
│  │ Error Correction: High (30% recovery)  │              │
│  │              ↓                          │              │
│  │ Print on batch packaging                │              │
│  │ Scan at distribution points             │              │
│  └─────────────────────────────────────────┘              │
│  Purpose: Physical tracking capability                     │
│  Property: Embeds batchId + chainHash for verification    │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Response Structure

```
Successful Response (HTTP 201):
┌────────────────────────────────────────────┐
│  {                                         │
│    "success": true,                        │
│                                            │
│    ├─ "message": "Batch created...",       │
│    │                                        │
│    ├─ "batch": {                           │
│    │   ├─ batchId                          │
│    │   ├─ medicineName                     │
│    │   ├─ quantity                         │
│    │   ├─ manufacturerName                 │
│    │   ├─ manufacturingDate                │
│    │   ├─ expiryDate                       │
│    │   └─ status: "GENESIS_CREATED"       │
│    │ },                                    │
│    │                                        │
│    ├─ "security": {                        │
│    │   ├─ dataHash: "a1b2c3d4..."         │
│    │   ├─ chainHash: "m1n2o3p4..."        │
│    │   ├─ hmacSignature: "sig_hash..."    │
│    │   └─ qrCode: {                        │
│    │       ├─ dataURL: "data:image/png..."│
│    │       ├─ content: "BATCH-001|..."    │
│    │       ├─ width: 300                  │
│    │       └─ height: 300                 │
│    │   }                                   │
│    │ },                                    │
│    │                                        │
│    ├─ "genesisEvent": {                    │
│    │   ├─ role: "Manufacturer"             │
│    │   ├─ location: "Factory Output"       │
│    │   ├─ timestamp: "ISO 8601"           │
│    │   ├─ signature: "sig_hash..."        │
│    │   └─ chainHash: "m1n2o3p4..."        │
│    │ },                                    │
│    │                                        │
│    └─ "encryptedData": {                   │
│        ├─ batchDetails: "U2FsdGVk..."     │
│        └─ encryptionAlgorithm: "AES..."   │
│    }                                       │
│  }                                         │
└────────────────────────────────────────────┘

Displayed in UI:
┌────────────────────────────────────────────┐
│  ✅ Batch Created Successfully             │
│  ─────────────────────────────────         │
│  Batch ID: BATCH-001                       │
│  Medicine: Aspirin 500mg                   │
│  Quantity: 10000 units                     │
│                                            │
│  [QR Code Image Display Here]              │
│                                            │
│  [Print QR Code Button]                    │
│  [View Batch Details Button]               │
│  [Go to Dashboard Button]                  │
└────────────────────────────────────────────┘
```

---

## 6. Data Flow Through System

```
┌───────────┐
│ Processor │ Creates batch request
└─────┬─────┘
      │
      │ POST /api/manufacturer/create-batch
      │ {batchId, medicineName, quantity, ...}
      ↓
┌──────────────────┐
│ Express Server   │
├──────────────────┤
│ Receives request │
│ Validates fields │
└─────┬────────────┘
      │
      ├──→ [Step 1: Validate input]
      │
      ├──→ [Step 2: AES encrypt] → encryptedBatchDetails
      │
      ├──→ [Step 3: SHA256 hash] → dataHash
      │
      ├──→ [Step 4: Chain hash]  → chainHash
      │
      ├──→ [Step 5: QR code]     → qrCodeDataURL
      │
      ├──→ [Step 6: HMAC sign]   → hmacSignature
      │
      └──→ [Step 7: Save to DB]
           └─ Create genesis event
           └─ Save encrypted batch
           └─ Store all hashes
           └─ Store QR code
           └─ Initialize chain
                ↓
          ┌──────────────┐
          │ MongoDB Batch│
          │   Document   │
          └──────────────┘
                ↓
      [Compose response object]
      ├─ batch metadata
      ├─ security package
      ├─ genesis event
      ├─ encrypted data
      └─ QR code
            ↓
      HTTP 201 Response
            ↓
      ┌─────────────────┐
      │ Browser/Frontend│
      └─────┬───────────┘
            │
            ├─ Display batch ID
            ├─ Show QR code
            ├─ Confirm message
            ├─ Store batch ID
            └─ Redirect to dashboard
```

---

## 7. Database Schema Visualization

```
┌─────────────────────────────────────────────────────────┐
│            BATCHES COLLECTION                            │
│  (MongoDB - medical-supply-chain database)              │
└─────────────────────────────────────────────────────────┘

Document Structure:

{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  
  ┌─ Batch Identification
  batchId: "BATCH-20251211-001",               [unique index]
  medicineName: "Aspirin 500mg",
  quantity: 10000,
  
  ┌─ Manufacturer Information
  manufacturerName: "GlaxoSmithKline",
  manufacturerId: "GSK-001",
  
  ┌─ Batch Timeline
  manufacturingDate: ISODate("2025-12-11T00:00:00Z"),
  expiryDate: ISODate("2026-12-11T00:00:00Z"),
  
  ┌─ Security & Encryption
  batchDetails: "U2FsdGVkX1..." [AES-256 encrypted],
  
  ┌─ Genesis Block Hashes
  genesisDataHash: "a1b2c3d4e5f6...",
  genesisChainHash: "m1n2o3p4q5r6...",
  genesisQRCode: "data:image/png;base64,iVBORw0KGgo...",
  
  ┌─ Status Tracking
  isComplete: false,
  prescriptionEncrypted: null,  [set by Pharmacy]
  
  ┌─ Event Chain (Growing Array)
  chain: [
    {
      _id: ObjectId("507f1f77bcf86cd799439012"),
      role: "Manufacturer",
      location: "Factory Output",
      timestamp: ISODate("2025-12-11T10:30:45.123Z"),
      signature: "...",
      previousHash: "GENESIS",
      dataHash: "a1b2c3d4e5f6...",
      chainHash: "m1n2o3p4q5r6...",
      qrCode: "data:image/png;base64,...",
      hmacSignature: "sig_hash..."
    }
    // More events added here as batch moves through supply chain
  ],
  
  ┌─ Timestamps
  createdAt: ISODate("2025-12-11T10:30:45.123Z"),
  updatedAt: ISODate("2025-12-11T10:30:45.123Z")
}
```

---

This visual documentation helps understand how each component works together in the manufacturer batch creation system!
