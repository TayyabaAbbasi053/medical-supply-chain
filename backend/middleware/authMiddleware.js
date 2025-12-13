const User = require("../models/user");

// Middleware to verify user is logged in and has correct role
const authenticateUser = async (req, res, next) => {
    try {
        // Get user email from multiple places to support different clients
        // Priority: custom header -> query param -> body
        const email = req.headers['x-user-email'] || req.query?.email || req.body?.email;

        if (!email) {
            return res.status(401).json({ error: "Email required for authentication" });
        }

        // Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found. Please login first." });
        }

        // Attach user info to request
        req.user = {
            email: user.email,
            name: user.name,
            role: user.role,
            id: user._id
        };

        next();
    } catch (error) {
        res.status(401).json({ error: "Authentication failed: " + error.message });
    }
};

// Middleware to check if user is a Manufacturer
const requireManufacturer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Please login first" });
    }

    if (req.user.role !== "Manufacturer") {
        return res.status(403).json({ error: "Only manufacturers can access this resource" });
    }

    next();
};

// Middleware to check if user is a Distributor
const requireDistributor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Please login first" });
    }

    if (req.user.role !== "Distributor") {
        return res.status(403).json({ error: "Only distributors can access this resource" });
    }

    next();
};

// Middleware to check if user is a Pharmacist
const requirePharmacist = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Please login first" });
    }

    if (req.user.role !== "Pharmacist") {
        return res.status(403).json({ error: "Only pharmacists can access this resource" });
    }

    next();
};

// Middleware to check if user is a Patient
const requirePatient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Please login first" });
    }

    if (req.user.role !== "Patient") {
        return res.status(403).json({ error: "Only patients can access this resource" });
    }

    next();
};

module.exports = {
    authenticateUser,
    requireManufacturer,
    requireDistributor,
    requirePharmacist,
    requirePatient
};
