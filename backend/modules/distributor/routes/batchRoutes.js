const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

console.log("✅ Distributor Routes Loaded"); // <--- ADD THIS LINE

// Specific endpoint for receiving goods
router.post('/receive', batchController.receiveBatch);

module.exports = router;