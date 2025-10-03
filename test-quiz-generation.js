const axios = require('axios');

// Test the quiz generation API
const testQuizGeneration = async () => {
  try {
    console.log('Testing backend API directly...');
    const response = await axios.post('http://localhost:5000/api/quizzes/generate', {
      topic: 'JavaScript',
      difficulty: 'medium',
      numQuestions: 5
    });
    
    console.log('Quiz generation response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if questions are AI-generated (not mock)
    const questions = response.data.quiz.questions;
    const isMock = questions[0].questionText.includes('What is question 1 about');
    console.log('Are questions mock-generated?', isMock);
    
    if (!isMock) {
      console.log('SUCCESS: AI question generation is working properly!');
    } else {
      console.log('FAILURE: Still using mock questions');
    }
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testQuizGeneration();
