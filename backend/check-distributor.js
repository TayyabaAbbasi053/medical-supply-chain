require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function checkDistributorEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all distributors
    const distributors = await User.find({ role: "Distributor" }).select("name email role");
    
    if (distributors.length === 0) {
      console.log("❌ No Distributors found in database");
    } else {
      console.log("🎯 DISTRIBUTOR USERS FOUND:\n");
      distributors.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDistributorEmail();
