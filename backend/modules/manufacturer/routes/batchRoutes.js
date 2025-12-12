const express = require("express");
const batchController = require("../controllers/batchController");
const { authenticateUser, requireManufacturer } = require("../../../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication and Manufacturer role
router.use(authenticateUser);
router.use(requireManufacturer);

// POST /api/modules/manufacturer/create-batch
router.post("/create-batch", batchController.createBatch);

// GET /api/modules/manufacturer/batch/:batchId
router.get("/batch/:batchId", batchController.getBatch);

// POST /api/modules/manufacturer/verify-batch
router.post("/verify-batch", batchController.verifyBatch);

module.exports = router;
