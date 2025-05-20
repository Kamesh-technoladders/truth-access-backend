const express = require('express');
const axios = require('axios');
const router = express.Router();

// Encryption endpoint for Dual Employment Check
router.post('/dual-encrypt', async (req, res) => {
  try {
    const { transID, docType, uan, employer_name } = req.body;

    // Validate request
    if (!transID || !docType || !uan || !employer_name) {
      return res.status(400).json({ error: 'Missing required fields: transID, docType, uan, employer_name' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /dual-encrypt');
      return res.status(200).json({
        requestData: 'McjBtzT43uJ/TtnCV/sQoz5gis2QuKop17d8Y7z35dLNWTdMvgrr9OXBXM3b7qelgA8tPByUfNsy9Qe5BTIgyeftzpWBi7y/OcWrn3gsEWU2x77r8s/ZLVFva8Y8afBSqEdD2MEKoa5I/+m2Abje3esh5gTYJmxOcm5Ql492zhI=:SMe5JWi7ao2G2FyAvYYHPA=='
      });
    }

    // Load environment variables
    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_ENCRYPT_URL || 'https://www.truthscreen.com/InstantSearch/encrypted_string';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_ENCRYPT_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    // Call TruthScreen API
    console.log('Calling TruthScreen dual-encrypt API:', { apiUrl, transID, docType, uan, employer_name });
    const response = await axios.post(apiUrl, {
      transID,
      docType,
      uan,
      employer_name
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen dual-encrypt response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Handle response
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
    console.error('Error in /dual-encrypt:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : error.response.data,
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

// Verification endpoint for Dual Employment Check
router.post('/dual-verify', async (req, res) => {
  try {
    const { requestData } = req.body;

    // Validate request
    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /dual-verify');
      return res.status(200).json({
        responseData: '+fRVlfZH1mDGKifTam75+675ei2Wx0FnpKGODeY5U4aLjeIMiJDe+mmuBvmmvS45JZd45ux2li/GG+lv+WOOlKvXOvvgEgiQjSIup0BZxrlbkZp8AOzXxNRZrYRJhaWJAvjHNyV/Qe4RW5eUAJe5zKiDlLRiCqaST6ZAXevQjcCVTrpbIC83oOGOrzU4Hza7TCCtZeWI48KdeZJnLdLtR5rzg9geUAGuUGBZYYG7gTM+lsM8K2Nd4p9CILFUTscoUBFgkDaFle4CC2osXe0Jtbjk1xpZBD1TltHDw+uBjNYq4YbpwU0OhPdZCqL2hToqqSgCw+7W+eZIkD4swKPTiueEGclqcAEJYPUcbpdvxm//QiLcoW4y/bsmCidkLsDqMeO4WQf9cj1iY4y6FDjI7CbT4TNCn2VMFwVEoWJ10R/g8JL97FadXtv2JdnRk15t9UKWNAGK5hEFN+yuU6lFFsx6D5QUstlhHgH9GDupfq5B7ovcoPhUXjzeHVid4svWpl4Sk0sK2UCFvEiQNDLmd84uHHZjv65mZMBTB0AIeGV0wRPpSeoAAdgkYYNt5aKzUXxaLdqUYSRAqrOdUZsq/vTb05wK9bS3xyPTcSLbYsX2ich3tcQUFUsILQNbIwES26+wQMY3dgY8V/dNvE2hrvwr5GbP1mnRxuOm+XcC0SfkRNiHYY/BjMBlR7WXbUZa:WQlnoYcpmGW+Q8CHBTnZzw=='
      });
    }

    // Load environment variables
    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_VERIFY_URL || 'https://www.truthscreen.com/api/v2.2/employmentsearch';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_VERIFY_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    // Call TruthScreen API
    console.log('Calling TruthScreen dual-verify API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      requestData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen dual-verify response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON (ignore Content-Type)
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen dual-verify response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Check for responseData
    if (!data.responseData || typeof data.responseData !== 'string') {
      console.error('Missing or invalid responseData in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing or invalid responseData in TruthScreen response' });
    }

    return res.status(200).json({ responseData: data.responseData });
  } catch (error) {
    console.error('Error in /dual-verify:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : error.response.data,
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

// Decryption endpoint for Dual Employment Check

router.post('/dual-decrypt', async (req, res) => {
  try {
    const { responseData } = req.body;

    // Validate request
    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /dual-decrypt');
      return res.status(200).json({
        msg: [
          {
            uan: '101329393114',
            MemberId: 'MHBAN00456650001333232',
            name: 'APARNA GUPTA',
            fatherOrHusbandName: 'RAVINDRA KUMAR',
            EstablishmentName: 'ACCENTURE SOLUTIONS PVT. LTD.',
            Doj: '29-Jan-2021',
            DateOfExitEpf: 'NA',
            Overlapping: 'No'
          },
          {
            uan: '101329393114',
            MemberId: 'PYBOM00100880001851072',
            name: 'APARNA GUPTA',
            fatherOrHusbandName: 'RAVINDRA KUMAR',
            EstablishmentName: 'INFOSYS LIMITED',
            Doj: '16-Jul-2018',
            DateOfExitEpf: '22-Jan-2021',
            Overlapping: 'No'
          }
        ],
        status: 1,
        transId: '1234567',
        tsTransId: 'R0-ACN-155750'
      });
    }

    // Load environment variables
    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_DECRYPT_URL || 'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_DECRYPT_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    // Call TruthScreen API
    console.log('Calling TruthScreen dual-decrypt API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      responseData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen dual-decrypt response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON (ignore Content-Type)
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen dual-decrypt response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Validate response
    if (!data.msg || data.status === undefined || !data.tsTransId) {
      console.error('Missing required fields in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing required fields (msg, status, tsTransId) in TruthScreen response' });
    }

    // Warn if transId is missing
    if (!data.transId) {
      console.warn('transId field missing in TruthScreen dual-decrypt response:', data);
    }

    // Validate that each msg entry has Overlapping field
    for (const entry of data.msg) {
      if (!entry.hasOwnProperty('Overlapping')) {
        console.error('Missing Overlapping field in msg entry:', entry);
        return res.status(500).json({ error: 'Missing Overlapping field in TruthScreen response msg' });
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in /dual-decrypt:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : error.response.data,
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

module.exports = router;