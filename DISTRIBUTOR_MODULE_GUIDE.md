# 📦 Distributor Module - Implementation Guide

## 🎯 Overview
The Distributor module is the **middle layer** of the supply chain. Distributors receive batches from manufacturers, store them, and dispatch them to end patients/hospitals. They can verify batch authenticity, track inventory, and add dispatch events to the supply chain.

**Note:** This basic project excludes pharmacists. Supply chain is: Manufacturer → Distributor → Patient

---

## 📊 Distributor Dashboard Architecture

```
┌──────────────────────────────────────────────────────┐
│              DISTRIBUTOR DASHBOARD                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┤
│  │  SECTION 1: RECEIVE BATCHES                   │
│  │  • Scan/Enter QR Code from Manufacturer      │
│  │  • Verify Batch Authenticity                 │
│  │  • Record Received Timestamp & Location      │
│  │  • Add to Inventory                          │
│  └────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┤
│  │  SECTION 2: VIEW INVENTORY                    │
│  │  • List all received batches                 │
│  │  • Filter: In Stock / Dispatched / Recalled  │
│  │  • Search by Batch Number / Medicine Name    │
│  │  • View: Received Date, Expiry, Quantity     │
│  └────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┤
│  │  SECTION 3: DISPATCH BATCHES                 │
│  │  • Select batch from inventory                │
│  │  • Enter dispatch location (Hospital/Patient) │
│  │  • Generate dispatch signature                │
│  │  • Record timestamp & digitally sign          │
│  │  • Add event to supply chain                  │
│  └────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┤
│  │  SECTION 4: TRACK BATCH CHAIN                │
│  │  • View complete timeline from Manufacturer   │
│  │  • See all events (Genesis → Your Dispatch)   │
│  │  • Verify chain integrity                     │
│  │  • Check signatures at each step              │
│  └────────────────────────────────────────────────┤
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Security Constraints for Distributor Level

| Constraint | Why | Implementation |
|-----------|-----|-----------------|
| **Can See Batch Number** | Needed for receiving and dispatching | Plaintext identifier from QR |
| **Can Decrypt Sensitive Data** | Has business need to know quantity, distributor info | Provide decryption on demand |
| **Can Add Chain Events** | Must record dispatch in supply chain | Only distributor-specific endpoints |
| **Cannot Edit Genesis Data** | Can't modify manufacturer's original batch | Read-only on original batch |
| **Digital Signature Required** | Must sign dispatch with secret key | Use HMAC-SHA256 signature |
| **Session Timeout** | Same as manufacturer (15 mins) | Consistent security policy |
| **3FA Verification** | Complete authentication | Password + OTP + Security Question |
| **RBAC on Endpoints** | Only distributor can access distributor routes | requireDistributor middleware |

---

## 📡 Supply Chain Data Flow (Simplified - No Pharmacist)

```
MANUFACTURER SIDE (Creates Batch)
│
├── Creates Batch with:
│   ├── 📝 PLAINTEXT: Batch Number
│   ├── 🔓 PUBLIC: Medicine Name, Mfg Date, Expiry Date, Manufacturer Name
│   ├── 🔐 ENCRYPTED: Strength, Quantity, Distributor ID, Dispatch Date
│   ├── QR Code: batchNumber|chainHash (for scanning)
│   └── Chain Event: Genesis (Manufacturer created)
│
DISTRIBUTOR SIDE (Receives & Dispatches)
│
├── Step 1: RECEIVE BATCH
│   ├── Scan QR Code from package
│   ├── Verify: Chain hash matches (authenticity check)
│   ├── Decrypt: See strength & quantity (if needed)
│   ├── Record: Received timestamp & warehouse location
│   └── Add Chain Event: Distributor Received
│
├── Step 2: STORE IN INVENTORY
│   ├── Store batch reference in database
│   ├── Track: Location, Quantity, Status
│   ├── Monitor: Expiry dates
│   └── Status: "IN_STOCK"
│
├── Step 3: DISPATCH BATCH
│   ├── Select batch from inventory
│   ├── Set dispatch location (Hospital A / Patient Direct)
│   ├── Generate distributor signature
│   ├── Record: Dispatch timestamp & location
│   └── Add Chain Event: Distributor Dispatched
│
└── Chain now shows: Genesis → Distributor Received → Distributor Dispatched

