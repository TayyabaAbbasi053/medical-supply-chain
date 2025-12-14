require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function checkEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user with specific email
    const user = await User.findOne({ email: "sameenumar29@gmail.com" });
    
    if (!user) {
      console.log("❌ sameenumar29@gmail.com NOT found");
    } else {
      console.log("✅ FOUND:\n");
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Security Question: ${user.securityQuestion}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkEmail();
