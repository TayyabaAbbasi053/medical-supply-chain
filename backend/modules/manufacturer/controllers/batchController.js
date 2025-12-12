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
      batchId,
      medicineName,
      activeIngredients,
      quantity,
      manufacturerName,
      manufacturerId,
      manufacturingDate,
      expiryDate,
      location = "Factory Output"
    } = req.body;

    // Get authenticated user
    const authenticatedUser = req.user;

    // Validation - ALL fields are required
    if (!batchId || !medicineName || !activeIngredients || !quantity || !manufacturerName || !manufacturerId || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        error: "All fields are required: batchId, medicineName, activeIngredients, quantity, manufacturerName, manufacturerId, manufacturingDate, expiryDate"
      });
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchId });
    if (existingBatch) {
      return res.status(400).json({ error: "Batch ID already exists" });
    }

    // Batch data preparation
    const batchData = {
      batchId,
      medicineName,
      quantity,
      manufacturerName,
      manufacturingDate,
      expiryDate
    };

    // SENSITIVE DATA TO ENCRYPT: batchId, quantity, manufacturerId, activeIngredients
    const sensitiveData = {
      batchId,
      quantity,
      manufacturerId,
      activeIngredients,
      timestamp: new Date()
    };

    // AES Encryption - Only encrypt sensitive proprietary data
    const sensitiveDataString = JSON.stringify(sensitiveData);
    const encryptedBatchDetails = encryptData(sensitiveDataString);

    // SHA-256 DataHash
    const dataHash = generateDataHash(batchData);

    // Hash-Chain Generation (Genesis)
    const previousChainHash = "GENESIS_BLOCK_HASH";
    const chainHash = generateChainHash(previousChainHash, dataHash);

    // QR Code Generation
    const qrCodeDataURL = await generateQRCode(batchId, chainHash);

    // HMAC Signature
    const eventData = {
      batchId,
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
      qrCode: qrCodeDataURL,
      hmacSignature: hmacSignature
    };

    // Create Batch in Database
    const newBatch = new Batch({
      batchId,
      medicineName,
      quantity,
      manufacturerName,
      manufacturerId: manufacturerId || "SYSTEM",
      manufacturingDate: batchData.manufacturingDate,
      expiryDate: batchData.expiryDate,
      batchDetails: encryptedBatchDetails,
      genesisDataHash: dataHash,
      genesisChainHash: chainHash,
      genesisQRCode: qrCodeDataURL,
      chain: [genesisEvent]
    });

    await newBatch.save();

    // Response Object
    const dispatchResponse = {
      success: true,
      message: "Batch created successfully with complete security chain",
      batch: {
        batchId: newBatch.batchId,
        medicineName: newBatch.medicineName,
        quantity: newBatch.quantity,
        manufacturerName: newBatch.manufacturerName,
        manufacturingDate: newBatch.manufacturingDate,
        expiryDate: newBatch.expiryDate,
        status: "GENESIS_CREATED"
      },
      security: {
        dataHash: dataHash,
        chainHash: chainHash,
        hmacSignature: hmacSignature,
        qrCode: {
          dataURL: qrCodeDataURL,
          content: `${batchId}|${chainHash}`,
          width: 300,
          height: 300
        }
      },
      genesisEvent: {
        role: genesisEvent.role,
        location: genesisEvent.location,
        timestamp: genesisEvent.timestamp,
        signature: genesisEvent.signature,
        chainHash: genesisEvent.chainHash
      },
      encryptedData: {
        batchDetails: encryptedBatchDetails,
        encryptionAlgorithm: "AES-256-ECB"
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
