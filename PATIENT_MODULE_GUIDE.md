# 📋 Patient Module - Implementation Guide

## 🎯 Overview
The Patient module is the **end consumer layer** of the supply chain. Patients receive medicines from pharmacists and need to verify authenticity, track origin, and access medicine information safely without seeing sensitive manufacturing details.

---

## 📊 Patient Dashboard Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PATIENT DASHBOARD                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┤
│  │  SECTION 1: VERIFY BATCH/MEDICINE                   │
│  │  • Scan QR Code (Camera Input)                      │
│  │  • Enter Batch Number (Manual)                      │
│  │  • Display: Authenticity Status ✅/❌               │
│  └─────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┤
│  │  SECTION 2: VERIFY MEDICINE DETAILS                 │
│  │  • Medicine Name                                    │
│  │  • Manufacturing Date                              │
│  │  • Expiry Date (⚠️ Warning if <30 days)           │
│  │  • Dosage/Strength                                 │
│  │  • Manufacturer Name                               │
│  └─────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┤
│  │  SECTION 3: TRACK SUPPLY CHAIN JOURNEY              │
│  │  • Genesis Event (Manufacturer Created)            │
│  │  • Distributor Dispatch                            │
│  │  • Pharmacist Received                             │
│  │  • Patient Received                                │
│  │  Timeline with Timestamps                          │
│  └─────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┤
│  │  SECTION 4: SAVED MEDICINES (Optional)             │
│  │  • History of verified medicines                   │
│  │  • Quick access to recently scanned items          │
│  └─────────────────────────────────────────────────────┤
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Constraints for Patient Level

| Constraint | Why | Implementation |
|-----------|-----|-----------------|
| **No Access to Encrypted Data** | Patient shouldn't see quantity, distributor ID, dispatch date | Only show PUBLIC & PLAINTEXT fields |
| **Can See Batch Number** | Needed for QR verification | Plaintext identifier in QR code |
| **No HMAC Signature Verification** | Patients don't need cryptographic proof | Read-only verification display |
| **No Chain Edit Permission** | Patients can't modify supply chain data | GET-only endpoints |
| **View-Only Batch Details** | Cannot update or delete | No POST/PUT/DELETE on batch endpoints |
| **Session Timeout** | Same as manufacturer (15 mins) | Consistent security policy |
| **3FA Verification** | Basic authentication (Password + OTP + Security Question) | Same 3FA flow as other roles |

---

## 📡 Data Flow: Manufacturer → Patient

```
MANUFACTURER SIDE (Created)
│
├── Batch Created with:
│   ├── � PLAINTEXT: Batch Number (needed for QR codes)
│   ├── 🔓 PUBLIC: Medicine Name, Mfg Date, Expiry Date, Manufacturer Name
│   ├── 🔐 ENCRYPTED: Strength, Quantity, Distributor ID, Dispatch Date
│   ├── QR Code: batchNumber|chainHash (Encoded)
│   └── Chain Event: [Genesis Event]
│
DISTRIBUTOR SIDE (Receives & Dispatches)
│
├── Gets Batch from Manufacturer
├── Updates Chain: Add Distributor dispatch event
│   └── Timestamp, Location, Signature
├── QR Code remains unchanged
│
PHARMACIST SIDE (Receives & Dispenses)
│
├── Gets Batch from Distributor
├── Updates Chain: Add Pharmacist received event
│   └── Timestamp, Location, Signature
│
PATIENT SIDE (Verifies & Uses)
│
├── Receives Medicine from Pharmacist
├── CAN SEE:
│   ✅ Batch Number (plaintext - from QR code)
│   ✅ Medicine Name
│   ✅ Manufacturing Date
│   ✅ Expiry Date
│   ✅ Manufacturer Name
│   ✅ Complete Supply Chain Timeline
│   ✅ QR Code Authenticity
│
├── CANNOT SEE:
│   ❌ Strength/Dosage (Encrypted)
│   ❌ Quantity Produced (Encrypted)
│   ❌ Distributor ID (Encrypted)
│   ❌ Dispatch Date (Encrypted)
│   ❌ HMAC Signatures (Backend verification only)
│
└── VERIFY: Scan QR → Check Chain Hash → Confirm Authenticity
```

