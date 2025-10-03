const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Generate a new quiz
router.post('/generate', quizController.generateQuiz);

// Get a quiz by ID
router.get('/:id', quizController.getQuiz);

// Submit quiz answers and calculate score
router.post('/:id/submit', quizController.submitQuiz);

module.exports = router;
