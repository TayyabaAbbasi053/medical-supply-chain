const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// USER SCHEMA
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true,
    enum: ["Distributor", "Manufacturer", "Pharmacist", "Patient"]
  },

  securityQuestion: {
    type: String,
    required: true
  },

  securityAnswer: {
    type: String,
    required: true
  },

  otp: {
    type: String,
    default: null
  },

  otpExpires: {
    type: Date,
    default: null
  }

}, { timestamps: true });


// 🔥 HASH PASSWORD + SECURITY ANSWER ALWAYS BEFORE SAVE
UserSchema.pre("save", async function () {

  // Hash password if changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Hash security answer if changed
  if (this.isModified("securityAnswer")) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
  }
});


// 🔍 COMPARE PASSWORD
UserSchema.methods.comparePassword = function (inputPass) {
  return bcrypt.compare(inputPass, this.password);
};

// 🔍 COMPARE SECURITY ANSWER
UserSchema.methods.compareAnswer = function (inputAnswer) {
  return bcrypt.compare(inputAnswer, this.securityAnswer);
};

module.exports = mongoose.model("User", UserSchema);
