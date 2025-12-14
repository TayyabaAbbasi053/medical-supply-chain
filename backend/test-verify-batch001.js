require("dotenv").config();
const mongoose = require("mongoose");
const Batch = require("./models/Batch");
const { generateDataHash } = require("./shared/utils/cryptoUtils");

async function testVerification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find batch001
    const batch = await Batch.findOne({ batchNumber: "batch001" });
    
    if (!batch) {
      console.log("❌ batch001 NOT found");
      process.exit(0);
    }

    console.log("📦 BATCH001 RAW DATA FROM DB:");
    console.log(`   batchNumber: ${batch.batchNumber}`);
    console.log(`   quantityProduced: ${batch.quantityProduced}`);
    console.log(`   medicineName: ${batch.medicineName}`);
    console.log(`   manufacturerName: ${batch.manufacturerName}`);
    console.log(`   manufacturingDate type: ${typeof batch.manufacturingDate}`);
    console.log(`   manufacturingDate value: ${batch.manufacturingDate}`);
    console.log(`   expiryDate type: ${typeof batch.expiryDate}`);
    console.log(`   expiryDate value: ${batch.expiryDate}`);

    // Try the verification WITH DATE NORMALIZATION
    const batchDataForVerification = {
      batchNumber: batch.batchNumber,       
      medicineName: batch.medicineName,
      quantityProduced: batch.quantityProduced, 
      manufacturerName: batch.manufacturerName,
      manufacturingDate: batch.manufacturingDate instanceof Date 
        ? batch.manufacturingDate.toISOString() 
        : batch.manufacturingDate,
      expiryDate: batch.expiryDate instanceof Date 
        ? batch.expiryDate.toISOString() 
        : batch.expiryDate
    };

    console.log("\n🔑 NORMALIZED VERIFICATION DATA:");
    console.log(JSON.stringify(batchDataForVerification, null, 2));

    // Recalculate hash
    const recalculatedHash = generateDataHash(batchDataForVerification);

    console.log("\n📊 HASH COMPARISON:");
    console.log(`   Stored (genesisDataHash):      ${batch.genesisDataHash}`);
    console.log(`   Recalculated (normalized):     ${recalculatedHash}`);
    console.log(`   Match: ${recalculatedHash === batch.genesisDataHash ? "✅ YES!" : "❌ NO"}`);

    if (recalculatedHash !== batch.genesisDataHash) {
      console.log("\n🔍 DEBUG: Let me try without normalization too:");
      const unnormalizedData = {
        batchNumber: batch.batchNumber,       
        medicineName: batch.medicineName,
        quantityProduced: batch.quantityProduced, 
        manufacturerName: batch.manufacturerName,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate
      };
      const unnormalizedHash = generateDataHash(unnormalizedData);
      console.log(`   Unnormalized hash: ${unnormalizedHash}`);
      console.log(`   Match unnormalized: ${unnormalizedHash === batch.genesisDataHash ? "✅ YES!" : "❌ NO"}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testVerification();