---

## 🔧 Patient Module - Required Features

### Feature 1: Verify Batch (Primary Action)

**Input Methods:**
1. **QR Code Scanner** (Mobile-friendly)
   - Use device camera
   - Decode: `batchNumber|chainHash`
   - Extract both values
   
2. **Manual Entry** (Fallback)
   - Input batch number
   - Decode QR from image upload
   - Text input for batch number

**Backend Flow:**
```
Patient Input (Batch Number or QR)
    ↓
API: GET /api/modules/patient/batch/:batchNumber
    ↓
Backend Logic:
  1. Find batch in database
  2. Retrieve PUBLIC fields only
  3. Retrieve entire chain events
  4. Recalculate chainHash from genesis + all events
  5. Compare patient's scanned chainHash with calculated chainHash
  6. Return: { isValid: true/false, batchDetails, chainHistory }
    ↓
Frontend: Display Verification Result
  ✅ GENUINE - Green checkmark, full details visible
  ❌ FAKE - Red X mark, alert warning
```

**Database Query Required:**
```javascript
// What backend needs to retrieve
{
  batchNumber: "BATCH-001",
  medicineName: "Paracetamol 500mg",
  manufacturingDate: "2025-01-10",
  expiryDate: "2026-01-10",
  manufacturerName: "Pharma Corp",
  genesisChainHash: "a1b2c3d4e5f6g7h8...",
  chain: [
    { role: "Manufacturer", timestamp, location, signature },
    { role: "Distributor", timestamp, location, signature },
    { role: "Pharmacist", timestamp, location, signature }
  ]
}
```

---

### Feature 2: Verify Medicine (Details Display)

**What Patient Sees:**

| Field | Visible | Reason |
|-------|---------|--------|
| Batch Number | ✅ | Plaintext identifier (from QR scan) |
| Medicine Name | ✅ | Need to know what they're taking |
| Strength/Dosage | ✅ | Critical for health/safety |
| Manufacturing Date | ✅ | Quality indicator |
| Expiry Date | ✅ | CRITICAL - Don't use expired |
| Manufacturer Name | ✅ | Transparency |
| Quantity Produced | ❌ | Manufacturer proprietary (encrypted) |
| Distributor ID | ❌ | Business confidential (encrypted) |
| Dispatch Date | ❌ | Sensitive supply chain info (encrypted) |

**Frontend Logic:**
```javascript
if (expiryDate < today) {
  display: "⚠️ EXPIRED - DO NOT USE"
  color: RED
}
else if (expiryDate < today + 30days) {
  display: "⚠️ EXPIRING SOON"
  color: YELLOW
}
else {
  display: "✅ SAFE TO USE"
  color: GREEN
}
```

**UI Components:**
- Large expiry date display (RED if expired)
- Medicine name and strength prominently shown
- Manufacturer info as badge
- Manufacturing vs Expiry date comparison
- Health warning if needed

---

### Feature 3: Track Supply Chain Journey

**Timeline Display (Linear Chain):**

```
┌──────────────────────────────────────────────────────┐
│     Supply Chain Journey for BATCH-001               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ✅ GENESIS EVENT (Manufacturer)                    │
│     Jan 10, 2025 @ 09:15 AM                        │
│     Location: Pharma Corp Factory                   │
│     Status: ✓ Verified                             │
│                                                     │
│         ↓ (Chain Arrow)                            │
│                                                     │
│  ✅ DISTRIBUTOR EVENT                              │
│     Jan 12, 2025 @ 11:30 AM                        │
│     Location: Central Distribution Hub              │
│     Status: ✓ Verified                             │
│     Signature: Valid                               │
│                                                     │
│         ↓ (Chain Arrow)                            │
│                                                     │
│  ✅ PHARMACIST EVENT                               │
│     Jan 13, 2025 @ 02:45 PM                        │
│     Location: Green Pharmacy Store                  │
│     Status: ✓ Verified                             │
│     Signature: Valid                               │
│                                                     │
│         ↓ (Chain Arrow)                            │
│                                                     │
│  ✅ PATIENT RECEIVED                               │
│     Jan 13, 2025 @ 05:20 PM                        │
│     Status: Authenticity Confirmed                 │
│                                                     │
└──────────────────────────────────────────────────────┘
```

