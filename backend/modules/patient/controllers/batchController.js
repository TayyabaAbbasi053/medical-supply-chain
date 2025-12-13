const Batch = require("../../../models/Batch");
const { generateChainHash } = require("../../../shared/utils/cryptoUtils");

// ---------------------------------------------------------
// GET BATCH DETAILS + VERIFICATION (PATIENT)
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

    // -------------------------------------------------
    // PATIENT VERIFICATION MODEL
    // Trust genesis, verify chain integrity only
    // -------------------------------------------------
    let isAuthentic = true;
    let previousHash = "GENESIS_BLOCK_HASH";

    for (const event of batch.chain) {
      const expectedChainHash = generateChainHash(
        previousHash,
        event.dataHash
      );

      if (expectedChainHash !== event.chainHash) {
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
        chainLength: batch.chain.length,
        verificationLevel: "CHAIN INTEGRITY (PATIENT)"
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
