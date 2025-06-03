const express = require('express');
const axios = require('axios');
const router = express.Router();

// Step 1: Encryption endpoint for Employee Check
router.post('/employee-encrypt-step1', async (req, res) => {
  try {
    const { transID, docType, companyName } = req.body;

    // Validate request
    if (!transID || !docType || !companyName) {
      return res.status(400).json({ error: 'Missing required fields: transID, docType, companyName' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-encrypt-step1');
      return res.status(200).json({
        requestData: '9KOASVG18geA+poUxu1TklnZjhkdwlqHmWVeWjyeXniTUj+p2zOlsNOBzUe2NwlvO95t+c9zS5kcOlqB9MGXnL5MXOcJvLVXfQQtzGCAi/I6uquGytkI+1zolRq4xc/P:KKFJfc/8x4FYXilJV8nCXQ=='
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
    console.log('Calling TruthScreen employee-encrypt-step1 API:', { apiUrl, transID, docType, companyName });
    const response = await axios.post(apiUrl, {
      transID,
      docType,
      companyName
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-encrypt-step1 response:', {
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
    console.error('Error in /employee-encrypt-step1:', {
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

// Step 1: Verification endpoint for Employee Check
router.post('/employee-verify-step1', async (req, res) => {
  try {
    const { requestData } = req.body;

    // Validate request
    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-verify-step1');
      return res.status(200).json({
        responseData: 'aEktyX+P8qctY+Dzj57ikuFpqOcgIpjbTjpLgwQMsyBEgsQ8Eeqb0T8Yi6C+ZDYU3U1r5TH6zpxXjlxbukINtN0HdJLEJgkcicpJhk+5r8WWeqLaBxErJeBmEAE+394VBFRZOp88stwSN8XRm1q3sQDoupTLFnT9Hqyis4IRnwMnxy5ZEl1MnWKpdevCJmnlOz9X+uHk63BGQ40tv21Gjev9WbdvMhpT3bbp9EXF/qH+X/DzuqdyXaDxysQuqjczmLMFKs3SvYZfbXHt3aMpLsypC9CvudN2JYBWGSTOxYiWTYfzfJ/X+wupF3HEXMky0jLOCfZLDnU0Lm9zRschEVLaCmMMbyxHeFErdZrNZuVVgPoNIVjsBA1wugGphmFlzTXXxjmF2+WZ1PPZTAHBzdkcGCNxqYJ1isPQGFLSMe35VCVm4R3CqFLCgP2/io/0M4w1zhAnC5ydRnshN+pkrYmJlUcsbLzjYce8VeO6LsYjUolsXGpRAgEyW1cawIs1rB/SLQEz618CMemS2nvrUQwVUYTGDJf0zagMjneY3Rz/3DA/+Jn+s6wj/WPSh97UBpTYX7lzA6G3QNECoQqoNCg/4GLm8zulD1zvwSacZ3dvOmr5yamU6+cJF2X9kqwF:tssjS14LhiH6+6lBMy7LXA=='
      });
    }

    // Load environment variables
    const username = process.env.TRUTHSCREEN_USERNAME;
    const apiUrl = process.env.TRUTHSCREEN_EMPLOYEE_VERIFY_URL || 'https://www.truthscreen.com/api/v2.2/employeecompany';

    if (!username) {
      console.error('Missing environment variable', {
        TRUTHSCREEN_USERNAME: username ? 'set' : 'missing',
        TRUTHSCREEN_EMPLOYEE_VERIFY_URL: apiUrl ? 'set' : 'missing'
      });
      return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    // Call TruthScreen API
    console.log('Calling TruthScreen employee-verify-step1 API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      requestData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-verify-step1 response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen employee-verify-step1 response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Check for responseData
    if (!data.responseData || typeof data.responseData !== 'string') {
      console.error('Missing or invalid responseData in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing or invalid responseData in TruthScreen response' });
    }

    return res.status(200).json({ responseData: data.responseData });
  } catch (error) {
    console.error('Error in /employee-verify-step1:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : error.response.data,
        headers: error.response.headers
      } : null
    });

    // Handle 400 Bad Request specifically to check for responseData
    if (error.response?.status === 400) {
      let data;
      try {
        data = typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data;
        if (data.responseData && typeof data.responseData === 'string') {
          console.log('Returning responseData despite 400 error for decryption:', data.responseData.slice(0, 100));
          return res.status(200).json({ responseData: data.responseData });
        } else {
          console.error('Missing or invalid responseData in 400 response:', data);
          return res.status(400).json({ error: `Bad request to TruthScreen: ${error.response.data?.message || 'Invalid input'}` });
        }
      } catch (parseError) {
        console.error('Failed to parse TruthScreen 400 response:', parseError.message, error.response.data);
        return res.status(400).json({ error: `Bad request to TruthScreen: Invalid response format` });
      }
    }

    // Handle other errors
    let errorMessage = error.response?.data?.message || error.message || 'Failed to verify data';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid TruthScreen username or authentication error';
    }
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Step 1: Decryption endpoint for Employee Check
router.post('/employee-decrypt-step1', async (req, res) => {
  try {
    const { responseData } = req.body;

    // Validate request
    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-decrypt-step1');
      return res.status(200).json({
        CompanyName: {
          'GRVSP3462186000': 'Tata Consultancy Services',
          'JKJMU2035529000': 'TATA CONSULTANCY SERVICES LIMITED',
          'JKSRN2045502000': 'Tata Consultancy Services C/o: Passport Seva Kendra Boulvard Dalgate Srinagar',
          'KRTVM0022542000': 'TATA CONSULTANCY SERVICES CANTEEN',
          'MHBAN0048475000': 'TATA CONSULTANCY SERVICES LIMITED',
          'PYKRP0045277000': 'TATA CONSULTANCY SERVICES LIMITED'
        },
        secretToken: 'lpPEtkHZ',
        status: 1,
        status_code: 200,
        tsTransactionID: '91-FL0B-72820145'
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
    console.log('Calling TruthScreen employee-decrypt-step1 API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      responseData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-decrypt-step1 response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen employee-decrypt-step1 response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Validate response: Check for successful response first
    if (data.CompanyName && data.secretToken && data.status !== undefined && data.status_code !== undefined && data.tsTransactionID) {
      console.log('Returning successful response with CompanyName:', {
        CompanyName: data.CompanyName,
        status: data.status,
        status_code: data.status_code
      });
      return res.status(200).json(data);
    }

    // Fallback for error response with msg, status, and status_code
    if (data.msg && data.status !== undefined && data.status_code !== undefined) {
      console.log('Returning error response with msg, status, and status_code:', {
        msg: data.msg,
        status: data.status,
        status_code: data.status_code
      });
      return res.status(200).json(data);
    }

    // If neither case is satisfied, return error
    console.error('Missing required fields in TruthScreen response:', data);
    return res.status(500).json({ error: 'Missing required fields in TruthScreen response' });
  } catch (error) {
    console.error('Error in /employee-decrypt-step1:', {
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

// Step 2: Encryption endpoint for Employee Check
router.post('/employee-encrypt-step2', async (req, res) => {
  try {
    const { transID, docType, company_name, person_name, verification_year, tsTransactionID, secretToken } = req.body;

    // Validate request
    if (!transID || !docType || !company_name || !person_name || !verification_year || !tsTransactionID || !secretToken) {
      return res.status(400).json({ error: 'Missing required fields: transID, docType, company_name, person_name, verification_year, tsTransactionID, secretToken' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-encrypt-step2');
      return res.status(200).json({
        requestData: 'ZgV9Lwb7f+4KUkZt847W4nmlyl5EgwVKjiAWzuHruPO0EhGLIJcTf/CCyhr7fj0XUfXpVsGsUkO5lxdWbKBrbAHSnV7Rxff6sSdMSJrRNQzWolkBvxHH2tNJNFMwjcwY5xQUNlI3yLwt6ZRHWrPFJUu1wxBPPfuOxJWS/D7lW7c3A1ZL/708vExtD0wUrDC7thLuzB+i6tfrBjDAjaLybyg6H/jq7oDLJdnNl9slS1ZiSrSk8UQupEeY7hvkVn+Rj9Y/mTV+WsIL+I7NtA8DKIQ/AhUOWIZGptd4UbD778NjrANkP5wPrsivyBVeRj9a9e7r4l/6H77+BbCIeseB5Q==:OTG+NhhUbgbiON+xSos0jw=='
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
    console.log('Calling TruthScreen employee-encrypt-step2 API:', { apiUrl, transID, docType, company_name, person_name, verification_year, tsTransactionID });
    const response = await axios.post(apiUrl, {
      transID,
      docType,
      company_name,
      person_name,
      verification_year,
      tsTransactionID,
      secretToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-encrypt-step2 response:', {
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
    console.error('Error in /employee-encrypt-step2:', {
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

// Step 2: Verification endpoint for Employee Check
router.post('/employee-verify-step2', async (req, res) => {
  try {
    const { requestData } = req.body;

    // Validate request
    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-verify-step2');
      return res.status(200).json({
        responseData: 'CnQZFIGDUYEz5mFDJW3a0ckamCaucxTvJT5p+Hu87rp7dBgagjBc4fl/IB5c1Sn5lBnCxbFXnyEOhN7k8zkK7qejhv6oD0Ac5n8ag2gsxgRa1xSHz233Wad7eI+f2L5ZSULBfoXwmr/wNOLkwKGJ87mktRgGCbWCN5AzjOSj56XHqjuwM6IM+DsCLylxhUKBE6OTX4sQ8cs+bu0uGGQqir+89AeD/ZGEhj4PMWTrhMN+JqSegnmOKSjMyoXjDj4UXNvQZS1z/tp0cgzbv1GMjg==:0uoQdAQf2BTEeYkMgkrJcQ=='
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
    console.log('Calling TruthScreen employee-verify-step2 API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      requestData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-verify-step2 response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen employee-verify-step2 response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Check for responseData
    if (!data.responseData || typeof data.responseData !== 'string') {
      console.error('Missing or invalid responseData in TruthScreen response:', data);
      return res.status(500).json({ error: 'Missing or invalid responseData in TruthScreen response' });
    }

    return res.status(200).json({ responseData: data.responseData });
  } catch (error) {
    console.error('Error in /employee-verify-step2:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: typeof error.response.data === 'string' ? error.response.data.slice(0, 100) : error.response.data,
        headers: error.response.headers
      } : null
    });

    // Handle 400 Bad Request specifically to check for responseData
    if (error.response?.status === 400) {
      let data;
      try {
        data = typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data;
        if (data.responseData && typeof data.responseData === 'string') {
          console.log('Returning responseData despite 400 error for decryption:', data.responseData.slice(0, 100));
          return res.status(200).json({ responseData: data.responseData });
        } else {
          console.error('Missing or invalid responseData in 400 response:', data);
          return res.status(400).json({ error: `Bad request to TruthScreen: ${error.response.data?.message || 'Invalid input'}` });
        }
      } catch (parseError) {
        console.error('Failed to parse TruthScreen 400 response:', parseError.message, error.response.data);
        return res.status(400).json({ error: `Bad request to TruthScreen: Invalid response format` });
      }
    }

    // Handle other errors
    let errorMessage = error.response?.data?.message || error.message || 'Failed to verify data';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid TruthScreen username or authentication error';
    }
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// Step 2: Decryption endpoint for Employee Check
router.post('/employee-decrypt-step2', async (req, res) => {
  try {
    const { responseData } = req.body;

    // Validate request
    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    // Mock response for testing
    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for /employee-decrypt-step2');
      return res.status(200).json({
        msg: {
          emp_search_month: '',
          emp_search_year: '2025',
          employee_names: ['KAMESH THIRUMALAISAMY'],
          employees_count: 1,
          employer_name: 'TECHNOLADDERS SOLUTIONS PRIVATE LIMITED',
          establishment_id: 'TNMAS2319553000',
          status: true,
          status_code: 200
        },
        status: 1,
        tsTransId: '2E-0VJ1-53684628'
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
    console.log('Calling TruthScreen employee-decrypt-step2 API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, {
      responseData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    // Log response details
    console.log('TruthScreen employee-decrypt-step2 response:', {
      status: response.status,
      headers: response.headers,
      data: typeof response.data === 'string' ? response.data.slice(0, 100) : response.data
    });

    // Parse response as JSON
    let data;
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse TruthScreen employee-decrypt-step2 response:', parseError.message, response.data);
      return res.status(500).json({ error: 'Invalid JSON response from TruthScreen' });
    }

    // Validate response: Check for successful response first
    if (data.msg && data.status !== undefined && data.tsTransId &&
        data.msg.employer_name && data.msg.establishment_id && 
        data.msg.status !== undefined && data.msg.status_code !== undefined) {
      console.log('Returning successful response with employer details:', {
        employer_name: data.msg.employer_name,
        establishment_id: data.msg.establishment_id,
        status: data.status
      });
      return res.status(200).json(data);
    }

    // Fallback for error response with msg, status, and tsTransId
    if (data.msg && data.status !== undefined && data.tsTransId) {
      console.log('Returning error response with msg, status, and tsTransId:', {
        msg: data.msg,
        status: data.status,
        tsTransId: data.tsTransId
      });
      return res.status(200).json(data);
    }

    // If neither case is satisfied, return error
    console.error('Missing required fields in TruthScreen response:', data);
    return res.status(500).json({ error: 'Missing required fields in TruthScreen response' });
  } catch (error) {
    console.error('Error in /employee-decrypt-step2:', {
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