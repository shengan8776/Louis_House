const express = require('express')
const axios = require('axios')
const app = express()
const cors = require('cors');

require('dotenv').config({ path: '../.env' });
app.use(express.json());

const groq_url_chat = 'https://api.groq.com/openai/v1/chat/completions';
const apiKey = process.env.GROQ_API_KEY;
const port = process.env.SERVER_PORT;
const client_port = process.env.CLIENT_PORT;
const system_prompt = "You are a road travel planer. Users will prompt you with destination that they want to go to, you need to plan a route and provide sites worth going to. Please give your response in the following format: {Applebees@Corvallis,OR; Mo seafood@Newport,OR; Gold beach@Gold Beach,OR; etc..} Do not give any sentence response.";

app.use(cors({
  origin: 'http://localhost:' + client_port,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

const prompt_content = "I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."

app.get('/generate-response', async (req, res) => {
  try {
    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
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
    res.json(parseLocationString(response.data.choices[0].message.content));
    //console.log("response.choices[0] is ", response.data.choices[0].message.content)
  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});

function parseLocationString(locationString) {
  // Remove the curly braces and split by semicolon
  const cleanedString = locationString.replace(/[{}]/g, '').trim();
  const locationArray = cleanedString.split(';').filter(location => location.trim() !== '');
  
  // Check if we have at least two locations (origin and destination)
  if (locationArray.length < 2) {
    throw new Error('At least two locations (origin and destination) are required');
  }
  
  // Create the JSON structure
  const result = {
    origin: locationArray[0].trim(),
    destination: locationArray[locationArray.length - 1].trim(),
    waypoints: []
  };
  
  // Add waypoints (everything between origin and destination)
  for (let i = 1; i < locationArray.length - 1; i++) {
    result.waypoints.push({
      location: locationArray[i].trim(),
      stopover: true
    });
  }
  
  return result;
}

// 步驟一：把 Groq 回傳字串格式轉換成可查詢的 query 陣列
function convertLocationStringToQueries(locationString) {
  const cleaned = locationString.replace(/[{}]/g, '').trim();
  return cleaned.split(';')
    .map(item => {
      const [name, city] = item.trim().split('@');
      if (!name || !city) return null;
      return `${name.trim()} ${city.trim()}`;
    })
    .filter(Boolean);
}

// 步驟二：查詢單一地點的 Google 詳細資料
function fetchPlaceDetail(query, mapInstance) {
  return new Promise((resolve, reject) => {
    if (!window.google || !mapInstance) {
      reject('Google Maps not ready');
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapInstance);

    service.textSearch({ query }, (results, status) => {
      if (status !== 'OK' || results.length === 0) {
        reject(`No results for: ${query}`);
        return;
      }

      const placeId = results[0].place_id;

      service.getDetails({ placeId }, (place, status) => {
        if (status !== 'OK') {
          reject(`Failed to get details for: ${query}`);
          return;
        }

        resolve({
          name: place.name,
          address: place.formatted_address,
          rating: place.rating,
          phone: place.formatted_phone_number,
          url: place.url,
          location: place.geometry?.location?.toJSON()
        });
      });
    });
  });
}

// 步驟三：整合全部流程，輸入字串與地圖實例
async function fetchAllPlaceDetailsFromRawString(locationString, mapInstance) {
  const queries = convertLocationStringToQueries(locationString);
  
  const results = await Promise.allSettled(
    queries.map(query => fetchPlaceDetail(query, mapInstance))
  );

  // 過濾成功的結果
  return results
    .filter(res => res.status === 'fulfilled')
    .map(res => res.value);
}


app.post('/chat', async (req, res) => {
  try {
    const user_prompt = req.body.prompt;

    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
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

app.post('/locations', async (req, res) => {
  try {
    const user_prompt = req.body.prompt;

    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
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
    res.json(parseLocationString(response.data.choices[0].message.content));

  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});