PATIENT SIDE (Verifies)
│
├── Receives batch from distributor
├── Scans QR Code
├── Verifies: Chain includes both distributor events
├── Sees: Complete timeline (Manufacturer → Distributor events → Ready for use)
└── Confirms: Authenticity ✅
```

---

## 🔧 Distributor Module - Required Features

### Feature 1: Receive Batch

**Input Method:**
- Scan QR Code from manufacturer's package
- Extracts: `batchNumber|chainHash`

**Backend Flow:**
```
Distributor Scans QR
    ↓
Decode: Get batchNumber & chainHash
    ↓
API: POST /api/modules/distributor/receive-batch
    {
      batchNumber: "BATCH-001",
      scannedChainHash: "a1b2c3d4e5f6...",
      receivedLocation: "Central Warehouse",
      receivedDate: "2025-01-12"
    }
    ↓
Backend Logic:
  1. Find batch by batchNumber
  2. Verify: scannedChainHash == stored genesisChainHash
  3. Calculate distributor signature
  4. Create "Distributor Received" event
  5. Add event to batch chain
  6. Update batch status: "RECEIVED_BY_DISTRIBUTOR"
  7. Return: { success: true, batch, newChainHash }
    ↓
Response to Frontend:
  ✅ RECEIVED - Batch added to inventory
  📊 Show updated chain with your received event
  ⚠️ Flag expiry if < 90 days
```

**Distributor Received Event Format:**
```javascript
{
  role: "Distributor",
  action: "RECEIVED",
  timestamp: "2025-01-12T10:30:00Z",
  location: "Central Warehouse",
  signature: "dist_sig_received_xxx...", // HMAC signature
  signatureValid: true,
  previousHash: "a1b2c3d4e5f6...", // Genesis hash
  chainHash: "NEW_CHAIN_HASH_AFTER_RECEIVED" // Updated hash
}
```

---

### Feature 2: View Inventory

**What Distributor Sees:**

| Field | Visible | Access |
|-------|---------|--------|
| Batch Number | ✅ | Plaintext (needed for operations) |
| Medicine Name | ✅ | Public field |
| Manufacturing Date | ✅ | Public field |
| Expiry Date | ✅ | Public field - CRITICAL for logistics |
| Manufacturer Name | ✅ | Public field |
| **Strength/Dosage** | ✅ | Encrypted (distributor can decrypt) |
| **Quantity Received** | ✅ | Encrypted (distributor can decrypt) |
| **Original Distributor ID** | ✅ | Encrypted (for reference) |
| Received Date | ✅ | Distributor's own record |
| Received Location | ✅ | Distributor's own record |
| Current Status | ✅ | IN_STOCK / DISPATCHED / EXPIRED |

**Inventory Status Colors:**
```
🟢 GREEN: Received, In Stock (30+ days to expiry)
🟡 YELLOW: In Stock, But Expiring Soon (<30 days)
🔴 RED: Expired or Recall Status
⚪ GRAY: Already Dispatched
```

**UI Features:**
- Sortable table (by received date, expiry date, medicine name)
- Filter by status
- Search by batch number or medicine
- Export inventory as CSV/PDF
- Batch details modal (click to expand)

---

### Feature 3: Dispatch Batch

**Input Required:**
```javascript
{
  batchNumber: "BATCH-001",
  dispatchLocation: "Hospital ABC" OR "Direct Patient",
  dispatchDate: "2025-01-14",
  recipientInfo: {
    hospitalName?: "Hospital ABC",
    patientId?: "P-12345",
    address: "123 Medical Street"
  },
  notes?: "Express delivery", // Optional
  quantity?: 500 // If partial dispatch
}
```

**Backend Flow:**
```
Distributor Submits Dispatch
    ↓
API: POST /api/modules/distributor/dispatch-batch
    ↓
Backend Logic:
  1. Find batch (must be IN_STOCK)
  2. Verify: Not already expired
  3. Decrypt: Get original quantity to validate
  4. Calculate: Distributor Dispatch signature
  5. Create "Distributor Dispatched" event:
     {
       role: "Distributor",
       action: "DISPATCHED",
       timestamp: now,
       location: dispatchLocation,
       signature: hmac(...),
       previousHash: lastChainHash,
       chainHash: recalculatedHash
     }
  6. Add event to chain
  7. Update batch status: "DISPATCHED"
  8. Return: Updated chain
    ↓
Response:
  ✅ DISPATCHED - Batch sent
  📦 Generate dispatch label/QR
  🔗 Updated chain with dispatch event
```

**Generated QR for Dispatch:**
```
Contains: batchNumber|newChainHash|dispatchLocation|timestamp

