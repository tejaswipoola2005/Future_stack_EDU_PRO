const axios = require('axios');

// Test the AI search API
const testAISearch = async () => {
  try {
    console.log('Testing AI search API directly...');
    const response = await axios.post('http://localhost:5000/api/search/topic', {
      topic: 'Machine Learning'
    });
    
    console.log('AI search response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if search results are AI-generated (not mock)
    const results = response.data.results;
    const isMock = results.overview.includes('This is mock information');
    console.log('Is search result mock-generated?', isMock);
    
    if (!isMock) {
      console.log('SUCCESS: AI search functionality is working properly!');
    } else {
      console.log('FAILURE: Still using mock search results');
    }
  } catch (error) {
    console.error('Error searching topic:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testAISearch();
