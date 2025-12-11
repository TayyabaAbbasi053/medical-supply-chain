# Patient Module

## 📋 Overview
The Patient module handles batch verification, prescription retrieval, and authenticity confirmation. It includes QR code scanning, full hash-chain verification, and offline verification capability.

## 📁 Structure
```
patient/
├── controllers/
│   └── batchController.js      # TODO: Implement patient logic
├── services/
│   └── (service layer for business logic)
├── routes/
│   └── batchRoutes.js          # TODO: Implement routes
└── tests/
    └── (test files)
```

## 🚀 Planned API Endpoints

### POST `/api/modules/patient/verify-batch`
Verify batch authenticity and view prescription

**TODO Implement:**
1. Receive batchId (from QR scan or manual input)
2. Fetch batch from database
3. Verify COMPLETE hash-chain:
   - Check genesisDataHash matches calculated hash
   - Verify each event's chainHash links to previous
   - Verify all HMAC signatures are valid
4. Check batch status (in transit, completed)
5. Decrypt prescription using shared `decryptData()`
6. Return verification result with prescription

**Expected Request:**
```json
{
  "batchId": "BATCH-001",
  "patientId": "PATIENT-001"
}
```

**Expected Response:**
```json
{
  "success": true,
  "verification": {
    "batchId": "BATCH-001",
    "isAuthentic": true,
    "chainValid": true,
    "tamperedDetected": false,
    "eventCount": 4
  },
  "batch": {
    "medicineName": "Aspirin 500mg",
    "quantity": 100,
    "manufacturerName": "Pharma Corp",
    "manufacturingDate": "2025-12-11T00:00:00Z",
    "expiryDate": "2026-12-11T00:00:00Z"
  },
  "prescription": {
    "medication": "Aspirin 500mg",
    "dosage": "1 tablet daily",
    "duration": "10 days",
    "notes": "Take with food"
  },
  "chain": [
    { role: "Manufacturer", ... },
    { role: "Distributor", ... },
    { role: "Pharmacy", ... }
  ]
}
```

### GET `/api/modules/patient/prescription/:batchId`
Get decrypted prescription

**TODO Implement:**
1. Fetch batch
2. Verify ownership/access
3. Decrypt prescription
4. Return prescription details

### GET `/api/modules/patient/batch-history/:patientId`
Get all batches associated with patient

**TODO Implement:**
1. Find all batches for patient
2. Return batch list with status
3. Verification status for each

### POST `/api/modules/patient/offline-verify`
Verify batch offline (using cached data)

**TODO Implement:**
1. Accept cached chain data (from QR code or previous scan)
2. Verify hash-chain locally without database
3. Detect any tampering
4. Return verification result

**Expected Request:**
```json
{
  "batchId": "BATCH-001",
  "cachedChain": [
    { role, dataHash, chainHash, hmacSignature, ... }
  ]
}
```

## 🔐 Security Considerations
- Verify ALL events in chain before trusting batch
- Use shared `cryptoUtils.verifyHMACSignature()` for each event
- Decrypt prescription only after full verification
- Check batch expiry date
- Prevent replay attacks by checking timestamps
- Implement rate limiting on verification endpoint
- Never expose HMAC keys

## 📚 Useful Functions from Shared Utils
```javascript
const { 
  generateChainHash,
  verifyHMACSignature,
  decryptData
} = require("../../shared/utils/cryptoUtils");

// Verify each event in chain
const isValid = verifyHMACSignature({
  batchId: event.batchId,
  dataHash: event.dataHash,
  chainHash: event.chainHash,
  timestamp: event.timestamp,
  role: event.role
}, event.hmacSignature, process.env.SECRET_KEY);

// Verify chain linking
const expectedChainHash = generateChainHash(
  previousEvent.chainHash, 
  event.dataHash
);
const isLinked = (expectedChainHash === event.chainHash);

// Decrypt prescription
const prescription = JSON.parse(
  decryptData(batch.prescriptionEncrypted)
);
```

## ✅ Verification Checklist
- [ ] Batch exists in database
- [ ] Genesis hash valid
- [ ] All event chainHashes link correctly
- [ ] All HMAC signatures valid
- [ ] No timestamp anomalies
- [ ] Batch not expired
- [ ] Patient authorized to view

## 📖 Next Steps
1. Copy this structure as template
2. Implement controllers in `batchController.js`
3. Implement routes in `batchRoutes.js`
4. Add tests in `tests/` folder
5. Integrate with `server.js`

---

**Status**: 🔄 TEMPLATE READY FOR IMPLEMENTATION
