const express = require("express");
const router = express.Router();

const {
  publicVerifyBatch,
  publicTrackTimeline
} = require("../controllers/publicController");

// PUBLIC: Verify batch authenticity
router.get("/verify/:batchNumber", publicVerifyBatch);

// PUBLIC: Get full supply chain
router.get("/timeline/:batchNumber", publicTrackTimeline);

module.exports = router;
