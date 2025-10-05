# GenAI Knowledge Companion - Project Summary

## Overview
GenAI Knowledge Companion is an AI-powered educational platform designed to help students gain in-depth domain knowledge through an interactive and real-time learning experience. By combining Generative AI, intelligent search, and real-time news integration, the project ensures that students can:
# Future_stack_EDU_PRO
“An AI-powered learning assistant with real-time quizzes, news, and search to bridge knowledge with real-world insights.”
- **Learn** – Explore topics with an AI-powered search engine
- **Apply** – Test their knowledge with dynamically generated quizzes
- **Reinforce** – Stay updated with real-world news related to the topic

This project acts as a personalized AI mentor, bridging the gap between theoretical learning and practical knowledge application.

## Project Structure

### Frontend (React Application)
```
frontend/quizmaker-frontend/
├── src/
│   ├── components/
│   │   ├── QuizMaker.js      # Quiz generation interface
│   │   ├── NewsSummary.js   # News summary display
│   │   └── AISearch.js      # AI-powered topic search
│   ├── App.js               # Main application component
│   └── index.js             # Entry point
├── .env                     # Environment variables (REACT_APP_BACKEND_URL)
└── package.json             # Frontend dependencies
```

### Backend (Node.js/Express API)
```
backend/
├── server.js                # Main server file
├── config/
│   └── db.js               # Database configuration
├── models/
│   ├── Quiz.js             # Quiz data model
│   └── User.js             # User data model
├── routes/
│   ├── quizRoutes.js       # Quiz API routes
│   ├── newsRoutes.js       # News API routes
│   └── searchRoutes.js     # Search API routes
├── controllers/
│   ├── quizController.js   # Quiz generation logic
│   ├── newsController.js   # News fetching and summarization logic
│   └── searchController.js # AI search logic
├── .env                     # Backend environment variables (API keys, DB connection)
└── package.json             # Backend dependencies
```

### Database
- **MongoDB** - Used for storing generated quizzes and user data

## System Flow

### 1. Quiz Generation Flow
1. User inputs topic, difficulty level, and number of questions in the frontend
2. Frontend sends request to backend API endpoint: `POST /api/quizzes/generate`
3. Backend controller (`quizController.js`) processes the request
4. Backend makes API call to **Cerebras LLM** with structured prompt for quiz generation
5. Cerebras LLM returns quiz questions with options and explanations
6. Backend saves quiz to MongoDB and sends response back to frontend
7. Frontend displays interactive quiz for user to take

### 2. News Summary Flow
1. User inputs topic in the frontend News Summary section
2. Frontend sends request to backend API endpoint: `POST /api/news/summary`
3. Backend controller (`newsController.js`) processes the request
4. Backend makes API call to **Cerebras LLM** with prompt to generate news summary
5. Cerebras LLM returns structured news summary with categorized articles
6. Backend sends response back to frontend
7. Frontend displays news summary in categorized format

### 3. AI Search Flow
1. User inputs any topic/subject in the frontend AI Search section
2. Frontend sends request to backend API endpoint: `POST /api/search/topic`
3. Backend controller (`searchController.js`) processes the request
4. Backend makes API call to **Cerebras LLM** with prompt to generate educational content
5. Cerebras LLM returns structured educational content including:
   - Topic overview
   - Key concepts with definitions and examples
   - Additional information sections
6. Backend sends response back to frontend
7. Frontend displays educational content in structured flow diagram format

## LLM Model Usage

### Cerebras LLM
- **Provider**: Cerebras Systems (leveraging their AI inference API)
- **Model**: llama3.1-8b
- **Usage Locations**:
  1. **Quiz Generation** (`backend/controllers/quizController.js`)
     - Generates multiple-choice questions with options and explanations
     - Adapts content based on topic, difficulty, and number of questions requested
  2. **News Summary** (`backend/controllers/newsController.js`)
     - Creates structured news summaries with categorized articles
     - Generates headlines, summaries, dates, and sources for each article
  3. **AI Search** (`backend/controllers/searchController.js`)
     - Provides comprehensive educational content about any topic
     - Structures information into overviews, key concepts, and additional sections

## Key Features

### 🎯 AI-Generated Quizzes
- Real-time quiz creation based on user-specified topics
- Multiple difficulty levels (easy, medium, hard)
- Variable number of questions per quiz
- Detailed explanations for each answer

### 📰 Real-Time News Integration
- Fetches and summarizes latest news articles about chosen topics
- Categorizes news into structured sections (Top Stories, Trends, Emerging Tech)
- Provides headlines, summaries, dates, and sources for each article

### 🔍 AI-Powered Search Engine
- In-depth exploration of any educational topic
- Structured learning content with clear sections:
  - Overview
  - Key Concepts (with definitions and examples)
  - Additional Information
- Flow diagram format for enhanced learning visualization

### 📊 Knowledge Cycle
A unique 3-step learning approach:
1. **Learn** → AI Search for comprehensive topic understanding
2. **Apply** → AI Quizzes to test knowledge
3. **Reinforce** → News Summaries to connect theory with real-world developments

### ⚡ Interactive Dashboard
- Visually engaging interface for all three learning tools
- Responsive design that works across devices
- Clean, intuitive user experience

## Technical Implementation Details

### Backend API Endpoints
- `POST /api/quizzes/generate` - Generate new quiz
- `GET /api/quizzes/:id` - Retrieve specific quiz
- `POST /api/news/summary` - Generate news summary
- `POST /api/search/topic` - Search for educational content

### Environment Configuration
- Frontend connects to backend via `REACT_APP_BACKEND_URL` environment variable
- Backend uses `.env` file for:
  - Cerebras API key (`CEREBRAS_API_KEY`)
  - MongoDB connection string (`MONGO_URI`)
  - Server port (`PORT`)

### Data Models
- **Quiz Model**: Stores topic, difficulty, questions array with text/options/answers
- **User Model**: (Available for future expansion) Stores user preferences and history

## Testing and Validation
- Custom test scripts for each service:
  - `test-quiz-generation.js` - Validates quiz generation
  - `test-news-summary.js` - Validates news summary creation
  - `test-ai-search.js` - Validates AI search functionality
- All services confirmed working without Docker using localhost connections

## Deployment Flexibility
- Supports both Docker-based deployment (using docker-compose) and local development
- Environment variables easily configurable for different deployment scenarios
- Modular structure allows for independent scaling of services
