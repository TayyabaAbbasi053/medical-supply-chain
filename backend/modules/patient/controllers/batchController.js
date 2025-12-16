const Batch = require("../../../models/Batch");
const {
  calculateHash,
  createCanonicalPayload,
  decryptData,
  generateChainHash
} = require("../../../utils/cryptoUtils");

/* =====================================================
   VERIFY BATCH (QR / Manual Entry)
===================================================== */
exports.verifyBatch = async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: "Batch ID is required" });
    }

    // 1. Fetch batch
    const batch = await Batch.findOne({
      $or: [{ batchNumber: batchId }, { batchId }]
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const chain = batch.chain;
    let previousHash = "GENESIS_BLOCK_HASH";

    // 2. FULL HASH CHAIN VERIFICATION
    for (let i = 0; i < chain.length; i++) {
      const event = chain[i];

      const payload = createCanonicalPayload(
        {
          batchNumber: batch.batchNumber,
          medicineName: event.medicineName,
          manufacturerName: event.manufacturerName,
          quantity: event.quantity,
          manufacturingDate: event.manufacturingDate,
          expiryDate: event.expiryDate,
          timestamp: event.timestamp,
          role: event.role,
          location: event.location
        },
        batch.batchNumber
      );

      const recalculatedDataHash = calculateHash(payload);
      const recalculatedChainHash = generateChainHash(
        previousHash,
        recalculatedDataHash
      );

      if (
        recalculatedDataHash !== event.dataHash ||
        recalculatedChainHash !== event.chainHash
      ) {
        return res.status(400).json({
          success: false,
          authentic: false,
          message: "❌ Batch has been tampered",
        });
      }

      previousHash = event.dataHash;
    }

    // 3. Expiry warning logic
    const expiryDate = new Date(batch.expiryDate);
    const daysLeft =
      (expiryDate - new Date()) / (1000 * 60 * 60 * 24);

    res.json({
      success: true,
      authentic: true,
      medicineName: batch.medicineName,
      manufacturerName: batch.manufacturerName,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      expiryWarning: daysLeft < 30,
      chainTimeline: chain.map(e => ({
        role: e.role,
        location: e.location,
        timestamp: e.timestamp
      })),
      prescriptionEncrypted: batch.prescriptionEncrypted || null
    });

  } catch (err) {
    console.error("Patient Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   DECRYPT PRESCRIPTION (OPTIONAL)
===================================================== */
exports.getPrescription = async (req, res) => {
  try {
    const { encryptedText } = req.body;
    if (!encryptedText) {
      return res.status(400).json({ error: "Encrypted text required" });
    }

    const decrypted = decryptData(encryptedText);
    res.json({ decrypted });

  } catch (err) {
    res.status(500).json({ error: "Decryption failed" });
  }
};
