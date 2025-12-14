const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const { generateDataHash } = require('./shared/utils/cryptoUtils');

async function testNewBatchLogic() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate what Manufacturer will send from form (strings)
    const formData = {
      batchNumber: 'test-batch-perfect',
      medicineName: 'paracetamol',
      manufacturingDate: '2024-12-14',  // String from form
      expiryDate: '2025-12-14',          // String from form
      manufacturerName: 'GlaxoSmithKline'
    };

    console.log('📋 FORM DATA (from Manufacturer):', formData);
    console.log('');

    // This is what Manufacturer SHOULD do now (with normalization)
    const publicBatchData = {
      batchNumber: formData.batchNumber,
      medicineName: formData.medicineName,
      manufacturingDate: formData.manufacturingDate instanceof Date 
        ? formData.manufacturingDate.toISOString() 
        : new Date(formData.manufacturingDate).toISOString(),
      expiryDate: formData.expiryDate instanceof Date 
        ? formData.expiryDate.toISOString() 
        : new Date(formData.expiryDate).toISOString(),
      manufacturerName: formData.manufacturerName
    };

    console.log('🔐 NORMALIZED DATA (in generateDataHash):', publicBatchData);
    console.log('');

    // Generate hash BEFORE saving
    const hashAtCreation = generateDataHash(publicBatchData);
    console.log('🔑 Hash generated at creation:', hashAtCreation);
    console.log('');

    // Simulate saving to MongoDB (dates become Date objects)
    const savedData = {
      ...formData,
      manufacturingDate: new Date(formData.manufacturingDate),
      expiryDate: new Date(formData.expiryDate)
    };

    console.log('💾 DATA SAVED TO MONGODB:', {
      batchNumber: savedData.batchNumber,
      medicineName: savedData.medicineName,
      manufacturingDate: savedData.manufacturingDate,
      expiryDate: savedData.expiryDate,
      manufacturerName: savedData.manufacturerName
    });
    console.log('');

    // Now simulate Distributor verification
    const verificationData = {
      batchNumber: savedData.batchNumber,
      medicineName: savedData.medicineName,
      manufacturingDate: savedData.manufacturingDate instanceof Date 
        ? savedData.manufacturingDate.toISOString() 
        : savedData.manufacturingDate,
      expiryDate: savedData.expiryDate instanceof Date 
        ? savedData.expiryDate.toISOString() 
        : savedData.expiryDate,
      manufacturerName: savedData.manufacturerName
    };

    console.log('✅ VERIFICATION DATA (from Distributor):', verificationData);
    console.log('');

    // Verify hash
    const hashAtVerification = generateDataHash(verificationData);
    console.log('🔑 Hash at verification:', hashAtVerification);
    console.log('');

    console.log('🔍 COMPARISON:');
    console.log('Hash at creation:     ', hashAtCreation);
    console.log('Hash at verification: ', hashAtVerification);
    console.log('MATCH?', hashAtCreation === hashAtVerification ? '✅ YES!' : '❌ NO');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testNewBatchLogic();
