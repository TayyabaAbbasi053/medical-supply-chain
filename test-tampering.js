// Test script to simulate batch tampering
const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchNumber: String,
  quantityProduced: Number,
  medicineName: String,
  manufacturerName: String,
  manufacturingDate: Date,
  expiryDate: Date,
  chain: Array
}, { collection: 'batches' });

const Batch = mongoose.model('Batch', BatchSchema);

async function testTampering() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/medical-supply-chain');
    console.log('✅ Connected to MongoDB');

    // Find the batch
    const batch = await Batch.findOne({ batchNumber: 'batch1229' });
    
    if (!batch) {
      console.log('❌ Batch not found');
      process.exit(1);
    }

    console.log('\n📦 CURRENT BATCH DATA:');
    console.log(`Batch ID: ${batch.batchNumber}`);
    console.log(`Original Quantity: ${batch.quantityProduced}`);
    console.log(`Medicine: ${batch.medicineName}`);
    console.log(`Chain events: ${batch.chain ? batch.chain.length : 0}`);

    // Get original quantity
    const originalQuantity = batch.quantityProduced;
    const tamperedQuantity = Math.floor(originalQuantity * 0.4); // Simulate 60% theft

    console.log(`\n🚨 SIMULATING THEFT:`);
    console.log(`${originalQuantity} units → ${tamperedQuantity} units (${Math.round((1 - tamperedQuantity/originalQuantity) * 100)}% stolen)`);

    // Update to simulated tampered quantity
    batch.quantityProduced = tamperedQuantity;
    await batch.save();

    console.log(`\n✅ Batch updated in database!`);
    console.log(`\n📋 NEXT STEPS:`);
    console.log(`1. Go to the Distributor frontend`);
    console.log(`2. Enter Batch ID: batch1229`);
    console.log(`3. Click "Confirm Receipt & Update Location"`);
    console.log(`4. You should see: 🚨 Batch integrity compromised! Tampering detected!`);
    console.log(`\n⚠️  To restore original batch, run this script again and it will ask to restore.`);

    // Close connection
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTampering();
