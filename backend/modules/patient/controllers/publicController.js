const Batch = require("../../../models/Batch");

// ---------------------------------------------------------
// PUBLIC: VERIFY BATCH AUTHENTICITY
// ---------------------------------------------------------
exports.publicVerifyBatch = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    // Support either `batchNumber` (public) or `batchId` (other modules)
    const identifier = batchNumber;
    const batch = await Batch.findOne({
      $or: [{ batchNumber: identifier }, { batchId: identifier }]
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found"
      });
    }

    const isAuthentic = !!batch.genesisDataHash;

    return res.json({
      success: true,
      batch: {
        batchNumber: batch.batchNumber || batch.batchId || identifier,
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
    console.error("Public verifyBatch Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message
    });
  }
};

// ---------------------------------------------------------
// PUBLIC: GET SUPPLY CHAIN TIMELINE
// ---------------------------------------------------------
exports.publicTrackTimeline = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    // Support lookup by either public `batchNumber` or internal `batchId`
    const identifier = batchNumber;
    const batch = await Batch.findOne({
      $or: [{ batchNumber: identifier }, { batchId: identifier }]
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found"
      });
    }

    const chainEvents = batch.chain.map(event => ({
      role: event.role,
      location: event.location,
      timestamp: event.timestamp,
      previousHash: event.previousHash,
      chainHash: event.chainHash
    }));

    return res.json({
      success: true,
      batchNumber: batch.batchNumber || batch.batchId || identifier,
      chain: chainEvents
    });

  } catch (err) {
    console.error("Public trackTimeline Error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message
    });
  }
};
