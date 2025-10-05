import React, { useState } from 'react';

function NewsSummary() {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/news/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Parse the summary if it's a string, otherwise use as is
        if (typeof data.summary === 'string') {
          try {
            setSummary(JSON.parse(data.summary));
          } catch (parseError) {
            // If parsing fails, create a structured object from the string
            setSummary({
              topic: topic,
              summary: data.summary,
              categories: []
            });
          }
        } else {
          setSummary(data.summary);
        }
      } else {
        setError(data.message || 'Error generating news summary');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSummary = () => {
    setTopic('');
    setSummary(null);
    setError('');
  };

  // Function to render the structured news summary in a flow diagram format
  const renderNewsSummary = (newsData) => {
    if (!newsData) return null;

    return (
      <div className="structured-news-summary">
        <div className="dashboard-header">
          <h2>Latest News on "{newsData.topic}"</h2>
          <button onClick={clearSummary} className="clear-button">
            Generate Another Summary
          </button>
        </div>
        
        {/* Overall summary section */}
        <div className="overall-summary">
          <h3>Overview</h3>
          <p>{newsData.summary}</p>
        </div>
        
        {/* Categories flow */}
        <div className="categories-flow">
          {newsData.categories && newsData.categories.map((category, index) => (
            <div key={index} className="category-card">
              <h3 className="category-title">{category.name}</h3>
              <div className="articles-container">
                {category.articles && category.articles.map((article, articleIndex) => (
                  <div key={articleIndex} className="article-card">
                    <h4 className="article-headline">{article.headline}</h4>
                    <p className="article-summary">{article.summary}</p>
                    <div className="article-meta">
                      <span className="article-date">{article.date}</span>
                      <span className="article-source">{article.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="news-summary">
      <h1>AI News Dashboard</h1>
      
      {!summary && !loading && (
        <div className="news-form">
          <h2>Get Latest News Summary</h2>
          <form onSubmit={generateSummary}>
            <div className="form-group">
              <label htmlFor="newsTopic">Topic:</label>
              <input 
                type="text" 
                id="newsTopic" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required 
                placeholder="Enter a news topic (e.g., Technology, Politics, Sports)"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Generating Summary...' : 'Generate News Summary'}
            </button>
          </form>
        </div>
      )}
      
      {loading && (
        <div className="loading-container">
          <p>Collecting and analyzing latest news...</p>
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={clearSummary} className="clear-button">
            Try Again
          </button>
        </div>
      )}
      
      {summary && (
        <div className="news-dashboard">
          {renderNewsSummary(summary)}
        </div>
      )}
    </div>
  );
}

export default NewsSummary;
