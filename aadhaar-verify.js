const express = require('express');
const axios = require('axios');

const router = express.Router();

// =================================================================
// STEP 1: Encrypt Aadhaar details for verification
// =================================================================
router.post('/encrypt-aadhaar-verification', async (req, res) => {
  try {
    const { transId, docType, docNumber } = req.body;

    if (!transId || !docType || !docNumber) {
      return res.status(400).json({ error: 'Missing required fields: transId, docType, and docNumber (Aadhaar)' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for Aadhaar Verification /encrypt-aadhaar-verification');
      // This mock response will be the encrypted string from the TruthScreen /InstantSearch/encrypted_string endpoint
      return res.status(200).json({
       requestData: 'ENCRYPTED_AADHAAR_REQ_TRANSID_1XXXX1_DOCTYPE_53_DOCNUMBER_841758451016_FJKELWJFEKLSJFELKJF:' +
                     'JALSKJDFLASDJFLKJASDLKFJ='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // New environment variable for this specific encrypt endpoint
    const apiUrl = process.env.TRUTHSCREEN_AADHAAR_VERIFY_ENCRYPT_URL || 'https://www.truthscreen.com/InstantSearch/encrypted_string';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen Aadhaar Verification encrypt API:', { apiUrl, transId, docType, docNumber });
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

    console.log('TruthScreen Aadhaar Verification encrypt response:', { status: response.status, data: response.data.slice(0, 100) });

    // This endpoint returns a plain string
    const requestData = response.data;
    return res.status(200).json({ requestData });

  } catch (error) {
    console.error('Error in Aadhaar Verification /encrypt-aadhaar-verification:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to encrypt Aadhaar verification data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 2: Get Aadhaar verification details using the encrypted request data
// =================================================================
router.post('/get-aadhaar-verification-data', async (req, res) => {
  try {
    const { requestData } = req.body;

    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for Aadhaar Verification /get-aadhaar-verification-data');
      // This mock response will be the encrypted response data from the /api/v2.2/idsearch endpoint
      return res.status(200).json({
         responseData: 'ENCRYPTED_AADHAAR_RES_TRANSID_1XXXX1_AADHAAR_ACTIVE_GENDER_MALE_STATE_TN:' +
                      'ASDFASDFASDFASDFASDFASDF='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // New environment variable for this specific get data endpoint
    const apiUrl = process.env.TRUTHSCREEN_AADHAAR_VERIFY_GET_DATA_URL || 'https://www.truthscreen.com/api/v2.2/idsearch';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen Aadhaar Verification /api/v2.2/idsearch API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, { requestData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen Aadhaar Verification /api/v2.2/idsearch response:', { status: response.status, data: response.data });

    // Assuming this endpoint returns a JSON object with a responseData field as well
    const { responseData } = response.data;
    if (!responseData) {
      return res.status(500).json({ error: 'Missing responseData from TruthScreen Aadhaar Verification API' });
    }
    return res.status(200).json({ responseData });

  } catch (error) {
    console.error('Error in Aadhaar Verification /get-aadhaar-verification-data:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to get Aadhaar verification data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 3: Decrypt the Aadhaar verification details
// =================================================================
router.post('/decrypt-aadhaar-verification', async (req, res) => {
  try {
    const { responseData } = req.body;

    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for Aadhaar Verification /decrypt-aadhaar-verification');
      return res.status(200).json({
        msg: {
          "Aadhaar Status": "Active",
          "Age Band": "20-30",
          "Gender": "MALE",
          "Mobile": "*******237",
          "State": "Tamil Nadu"
        },
        status: 1,
        tsTransId: "TS-LQC-502989"
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // New environment variable for this specific decrypt endpoint
    const apiUrl = process.env.TRUTHSCREEN_AADHAAR_VERIFY_DECRYPT_URL || 'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen Aadhaar Verification decrypt API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, { responseData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen Aadhaar Verification decrypt response:', { status: response.status, data: response.data });

    // This endpoint returns the final JSON object
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in Aadhaar Verification /decrypt-aadhaar-verification:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to decrypt Aadhaar verification details';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;