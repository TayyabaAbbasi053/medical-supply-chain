const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

console.log('Connecting to:', process.env.MONGO_URI.substring(0, 50) + '...');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('\n✅ Connected to MongoDB\n');
    
    const users = await User.find({}, 'name email role');
    console.log('📋 ALL USERS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name.padEnd(20)} | ${u.email.padEnd(35)} | ${u.role}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${users.length} users\n`);
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Connection Error:', err.message);
    process.exit(1);
  });
