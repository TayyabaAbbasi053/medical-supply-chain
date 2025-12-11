# Distributor Module

## 📋 Overview
The Distributor module handles batch pickup, verification, and dispatch to pharmacy. It includes QR scanning, hash-chain verification, location tracking, and event appending to the supply chain.

## 📁 Structure
```
distributor/
├── controllers/
│   └── batchController.js      # TODO: Implement distributor logic
├── services/
│   └── (service layer for business logic)
├── routes/
│   └── batchRoutes.js          # TODO: Implement routes
└── tests/
    └── (test files)
```

## 🚀 Planned API Endpoints

### POST `/api/modules/distributor/update-batch`
Update batch when received at distributor

**TODO Implement:**
1. Receive batchId from QR scan or manual input
2. Verify hash-chain integrity using shared cryptoUtils
3. Check location and tamper status
4. Append new event to batch.chain
5. Generate new chainHash: `SHA256(previousChainHash + newDataHash)`
6. Create HMAC signature for distributor event
7. Save updated batch to database
8. Return response with new chain status

**Expected Request:**
```json
{
  "batchId": "BATCH-001",
  "distributorId": "DIST-001",
  "location": "Distribution Center, City",
  "timestamp": "2025-12-11T14:30:00Z"
}
```

### POST `/api/modules/distributor/dispatch`
Dispatch batch to pharmacy

**TODO Implement:**
- Prepare batch for dispatch
- Create dispatch event
- Sign with HMAC
- Update batch status

### POST `/api/modules/distributor/location-update`
Update distributor location during transit

**TODO Implement:**
- Track batch location
- Log location changes
- Append location events to chain

## 🔐 Security Considerations
- Use shared `cryptoUtils.generateChainHash()` to link events
- Use shared `cryptoUtils.generateHMACSignature()` for distributor events
- Verify previous event signature before appending
- Include timestamp to prevent replay attacks

## 📚 Useful Functions from Shared Utils
```javascript
const { 
  generateChainHash,
  generateHMACSignature,
  generateQRCode 
} = require("../../shared/utils/cryptoUtils");

// Generate new chain hash linking to previous
const newChainHash = generateChainHash(previousChainHash, dataHash);

// Sign distributor event
const signature = generateHMACSignature({
  batchId,
  dataHash,
  chainHash: newChainHash,
  timestamp: new Date(),
  role: "Distributor"
}, process.env.SECRET_KEY);
```

## 📖 Next Steps
1. Copy this structure as template for other modules
2. Implement controllers in `batchController.js`
3. Implement routes in `batchRoutes.js`
4. Add tests in `tests/` folder
5. Integrate with `server.js`

---

**Status**: 🔄 TEMPLATE READY FOR IMPLEMENTATION
