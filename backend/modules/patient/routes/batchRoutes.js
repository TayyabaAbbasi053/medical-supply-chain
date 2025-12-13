const express = require("express");
const router = express.Router();

const {
  getBatchDetails,
  getSupplyChainTimeline,
} = require("../controllers/batchController");

const {
  authenticateUser,
  requirePatient
} = require("../../../middleware/authMiddleware");

// Patient must be logged in
router.use(authenticateUser);
router.use(requirePatient);

// ✔ GET batch details by batchNumber
router.get("/batch/:batchNumber", getBatchDetails);

// ✔ GET supply chain timeline by batchNumber
router.get("/batch/:batchNumber/chain", getSupplyChainTimeline);

module.exports = router;
