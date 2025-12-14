require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // Check if admin exists
    const admin = await User.findOne({ email: "sameenumar29@gmail.com" });
    
    if (!admin) {
      console.log("❌ Admin not found. Creating admin...");
      
      const newAdmin = new User({
        name: "Sameen Umar",
        email: "sameenumar29@gmail.com",
        password: "Sam29@123",  // Will be hashed
        role: "Admin",
        securityQuestion: "What is your name?",
        securityAnswer: "Sameen Umar",
        registrationStatus: "active"
      });
      
      await newAdmin.save();
      console.log("✅ Admin created successfully!");
    } else {
      console.log("✅ Admin found:");
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Security Q: ${admin.securityQuestion}`);
      console.log(`   Security A: ${admin.securityAnswer}`);
      console.log(`   Registration Status: ${admin.registrationStatus}`);
      
      // Ensure admin has security question/answer
      if (!admin.securityQuestion || !admin.securityAnswer) {
        console.log("\n⚠️  Missing security question/answer. Updating...");
        admin.securityQuestion = "What is your name?";
        admin.securityAnswer = admin.name;
        await admin.save();
        console.log("✅ Admin updated with security questions");
      }
    }

    mongoose.connection.close();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
