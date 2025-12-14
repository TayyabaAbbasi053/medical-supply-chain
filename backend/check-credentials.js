require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function checkCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all distributors
    const distributors = await User.find({ role: "Distributor" });
    
    console.log("🎯 DISTRIBUTOR CREDENTIALS:\n");
    distributors.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Security Question: ${user.securityQuestion}`);
      console.log(`   Security Answer: ${user.securityAnswer}`);
      console.log(`   Password: [HASHED - ${user.password.substring(0, 20)}...]`);
      console.log(`   (Passwords are bcrypt-hashed, cannot be retrieved)\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkCredentials();
