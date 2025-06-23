const express = require('express');
const axios = require('axios');

const router = express.Router();

// =================================================================
// STEP 1: Encrypt Aadhaar details
// =================================================================
router.post('/encrypt-aadhaar', async (req, res) => {
  try {
    const { transId, docType, docNumber } = req.body;

    if (!transId || !docType || !docNumber) {
      return res.status(400).json({ error: 'Missing required fields: transId, docType, and docNumber (Aadhaar)' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /encrypt-aadhaar');
      return res.status(200).json({
        requestData: 'i5dx6WDB1n22cjA1+2U0r0GlB+B7NIgd32a59XKFUHWwVURw7eTwMkHNL0A/8ErKFUqExaccWhvUxLpoZCUY2ZY8JrrOp1N0OXLQ2FhTUvo=:Kt9NN6RydzHI3uht6xe1SQ=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_AADHAAR_ENCRYPT_URL || 'https://www.truthscreen.com/v1/apicall/encrypt';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen UAN Lookup encrypt API (Aadhaar):', { apiUrl, transId, docType, docNumber });
    const response = await axios.post(apiUrl, {
      transId,
      docType,
      docNumber
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen UAN Lookup encrypt response (Aadhaar):', { status: response.status, data: response.data.slice(0, 100) });

    const requestData = response.data;
    return res.status(200).json({ requestData });

  } catch (error) {
    console.error('Error in UAN Lookup /encrypt-aadhaar:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to encrypt Aadhaar data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 2: Get UAN using the encrypted Aadhaar data
// =================================================================
router.post('/get-uan-aadhaar', async (req, res) => {
  try {
    const { requestData } = req.body;

    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /get-uan-aadhaar');
      return res.status(200).json({
        responseData: 'sOc1GIT3gCP6zaTQ+ccM3RB0suoYt0MGIl+ohR3XvsTBNvN6rmt3aLbdqk2YASj4PYD59oz+t5W+YEI8a1qUfTR+XJAZfugf/JrgzS6g0++Fu0HyRZhnSXLsdjzwf04r+GO2Ioy+UYrW8ItJa7q+wvRSm55o1aWQOAMqX0axKYkwtBA74yxmM+Jvcspm3flRFVIAFSw+t5qsUDnXdR4h+A==:IJYc6qvyDfWJEwXS7Bggnw=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_AADHAAR_TO_UAN_URL || 'https://www.truthscreen.com/v1/apicall/employment/aadhaar_to_uan';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen aadhaar_to_uan API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, { requestData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen aadhaar_to_uan response:', { status: response.status, data: response.data });

    const { responseData } = response.data;
    if (!responseData) {
      return res.status(500).json({ error: 'Missing responseData from TruthScreen aadhaar_to_uan API' });
    }
    return res.status(200).json({ responseData });

  } catch (error) {
    console.error('Error in UAN Lookup /get-uan-aadhaar:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to get UAN data using Aadhaar';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 3: Decrypt the UAN details (from Aadhaar lookup)
// =================================================================
router.post('/decrypt-aadhaar', async (req, res) => {
  try {
    const { responseData } = req.body;

    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /decrypt-aadhaar');
      return res.status(200).json({
        msg: {
            aadhaar_number: 'XXXXXXXX1016',
            message: 'Success',
            uan_number: '101471811640'
        },
        status: 1,
        transID: '8928323',
        tsTransID: '1I-VLQK-48108681'
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_AADHAAR_DECRYPT_URL || 'https://www.truthscreen.com/v1/apicall/decrypt';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen UAN Lookup decrypt API (Aadhaar):', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, { responseData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen UAN Lookup decrypt response (Aadhaar):', { status: response.status, data: response.data });

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in UAN Lookup /decrypt-aadhaar:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to decrypt UAN details from Aadhaar lookup';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;