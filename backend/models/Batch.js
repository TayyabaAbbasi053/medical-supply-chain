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
  batchId: { type: String, unique: true, required: true },
  medicineName: String,
  quantity: Number,
  manufacturerName: String,
  manufacturerId: String,    // Reference to manufacturer user ID
  expiryDate: Date,
  manufacturingDate: Date,
  batchDetails: String,      // AES encrypted batch details
  isComplete: { type: Boolean, default: false },
  prescriptionEncrypted: String, // Only added by Pharmacy
  genesisDataHash: String,   // SHA-256 hash of initial batch data
  genesisChainHash: String,  // Genesis chain hash
  genesisQRCode: String,     // Genesis QR code
  chain: [EventSchema],      // The History Array
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Batch", BatchSchema);