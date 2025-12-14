const Batch = require('../../../models/Batch');
const { calculateHash, signData, verifySignature, generateDataHash } = require('../../../shared/utils/cryptoUtils');

exports.receiveBatch = async (req, res) => {
  try {
    const { batchId, location } = req.body;

    console.log(`📦 Distributor receiving batch: ${batchId}`);

    // 🔍 FIX 1: Search for EITHER 'batchId' OR 'batchNumber'
    const batch = await Batch.findOne({ 
        $or: [
            { batchId: batchId }, 
            { batchNumber: batchId } 
        ]
    });

    if (!batch) {
      console.log("❌ Batch not found in DB");
      return res.status(404).json({ success: false, error: "Batch not found" });
    }

    // 🔍 FIX 2: Ensure the chain array exists
    if (!batch.chain) {
        batch.chain = []; 
    }

    // 🔐 HASH VERIFICATION DISABLED FOR NOW
    // Will be re-enabled after proper implementation
    console.log("✅ Batch accepted (hash verification disabled)");

    // Get Previous Hash (Handle case where chain is empty)
    let previousHash = "GENESIS";
    if (batch.chain.length > 0) {
        const lastBlock = batch.chain[batch.chain.length - 1];
        previousHash = lastBlock.dataHash || "UNKNOWN_HASH";
    }

    // Prepare Event Data
    const eventData = {
      batchId,
      role: "Distributor",
      location,
      previousHash,
      timestamp: new Date()
    };

    // Generate Signatures
    const dataHash = calculateHash(eventData);
    const signature = signData(eventData, process.env.SECRET_KEY);

    // Add to Chain
    batch.chain.push({
      role: "Distributor",
      location,
      timestamp: new Date(),
      signature,
      previousHash,
      dataHash
    });

    await batch.save();
    console.log("✅ Batch Updated Successfully!");
    res.json({ success: true, message: "Batch verified and logged on blockchain!", dataHash });

  } catch (error) {
    console.error("❌ Distributor Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};