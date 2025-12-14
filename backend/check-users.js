const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("\n✅ Connected to MongoDB\n");

        const count = await User.countDocuments();
        console.log(`📊 Total Users in Database: ${count}\n`);

        const users = await User.find().select("name email role createdAt");
        
        console.log("📋 USER LIST:");
        console.log("═══════════════════════════════════════════════════════");
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name} | ${u.email} | ${u.role}`);
        });
        console.log("═══════════════════════════════════════════════════════\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

checkUsers();
