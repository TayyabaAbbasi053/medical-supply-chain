require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function checkSpecificEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user with specific email
    const user = await User.findOne({ email: "mharisabdullah113@gmail.com" }).select("name email role");
    
    if (!user) {
      console.log("❌ mharisabdullah113@gmail.com NOT found in database");
    } else {
      console.log("✅ FOUND USER:\n");
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkSpecificEmail();
