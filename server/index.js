const express = require('express')
const axios = require('axios')
//const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(express.json());

const groq_url_chat = 'https://api.groq.com/openai/v1/chat/completions';
const apiKey = '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';

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

const prompt_content = "I want to have some icecream!"

app.get('/generate-response', async (req, res) => {
  try {
    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": "You are a warm Dad."
        },
        {
          "role": "user",
          "content": prompt_content
        }]
    };
    
    // Make the API call with authorization header
    const response = await axios.post(
      groq_url_chat,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send the API response back to the client
    res.json(response.data);
    console.log("response.choices[0] is ", response.data.choices[0].message.content)
  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const user_prompt = req.body.prompt;
    //console.log('user_prompt is ', user_prompt)

    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": "You are a warm Dad."
        },
        {
          "role": "user",
          "content": user_prompt
        }]
    };
    
    // Make the API call with authorization header
    const response = await axios.post(
      groq_url_chat,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send the API response back to the client
    res.json(response.data.choices[0].message.content);

  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});