Used by: 
- Patient to verify entire journey
- Recipient hospital to confirm arrival
```

---

### Feature 4: Track Batch Chain

**Timeline Display:**
```
┌──────────────────────────────────────────────────┐
│   Batch Journey - BATCH-001                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ GENESIS EVENT (Manufacturer)                │
│     Jan 10, 2025 @ 09:15 AM                    │
│     Location: Pharma Corp Factory              │
│     Signature: ✓ Valid                         │
│                                                  │
│         ↓ (Chain Arrow)                        │
│                                                  │
│  ✅ DISTRIBUTOR RECEIVED                       │
│     Jan 12, 2025 @ 10:30 AM                    │
│     Location: Central Warehouse                │
│     Signature: ✓ Valid                         │
│     Signed by: Distributor User1               │
│                                                  │
│         ↓ (Chain Arrow)                        │
│                                                  │
│  ✅ DISTRIBUTOR DISPATCHED                     │
│     Jan 14, 2025 @ 03:45 PM                    │
│     Location: Hospital ABC                     │
│     Signature: ✓ Valid                         │
│     Signed by: Distributor User2               │
│     Status: Awaiting Recipient Confirmation    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**What's Shown:**
- All events in chronological order
- Timestamps for each transition
- Locations and handoff points
- Signature validity indicators
- Who signed each event (distributor username)
- Current batch status

**Verify Button:**
- Recalculate entire chain hash
- Verify each signature
- Alert if any signature is INVALID (tampering detected)

---

## 🛠️ Distributor Module - Required Endpoints

### 1. Receive Batch Endpoint
```
POST /api/modules/distributor/receive-batch

Request Body:
{
  batchNumber: "BATCH-001",
  scannedChainHash: "a1b2c3d4e5f6g7h8...",
  receivedLocation: "Central Warehouse",
  receivedDate: "2025-01-12"
}

Returns:
{
  success: true,
  message: "Batch received successfully",
  batch: {
    batchNumber: "BATCH-001",
    medicineName: "Paracetamol 500mg",
    manufacturingDate: "2025-01-10",
    expiryDate: "2026-01-10",
    strength: "500mg", // Can decrypt
    quantityReceived: 10000, // Can decrypt
    status: "RECEIVED_BY_DISTRIBUTOR"
  },
  chainEvent: {
    role: "Distributor",
    action: "RECEIVED",
    timestamp: "2025-01-12T10:30:00Z",
    location: "Central Warehouse",
    signature: "dist_sig_received_xxx...",
    chainHash: "NEW_HASH_AFTER_RECEIVED"
  }
}
```

### 2. Get Inventory Endpoint
```
GET /api/modules/distributor/inventory
GET /api/modules/distributor/inventory?status=IN_STOCK
GET /api/modules/distributor/inventory?search=Paracetamol

Returns:
{
  success: true,
  batches: [
    {
      batchNumber: "BATCH-001",
      medicineName: "Paracetamol 500mg",
      manufacturingDate: "2025-01-10",
      expiryDate: "2026-01-10",
      quantityReceived: 10000,
      quantityAvailable: 10000,
      receivedDate: "2025-01-12",
      status: "IN_STOCK",
      expiryStatus: "SAFE" | "WARNING" | "EXPIRED"
    },
    ...
  ],
  totalBatches: 45,
  inStockCount: 42,
  expiredCount: 0,
  dispatchedCount: 3
}
```

### 3. Dispatch Batch Endpoint
```
POST /api/modules/distributor/dispatch-batch

Request Body:
{
  batchNumber: "BATCH-001",
  dispatchLocation: "Hospital ABC",
  dispatchDate: "2025-01-14",
  recipientInfo: {
    hospitalName: "Hospital ABC",
    address: "123 Medical Street"
  },
  quantity: 1000 // Optional: if partial dispatch
}

Returns:
{
  success: true,
  message: "Batch dispatched successfully",
  chainEvent: {
    role: "Distributor",
    action: "DISPATCHED",
    timestamp: "2025-01-14T15:45:00Z",
    location: "Hospital ABC",
    signature: "dist_sig_dispatch_yyy...",
    chainHash: "NEW_HASH_AFTER_DISPATCH"
  },
  dispatchLabel: {
    qrCode: "data:image/png;base64,...", // QR with new chainHash
    batchNumber: "BATCH-001",
    dispatchedTo: "Hospital ABC",
    dispatchDate: "2025-01-14"
  }
}
```

