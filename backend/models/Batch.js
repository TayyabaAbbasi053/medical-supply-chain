const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  role: String,              // Manufacturer, Distributor, Pharmacy
  location: String,
  timestamp: Date,
  signature: String,         // HMAC verification
  previousHash: String,      // Links to previous event
  dataHash: String,          // Hash of current data
  chainHash: String,         // Hash-chain value
  qrCode: String,            // QR code data URL
  hmacSignature: String      // HMAC signature for the event
});

const BatchSchema = new mongoose.Schema({
  // 🔐 ENCRYPTED FIELDS (Sensitive)
  batchNumber: { type: String, unique: true, required: true },  // Batch ID
  quantityProduced: { type: Number, required: true },           // Quantity
  // strength, distributorId, dispatchDate stored in batchDetails (encrypted)
  
  // 🔓 PUBLIC FIELDS (Unencrypted)
  medicineName: { type: String, required: true },
  manufacturerName: { type: String, required: true },
  manufacturingDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  
  // Encrypted container
  batchDetails: { type: String, required: true },              // AES encrypted: {batchNumber, strength, quantityProduced, distributorId, dispatchDate, manufacturerSignature}
  
  // Security metadata
  isComplete: { type: Boolean, default: false },
  prescriptionEncrypted: String,                                // Only added by Pharmacy
  genesisDataHash: String,                                      // SHA-256 hash of public batch data
  genesisChainHash: String,                                     // Genesis chain hash
  genesisQRCode: String,                                        // Genesis QR code
  encryptionAlgorithm: { type: String, default: "AES-256-ECB" },
  
  // Data classification metadata
  dataClassification: {
    encrypted: [String],
    public: [String]
  },
  
  // Supply chain history
  chain: [EventSchema],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Batch", BatchSchema);