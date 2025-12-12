require("dotenv").config();
const mongoose = require("mongoose");
const Batch = require("./models/Batch");

async function fixBatchIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all batches with null batchNumber or batchId
    const deleteResult = await Batch.deleteMany({
      $or: [
        { batchNumber: null },
        { batchNumber: undefined },
        { batchId: null },
        { batchId: undefined }
      ]
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} batches with null values`);

    // Drop the problematic batchId index if it exists
    try {
      await Batch.collection.dropIndex("batchId_1");
      console.log("✅ Dropped batchId_1 index");
    } catch (error) {
      console.log("ℹ️  batchId_1 index doesn't exist (that's fine)");
    }

    // Show current indexes
    const indexes = await Batch.collection.getIndexes();
    console.log("📋 Current indexes:", Object.keys(indexes));

    console.log("\n✅ Database fix completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    process.exit(1);
  }
}

fixBatchIndex();
