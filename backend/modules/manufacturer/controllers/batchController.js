const Batch = require("../../../models/Batch");
const {
  generateDataHash,
  generateChainHash,
  generateHMACSignature,
  encryptData,
  generateQRCode
} = require("../../../shared/utils/cryptoUtils");

// Create Batch Controller
exports.createBatch = async (req, res) => {
  try {
    const {
      // � PLAINTEXT IDENTIFIER
      batchNumber,
      
      // 🔐 ENCRYPTED FIELDS
      strength,
      quantityProduced,
      distributorId,
      dispatchDate,
      
      // 🔓 PUBLIC FIELDS
      medicineName,
      manufacturingDate,
      expiryDate,
      manufacturerName,
      
      location = "Factory Output"
    } = req.body;

    // Get authenticated user
    const authenticatedUser = req.user;

    // Validation - ALL fields are required
    if (!batchNumber || !strength || !quantityProduced || !distributorId || !dispatchDate || 
        !medicineName || !manufacturingDate || !expiryDate || !manufacturerName) {
      return res.status(400).json({
        error: "All fields are required. Plaintext: batchNumber. Encrypted: strength, quantityProduced, distributorId, dispatchDate. Public: medicineName, manufacturingDate, expiryDate, manufacturerName"
      });
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchNumber });
    if (existingBatch) {
      return res.status(400).json({ error: "Batch Number already exists" });
    }

    // 🔓 PUBLIC BATCH DATA (Not encrypted - accessible to all)
    // NORMALIZE DATES TO ISO STRINGS FOR CONSISTENT HASHING
    const publicBatchData = {
      batchNumber,
      medicineName,
      manufacturingDate: manufacturingDate instanceof Date 
        ? manufacturingDate.toISOString() 
        : new Date(manufacturingDate).toISOString(),
      expiryDate: expiryDate instanceof Date 
        ? expiryDate.toISOString() 
        : new Date(expiryDate).toISOString(),
      manufacturerName
    };

    // 🔐 SENSITIVE DATA TO ENCRYPT (Only manufacturer knows this)
    // NOTE: batchNumber is NOT encrypted (needed for QR codes and patient verification)
    const sensitiveData = {
      strength,
      quantityProduced,
      distributorId,
      dispatchDate,
      manufacturerSignature: `MFG-SIG-${batchNumber}-${Date.now()}`,
      timestamp: new Date()
    };

    // AES Encryption - Encrypt all sensitive proprietary data
    const sensitiveDataString = JSON.stringify(sensitiveData);
    const encryptedBatchDetails = encryptData(sensitiveDataString);

    // SHA-256 DataHash (based on PUBLIC data only)
    const dataHash = generateDataHash(publicBatchData);

    // Hash-Chain Generation (Genesis)
    const previousChainHash = "GENESIS_BLOCK_HASH";
    const chainHash = generateChainHash(previousChainHash, dataHash);

    // HMAC Signature (includes manufacturer signature)
    const eventData = {
      batchNumber,
      dataHash,
      chainHash,
      timestamp: new Date(),
      role: "Manufacturer"
    };

    const hmacSignature = generateHMACSignature(eventData, process.env.SECRET_KEY);

    // Genesis Event
    const genesisEvent = {
      role: "Manufacturer",
      location: location,
      timestamp: new Date(),
      signature: hmacSignature,
      previousHash: "GENESIS",
      dataHash: dataHash,
      chainHash: chainHash,
      hmacSignature: hmacSignature,
      encryptionStatus: "ENCRYPTED"
    };

    // Create Batch in Database
    const newBatch = new Batch({
      batchNumber,
      medicineName,
      quantityProduced,
      manufacturerName,
      manufacturingDate,
      expiryDate,
      // 🔐 Encrypted sensitive data
      batchDetails: encryptedBatchDetails,
      // Security metadata
      genesisDataHash: dataHash,
      genesisChainHash: chainHash,
      chain: [genesisEvent],
      encryptionAlgorithm: "AES-256-ECB",
      dataClassification: {
        plaintext: ["batchNumber"],
        encrypted: ["strength", "quantityProduced", "distributorId", "dispatchDate", "manufacturerSignature"],
        public: ["medicineName", "manufacturingDate", "expiryDate", "manufacturerName"]
      }
    });

    await newBatch.save();

    // Response Object
    const dispatchResponse = {
      success: true,
      message: "Batch created successfully with encryption applied",
      batch: {
        // 🔓 PUBLIC DATA (visible in response)
        batchNumber: newBatch.batchNumber,
        medicineName: newBatch.medicineName,
        manufacturingDate: newBatch.manufacturingDate,
        expiryDate: newBatch.expiryDate,
        manufacturerName: newBatch.manufacturerName,
        status: "GENESIS_CREATED"
      },
      dataClassification: {
        plaintext: {
          fields: ["Batch Number"],
          reason: "Needed for QR codes and patient verification"
        },
        encrypted: {
          fields: ["Strength/Dosage", "Quantity Produced", "Distributor ID", "Dispatch Date", "Manufacturer Signature"],
          algorithm: "AES-256-ECB",
          status: "✅ ENCRYPTED"
        },
        public: {
          fields: ["Medicine Name", "Manufacturing Date", "Expiry Date", "Manufacturer Name"],
          status: "🔓 PUBLIC (Unencrypted)"
        }
      },
      security: {
        dataHash: dataHash,
        chainHash: chainHash,
        hmacSignature: hmacSignature
      },
      genesisEvent: {
        role: genesisEvent.role,
        location: genesisEvent.location,
        timestamp: genesisEvent.timestamp,
        signature: genesisEvent.signature,
        chainHash: genesisEvent.chainHash
      }
    };

    res.status(201).json(dispatchResponse);
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({
      error: "Batch creation failed",
      message: error.message
    });
  }
};

// Get Batch Controller
exports.getBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.json({
      success: true,
      batch: {
        batchId: batch.batchId,
        medicineName: batch.medicineName,
        quantity: batch.quantity,
        manufacturerName: batch.manufacturerName,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate,
        genesisDataHash: batch.genesisDataHash,
        genesisChainHash: batch.genesisChainHash,
        chainLength: batch.chain.length,
        status: batch.isComplete ? "COMPLETED" : "IN_TRANSIT"
      },
      chainHistory: batch.chain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Batch Controller
exports.verifyBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const genesisDataHash = generateDataHash({
      batchId: batch.batchId,
      medicineName: batch.medicineName,
      quantity: batch.quantity,
      manufacturerName: batch.manufacturerName,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate
    });

    const isGenesisValid = genesisDataHash === batch.genesisDataHash;

    res.json({
      success: true,
      verification: {
        batchId: batch.batchId,
        isGenesisHashValid: isGenesisValid,
        chainIntegrity: {
          genesisDataHash: {
            stored: batch.genesisDataHash,
            calculated: genesisDataHash,
            match: isGenesisValid
          },
          genesisChainHash: batch.genesisChainHash
        },
        eventCount: batch.chain.length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
