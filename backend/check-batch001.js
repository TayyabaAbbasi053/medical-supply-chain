require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => {
  const Batch = require('./models/Batch');
  Batch.findOne({ batchNumber: 'batch001' }).then(batch => {
    if (!batch) {
      console.log('batch001 NOT FOUND');
      mongoose.disconnect();
      return;
    }
    
    console.log('\n=== BATCH001 DETAILS ===\n');
    console.log('batchNumber:', batch.batchNumber);
    console.log('medicineName:', batch.medicineName);
    console.log('manufacturerName:', batch.manufacturerName);
    console.log('manufacturingDate:', batch.manufacturingDate);
    console.log('expiryDate:', batch.expiryDate);
    console.log('genesisDataHash:', batch.genesisDataHash ? 'EXISTS' : 'MISSING ⚠️');
    console.log('chain.length:', batch.chain ? batch.chain.length : 0);
    
    mongoose.disconnect();
  });
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
