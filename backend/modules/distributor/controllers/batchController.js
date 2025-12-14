const Batch = require('../../../models/Batch');
const { 
  calculateHash, 
  generateChainHash, 
  generateHMACSignature, 
  generateQRCode, 
  validateChain,
  decryptData 
} = require('../../../utils/cryptoUtils');

// --- 1. Get Batch Info (Preview before receiving) ---
exports.getBatchInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by batchNumber (Schema uses batchNumber, not batchId)
    const batch = await Batch.findOne({ batchNumber: id });

    if (!batch) {
        return res.status(404).json({ success: false, error: "Batch not found" });
    }

    // Optional: Decrypt internal details for the Distributor to see
    let decryptedDetails = {};
    try {
        const decryptedString = decryptData(batch.batchDetails);
        decryptedDetails = JSON.parse(decryptedString); // Assuming JSON was stored
    } catch (e) {
        console.log("Decryption of details failed or not JSON");
    }

    // Get current location
    const lastEvent = batch.chain[batch.chain.length - 1];

    res.json({
        success: true,
        batchNumber: batch.batchNumber,
        medicineName: batch.medicineName,
        manufacturerName: batch.manufacturerName,
        quantity: batch.quantityProduced,
        expiryDate: batch.expiryDate,
        currentLocation: lastEvent ? lastEvent.location : "Unknown",
        // Send back a clean status
        status: batch.isComplete ? "Completed" : "In Transit"
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- 2. Receive Batch & Update Chain ---
exports.receiveBatch = async (req, res) => {
  try {
    const { batchId, location, distributorName, phone } = req.body;

    // 1. Find the batch
    const batch = await Batch.findOne({ batchNumber: batchId });
    if (!batch) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }

    // 2. 🛡️ SECURITY: Validate Chain Integrity
    const isChainValid = validateChain(batch.chain);
    if (!isChainValid) {
        console.error(`🚨 TAMPERING DETECTED for Batch ${batchId}`);
        return res.status(403).json({ 
            success: false, 
            error: "CRITICAL: Blockchain integrity compromised. Previous data has been modified." 
        });
    }

    // 3. Get Previous Block Data
    const lastBlock = batch.chain[batch.chain.length - 1];
    const previousChainHash = lastBlock.chainHash;
    const previousDataHashLink = lastBlock.dataHash;

    // 4. Prepare New Event Data
    // We combine distributor details into a string for the 'handlerDetails' field
    const handlerInfo = `${distributorName} | ${phone}`;
    
    const eventTimestamp = new Date();

    const eventPayload = {
      batchNumber: batchId,
      role: "Distributor",
      location: location,
      handlerDetails: handlerInfo,
      timestamp: eventTimestamp,
      previousHash: previousDataHashLink // Linking to previous data
    };

    // 5. 🔐 Cryptographic Operations
    
    // A. Generate Data Hash for this specific event
    const currentDataHash = calculateHash(eventPayload);

    // B. Generate Chain Hash (The "Block" Link)
    // ChainHash = SHA256( PreviousChainHash + CurrentDataHash )
    const currentChainHash = generateChainHash(previousChainHash, currentDataHash);

    // C. Generate HMAC Signature (Proof of Origin)
    const hmacSig = generateHMACSignature({
        batchNumber: batchId,
        dataHash: currentDataHash,
        chainHash: currentChainHash,
        timestamp: eventTimestamp,
        role: "Distributor"
    }, process.env.SECRET_KEY);

    // D. Generate New QR Code (Updating the state of the batch)
    const newQrCode = await generateQRCode(batchId, currentChainHash);

    // 6. Push to Database
    batch.chain.push({
      role: "Distributor",
      location: location,
      timestamp: eventTimestamp,
      previousHash: previousDataHashLink,
      dataHash: currentDataHash,
      chainHash: currentChainHash,
      signature: "VALID", // Placeholder or digital sig
      hmacSignature: hmacSig,
      qrCode: newQrCode,
      handlerDetails: handlerInfo
    });

    await batch.save();
    
    console.log(`✅ Distributor Update Success: ${batchId} at ${location}`);
    res.json({ 
        success: true, 
        message: "Batch received and chain updated", 
        txHash: currentChainHash 
    });

  } catch (error) {
    console.error("❌ Distributor Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};