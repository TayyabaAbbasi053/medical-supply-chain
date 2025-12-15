const Batch = require('../../../models/Batch');
const { 
  calculateHash, 
  signData, 
  encryptData, 
  createCanonicalPayload, // 👈 CRITICAL: Ensures hash matches Validator
  generateChainHash, 
  generateHMACSignature 
} = require('../../../utils/cryptoUtils');

// --- Create New Batch (Genesis Block) ---
exports.createBatch = async (req, res) => {
  try {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
    }

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

    // 1. Basic Validation
    if (!batchNumber || !quantityProduced || !medicineName) {
        return res.status(400).json({ error: "Missing required fields (Batch Number, Quantity, Name)" });
    }

    // 2. Check for Duplicates
    const existing = await Batch.findOne({ 
        $or: [{ batchNumber: batchNumber }, { batchId: batchNumber }] 
    });
    if (existing) {
        return res.status(400).json({ error: "Batch ID/Number already exists in database" });
    }

    // 3. Format Data Types (CRITICAL FOR HASH CONSISTENCY)
    // The Validator expects 'quantity' to be a Number, not a String "100"
    const quantityNum = Number(quantityProduced); 
    const mfgDateISO = new Date(manufacturingDate).toISOString();
    const expDateISO = new Date(expiryDate).toISOString();
    const eventTimestamp = new Date();

    // 4. Prepare Raw Data for Hashing
    // We construct the object exactly how the 'createCanonicalPayload' helper expects it
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

    // 5. Generate the "Truth" Hash
    // This normalizes dates, sorts keys, and creates the SHA256 hash
    const payloadForHashing = createCanonicalPayload(rawGenesisData, batchNumber);
    const dataHash = calculateHash(payloadForHashing); 

    // 6. Create Genesis Chain Hash
    // The first block doesn't have a previous hash, so we seed it.
    const chainHash = generateChainHash("GENESIS_BLOCK_HASH", dataHash);

    // 7. Generate HMAC Signature (Proof of Identity)
    const hmacSignature = generateHMACSignature({
        batchNumber, 
        dataHash, 
        chainHash, 
        timestamp: eventTimestamp, 
        role: "Manufacturer"
    }, process.env.SECRET_KEY);

    // 8. Encrypt Sensitive Business Data
    // This data is hidden from the public/distributors
    const sensitiveData = {
        strength, 
        quantity: quantityNum, 
        distributorId, 
        dispatchDate,
        manufacturerSignature: `MFG-${batchNumber}`
    };
    const encryptedBatchDetails = encryptData(JSON.stringify(sensitiveData));

    // 9. Save to Database
    // ⚠️ IMPORTANT: We must save 'quantity', 'medicineName' inside the chain event.
    // If we don't, the Distributor Validator will read 'undefined', hash it, 
    // and fail the tamper check.
    const newBatch = new Batch({
      batchNumber: batchNumber,
      quantityProduced: quantityNum,
      medicineName: medicineName, 
      manufacturerName: manufacturerName,
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
        signature: hmacSignature, // Using HMAC as signature
        previousHash: "GENESIS_BLOCK_HASH",
        dataHash: dataHash,
        chainHash: chainHash,
        hmacSignature: hmacSignature,
        
        // 👇 CONTEXT FIELDS (Required for future Validation)
        medicineName: medicineName,
        manufacturerName: manufacturerName,
        quantity: quantityNum,
        manufacturingDate: mfgDateISO,
        expiryDate: expDateISO
      }]
    });

    await newBatch.save();
    console.log(`✅ Manufacturer Created Batch: ${batchNumber}`);
    
    res.status(201).json({ 
        success: true, 
        message: "Batch created successfully", 
        batch: { batchNumber, status: "CREATED" } 
    });

  } catch (error) {
    console.error("❌ Manufacturer Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- Optional: Get All Batches (For Manufacturer Dashboard List) ---
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find({}, { batchNumber: 1, medicineName: 1, isComplete: 1, createdAt: 1 })
                                   .sort({ createdAt: -1 })
                                   .limit(20);
        res.json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};