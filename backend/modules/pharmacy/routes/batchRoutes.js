const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// Route to Preview Details
router.get('/search/:id', batchController.getBatchInfo);

// Route to Dispense
router.post('/dispense', batchController.dispenseMedicine);

module.exports = router;