const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendOTP } = require("../utils/sendEmail");

// Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ----------------------------------------------------
   REGISTER USER
-----------------------------------------------------*/
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, securityQuestion, securityAnswer } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            securityQuestion,
            securityAnswer
        });

        await newUser.save();

        res.json({ success: true, message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------------------------------------------
   LOGIN — STEP 1 (Password Verification + Send OTP)
-----------------------------------------------------*/
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

        const otp = generateOTP();
        const expiry = Date.now() + 5 * 60 * 1000;

        user.otp = otp;
        user.otpExpires = expiry;
        await user.save();

        await sendOTP(email, otp);

        res.json({
            success: true,
            message: "OTP sent to email",
            email
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------------------------------------------
   VERIFY OTP — STEP 2
-----------------------------------------------------*/
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({
            success: true,
            message: "OTP verified",
            question: user.securityQuestion
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------------------------------------------
   VERIFY SECURITY QUESTION — FINAL STEP
-----------------------------------------------------*/
router.post("/verify-question", async (req, res) => {
    try {
        const { email, answer } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await user.compareAnswer(answer);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect answer" });
        }

        res.json({
            success: true,
            message: "3FA Authentication Successful",
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------------------------------------------
   GET CURRENT USER (🔥 FIX FOR PATIENT NAME)
-----------------------------------------------------*/
router.get("/me", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, error: "Email required" });
        }

        const user = await User.findOne({ email }).select("name email role");

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