**What Each Event Shows:**
- Role (Manufacturer/Distributor/Pharmacist)
- Timestamp
- Location
- Signature Status (Valid/Invalid)
- Chain verification (Icon: ✓ or ✗)

**Backend API:**
```
GET /api/modules/patient/batch/:batchNumber/chain

Response:
{
  batchNumber: "BATCH-001",
  chainValid: true,  // All signatures verified
  chain: [
    {
      role: "Manufacturer",
      timestamp: "2025-01-10T09:15:00Z",
      location: "Pharma Corp Factory",
      signature: "mfg_sig_xxx...",
      signatureValid: true
    },
    {
      role: "Distributor",
      timestamp: "2025-01-12T11:30:00Z",
      location: "Central Distribution",
      signature: "dist_sig_yyy...",
      signatureValid: true
    },
    {
      role: "Pharmacist",
      timestamp: "2025-01-13T14:45:00Z",
      location: "Green Pharmacy",
      signature: "pharm_sig_zzz...",
      signatureValid: true
    }
  ]
}
```

---

## 🛠️ Patient Module - Required Endpoints

### 1. Batch Verification Endpoint
```
GET /api/modules/patient/batch/:batchNumber

Returns:
{
  success: true,
  batch: {
    batchNumber: (from QR),
    medicineName: "Paracetamol 500mg",
    manufacturingDate: "2025-01-10",
    expiryDate: "2026-01-10",
    manufacturerName: "Pharma Corp",
    strength: "500mg",
    status: "VERIFIED" | "COUNTERFEIT"
  },
  verification: {
    isAuthentic: true,
    chainValid: true,
    genesisHashMatches: true
  }
}
```

### 2. Supply Chain Timeline Endpoint
```
GET /api/modules/patient/batch/:batchNumber/chain

Returns:
{
  success: true,
  chain: [
    { role, timestamp, location, signature, signatureValid },
    { role, timestamp, location, signature, signatureValid },
    { role, timestamp, location, signature, signatureValid }
  ]
}
```

### 3. Medicine History (Optional)
```
GET /api/modules/patient/my-medicines

Returns:
{
  success: true,
  medicines: [
    { batchNumber, medicineName, dateVerified, status }
  ]
}
```

---

## 🔐 Patient Routes - Security Requirements

```javascript
// All routes require:
// 1. Authentication (3FA completed)
// 2. Role check (userRole === 'Patient')
// 3. Session validation (15-min timeout)

router.use(authenticateUser);
router.use(requirePatient);

// GET endpoints only (read-only access)
router.get('/batch/:batchNumber', verifyBatch);
router.get('/batch/:batchNumber/chain', getChainTimeline);
router.get('/my-medicines', getVerifiedMedicines);
```

**NO POST/PUT/DELETE allowed** for patients - completely read-only role.

---

## 📱 Patient Dashboard - UI/UX Flow

```
┌─────────────────────────────────────────┐
│  Patient Login (3FA)                    │
│  • Password                             │
│  • OTP (Email)                          │
│  • Security Question                    │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  Patient Dashboard                      │
│  [Session: 15:00]                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📸 SCAN QR CODE                 │   │
│  │ OR                              │   │
│  │ 🔢 ENTER BATCH NUMBER           │   │
│  │                                 │   │
│  │ [Scan Button] [Enter Button]    │   │
│  └─────────────────────────────────┘   │
└────────────┬────────────────────────────┘
             ↓
        (Two Paths)
        ↙      ↘
    ✅ VALID    ❌ INVALID
    (Show)     (Show Alert)
```

---

## 🚨 Error Handling

**What if patient scans INVALID batch?**
- Show error: "❌ This medicine is COUNTERFEIT or not found in our system"
- Warn: "Do not consume. Report to authorities"
- Option: "Report this batch"

