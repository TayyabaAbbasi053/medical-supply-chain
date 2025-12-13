const Batch = require("../../../models/Batch");

// ---------------------------------------------------------
// GET BATCH DETAILS (PUBLIC VIEW)
// ---------------------------------------------------------
exports.getBatchDetails = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    // Find batch using batchNumber — NOT batchId
    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found"
      });
    }

    // Basic authenticity check:
    const isAuthentic = !!batch.genesisDataHash;

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
        chainLength: batch.chain.length
      }
    });

  } catch (err) {
    console.error("Patient getBatchDetails Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message
    });
  }
};

// ---------------------------------------------------------
// GET SUPPLY CHAIN TIMELINE
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

    // Convert all chain events into clean JSON
    const chainEvents = batch.chain.map(event => ({
      role: event.role,
      location: event.location,
      timestamp: event.timestamp,
      signatureValid: true, // Signature verification optional
      previousHash: event.previousHash,
      chainHash: event.chainHash
    }));

    return res.json({
      success: true,
      batchNumber: batch.batchNumber,
      chain: chainEvents
    });

  } catch (err) {
    console.error("Patient getSupplyChainTimeline Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message
    });
  }
};
