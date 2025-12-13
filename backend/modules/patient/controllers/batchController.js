const Batch = require("../../../models/Batch");
const {
  generateDataHash,
  generateChainHash,
  generateHMACSignature
} = require("../../../shared/utils/cryptoUtils");

// ---------------------------------------------------------
// GET BATCH DETAILS + FULL VERIFICATION (PATIENT)
// ---------------------------------------------------------
exports.getBatchDetails = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found"
      });
    }

    /* -------------------------------------------------
       STEP 1 — GENESIS DATA HASH VERIFICATION
    ------------------------------------------------- */
    const recalculatedGenesisHash = generateDataHash({
      batchNumber: batch.batchNumber,
      medicineName: batch.medicineName,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      manufacturerName: batch.manufacturerName
    });

    let isAuthentic = recalculatedGenesisHash === batch.genesisDataHash;

    /* -------------------------------------------------
       STEP 2 — CHAIN INTEGRITY + HMAC VERIFICATION
    ------------------------------------------------- */
    let previousHash = "GENESIS_BLOCK_HASH";

    for (const event of batch.chain) {
      // Verify chain hash
      const expectedChainHash = generateChainHash(
        previousHash,
        event.dataHash
      );

      if (expectedChainHash !== event.chainHash) {
        isAuthentic = false;
        break;
      }

      // Verify HMAC signature
      const expectedHMAC = generateHMACSignature(
        {
          batchNumber: batch.batchNumber,
          dataHash: event.dataHash,
          chainHash: event.chainHash,
          timestamp: event.timestamp,
          role: event.role
        },
        process.env.SECRET_KEY
      );

      if (expectedHMAC !== event.hmacSignature) {
        isAuthentic = false;
        break;
      }

      previousHash = event.chainHash;
    }

    return res.json({
      success: true,
      batch: {
        batchNumber: batch.batchNumber,
        medicineName: batch.medicineName,
        manufacturerName: batch.manufacturerName,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate
      },
      verification: {
        isAuthentic,
        genesisHashMatch: recalculatedGenesisHash === batch.genesisDataHash,
        chainLength: batch.chain.length,
        verificationLevel: "GENESIS + CHAIN + HMAC"
      }
    });

  } catch (err) {
    console.error("Patient getBatchDetails Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// ---------------------------------------------------------
// GET SUPPLY CHAIN TIMELINE (PATIENT)
// ---------------------------------------------------------
exports.getSupplyChainTimeline = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found"
      });
    }

    const chainEvents = batch.chain.map((event, index) => ({
      step: index + 1,
      role: event.role,
      location: event.location,
      timestamp: event.timestamp,
      chainHash: event.chainHash
    }));

    return res.json({
      success: true,
      batchNumber: batch.batchNumber,
      chainLength: batch.chain.length,
      chain: chainEvents
    });

  } catch (err) {
    console.error("Patient getSupplyChainTimeline Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};
