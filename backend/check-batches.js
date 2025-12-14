require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => {
  const Batch = require('./models/Batch');
  Batch.find({}).select('batchNumber').then(batches => {
    console.log('\n=== ALL BATCH NUMBERS IN DATABASE ===\n');
    batches.forEach(b => console.log('  ' + b.batchNumber));
    console.log('\nTotal:', batches.length);
    
    // Check if batch001 exists
    const hasBatch001 = batches.some(b => b.batchNumber === 'batch001');
    console.log('\nbatch001 exists?', hasBatch001 ? 'YES ✅' : 'NO ❌');
    
    mongoose.disconnect();
  });
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