### 4. Get Batch Chain Endpoint
```
GET /api/modules/distributor/batch/:batchNumber/chain

Returns:
{
  success: true,
  batchNumber: "BATCH-001",
  chainValid: true,
  chain: [
    {
      role: "Manufacturer",
      action: "CREATED",
      timestamp: "2025-01-10T09:15:00Z",
      location: "Pharma Corp Factory",
      signature: "mfg_sig_xxx...",
      signatureValid: true
    },
    {
      role: "Distributor",
      action: "RECEIVED",
      timestamp: "2025-01-12T10:30:00Z",
      location: "Central Warehouse",
      signature: "dist_sig_received_xxx...",
      signatureValid: true
    },
    {
      role: "Distributor",
      action: "DISPATCHED",
      timestamp: "2025-01-14T15:45:00Z",
      location: "Hospital ABC",
      signature: "dist_sig_dispatch_yyy...",
      signatureValid: true
    }
  ]
}
```

### 5. Get Batch Details (with Decryption)
```
GET /api/modules/distributor/batch/:batchNumber

Returns:
{
  success: true,
  batch: {
    batchNumber: "BATCH-001",
    medicineName: "Paracetamol 500mg",
    strength: "500mg", // DECRYPTED
    quantityProduced: 10000, // DECRYPTED
    distributorId: "DIST-001", // DECRYPTED (context)
    dispatchDate: "2025-01-12", // DECRYPTED
    manufacturingDate: "2025-01-10",
    expiryDate: "2026-01-10",
    manufacturerName: "Pharma Corp",
    status: "RECEIVED_BY_DISTRIBUTOR"
  }
}
```

---

## 🔐 Distributor Routes - Security Requirements

```javascript
// All routes require:
// 1. Authentication (3FA completed)
// 2. Role check (userRole === 'Distributor')
// 3. Session validation (15-min timeout)

router.use(authenticateUser);
router.use(requireDistributor);

// POST endpoints (can receive & dispatch)
router.post('/receive-batch', receiveBatch);
router.post('/dispatch-batch', dispatchBatch);

// GET endpoints (can view)
router.get('/inventory', getInventory);
router.get('/batch/:batchNumber', getBatchDetails);
router.get('/batch/:batchNumber/chain', getBatchChain);

// NO DELETE/UPDATE on original batches
```

---

## 📱 Distributor Dashboard - UI/UX Flow

```
┌──────────────────────────────────────────────┐
│  Distributor Login (3FA)                     │
│  • Password                                  │
│  • OTP (Email)                               │
│  • Security Question                         │
└────────────┬─────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│  Distributor Dashboard                       │
│  [Session: 15:00] [Inventory: 42 batches]    │
│                                              │
│  Navigation Tabs:                            │
│  ├─ 📥 RECEIVE BATCH                        │
│  ├─ 📦 VIEW INVENTORY                       │
│  ├─ 📤 DISPATCH BATCH                       │
│  └─ 🔗 TRACK CHAIN                          │
│                                              │
└────────────┬─────────────────────────────────┘
             ↓
      (User selects tab)
      ↙     ↓      ↓      ↘
   📥      📦    📤      🔗
```

**Workflow:**
1. **RECEIVE:** Scan QR → Verify → Store in inventory
2. **INVENTORY:** Browse all batches → Filter by status/expiry
3. **DISPATCH:** Select batch → Enter location → Generate label → Add to chain
4. **TRACK:** View batch history → Verify chain integrity → Monitor supply

---

## 💾 Distributor Model - Database Schema

