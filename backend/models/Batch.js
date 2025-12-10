const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  role: String,       // Manufacturer, Distributor, Pharmacy
  location: String,
  timestamp: Date,
  signature: String,  // HMAC verification
  previousHash: String, // Links to previous event
  dataHash: String    // Hash of current data
});

const BatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, required: true },
  medicineName: String,
  quantity: Number,
  manufacturerName: String,
  isComplete: { type: Boolean, default: false },
  prescriptionEncrypted: String, // Only added by Pharmacy
  chain: [EventSchema] // The History Array
});

module.exports = mongoose.model("Batch", BatchSchema);