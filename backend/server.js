require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Import Modules ---
const authRoutes = require('./routes/auth');
const manufacturerRoutes = require('./modules/manufacturer/routes/batchRoutes');
const distributorRoutes = require('./modules/distributor/routes/batchRoutes');
const pharmacyRoutes = require('./modules/pharmacy/routes/batchRoutes');

// --- Import Utils & Models (For Manufacturer Creation Logic) ---
const Batch = require("./models/Batch");
const { 
  calculateHash, 
  signData, 
  encryptData, 
  decryptData, 
  createCanonicalPayload, // 👈 CRITICAL: Ensures hash consistency
  generateChainHash,
  generateHMACSignature
} = require("./utils/cryptoUtils");

console.log("---- 🚀 STARTING SERVER ----");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Register Module Routes ---
try {
    console.log("1. Loading Auth Routes...");
    app.use("/api/auth", authRoutes);
    
    // Future-proofing: If you move create-batch to this module later
    console.log("2. Loading Manufacturer Routes...");
    app.use("/api/modules/manufacturer", manufacturerRoutes);

    console.log("3. Loading Distributor Routes...");
    app.use('/api/distributor', distributorRoutes);

    console.log("4. Loading Pharmacy Routes...");
    app.use('/api/pharmacy', pharmacyRoutes);

    console.log("✅ ALL MODULES LOADED SUCCESSFULLY");

} catch (error) {
    console.error("❌ CRITICAL ERROR LOADING ROUTES:", error.message);
}

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ DB Error:", err));

// =============================================================
// 👇 MANUFACTURER CREATION LOGIC (Strict Compliance)
// This logic creates the "Genesis Block". It MUST match the
// validator logic in cryptoUtils.js exactly.
// =============================================================

app.post("/api/create-batch", async (req, res) => {
  try {
    const {
      batchNumber, // or batchId
      strength,
      quantityProduced,
      distributorId,
      dispatchDate,
      medicineName,
      manufacturingDate,
      expiryDate,
      manufacturerName,
      location = "Factory Output"
    } = req.body;

    // 1. Validate Inputs
    if (!batchNumber || !quantityProduced || !medicineName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Check if exists (Check both ID fields for safety)
    const existing = await Batch.findOne({ 
        $or: [{ batchNumber: batchNumber }, { batchId: batchNumber }] 
    });
    if (existing) return res.status(400).json({ error: "Batch Number already exists" });

    // 3. Format Data Types (CRITICAL FOR HASHING)
    const quantityNum = Number(quantityProduced); // Must be a Number
    const mfgDateISO = new Date(manufacturingDate).toISOString();
    const expDateISO = new Date(expiryDate).toISOString();
    const eventTimestamp = new Date();

    // 4. Prepare Raw Object for Helper
    // We pass the raw inputs, the helper formats them into ISO/Numbers
    // This structure MUST match what createCanonicalPayload expects for "Manufacturer"
    const rawGenesisData = {
        batchNumber: batchNumber,
        medicineName: medicineName,
        manufacturerName: manufacturerName,
        quantity: quantityNum,
        manufacturingDate: mfgDateISO, 
        expiryDate: expDateISO,        
        timestamp: eventTimestamp,
        role: "Manufacturer"
    };

    // 5. Generate CONSISTENT Hash
    // The helper converts dates to ISO and sorts keys. 
    // This is the "Truth" hash.
    const payloadForHashing = createCanonicalPayload(rawGenesisData, batchNumber);
    const dataHash = calculateHash(payloadForHashing); 

    // 6. Chain Hash (Genesis starts with a seed)
    const chainHash = generateChainHash("GENESIS_BLOCK_HASH", dataHash);

    // 7. Signature (HMAC)
    const hmacSignature = generateHMACSignature({
        batchNumber, 
        dataHash, 
        chainHash, 
        timestamp: eventTimestamp, 
        role: "Manufacturer"
    }, process.env.SECRET_KEY);

    // 8. Encrypt Private Data (Sensitive fields only)
    const sensitiveData = {
        strength, 
        quantity: quantityNum, 
        distributorId, 
        dispatchDate,
        manufacturerSignature: `MFG-${batchNumber}`
    };
    const encryptedBatchDetails = encryptData(JSON.stringify(sensitiveData));

    // 9. Save to DB
    // IMPORTANT: The 'chain' object must contain the fields we just hashed (quantity, dates, etc.)
    // otherwise the Validator won't be able to reconstruct the hash later.
    const newBatch = new Batch({
      batchNumber: batchNumber,
      quantityProduced: quantityNum,
      medicineName, 
      manufacturerName,
      manufacturingDate: mfgDateISO, 
      expiryDate: expDateISO,
      batchDetails: encryptedBatchDetails,
      
      // Metadata
      genesisDataHash: dataHash,
      genesisChainHash: chainHash,
      encryptionAlgorithm: "AES-256-ECB",
      
      // The Blockchain History
      chain: [{
        role: "Manufacturer",
        location: location,
        timestamp: eventTimestamp,
        signature: hmacSignature, // Using HMAC as the primary signature
        previousHash: "GENESIS_BLOCK_HASH",
        dataHash: dataHash,
        chainHash: chainHash,
        hmacSignature: hmacSignature,
        
        // 👇 CONTEXT FIELDS (Required for Validation later)
        medicineName: medicineName,
        manufacturerName: manufacturerName,
        quantity: quantityNum,
        manufacturingDate: mfgDateISO,
        expiryDate: expDateISO
      }]
    });

    await newBatch.save();
    console.log(`✅ Batch ${batchNumber} Created Successfully (Genesis Block)`);
    
    res.status(201).json({ 
        success: true, 
        message: "Batch created successfully", 
        batch: { batchNumber, status: "CREATED" } 
    });

  } catch (error) {
    console.error("Create Batch Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================
// 👇 PATIENT / VIEWER ROUTES (Legacy/Public)
// =============================================================

// Get Batch History
app.get("/api/batch/:id", async (req, res) => {
  try {
    // Robust search: Look for batchId OR batchNumber
    const batch = await Batch.findOne({ 
        $or: [ { batchId: req.params.id }, { batchNumber: req.params.id } ]
    });
    
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrypt Prescription
app.post("/api/decrypt", (req, res) => {
  try {
    const { encryptedText } = req.body;
    const decrypted = decryptData(encryptedText);
    res.json({ decrypted });
  } catch (e) {
    res.status(500).json({ error: "Decryption failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));