require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

console.log("---- 🚀 STARTING SERVER ----");

const app = express();
app.use(cors());
app.use(express.json());

// --- Debugging Imports ---
try {
    console.log("1. Loading Auth Routes...");
    const authRoutes = require('./routes/auth');
    app.use("/api/auth", authRoutes);
    
    console.log("2. Loading Manufacturer Routes...");
    const manufacturerRoutes = require('./modules/manufacturer/routes/batchRoutes');
    app.use("/api/modules/manufacturer", manufacturerRoutes);

    console.log("3. Loading Distributor Routes...");
    const distributorRoutes = require('./modules/distributor/routes/batchRoutes');
    app.use('/api/distributor', distributorRoutes);
    console.log("✅ hyDistributor Routes Loaded Successfully into App");

    console.log("4. Loading Pharmacy Routes...");
    const pharmacyRoutes = require('./modules/pharmacy/routes/batchRoutes');
    app.use('/api/pharmacy', pharmacyRoutes);
    console.log("✅ Pharmacy Routes Loaded Successfully into App");


} catch (error) {
    console.error("❌ CRITICAL ERROR LOADING ROUTES:", error.message);
    // This will tell us if the folder name is wrong
}

// --- Database ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// --- Legacy Routes (Just so app doesn't crash) ---
const { calculateHash, signData, decryptData } = require("./utils/cryptoUtils");
const Batch = require("./models/Batch");

app.post("/api/create-batch", async (req, res) => { /* ... legacy code ... */ });
app.get("/api/batch/:id", async (req, res) => {
    try {
        const batch = await Batch.findOne({ batchId: req.params.id });
        if (!batch) return res.status(404).json({ error: "Batch not found" });
        res.json(batch);
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post("/api/decrypt", (req, res) => { /* ... legacy code ... */ });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));