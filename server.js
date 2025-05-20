const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const dualEmploymentRoutes = require('./dual-employment-routes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'username'],
  maxAge: 86400
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Mount Dual Employment Check routes
app.use('/api/dual', dualEmploymentRoutes);

// Encryption endpoint (Basic UAN)
app.post('/encrypt', async (req, res) => {
  try {
    const { transID, docType, uan } = req.body;

    if (!transID || !docType || !uan) {
      return res.status(400).json({ error: 'Missing required fields: transID, docType, uan' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /encrypt');
      return res.status(200).json({
        requestData: 'tpeBEPSDoJkkZp9WnhgcDnU1iSjpYXPw8ZXlWy0xTb5KUMbNxze+OLKbvZ7w+DZamuJm4Yd2EL3YMaTidyuDF1khnju2pFODaxBNvAAiLyE=:Z1u8EBWjAwYm6/qsCMkoZQ=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_ENCRYPT_URL || 'https://www.truthscreen.com/InstantSearch/encrypted_string';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_ENCRYPT_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen encrypt API:', { apiUrl, transID, docType, uan });
    const response = await axios.post(apiUrl, {
      transID,
      docType,
      uan
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen encrypt response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    let requestData;
    const contentType = response.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      const data = response.data;
      if (data.encryptedData) {
        requestData = data.encryptedData;
      } else {
        console.warn('Missing encryptedData in JSON response:', data);
        return res.status(500).json({ error: 'Missing encryptedData in TruthScreen JSON response' });
      }
    } else if (contentType.includes('text') || typeof response.data === 'string') {
      console.log('Received plain string response from TruthScreen:', response.data.slice(0, 100));
      requestData = response.data;
    } else {
      console.error('Unexpected response format from TruthScreen:', { contentType, data: response.data });
      return res.status(500).json({ error: `Invalid response format from TruthScreen: ${contentType}` });
    }

    return res.status(200).json({ requestData });
  } catch (error) {
    console.error('Error in /encrypt:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : response.data,
        headers: error.response.headers
      } : null
    });
    let errorMessage = error.response?.data?.message || error.message || 'Failed to encrypt data';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid TruthScreen username or authentication error';
    } else if (error.response?.status === 400) {
      errorMessage = `Bad request to TruthScreen: ${error.response.data?.message || 'Invalid input'}`;
    }
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Verification endpoint (Basic UAN)
app.post('/verify', async (req, res) => {
  try {
    const { requestData } = req.body;

    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /verify');
      return res.status(200).json({
        responseData: 'XtrjI2Ji7VJYhutJLNxao7vsaXykCWNFJKpPcSOfjq+hSFr5baTwlDpiWxjlmOqINELirncVu2eeONHBEDRsjPvIyFBqzxvub0yfqLQD/FkzAVkluQLNHqFgn8K0U8z9VI2FxwTkVUXVDiT02WqZ/ZKs9r4l8s4+oKu9rpoUTgCRTK/LEhC5OeMvgEEtOBR2UfbmlHSqHuhfaUAIr53M7YIvQJgtbw8e9hYQi6njDZigJQv893BtinH577tNate34sI9kXAfXxEB5pf0OCF+Sucbkk1mmfwXm7bNSu+lOzNTctwgsw0j9Tmoo1Wcwa9FWYlZixkVxDrZA7azz8OEzQ0ml91ChJwU0E+vvZ2janOLejI68tCyrMiSZMXqOOmmHWvd4E7auNdPWjdcwdMenLxhOBcV5GIg39g9mwDtHgpsHsmsYyXPjuWRTRSQcEtPrkeL9s5qXXt/dggH6BzDOAZgGuvJFhK6eVPqstY/QUeI6WcSpwXEJUTXdJ1e9XyRhhMPOUA+xwCRQpQkw95/bmAmbiOVixxDOdvPjh8qAWqbgBlqHNj8VOO2n4F9W86LnJX4UfOd/96T6dEDTxZ2sC1pipBW/NNkfnMaPu4gBruPFiBjZ9aUwUM9MpM/s1AIGYf6//uc95eE8zica4YGiBjxXzcOHSIFZuRuCojNGdfyHvTtITeC0tudZ1qNudkc8VeJvjGfEPoFVy4GPqMfAw==:OLILdBQBxuSI4ttuZAW8OA=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_VERIFY_URL || 'https://www.truthscreen.com/api/v2.2/employmentsearch';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_VERIFY_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen verify API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      requestData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen verify response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen verify response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    if (!data.responseData || typeof data.responseData !== 'string') {
      console.error('Missing or invalid responseData in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing or invalid responseData in TruthScreen response' });
    }

    return res.status(200).json({ responseData: data.responseData });
  } catch (error) {
    console.error('Error in /verify:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? response.data.slice(0, 100) : response.data,
        headers: error.response.headers
      } : null
    });
    let errorMessage = error.response?.data?.message || error.message || 'Failed to verify data';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid TruthScreen username or authentication error';
    } else if (error.response?.status === 400) {
      errorMessage = `Bad request to TruthScreen: ${error.response.data?.message || 'Invalid input'}`;
    }
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Decryption endpoint (Basic UAN)
app.post('/decrypt', async (req, res) => {
  try {
    const { responseData } = req.body;

    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /decrypt');
      return res.status(200).json({
        msg: [
          {
            DateOfExitEpf: 'NA',
            Doj: '13-May-2019',
            EstablishmentName: 'CARELON GLOBAL SOLUTIONS INDIA LLP',
            MemberId: 'BGBNG16813600000012847',
            fatherOrHusbandName: 'MALLAYYA KENDYALA',
            name: 'KENDYALA SHIVA KUMAR',
            uan: '101246220361'
          },
          {
            DateOfExitEpf: '26-Mar-2019',
            Doj: '01-Jul-2017',
            EstablishmentName: 'TATA CONSULTANCY SERVICES LIMITED',
            MemberId: 'MHBAN00484750000989082',
            fatherOrHusbandName: 'MALLAYYA KENDYALA',
            name: 'KENDYALA SHIVA KUMAR',
            uan: '101246220361'
          }
        ],
        status: 1,
        transId: '718d78e3-f7eb-429b-91d3-eca194a6716d',
        tsTransId: 'TS-GLK-810980'
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_DECRYPT_URL || 'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_DECRYPT_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen decrypt API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      responseData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen decrypt response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen decrypt response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    if (!data.msg || data.status === undefined || !data.transId) {
      console.error('Missing required fields in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing required fields (msg, status, transId) in TruthScreen response' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in /decrypt:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data,
        headers: error.response.headers
      } : null
    });
    let errorMessage = error.response?.data?.message || error.message || 'Failed to decrypt data';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid TruthScreen username or authentication error';
    } else if (error.response?.status === 400) {
      errorMessage = `Bad request to TruthScreen: ${error.response.data?.message || 'Invalid input'}`;
    }
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});