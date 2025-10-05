const axios = require('axios');

const testBackendAPI = async () => {
  try {
    console.log('Testing backend API directly...');
    const response = await axios.post('http://localhost:5000/api/search/topic', {
      topic: 'Machine Learning'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Backend API response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error calling backend API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testBackendAPI();
