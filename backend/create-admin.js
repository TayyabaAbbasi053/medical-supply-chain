const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        // Check if admin already exists
        const existing = await User.findOne({ email: "admin@hospital.com" });
        if (existing) {
            console.log("❌ Admin already exists");
            process.exit(0);
        }

        // Create admin account
        const admin = new User({
            name: "Hospital Admin",
            email: "admin@hospital.com",
            password: "Admin123",  // Will be hashed by model
            role: "Admin",
            securityQuestion: "What is your name?",
            securityAnswer: "Admin",
            registrationStatus: "active"
        });

        await admin.save();
        console.log("✅ Admin created successfully!");
        console.log("   Email: admin@hospital.com");
        console.log("   Password: Admin123");
        console.log("   Role: Admin");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

createAdmin();
