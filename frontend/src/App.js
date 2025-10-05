import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import QuizMaker from './components/QuizMaker';
import NewsSummary from './components/NewsSummary';
import AISearch from './components/AISearch';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav className="main-nav">
          <h1>AI Learning Platform</h1>
          <ul>
            <li><Link to="/">Quiz Maker</Link></li>
            <li><Link to="/news">News Dashboard</Link></li>
            <li><Link to="/search">AI Search Engine</Link></li>
          </ul>
        </nav>
        
        <Routes>
          <Route path="/" element={<QuizMaker />} />
          <Route path="/news" element={<NewsSummary />} />
          <Route path="/search" element={<AISearch />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;
