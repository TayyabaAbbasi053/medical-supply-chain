#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

async function listUsers() {
    try {
        console.log('\n🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!\n');

        const users = await User.find({}, 'name email role createdAt');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📊 TOTAL USERS: ${users.length}`);
        console.log('═══════════════════════════════════════════════════════');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
        } else {
            users.forEach((u, i) => {
                const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
                console.log(`${i + 1}. ${u.name} | ${u.email} | ${u.role} | ${date}`);
            });
        }
        
        console.log('═══════════════════════════════════════════════════════\n');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listUsers();
