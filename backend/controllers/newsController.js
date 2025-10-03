const axios = require('axios');

// Mock news summary generator (to be replaced with actual implementation)
const generateMockNewsSummary = (topic) => {
  return `This is a mock news summary for ${topic}. In a real implementation, this would collect news from various sources on the web, analyze them, and present a neat structural representation of the latest news in this category.`;
};

// AI news summary generator using Cerebras API
const generateAINewsSummary = async (topic) => {
  try {
    const prompt = `Collect the latest news articles about ${topic} from various sources on the web, analyze them, and create a well-structured representation of the news dashboard. Include headlines, brief summaries, publication dates, and categorize the news by importance or sub-topics. Format the response as a JSON object with the following structure:
    
    {
      "topic": "${topic}",
      "summary": "Brief overall summary of news about ${topic}",
      "categories": [
        {
          "name": "Category name (e.g., Top Stories, Technology, Politics)",
          "articles": [
            {
              "headline": "Article headline",
              "summary": "Brief summary of the article (2-3 sentences)",
              "date": "Publication date in DD/MM/YYYY format",
              "source": "News source name"
            }
          ]
        }
      ]
    }
    
    Important: Respond with ONLY the JSON object. Do not include any other text, explanations, or markdown formatting. Make sure to include at least 3 categories with 2-4 articles each. Ensure all articles have real-looking headlines, dates, and sources.`;

    const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
      model: "llama3.1-8b",
      messages: [
        {
          role: "system",
          content: "You are a helpful news dashboard creator. You collect and analyze news from various sources and present them in a well-structured JSON format. Create a dashboard with clear sections for different news categories or importance levels. Respond with ONLY the JSON object, no other text. Make sure to include at least 3 categories with 2-4 articles each. Ensure all articles have real-looking headlines, dates, and sources."
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

    const newsJSON = response.data.choices[0].message.content;
    
    // Try to extract JSON from the response if it's wrapped in markdown code blocks
    let cleanedNewsJSON = newsJSON;
    if (newsJSON.startsWith('```json')) {
      cleanedNewsJSON = newsJSON.substring(7, newsJSON.length - 3);
    } else if (newsJSON.startsWith('```')) {
      cleanedNewsJSON = newsJSON.substring(3, newsJSON.length - 3);
    } else {
      // If there's natural language text before/after the JSON, extract only the JSON portion
      const firstBracket = newsJSON.indexOf('{');
      const lastBracket = newsJSON.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanedNewsJSON = newsJSON.substring(firstBracket, lastBracket + 1);
      }
    }
    
    return JSON.parse(cleanedNewsJSON);
  } catch (error) {
    console.error('Error generating AI news summary:', error.message);
    if (error.response) {
      console.error('API Error response:', error.response.data);
    }
    // If AI fails, fall back to mock summary with structured data
    return {
      topic: topic,
      summary: generateMockNewsSummary(topic),
      categories: [
        {
          name: "Top Stories",
          articles: [
            {
              headline: `Important developments in ${topic}`,
              summary: `Recent developments have shaped the landscape of ${topic}. Experts are analyzing the impact of these changes on the industry.`,
              date: "03/10/2025",
              source: "News Network"
            },
            {
              headline: `New trends emerging in ${topic}`,
              summary: `Several new trends are emerging in the ${topic} field, indicating a shift in how professionals approach this domain.`,
              date: "02/10/2025",
              source: "Global Times"
            }
          ]
        },
        {
          name: "Research & Innovation",
          articles: [
            {
              headline: `Breakthrough research in ${topic} published`,
              summary: `Scientists have published new research findings that could revolutionize our understanding of ${topic} and its applications.`,
              date: "01/10/2025",
              source: "Science Daily"
            },
            {
              headline: `Innovation hub for ${topic} opens in major city`,
              summary: `A new innovation center focused on ${topic} has opened, bringing together experts from around the world to collaborate on future developments.`,
              date: "30/09/2025",
              source: "Tech Journal"
            }
          ]
        }
      ]
    };
  }
};

// Generate news summary
const generateNewsSummary = async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Validate input
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    // Generate news summary using AI
    const summary = await generateAINewsSummary(topic);
    
    res.status(200).json({
      message: 'News summary generated successfully',
      summary: summary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating news summary' });
  }
};

module.exports = {
  generateNewsSummary
};
