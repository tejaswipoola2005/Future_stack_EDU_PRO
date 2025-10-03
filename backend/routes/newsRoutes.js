const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Generate news summary
router.post('/summary', newsController.generateNewsSummary);

module.exports = router;
