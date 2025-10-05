import React, { useState } from 'react';

function AISearch() {
  const [topic, setTopic] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchTopic = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchResults(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/search/topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
    
      const data = await response.json();
      if (response.ok) {
        // Parse the results if it's a string, otherwise use as is
        if (typeof data.results === 'string') {
          try {
            setSearchResults(JSON.parse(data.results));
          } catch (parseError) {
            // If parsing fails, create a structured object from the string
            setSearchResults({
              topic: topic,
              overview: data.results,
              keyConcepts: [],
              additionalInfo: []
            });
          }
        } else {
          setSearchResults(data.results);
        }
      } else {
        setError(data.message || 'Error searching topic');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setTopic('');
    setSearchResults(null);
    setError('');
  };

  // Function to render the structured educational content in a flow diagram format
  const renderEducationalContent = (content) => {
    if (!content) return null;

    return (
      <div className="structured-learning-content">
        <div className="dashboard-header">
          <h2>Learning About "{content.topic}"</h2>
          <button onClick={clearSearch} className="clear-button">
            Search Another Topic
          </button>
        </div>
        
        {/* Overview section */}
        <div className="learning-section overview-section">
          <h3>Overview</h3>
          <p>{content.overview}</p>
        </div>
        
        {/* Key concepts flow */}
        <div className="learning-section concepts-section">
          <h3>Key Concepts</h3>
          <div className="concepts-flow">
            {content.keyConcepts && content.keyConcepts.map((concept, index) => (
              <div key={index} className="concept-card">
                <h4 className="concept-title">{concept.concept}</h4>
                <div className="concept-details">
                  <p className="concept-definition"><strong>Definition:</strong> {concept.definition}</p>
                  <p className="concept-example"><strong>Example:</strong> {concept.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional information sections */}
        <div className="learning-section additional-info-section">
          <h3>Additional Information</h3>
          <div className="additional-info-flow">
            {content.additionalInfo && content.additionalInfo.map((info, index) => (
              <div key={index} className="info-card">
                <h4 className="info-title">{info.section}</h4>
                <p className="info-content">{info.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ai-search">
      <h1>AI Learning Assistant</h1>
      
      {!searchResults && !loading && (
        <div className="search-form">
          <h2>Learn About Any Topic</h2>
          <form onSubmit={searchTopic}>
            <div className="form-group">
              <label htmlFor="searchTopic">Topic:</label>
              <input 
                type="text" 
                id="searchTopic" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required 
                placeholder="Enter any subject (e.g., Quantum Physics, Renaissance Art, Machine Learning)"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Learn About Topic'}
            </button>
          </form>
        </div>
      )}
      
      {loading && (
        <div className="loading-container">
          <p>Searching the web for information about "{topic}"...</p>
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={clearSearch} className="clear-button">
            Try Again
          </button>
        </div>
      )}
      
      {searchResults && (
        <div className="learning-dashboard">
          {renderEducationalContent(searchResults)}
        </div>
      )}
    </div>
  );
}

export default AISearch;
