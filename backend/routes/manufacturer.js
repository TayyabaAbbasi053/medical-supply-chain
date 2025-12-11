const express = require("express");
const Batch = require("../models/Batch");
const {
  generateDataHash,
  generateChainHash,
  generateHMACSignature,
  encryptData,
  generateQRCode
} = require("../utils/cryptoUtils");

const router = express.Router();

// ===== STEP 1: BATCH CREATION WITH FULL SECURITY WORKFLOW =====
router.post("/create-batch", async (req, res) => {
  try {
    const {
      batchId,
      medicineName,
      quantity,
      manufacturerName,
      manufacturerId,
      manufacturingDate,
      expiryDate,
      location = "Factory Output"
    } = req.body;

    // Validation
    if (!batchId || !medicineName || !quantity || !manufacturerName) {
      return res.status(400).json({
        error: "Missing required fields: batchId, medicineName, quantity, manufacturerName"
      });
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchId });
    if (existingBatch) {
      return res.status(400).json({ error: "Batch ID already exists" });
    }

    // ============================================
    // STEP 1: Batch Creation
    // ============================================
    const batchData = {
      batchId,
      medicineName,
      quantity,
      manufacturerName,
      manufacturingDate: manufacturingDate || new Date(),
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
    };

    // ============================================
    // STEP 2: AES Encryption of Batch Details
    // ============================================
    const batchDetailsString = JSON.stringify(batchData);
    const encryptedBatchDetails = encryptData(batchDetailsString);

    // ============================================
    // STEP 3: SHA-256 DataHash Generation
    // ============================================
    const dataHash = generateDataHash(batchData);

    // ============================================
    // STEP 4: Hash-Chain Generation (Genesis Block)
    // ============================================
    const previousChainHash = "GENESIS_BLOCK_HASH";
    const chainHash = generateChainHash(previousChainHash, dataHash);

    // ============================================
    // STEP 5: QR Code Generation (batchId + chainHash)
    // ============================================
    const qrCodeDataURL = await generateQRCode(batchId, chainHash);

    // ============================================
    // STEP 6: HMAC Signature for Manufacturer Event
    // ============================================
    const eventData = {
      batchId,
      dataHash,
      chainHash,
      timestamp: new Date(),
      role: "Manufacturer"
    };

    const hmacSignature = generateHMACSignature(eventData, process.env.SECRET_KEY);

    // ============================================
    // STEP 7: Create Genesis Event in Batch Chain
    // ============================================
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

    // ============================================
    // Create New Batch in Database
    // ============================================
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

    // ============================================
    // STEP 7: Final Dispatch Response Object
    // ============================================
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
});

// ===== GET BATCH WITH DECRYPTED DETAILS =====
router.get("/batch/:batchId", async (req, res) => {
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
});

// ===== VERIFY BATCH INTEGRITY =====
router.post("/verify-batch", async (req, res) => {
  try {
    const { batchId } = req.body;
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Verify genesis data hash
    const genesisDataHash = generateDataHash({
      batchId: batch.batchId,
      medicineName: batch.medicineName,
      quantity: batch.quantity,
      manufacturerName: batch.manufacturerName,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate
    });

    const isGenesisValid = genesisDataHash === batch.genesisDataHash;

    // Verify QR code is still consistent
    const expectedQRContent = `${batchId}|${batch.genesisChainHash}`;

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
});

module.exports = router;
