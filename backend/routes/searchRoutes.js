const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search for information about a topic
router.post('/topic', searchController.searchTopic);

module.exports = router;
