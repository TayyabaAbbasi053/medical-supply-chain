const mongoose = require('mongoose');
require('dotenv').config();

const Batch = require('./models/Batch');

async function checkBatch1231() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const batch = await Batch.findOne({ batchNumber: 'batch1231' });
    
    if (!batch) {
      console.log('❌ batch1231 not found');
      process.exit(0);
    }

    console.log('📦 BATCH1231 DETAILS:\n');
    console.log('batchNumber:', batch.batchNumber);
    console.log('medicineName:', batch.medicineName);
    console.log('manufacturerName:', batch.manufacturerName);
    
    console.log('\n📅 DATE FIELDS:');
    console.log('manufacturingDate type:', typeof batch.manufacturingDate);
    console.log('manufacturingDate value:', batch.manufacturingDate);
    console.log('manufacturingDate constructor:', batch.manufacturingDate.constructor.name);
    console.log('manufacturingDate ISO:', batch.manufacturingDate.toISOString());
    
    console.log('\nexpiryDate type:', typeof batch.expiryDate);
    console.log('expiryDate value:', batch.expiryDate);
    console.log('expiryDate constructor:', batch.expiryDate.constructor.name);
    console.log('expiryDate ISO:', batch.expiryDate.toISOString());
    
    console.log('\n🔐 HASH:');
    console.log('genesisDataHash:', batch.genesisDataHash);
    
    console.log('\n🧪 TEST HASH RECALCULATION:');
    const CryptoJS = require('crypto-js');
    
    // Test what Manufacturer should have sent
    const testData = {
      batchNumber: batch.batchNumber,
      medicineName: batch.medicineName,
      manufacturingDate: batch.manufacturingDate.toISOString(),
      expiryDate: batch.expiryDate.toISOString(),
      manufacturerName: batch.manufacturerName
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    const testHash = CryptoJS.SHA256(JSON.stringify(testData)).toString();
    console.log('Recalculated hash:', testHash);
    console.log('Stored hash:      ', batch.genesisDataHash);
    console.log('MATCH?', testHash === batch.genesisDataHash);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBatch1231();
