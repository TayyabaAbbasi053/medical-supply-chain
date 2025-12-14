require("dotenv").config();
const mongoose = require("mongoose");
const Batch = require("./models/Batch");

async function debugBatch001() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find batch001 with all fields
    const batch = await Batch.findOne({ batchNumber: "batch001" }).lean();
    
    if (!batch) {
      console.log("❌ batch001 NOT found");
      process.exit(0);
    }

    console.log("📋 ALL BATCH001 FIELDS:");
    console.log(JSON.stringify(batch, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

debugBatch001();
