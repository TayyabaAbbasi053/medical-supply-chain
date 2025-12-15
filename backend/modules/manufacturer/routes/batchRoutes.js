const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// 👇 CRITICAL: Your frontend is asking for '/create-batch', so we define it here.
router.post('/create-batch', batchController.createBatch);

// Optional: Route to get list
router.get('/all', batchController.getAllBatches);

module.exports = router;