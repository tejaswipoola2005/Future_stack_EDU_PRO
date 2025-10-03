const axios = require('axios');

// Mock topic search (to be replaced with actual implementation)
const generateMockTopicInfo = (topic) => {
  return {
    topic: topic,
    overview: `This is mock information about ${topic}. In a real implementation, this would search the whole web for information about the topic and provide a comprehensive explanation for students to learn about the subject.`,
    keyConcepts: [
      {
        concept: `Fundamental concept 1 in ${topic}`,
        definition: `This is the definition of the first key concept in ${topic}.`,
        example: `Here's an example to illustrate this concept.`
      },
      {
        concept: `Fundamental concept 2 in ${topic}`,
        definition: `This is the definition of the second key concept in ${topic}.`,
        example: `Here's an example to illustrate this concept.`
      }
    ],
    additionalInfo: [
      {
        section: "Historical Background",
        content: `Information about the history and development of ${topic}.`
      },
      {
        section: "Current Applications",
        content: `How ${topic} is being used today in various fields.`
      }
    ]
  };
};

// AI topic search using Cerebras API
const generateAITopicInfo = async (topic) => {
  try {
    const prompt = `Search the whole web for comprehensive information about ${topic} and provide a detailed explanation that would help a student learn about this subject. Include key concepts, definitions, examples, and any other relevant educational information. Format the response as a JSON object with the following structure:
    
    {
      "topic": "${topic}",
      "overview": "Brief overview of the topic",
      "keyConcepts": [
        {
          "concept": "Name of key concept",
          "definition": "Clear definition of the concept",
          "example": "Practical example to illustrate the concept"
        }
      ],
      "additionalInfo": [
        {
          "section": "Section name (e.g., History, Applications, etc.)",
          "content": "Detailed information about this section"
        }
      ]
    }
    
    Important: Respond with ONLY the JSON object. Do not include any other text, explanations, or markdown formatting. Include at least 3 key concepts and 2 additional information sections.`;

    const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
      model: "llama3.1-8b",
      messages: [
        {
          role: "system",
          content: "You are a helpful educational assistant. You search the web for comprehensive information about topics and provide detailed explanations to help students learn about subjects. Your responses should be educational, well-structured, and easy to understand. Respond with ONLY the JSON object, no other text. Include at least 3 key concepts and 2 additional information sections."
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

    const topicJSON = response.data.choices[0].message.content;
    
    // Try to extract JSON from the response if it's wrapped in markdown code blocks
    let cleanedTopicJSON = topicJSON;
    if (topicJSON.startsWith('```json')) {
      cleanedTopicJSON = topicJSON.substring(7, topicJSON.length - 3);
    } else if (topicJSON.startsWith('```')) {
      cleanedTopicJSON = topicJSON.substring(3, topicJSON.length - 3);
    } else {
      // If there's natural language text before/after the JSON, extract only the JSON portion
      const firstBracket = topicJSON.indexOf('{');
      const lastBracket = topicJSON.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanedTopicJSON = topicJSON.substring(firstBracket, lastBracket + 1);
      }
    }
    
    return JSON.parse(cleanedTopicJSON);
  } catch (error) {
    console.error('Error searching topic with AI:', error.message);
    if (error.response) {
      console.error('API Error response:', error.response.data);
    }
    // If AI fails, fall back to mock information with structured data
    return generateMockTopicInfo(topic);
  }
};

// Search for information about a topic
const searchTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Validate input
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    // Generate topic information using AI
    const results = await generateAITopicInfo(topic);
    
    res.status(200).json({
      message: 'Topic information retrieved successfully',
      results: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching topic' });
  }
};

module.exports = {
  searchTopic
};
