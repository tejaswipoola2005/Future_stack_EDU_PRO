import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizMaker() {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submit quiz for scoring
  const submitQuiz = useCallback(async () => {
    if (!quiz) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quizzes/${quiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: null, // For simplicity, we're not implementing user accounts in this version
          answers: selectedOptions 
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setScore(data);
        setQuizCompleted(true);
      } else {
        alert(data.message || 'Error submitting quiz');
      }
    } catch (error) {
      alert('Error connecting to the server');
      console.error(error);
    }
  }, [quiz, selectedOptions]);

  // Timer functionality
  React.useEffect(() => {
    let timer;
    if (timeLeft > 0 && !quizCompleted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quiz) {
      // Time's up, auto-submit quiz
      if (!quizCompleted) {
        submitQuiz();
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizCompleted, quiz, submitQuiz]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle form submission to generate quiz
  const generateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const topic = formData.get('topic');
    const difficulty = formData.get('difficulty');
    const numQuestions = parseInt(formData.get('numQuestions'));
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty, numQuestions }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setQuiz(data.quiz);
        setCurrentQuestion(0);
        setSelectedOptions(new Array(data.quiz.questions.length).fill(null));
        setTimeLeft(data.quiz.questions.length * 60); // 60 seconds per question
        setQuizCompleted(false);
        setScore(null);
      } else {
        alert(data.message || 'Error generating quiz');
      }
    } catch (error) {
      alert('Error connecting to the server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (questionIndex, option) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = option;
    setSelectedOptions(newSelectedOptions);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Restart quiz
  const restartQuiz = () => {
    navigate('/');
  };

  return (
    <div>
      <h1>AI-Powered Quiz Maker</h1>
      
      {!quiz && (
        <div className="quiz-form">
          <h2>Generate a New Quiz</h2>
          <form onSubmit={generateQuiz}>
            <div className="form-group">
              <label htmlFor="topic">Topic:</label>
              <input 
                type="text" 
                id="topic" 
                name="topic" 
                required 
                placeholder="Enter a topic (e.g., History, Science, Geography)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select id="difficulty" name="difficulty" required>
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="numQuestions">Number of Questions:</label>
              <input 
                type="number" 
                id="numQuestions" 
                name="numQuestions" 
                min="1" 
                max="20" 
                required 
                placeholder="Enter number of questions"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </form>
        </div>
      )}
      
      {quiz && !quizCompleted && (
        <div className="quiz-container">
          <div className="quiz-header">
            <h2>{quiz.topic} Quiz</h2>
            <div className="timer">Time Left: {formatTime(timeLeft)}</div>
          </div>
          
          <div className="question-container">
            <div className="question-progress">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            
            <div className="question-text">
              {quiz.questions[currentQuestion].questionText}
            </div>
            
            <div className="options-container">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedOptions[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(currentQuestion, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <div className="navigation-buttons">
              <button onClick={prevQuestion} disabled={currentQuestion === 0}>
                Previous
              </button>
              <button onClick={nextQuestion} disabled={currentQuestion === quiz.questions.length - 1}>
                Next
              </button>
              {currentQuestion === quiz.questions.length - 1 && (
                <button onClick={submitQuiz} className="submit-button">
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {quizCompleted && score && (
        <div className="results-container">
          <h2>Quiz Results</h2>
          <div className="score-display">
            Your Score: {score.score} / {score.totalQuestions}
          </div>
          <div className="percentage-display">
            ({Math.round((score.score / score.totalQuestions) * 100)}%)
          </div>
          
          <div className="answers-review">
            <h3>Review Your Answers</h3>
            {quiz.questions.map((question, index) => (
              <div key={index} className="answer-review-item">
                <p className="review-question">Q{index + 1}: {question.questionText}</p>
                <p className={`review-answer ${score.answers[index].isCorrect ? 'correct' : 'incorrect'}`}>
                  Your answer: {score.answers[index].selectedOption || 'No answer selected'}
                </p>
                {!score.answers[index].isCorrect && (
                  <p className="correct-answer">
                    Correct answer: {question.correctAnswer}
                  </p>
                )}
                <p className="explanation">
                  Explanation: {question.explanation}
                </p>
              </div>
            ))}
          </div>
          
          <button onClick={restartQuiz} className="restart-button">
            Generate Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizMaker;