**What if chain is broken?**
- Show error: "⚠️ Supply chain integrity compromised"
- Display: Which event failed verification
- Warn: Possible tampering detected

**What if medicine is EXPIRED?**
- Large RED warning: "⚠️ EXPIRED - DO NOT USE"
- Show expiry date prominently
- Suggest: Contact pharmacist for replacement

---

## 💾 Patient Model - Database Schema

```javascript
{
  patientId: ObjectId,
  email: String (unique),
  name: String,
  phone: String,
  address: String,
  
  // Medical Info (Optional, can be extended)
  allergies: [String],
  medications: [String],
  
  // Verification History
  verifiedMedicines: [
    {
      batchNumber: String,
      medicineName: String,
      verificationDate: Date,
      isAuthentic: Boolean,
      chainValid: Boolean
    }
  ],
  
  // Session Info
  loginTimestamp: Date,
  lastVerification: Date,
  
  // Account Security
  hashedPassword: String,
  securityQuestion: String,
  securityAnswer: String (hashed),
  otpVerified: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Integration Points

### From Manufacturer:
- ✅ Public batch data (medicine name, dates, manufacturer)
- ✅ QR code (batchNumber + chainHash)
- ✅ Genesis event in chain

### From Distributor (Future):
- ✅ Will add distributor dispatch event to chain
- ✅ Will add distributor signature to chain

### From Pharmacist (Future):
- ✅ Will add pharmacist received event to chain
- ✅ Will add pharmacist signature to chain
- ✅ Will associate batch with patient at dispensing

### To Patient:
- ✅ View PUBLIC data only
- ✅ View complete chain timeline
- ✅ Verify authenticity
- ✅ See expiry warnings

---

## ✅ Implementation Checklist

- [ ] Create Patient model with schema above
- [ ] Create Patient controller with 3 endpoints (verify, chain, history)
- [ ] Create Patient routes with requirePatient middleware
- [ ] Create Patient pages (Dashboard, Verify, Timeline)
- [ ] Implement QR scanner (use `html5-qrcode` library)
- [ ] Implement batch verification logic (recalculate chainHash)
- [ ] Add medicine expiry date warnings (RED if expired, YELLOW if <30 days)
- [ ] Add supply chain timeline visualization
- [ ] Add error handling for counterfeit/missing batches
- [ ] Add session timeout (15 minutes)
- [ ] Add 3FA enforcement on patient page
- [ ] Test with manufacturer-created batches
- [ ] Add API response validation
- [ ] Add unit tests for verification logic

---

## 🎯 Key Takeaways

| Aspect | Detail |
|--------|--------|
| **Patient Role** | Read-only end consumer |
| **Verify Methods** | QR scan OR manual batch entry |
| **Visible Data** | PLAINTEXT (batch number) + PUBLIC fields (medicine details) |
| **Hidden Data** | ENCRYPTED fields (strength, quantity, distributor ID, dispatch date) |
| **Main Features** | Verify batch, view medicine details, track supply chain |
| **Timeline** | Genesis → Distributor → Pharmacist → Patient |
| **Authenticity Check** | Chain hash verification |
| **Security** | 3FA, Session timeout, Read-only endpoints |
| **Database** | Store verification history, medicine timeline |

---

## 📝 Notes for Implementation

1. **Chain Hash Verification:** Backend must recalculate chainHash by going through all events and verify it matches what patient scanned from QR code

2. **Expiry Date Logic:** Implement warning system - 3 colors:
   - 🟢 GREEN: More than 30 days to expiry
   - 🟡 YELLOW: Less than 30 days to expiry
   - 🔴 RED: Already expired

3. **QR Code Library:** Use `html5-qrcode` for scanning on frontend

4. **Medicine History:** Optional feature - stores all medicines patient has verified for quick reference

5. **Report Counterfeit:** Add button to report suspicious batches (for future pharmacist/admin review)

6. **Offline Mode:** Consider caching recently verified batches for offline verification

---

**This guide provides the complete blueprint for the Patient module without writing any code. Follow these specs when implementing!** 🎯
