# Pharmacy Module

## 📋 Overview
The Pharmacy module handles batch receipt, inventory management, prescription addition, and patient dispensing. It includes full hash-chain verification, encryption of prescriptions, and complete audit logging.

## 📁 Structure
```
pharmacy/
├── controllers/
│   └── batchController.js      # TODO: Implement pharmacy logic
├── services/
│   └── (service layer for business logic)
├── routes/
│   └── batchRoutes.js          # TODO: Implement routes
└── tests/
    └── (test files)
```

## 🚀 Planned API Endpoints

### POST `/api/modules/pharmacy/receive-batch`
Receive batch at pharmacy

**TODO Implement:**
1. Scan QR code or receive batchId
2. Fetch batch from database
3. Verify COMPLETE hash-chain (all events from manufacturer to distributor)
4. Update inventory
5. Create pharmacy receipt event
6. Generate new chainHash
7. Sign with HMAC (role: "Pharmacy")
8. Append event to batch.chain
9. Save updated batch
10. Return verification report

**Expected Request:**
```json
{
  "batchId": "BATCH-001",
  "pharmacyId": "PHARM-001",
  "pharmacyName": "City Pharmacy",
  "location": "123 Main St, City",
  "timestamp": "2025-12-11T16:45:00Z"
}
```

### POST `/api/modules/pharmacy/dispense`
Dispense batch to patient

**TODO Implement:**
1. Verify patient prescription
2. Update inventory (reduce quantity)
3. Create dispense event
4. Mark batch as complete (if all dispensed)
5. Log event in chain
6. Return confirmation

### POST `/api/modules/pharmacy/add-prescription`
Add encrypted prescription to batch

**TODO Implement:**
1. Receive patient prescription data
2. Encrypt using shared `encryptData()`
3. Store in batch.prescriptionEncrypted
4. Mark batch.isComplete = true
5. Create prescription event in chain
6. Sign with HMAC

**Expected Request:**
```json
{
  "batchId": "BATCH-001",
  "patientId": "PATIENT-001",
  "prescription": {
    "medication": "Aspirin 500mg",
    "dosage": "1 tablet daily",
    "duration": "10 days",
    "notes": "Take with food"
  }
}
```

## 🔐 Security Considerations
- Verify ALL previous hashes in the chain before accepting batch
- Use shared `cryptoUtils.verifyHMACSignature()` to verify each event
- Encrypt prescriptions using shared `encryptData()`
- Never store plaintext prescriptions
- Log all operations for audit trail
- Include timestamp to prevent replay attacks

## 📚 Useful Functions from Shared Utils
```javascript
const { 
  generateChainHash,
  generateHMACSignature,
  verifyHMACSignature,
  encryptData,
  decryptData
} = require("../../shared/utils/cryptoUtils");

// Verify previous event signature
const isValid = verifyHMACSignature(previousEvent, previousEvent.hmacSignature, process.env.SECRET_KEY);

// Generate new chain hash
const newChainHash = generateChainHash(previousEvent.chainHash, newDataHash);

// Encrypt prescription
const encrypted = encryptData(JSON.stringify(prescription));

// Decrypt prescription (for verification)
const decrypted = decryptData(encryptedPrescription);
```

## ✅ Verification Checklist
- [ ] Hash-chain integrity verified
- [ ] All HMAC signatures valid
- [ ] No tamper evidence
- [ ] Batch status matches expected
- [ ] Inventory sufficient
- [ ] Patient verified (if applicable)

## 📖 Next Steps
1. Copy this structure as template for other modules
2. Implement controllers in `batchController.js`
3. Implement routes in `batchRoutes.js`
4. Add tests in `tests/` folder
5. Integrate with `server.js`

---

**Status**: 🔄 TEMPLATE READY FOR IMPLEMENTATION
