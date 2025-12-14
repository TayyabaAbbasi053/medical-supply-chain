const mongoose = require('mongoose');
require('dotenv').config();

const Batch = require('./models/Batch');

async function checkAllBatches() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const batches = await Batch.find().select('batchNumber batchId genesisDataHash createdAt');
    
    console.log('📦 All Batches in Database:\n');
    batches.forEach((batch, i) => {
      const age = new Date() - new Date(batch.createdAt);
      const days = Math.floor(age / (1000 * 60 * 60 * 24));
      console.log(`${i+1}. batchNumber: ${batch.batchNumber || 'N/A'}`);
      console.log(`   batchId: ${batch.batchId || 'N/A'}`);
      console.log(`   hash: ${batch.genesisDataHash ? batch.genesisDataHash.substring(0, 20) + '...' : 'NONE'}`);
      console.log(`   age: ${days} days old`);
      console.log(`   created: ${batch.createdAt}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllBatches();
