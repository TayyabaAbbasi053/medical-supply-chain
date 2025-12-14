// Test script to simulate batch tampering by directly accessing the database
// Run this from the backend directory to use the same MongoDB connection

require('dotenv').config();
const Batch = require('./models/Batch');
const mongoose = require('mongoose');

async function testTampering() {
  console.log('\n🔧 BATCH TAMPERING SIMULATION');
  console.log('═════════════════════════════════════\n');

  try {
    // Connect to MongoDB using the same URI as the backend
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
    console.log(`├─ Quantity: ${batch.quantityProduced}`);
    console.log(`├─ Medicine: ${batch.medicineName}`);
    console.log(`└─ Chain events: ${batch.chain ? batch.chain.length : 0}\n`);

    // Get original quantity
    const originalQuantity = batch.quantityProduced;
    const tamperedQuantity = Math.floor(originalQuantity * 0.4); // Simulate 60% theft

    console.log('🚨 SIMULATING THEFT IN TRANSIT:');
    console.log(`├─ Original Quantity: ${originalQuantity} units`);
    console.log(`├─ Tampered Quantity: ${tamperedQuantity} units`);
    console.log(`└─ Amount Stolen: ${originalQuantity - tamperedQuantity} units (${Math.round((1 - tamperedQuantity/originalQuantity) * 100)}%)\n`);

    // Update to simulated tampered quantity
    batch.quantityProduced = tamperedQuantity;
    await batch.save();

    console.log('✅ Batch updated in database!\n');
    console.log('📋 VERIFICATION TEST - NEXT STEPS:\n');
    console.log('1. Go to Distributor frontend at http://localhost:5174/distributor');
    console.log('2. Enter Batch ID: batch1229');
    console.log('3. Click "Confirm Receipt & Update Location"');
    console.log('4. ⚠️  You should see error: "🚨 Batch integrity compromised!"');
    console.log('\n✨ This proves the verification is working!\n');

    // Close connection
    await mongoose.disconnect();
    console.log('✅ Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTampering();
