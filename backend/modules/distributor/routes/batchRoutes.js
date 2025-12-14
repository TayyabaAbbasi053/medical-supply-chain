const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// Route to fetch details BEFORE receiving
router.get('/search/:id', batchController.getBatchInfo);

// Route to confirm receipt
router.post('/receive', batchController.receiveBatch);

module.exports = router;