const express = require("express");
const router = express.Router();

const batchController = require("../controllers/batchController");

// Verify batch (QR or manual)
router.post("/verify-batch", batchController.verifyBatch);

// Decrypt prescription
router.post("/decrypt", batchController.getPrescription);

module.exports = router;
