// Test script to restore batch to original state for re-testing

require('dotenv').config();
const Batch = require('./models/Batch');
const mongoose = require('mongoose');

async function restoreBatch() {
  console.log('\n🔄 RESTORING BATCH TO ORIGINAL STATE');
  console.log('═════════════════════════════════════\n');

  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medical-supply-chain';
    console.log(`🔗 Connecting to MongoDB...\n`);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the batch
    const batch = await Batch.findOne({ batchNumber: 'batch1229' });
    
    if (!batch) {
      console.log('❌ Batch not found in database');
      process.exit(1);
    }

    console.log('📦 CURRENT BATCH DATA:');
    console.log(`├─ Batch ID: ${batch.batchNumber}`);
    console.log(`├─ Current Quantity: ${batch.quantityProduced}`);
    console.log(`└─ Medicine: ${batch.medicineName}\n`);

    // Restore to 10 units (original)
    batch.quantityProduced = 10;
    await batch.save();

    console.log('✅ Batch restored to original quantity: 10 units\n');

    await mongoose.disconnect();
    console.log('✅ Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreBatch();
