const Batch = require('../../../models/Batch');
const { 
  calculateHash, generateChainHash, generateHMACSignature, 
  generateQRCode, validateChain, createCanonicalPayload 
} = require('../../../utils/cryptoUtils');

// --- GET Info (Preview) ---
exports.getBatchInfo = async (req, res) => {
  try {
    const { id } = req.params; // This is batchNumber
    const batch = await Batch.findOne({ batchNumber: id });

    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // Show Manufacturer info to Distributor
    const lastEvent = batch.chain[batch.chain.length - 1];
    
    res.json({
        success: true,
        medicineName: batch.medicineName,
        manufacturerName: batch.manufacturerName,
        quantity: batch.quantityProduced,
        currentLocation: lastEvent.location
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- POST Receive (Update Chain) ---
exports.receiveBatch = async (req, res) => {
  try {
    const { batchId, location, distributorName, phone } = req.body;
    // Note: Frontend sends 'batchId', but it corresponds to 'batchNumber' in DB

    const batch = await Batch.findOne({ batchNumber: batchId });
    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // 1. 🛡️ Validate Tampering
    const isValid = validateChain(batch.chain, batch.batchNumber);
    if (!isValid) return res.status(403).json({ success: false, error: "CRITICAL: Chain Tampered!" });

    // 2. Prepare Data
    const lastBlock = batch.chain[batch.chain.length - 1];
    const eventTimestamp = new Date();
    const handlerInfo = `${distributorName}`; // Storing name

    // 3. Create Canonical Payload (MUST match cryptoUtils structure)
    const rawData = {
        batchNumber: batch.batchNumber,
        role: "Distributor",
        location: location,
        handlerDetails: handlerInfo,
        contactInfo: phone,
        timestamp: eventTimestamp,
        previousHash: lastBlock.dataHash
    };

    // 4. Crypto Ops
    const dataHash = calculateHash(createCanonicalPayload(rawData, batch.batchNumber));
    const chainHash = generateChainHash(lastBlock.chainHash, dataHash);
    
    const hmacSig = generateHMACSignature({
        batchNumber: batch.batchNumber,
        dataHash, chainHash, timestamp: eventTimestamp, role: "Distributor"
    }, process.env.SECRET_KEY);

    const qrCode = await generateQRCode(batch.batchNumber, chainHash);

    // 5. Save
    batch.chain.push({
        role: "Distributor",
        location,
        handlerDetails: handlerInfo,
        contactInfo: phone,
        timestamp: eventTimestamp,
        previousHash: lastBlock.dataHash,
        dataHash,
        chainHash,
        hmacSignature: hmacSig,
        qrCode
    });

    await batch.save();
    res.json({ success: true, message: "Distributor updated successfully", txHash: chainHash });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};