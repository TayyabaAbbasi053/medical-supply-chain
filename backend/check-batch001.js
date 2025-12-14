require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => {
  const Batch = require('./models/Batch');
  Batch.findOne({ batchNumber: 'batch001' }).then(batch => {
    if (!batch) {
      console.log('batch001 NOT FOUND');
      mongoose.disconnect();
      process.exit(0);
      return;
    }
    
    console.log('\n=== BATCH001 DETAILS ===\n');
    console.log('batchNumber:', batch.batchNumber);
    console.log('quantityProduced:', batch.quantityProduced);
    console.log('medicineName:', batch.medicineName);
    console.log('manufacturerName:', batch.manufacturerName);
    console.log('manufacturingDate:', batch.manufacturingDate);
    console.log('expiryDate:', batch.expiryDate);
    
    console.log('\n🔐 SECURITY INFO:');
    console.log('genesisDataHash:', batch.genesisDataHash ? batch.genesisDataHash : '❌ MISSING!');
    console.log('genesisChainHash:', batch.genesisChainHash ? batch.genesisChainHash : 'N/A');
    console.log('batchDetails (encrypted):', batch.batchDetails ? '✅ Exists' : '❌ Missing');
    console.log('encryptionAlgorithm:', batch.encryptionAlgorithm);
    
    console.log('\n⛓️  CHAIN:');
    console.log('chain.length:', batch.chain ? batch.chain.length : 0);
    if (batch.chain && batch.chain.length > 0) {
      console.log('First event role:', batch.chain[0].role);
      console.log('First event dataHash:', batch.chain[0].dataHash ? batch.chain[0].dataHash.substring(0, 30) + '...' : 'N/A');
    }
    
    mongoose.disconnect();
    process.exit(0);
  }).catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
    process.exit(1);
  });
}).catch(err => {
  console.error('DB Connection Error:', err);
  process.exit(1);
});
