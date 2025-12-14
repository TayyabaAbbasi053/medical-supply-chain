const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const { authenticateUser, requireAdmin } = require("../middleware/authMiddleware");

// Helper: Generate temporary password
function generateTempPassword() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/* ============================================================
   ADMIN REGISTRATION (Only via secret key - one-time setup)
   ============================================================ */
router.post("/register-admin", async (req, res) => {
    try {
        const { name, email, password, securityQuestion, securityAnswer, adminSecret } = req.body;

        // Verify admin secret key
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ error: "Invalid admin secret key" });
        }

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new admin user
        const newAdmin = new User({
            name,
            email,
            password,
            role: "Admin",
            securityQuestion,
            securityAnswer,
            registrationStatus: "active"
        });

        await newAdmin.save();

        res.json({ 
            success: true, 
            message: "Admin registered successfully",
            admin: {
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   ADMIN SIMPLE LOGIN (Email + Password only)
   ============================================================ */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        // Find admin user
        const user = await User.findOne({ email });
        if (!user || user.role !== "Admin") {
            return res.status(401).json({ error: "Invalid credentials or not an admin" });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log("✅ Admin logged in:", email);

        res.json({
            success: true,
            message: "Login successful",
            admin: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   REGISTER USERS (Admin only - requires login)
   ============================================================ */
router.post("/register-user", async (req, res) => {
    try {
        const { name, email, role, password, adminEmail } = req.body;

        console.log("📝 Registration request:", { name, email, role, adminEmail });

        // Validate inputs
        if (!name || !email || !role || !password) {
            return res.status(400).json({ error: "Name, email, role, and password are required" });
        }

        // Check if requester is admin
        if (!adminEmail) {
            return res.status(401).json({ error: "Admin email required. Please login first." });
        }

        const admin = await User.findOne({ email: adminEmail });
        if (!admin || admin.role !== "Admin") {
            return res.status(403).json({ error: "Only admins can register users" });
        }

        // Validate role
        const validRoles = ["Manufacturer", "Distributor", "Pharmacist", "Patient"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
        }

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new user with provided password
        const newUser = new User({
            name,
            email,
            password,  // Will be hashed by pre-save hook in model
            role,
            securityQuestion: "What is your name?",
            securityAnswer: name,
            registrationStatus: "active"
        });

        await newUser.save();
        
        console.log("✅ User registered by admin:", { name, email, role });

        res.status(201).json({
            success: true,
            message: `✅ User ${name} registered successfully with role ${role}!`,
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   BULK REGISTER USERS (Admin only - from CSV/array)
   ============================================================ */
router.post("/bulk-register-users", authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { users } = req.body; // Array of {name, email, role, securityQuestion, securityAnswer}

        if (!Array.isArray(users)) {
            return res.status(400).json({ error: "Users must be an array" });
        }

        const validRoles = ["Manufacturer", "Distributor", "Pharmacist"];
        const results = {
            success: [],
            failed: []
        };

        for (const userData of users) {
            try {
                const { name, email, role, securityQuestion, securityAnswer } = userData;

                // Validate
                if (!name || !email || !role) {
                    results.failed.push({
                        email,
                        reason: "Missing required fields (name, email, role)"
                    });
                    continue;
                }

                if (!validRoles.includes(role)) {
                    results.failed.push({
                        email,
                        reason: "Invalid role"
                    });
                    continue;
                }

                // Check if exists
                const existing = await User.findOne({ email });
                if (existing) {
                    results.failed.push({
                        email,
                        reason: "Email already exists"
                    });
                    continue;
                }

                // Generate temp password
                const tempPassword = generateTempPassword();

                // Create user
                const newUser = new User({
                    name,
                    email,
                    password: tempPassword,
                    role,
                    securityQuestion: securityQuestion || "What is your favorite color?",
                    securityAnswer: securityAnswer || "blue",
                    registeredBy: req.user.email,
                    registrationStatus: "active"
                });

                await newUser.save();

                // Send email
                const emailSubject = `Welcome to Medical Supply Chain - ${role} Account Created`;
                const emailBody = `
                    <h2>Welcome to Medical Supply Chain!</h2>
                    <p>Dear ${name},</p>
                    <p>Your ${role} account has been created.</p>
                    <br/>
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                    <br/>
                    <p><strong>Important:</strong> Please log in and change your password immediately.</p>
                    <p>Login URL: <a href="http://localhost:5173">http://localhost:5173</a></p>
                `;

                try {
                    await sendEmail(email, emailSubject, emailBody);
                } catch (emailError) {
                    console.error(`Email failed for ${email}:`, emailError);
                }

                results.success.push({
                    name,
                    email,
                    role
                });

            } catch (error) {
                results.failed.push({
                    email: userData.email,
                    reason: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Bulk registration completed. ${results.success.length} succeeded, ${results.failed.length} failed`,
            results
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   GET ALL USERS (Admin only)
   ============================================================ */
router.get("/users", authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};

        const users = await User.find(query).select("-password -securityAnswer -otp -otpExpires");
        
        res.json({
            success: true,
            total: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   TEST: VIEW ALL REGISTERED USERS (No auth needed - for testing)
   ============================================================ */
router.get("/test-all-users", async (req, res) => {
    try {
        const users = await User.find().select("name email role createdAt");
        res.json({
            total: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   DELETE USER (Admin only)
   ============================================================ */
router.delete("/users/:email", authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            message: `User ${email} has been deleted`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   UPDATE USER ROLE (Admin only)
   ============================================================ */
router.put("/users/:email/role", authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { email } = req.params;
        const { role } = req.body;

        const validRoles = ["Manufacturer", "Distributor", "Pharmacist", "Patient", "Admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { role },
            { new: true }
        ).select("-password -securityAnswer");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