```javascript
{
  distributorId: ObjectId,
  distributorName: String,
  email: String (unique),
  phone: String,
  
  // Business Info
  warehouseLocation: String,
  city: String,
  state: String,
  capacity: Number, // Max batches can store
  
  // Inventory Management
  inventory: [
    {
      batchNumber: String,
      medicineName: String,
      quantityReceived: Number,
      quantityAvailable: Number,
      quantityDispatched: Number,
      receivedDate: Date,
      dispatchedDate: Date,
      location: String,
      status: "IN_STOCK" | "DISPATCHED" | "EXPIRED" | "RECALLED",
      expiryDate: Date,
      manufacturingDate: Date,
      manufacturerName: String
    }
  ],
  
  // Dispatch Records
  dispatchHistory: [
    {
      batchNumber: String,
      dispatchedTo: String, // Hospital name or Patient ID
      dispatchDate: Date,
      location: String,
      quantity: Number,
      signature: String,
      chainHashAfterDispatch: String
    }
  ],
  
  // Session Info
  loginTimestamp: Date,
  lastActivity: Date,
  
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
- ✅ Plaintext batch number (for identification)
- ✅ Encrypted sensitive data (strength, quantity, etc.)
- ✅ QR code (batchNumber|chainHash)
- ✅ Genesis event in chain

### Distributor Actions:
- ✅ Scan QR to receive
- ✅ Verify chain integrity
- ✅ Decrypt sensitive fields (has keys)
- ✅ Add "Distributor Received" event to chain
- ✅ Store in inventory
- ✅ Dispatch to hospitals/patients
- ✅ Add "Distributor Dispatched" event to chain

### To Patient:
- ✅ Complete chain (Genesis → Distributor Received → Distributor Dispatched)
- ✅ Public batch data
- ✅ Ability to verify entire journey
- ✅ No encrypted field access (patient can't decrypt)

---

## ✅ Implementation Checklist

- [ ] Create Distributor model with schema above
- [ ] Create Distributor controller with 5 endpoints
- [ ] Create Distributor routes with requireDistributor middleware
- [ ] Create Distributor pages (Dashboard, Receive, Inventory, Dispatch, Chain)
- [ ] Implement QR scanner for receiving
- [ ] Implement inventory management UI (sortable, filterable table)
- [ ] Implement dispatch form with location input
- [ ] Add decryption logic for sensitive fields
- [ ] Add chain verification logic (recalculate all hashes)
- [ ] Add signature generation for distributor events
- [ ] Add expiry date warnings (RED if expired, YELLOW if <30 days)
- [ ] Add session timeout (15 minutes)
- [ ] Add 3FA enforcement on distributor page
- [ ] Test receive workflow (scan manufacturer QR)
- [ ] Test dispatch workflow (generate dispatch QR)
- [ ] Test chain verification (all signatures valid)
- [ ] Add API response validation
- [ ] Add CSV export for inventory

---

## 🎯 Key Differences from Patient Module

| Aspect | Patient | Distributor |
|--------|---------|------------|
| **Role** | End consumer (read-only) | Business intermediary (receive + dispatch) |
| **Data Access** | Can't decrypt | CAN decrypt encrypted fields |
| **Chain Edit** | Read-only | Can ADD dispatch events |
| **QR Scan** | Verify only | Receive batches |
| **Inventory** | None | Manage warehouse |
| **Dispatch** | Receives | Sends with digital signature |
| **Critical Action** | Verify authenticity | Maintain chain integrity |
| **Endpoints** | GET only (3) | POST + GET (5) |

---

## 📝 Notes for Implementation

1. **Decryption Authority:** Distributor MUST have decryption keys in .env (AES_SECRET) to decrypt sensitive fields

2. **Signature Generation:** Each distributor action generates HMAC signature:
   ```javascript
   signature = HMAC-SHA256({
     batchNumber,
     action: "RECEIVED" | "DISPATCHED",
     timestamp,
     location,
     distributorId
   }, SECRET_KEY)
   ```

3. **Chain Hash Update:** After each distributor event, recalculate:
   ```
   newChainHash = SHA256(previousChainHash + eventHash)
   ```

4. **Inventory Tracking:**
   - Track received quantity vs dispatched
   - Mark as "EXPIRED" automatically if expiryDate passed
   - Prevent dispatch of expired batches

5. **Expiry Warnings:**
   - 🟢 GREEN: 30+ days
   - 🟡 YELLOW: 7-30 days
   - 🔴 RED: <7 days or already expired

6. **Dispatch Labels:**
   - Generate QR for dispatch
   - Include: batchNumber, newChainHash, location, date
   - Physical label for package

7. **Audit Trail:**
   - Log all distributor actions
   - Record: Who received, when, where
   - Record: Who dispatched, when, to where

---

## 🔗 Complete Supply Chain (After Patient Added)

```
Manufacturer
    ↓ (Creates batch)
    └─→ Batch with Genesis Event + QR Code
         
Distributor
    ↓ (Receives from manufacturer)
    ├─ Scans QR → Verifies Genesis Hash
    ├─ Adds "Distributor Received" Event
    └─→ Batch stored in inventory
         
Distributor
    ↓ (Dispatches to patient)
    ├─ Selects batch from inventory
    ├─ Adds "Distributor Dispatched" Event
    └─→ New QR with updated chainHash
    
Patient
    ↓ (Receives from distributor)
    ├─ Scans QR → Verifies all chain hashes
    ├─ Sees: Manufacturer → Distributor Received → Distributor Dispatched
    └─→ Confirms: Authenticity ✅
```

---

**This guide provides the complete blueprint for the Distributor module. Implement following these specs!** 🎯
