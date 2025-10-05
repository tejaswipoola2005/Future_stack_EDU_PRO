const axios = require('axios');

// Test the news summary API
const testNewsSummary = async () => {
  try {
    console.log('Testing news summary API directly...');
    const response = await axios.post('http://localhost:5000/api/news/summary', {
      topic: 'Technology'
    });
    
    console.log('News summary response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if news summary is AI-generated (not mock)
    const summary = response.data.summary;
    const isMock = summary.summary.includes('This is a mock news summary');
    console.log('Is news summary mock-generated?', isMock);
    
    if (!isMock) {
      console.log('SUCCESS: AI news summary generation is working properly!');
    } else {
      console.log('FAILURE: Still using mock news summary');
    }
    
    // Log the full response for debugging
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    // Validate structure
    console.log('\n--- Validating Response Structure ---');
    console.log('Has topic:', !!summary.topic);
    console.log('Has summary:', !!summary.summary);
    console.log('Has categories:', !!summary.categories);
    
    if (summary.categories && Array.isArray(summary.categories)) {
      console.log('Categories count:', summary.categories.length);
      summary.categories.forEach((category, index) => {
        console.log(`Category ${index + 1}: ${category.name}`);
        console.log(`  Has articles array:`, !!category.articles);
        if (category.articles && Array.isArray(category.articles)) {
          console.log(`  Articles count:`, category.articles.length);
          category.articles.forEach((article, artIndex) => {
            console.log(`    Article ${artIndex + 1}:`);
            console.log(`      Has headline:`, !!article.headline);
            console.log(`      Has summary:`, !!article.summary);
            console.log(`      Has date:`, !!article.date);
            console.log(`      Has source:`, !!article.source);
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating news summary:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testNewsSummary();
