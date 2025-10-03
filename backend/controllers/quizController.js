const Quiz = require('../models/Quiz');
const User = require('../models/User');
const axios = require('axios');

// Mock AI question generator (to be replaced with actual AI integration)
const generateMockQuestions = (topic, difficulty, numQuestions) => {
  const questions = [];
  
  for (let i = 1; i <= numQuestions; i++) {
    questions.push({
      questionText: `What is question ${i} about ${topic}?`,
      options: [
        `Option A for ${topic} question ${i}`,
        `Option B for ${topic} question ${i}`,
        `Option C for ${topic} question ${i}`,
        `Option D for ${topic} question ${i}`
      ],
      correctAnswer: `Option A for ${topic} question ${i}`,
      explanation: `This is the explanation for why Option A is correct for question ${i} about ${topic}.`
    });
  }
  
  return questions;
};

// AI question generator using Cerebras API
const generateAIQuestions = async (topic, difficulty, numQuestions) => {
  try {
    const prompt = `Generate ${numQuestions} multiple-choice questions about ${topic} at ${difficulty} difficulty level. Each question should have 4 options (A, B, C, D) with one correct answer. Format the response as a JSON array with each question object having the following properties:
    - questionText: The question text
    - options: An array of 4 options labeled A, B, C, D
    - correctAnswer: The correct option letter (A, B, C, or D)
    - explanation: A detailed explanation of why the answer is correct

    Example format:
    [
      {
        "questionText": "What is the capital of France?",
        "options": ["A) London", "B) Berlin", "C) Paris", "D) Rome"],
        "correctAnswer": "C",
        "explanation": "Paris is the capital of France. It is located in the north-central part of the country."
      }
    ]

    Important: Respond with ONLY the JSON array. Do not include any other text, explanations, or markdown formatting.`;

    console.log('Making request to Cerebras API with topic:', topic, 'difficulty:', difficulty, 'numQuestions:', numQuestions);
    
    const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
      model: "llama3.1-8b",
      messages: [
        {
          role: "system",
          content: "You are a helpful quiz generator assistant. You always respond with valid JSON and follow the exact format requested. Respond with ONLY the JSON array. Do not include any other text, explanations, or markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Cerebras API response status:', response.status);
    console.log('Cerebras API response data:', JSON.stringify(response.data, null, 2));
    
    const questionsJSON = response.data.choices[0].message.content;
    console.log('Questions JSON from API:', questionsJSON);
    
    // Try to extract JSON from the response if it's wrapped in markdown code blocks
    let cleanedQuestionsJSON = questionsJSON;
    if (questionsJSON.startsWith('```json')) {
      cleanedQuestionsJSON = questionsJSON.substring(7, questionsJSON.length - 3);
    } else if (questionsJSON.startsWith('```')) {
      cleanedQuestionsJSON = questionsJSON.substring(3, questionsJSON.length - 3);
    } else {
      // If there's natural language text before/after the JSON, extract only the JSON portion
      const firstBracket = questionsJSON.indexOf('[');
      const lastBracket = questionsJSON.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanedQuestionsJSON = questionsJSON.substring(firstBracket, lastBracket + 1);
      }
    }
    
    console.log('Cleaned questions JSON:', cleanedQuestionsJSON);
    
    const questions = JSON.parse(cleanedQuestionsJSON);
    
    // Validate and format questions
    return questions.map(question => ({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    }));
  } catch (error) {
    console.error('Error generating AI questions:', error.message);
    if (error.response) {
      console.error('API Error response:', JSON.stringify(error.response.data, null, 2));
      console.error('API Error status:', error.response.status);
      console.error('API Error headers:', JSON.stringify(error.response.headers, null, 2));
    }
    // If AI fails, fall back to mock questions
    console.log('Falling back to mock questions');
    return generateMockQuestions(topic, difficulty, numQuestions);
  }
};

// Generate a new quiz using AI
const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;
    
    // Validate input
    if (!topic || !difficulty || !numQuestions) {
      return res.status(400).json({ message: 'Topic, difficulty, and number of questions are required' });
    }
    
    // Generate questions using AI
    const questions = await generateAIQuestions(topic, difficulty, numQuestions);
    
    // Create quiz in database
    const quiz = new Quiz({
      topic,
      difficulty,
      questions
    });
    
    const savedQuiz = await quiz.save();
    
    res.status(201).json({
      message: 'Quiz generated successfully',
      quiz: savedQuiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating quiz' });
  }
};

// Get a quiz by ID
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving quiz' });
  }
};

// Submit quiz answers and calculate score
const submitQuiz = async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Calculate score
    let score = 0;
    const detailedAnswers = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      
      // Handle both cases: when correctAnswer is an index letter (A, B, C, D) or full text
      let isCorrect = false;
      if (question.correctAnswer.length === 1 && ['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        // AI-generated questions use letters A, B, C, D as correctAnswer
        const correctOptionIndex = question.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
        if (correctOptionIndex < question.options.length) {
          isCorrect = userAnswer === question.options[correctOptionIndex];
        }
      } else {
        // Mock questions use full option text as correctAnswer
        isCorrect = userAnswer === question.correctAnswer;
      }
      
      if (isCorrect) {
        score++;
      }
      
      detailedAnswers.push({
        questionId: question._id,
        selectedOption: userAnswer,
        isCorrect: isCorrect
      });
    });
    
    // Save user attempt (if userId provided)
    if (userId) {
      let user = await User.findById(userId);
      
      if (!user) {
        user = new User({
          name: 'Anonymous User',
          email: `user${Date.now()}@quizmaker.com`
        });
      }
      
      user.attempts.push({
        quizId: quiz._id,
        score: score,
        totalQuestions: quiz.questions.length,
        answers: detailedAnswers
      });
      
      await user.save();
    }
    
    res.status(200).json({
      score: score,
      totalQuestions: quiz.questions.length,
      answers: detailedAnswers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};

module.exports = {
  generateQuiz,
  getQuiz,
  submitQuiz
};
