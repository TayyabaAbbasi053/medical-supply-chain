const Batch = require('../../../models/Batch');
const { 
  calculateHash, 
  signData, 
  encryptData, 
  validateChain 
} = require('../../../utils/cryptoUtils');

// --- 1. GET Batch Details (Preview History) ---
exports.getBatchInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Robust Search
    const batch = await Batch.findOne({ 
        $or: [ { batchId: id }, { batchNumber: id } ]
    });

    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // Extract Distributor History from the Chain
    const distributionHistory = batch.chain
      .filter(event => event.role === "Distributor")
      .map(event => ({
        handler: event.handlerDetails || "Unknown",
        location: event.location,
        date: event.timestamp
      }));

    res.json({
        success: true,
        medicineName: batch.medicineName,
        manufacturerName: batch.manufacturerName,
        quantity: batch.quantityProduced || batch.quantity,
        expiryDate: batch.expiryDate,
        isComplete: batch.isComplete,
        history: distributionHistory // Sending list of distributors to frontend
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- 2. DISPENSE (Verify Chain + Encrypt Rx) ---
exports.dispenseMedicine = async (req, res) => {
  try {
    const { batchId, prescription } = req.body;

    const batch = await Batch.findOne({ 
        $or: [ { batchId: batchId }, { batchNumber: batchId } ]
    });

    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // 🛡️ SECURITY: Validate Chain Integrity
    // If a hacker changed a Distributor's location in the DB, this fails.
    const isChainValid = validateChain(batch.chain);
    if (!isChainValid) {
        console.error(`🚨 TAMPERING DETECTED in Pharmacy for Batch ${batchId}`);
        return res.status(403).json({ 
            success: false, 
            error: "CRITICAL: Supply Chain Integrity Compromised! Do not dispense." 
        });
    }

    if (!prescription) {
        return res.status(400).json({ success: false, error: "Prescription is required" });
    }

    // 1. Encrypt Prescription (Privacy)
    const encryptedRx = encryptData(prescription);

    // 2. Prepare Block Data
    const lastBlock = batch.chain[batch.chain.length - 1];
    const previousHash = lastBlock ? lastBlock.dataHash : "GENESIS";
    
    const eventData = {
      batchId,
      role: "Pharmacy",
      location: "Dispensed to Patient",
      previousHash,
      timestamp: new Date()
    };

    // 3. Generate Crypto Signatures
    const dataHash = calculateHash(eventData);
    const signature = signData(eventData, process.env.SECRET_KEY);

    // 4. Update Database
    batch.chain.push({
      role: "Pharmacy",
      location: "Dispensed to Patient",
      timestamp: new Date(),
      signature,
      previousHash,
      dataHash
    });

    batch.prescriptionEncrypted = encryptedRx;
    batch.isComplete = true; // Locks the batch

    await batch.save();
    console.log(`✅ Pharmacy Dispensed: ${batchId}`);
    
    res.json({ success: true, message: "Medicine dispensed & Data Encrypted", dataHash });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};