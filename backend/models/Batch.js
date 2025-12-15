const mongoose = require("mongoose");

// 👇 KEY FIX: Added { strict: false }
// This prevents Mongoose from deleting 'quantity' and 'medicineName' from the chain events
const EventSchema = new mongoose.Schema({
  role: String,              // Manufacturer, Distributor, Pharmacy
  location: String,
  timestamp: Date,
  signature: String,         // HMAC verification
  previousHash: String,      // Links to previous event's dataHash
  dataHash: String,          // Hash of current event data
  chainHash: String,         // Hash-chain value
  qrCode: String,            // QR code data URL
  hmacSignature: String,     // HMAC signature for the event
  handlerDetails: String,    // Distributor Name
  contactInfo: String        // Phone Number
}, { strict: false });       // 👈 THIS IS THE MAGIC FIX

const BatchSchema = new mongoose.Schema({
  // 🔐 ENCRYPTED FIELDS (Sensitive)
  batchNumber: { type: String, unique: true, required: true },  // Batch ID
  quantityProduced: { type: Number, required: true },
  
  // 🔓 PUBLIC FIELDS (Unencrypted)
  medicineName: { type: String, required: true },
  manufacturerName: { type: String, required: true },
  manufacturingDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  
  // Encrypted container
  batchDetails: { type: String, required: true }, 
  
  // Security metadata
  isComplete: { type: Boolean, default: false },
  prescriptionEncrypted: String,                  
  genesisDataHash: String,                        
  genesisChainHash: String,                       
  genesisQRCode: String,                          
  encryptionAlgorithm: { type: String, default: "AES-256-ECB" },
  
  // Supply chain history
  chain: [EventSchema],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Batch", BatchSchema);