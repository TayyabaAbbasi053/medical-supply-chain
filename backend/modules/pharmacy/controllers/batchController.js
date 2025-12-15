const Batch = require('../../../models/Batch');
const { 
  calculateHash, generateChainHash, generateHMACSignature, 
  generateQRCode, validateChain, createCanonicalPayload, encryptData 
} = require('../../../utils/cryptoUtils');

// --- GET History (Preview) ---
exports.getBatchInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findOne({ batchNumber: id });

    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // Extract history of Distributors
    const history = batch.chain
        .filter(e => e.role === "Distributor")
        .map(e => ({
            name: e.handlerDetails,
            contact: e.contactInfo,
            location: e.location,
            time: e.timestamp
        }));

    res.json({
        success: true,
        medicineName: batch.medicineName,
        manufacturerName: batch.manufacturerName,
        isComplete: batch.isComplete,
        history // Send full list to frontend
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- POST Dispense ---
exports.dispenseMedicine = async (req, res) => {
  try {
    const { batchId, prescription } = req.body;

    const batch = await Batch.findOne({ batchNumber: batchId });
    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // 1. 🛡️ Validate Tampering
    const isValid = validateChain(batch.chain, batch.batchNumber);
    if (!isValid) return res.status(403).json({ success: false, error: "CRITICAL: Chain Tampered!" });

    // 2. Encrypt Rx
    const encryptedRx = encryptData(prescription);

    // 3. Prepare Data
    const lastBlock = batch.chain[batch.chain.length - 1];
    const eventTimestamp = new Date();
    
    // 4. Canonical Payload
    const rawData = {
        batchNumber: batch.batchNumber,
        role: "Pharmacy",
        location: "Dispensed to Patient",
        handlerDetails: "City Pharmacy", // Can be dynamic if needed
        contactInfo: "N/A",
        timestamp: eventTimestamp,
        previousHash: lastBlock.dataHash
    };

    // 5. Crypto Ops
    const dataHash = calculateHash(createCanonicalPayload(rawData, batch.batchNumber));
    const chainHash = generateChainHash(lastBlock.chainHash, dataHash);
    
    const hmacSig = generateHMACSignature({
        batchNumber: batch.batchNumber,
        dataHash, chainHash, timestamp: eventTimestamp, role: "Pharmacy"
    }, process.env.SECRET_KEY);

    // 6. Save
    batch.chain.push({
        role: "Pharmacy",
        location: "Dispensed to Patient",
        handlerDetails: "City Pharmacy",
        timestamp: eventTimestamp,
        previousHash: lastBlock.dataHash,
        dataHash, chainHash, hmacSignature: hmacSig
    });

    batch.prescriptionEncrypted = encryptedRx;
    batch.isComplete = true;

    await batch.save();
    res.json({ success: true, message: "Dispensed & Encrypted" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};