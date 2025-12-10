require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Batch = require("./models/Batch");
const { calculateHash, signData, encryptData, decryptData } = require("./utils/cryptoUtils");

const app = express();

// Middleware
app.use(cors()); // Allow Frontend to talk to Backend
app.use(express.json()); // Allow JSON data

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- API 1: Manufacturer Creates Batch ---
app.post("/api/create-batch", async (req, res) => {
  try {
    const { batchId, medicineName, quantity, manufacturerName } = req.body;

    // Check if batch already exists
    const existing = await Batch.findOne({ batchId });
    if (existing) return res.status(400).json({ error: "Batch ID already exists" });

    // Create Genesis Event
    const eventData = { batchId, medicineName, manufacturerName, timestamp: new Date() };
    const dataHash = calculateHash(eventData);
    const signature = signData(eventData, process.env.SECRET_KEY);

    const newBatch = new Batch({
      batchId,
      medicineName,
      quantity,
      manufacturerName,
      chain: [{
        role: "Manufacturer",
        location: "Factory Output",
        timestamp: new Date(),
        signature,
        previousHash: "GENESIS_BLOCK",
        dataHash
      }]
    });

    await newBatch.save();
    res.json({ success: true, message: "Batch Created", batchId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API 2: Distributor/Pharmacy Updates Chain ---
app.post("/api/update-batch", async (req, res) => {
  try {
    const { batchId, role, location, patientPrescription } = req.body;
    
    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    // Link to previous hash
    const lastBlock = batch.chain[batch.chain.length - 1];
    const previousHash = lastBlock.dataHash;

    const eventData = { batchId, role, location, previousHash, timestamp: new Date() };
    const dataHash = calculateHash(eventData);
    const signature = signData(eventData, process.env.SECRET_KEY);

    const newBlock = {
      role,
      location,
      timestamp: new Date(),
      signature,
      previousHash,
      dataHash
    };

    batch.chain.push(newBlock);

    // If Pharmacy adds a prescription, encrypt it
    if (role === "Pharmacy" && patientPrescription) {
      batch.prescriptionEncrypted = encryptData(patientPrescription);
      batch.isComplete = true;
    }

    await batch.save();
    res.json({ success: true, message: "Chain Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API 3: Get Batch History (For Patient) ---
app.get("/api/batch/:id", async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.id });
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API 4: Decrypt Prescription ---
app.post("/api/decrypt", (req, res) => {
  try {
    const { encryptedText } = req.body;
    const decrypted = decryptData(encryptedText);
    res.json({ decrypted });
  } catch (e) {
    res.status(500).json({ error: "Decryption failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));