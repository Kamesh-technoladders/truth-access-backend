const express = require('express');
const axios = require('axios');

const router = express.Router();

// =================================================================
// STEP 1: Encrypt PAN details for verification
// =================================================================
router.post('/encrypt-pan-verification', async (req, res) => {
  try {
    const { transId, docType, docNumber } = req.body;

    if (!transId || !docType || !docNumber) {
      return res.status(400).json({ error: 'Missing required fields: transId, docType, and docNumber (PAN)' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for PAN Verification /encrypt-pan-verification');
      // Mock encrypted string provided by you
      return res.status(200).json({
        requestData: 'aduw2MBDJhcEJm2R7BdjpP5DJfAeCpBsNAxb1pnew6fK8Cek/7NYJgOUk4kArL6qQJXv1NP8wwLqXsKcV8qClJ/XXiq/E0adK7U9+BDsU1p3oFG/Ika4QSIbI5G9sTnwxldulG4peNiEvOYNZlys4/PjbMwi5JQ7MY0hTQtHtus=:pkg8uTwEbXX+HSFi8RObJw=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // Same encryption URL as Aadhaar verification, but distinct process
    const apiUrl = process.env.TRUTHSCREEN_PAN_VERIFY_ENCRYPT_URL || 'https://www.truthscreen.com/InstantSearch/encrypted_string';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen PAN Verification encrypt API:', { apiUrl, transId, docType, docNumber });
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

    console.log('TruthScreen PAN Verification encrypt response:', { status: response.status, data: response.data.slice(0, 100) });

    // This endpoint returns a plain string
    const requestData = response.data;
    return res.status(200).json({ requestData });

  } catch (error) {
    console.error('Error in PAN Verification /encrypt-pan-verification:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to encrypt PAN verification data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 2: Get PAN verification details using the encrypted request data
// =================================================================
router.post('/get-pan-verification-data', async (req, res) => {
  try {
    const { requestData } = req.body;

    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for PAN Verification /get-pan-verification-data');
      // Mock encrypted response data provided by you
      return res.status(200).json({
        responseData: 'blzFLZRCbkoMBBkK0Ty60ecIsbtEPJkK4bZpBIU6F96tvCV47o7jzrzPIlKzdXEXo6hCsXvRouKI71CjdMoc0N2lFv29krY3MiLL3VpcLgEdDx6JfARxqe80p0uxD9wq6VwdkFEVqYBr9Rb+ZuZP9LwDV/erkPKVur2JG+1V48gWWKACDJHvUmeUi9ZnPuAo0032KLnxtKpL0/RmZ13qttwPeAO4A7WexvSDh/ENi28TwKztWK1luY2jK4TBoM0ta5PzHMDcuHnKVPt30XqpOBgPalEFtscW16jRmrz/t02+FfNXmFNbApCgZAOnZl4WVB+PqhzIcLva87fgklgTNuJ+kkbjlZySd21puBn5oOIPsteC8PPn+wW274QZ/wKT:vjg6xt77c0JDxDvfqHf9cw=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // Same endpoint as Aadhaar verification for retrieving data
    const apiUrl = process.env.TRUTHSCREEN_PAN_VERIFY_GET_DATA_URL || 'https://www.truthscreen.com/api/v2.2/idsearch';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen PAN Verification /api/v2.2/idsearch API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, { requestData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen PAN Verification /api/v2.2/idsearch response:', { status: response.status, data: response.data });

    // Assuming this endpoint returns a JSON object with a responseData field as well
    const { responseData } = response.data;
    if (!responseData) {
      return res.status(500).json({ error: 'Missing responseData from TruthScreen PAN Verification API' });
    }
    return res.status(200).json({ responseData });

  } catch (error) {
    console.error('Error in PAN Verification /get-pan-verification-data:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to get PAN verification data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 3: Decrypt the PAN verification details
// =================================================================
router.post('/decrypt-pan-verification', async (req, res) => {
  try {
    const { responseData } = req.body;

    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for PAN Verification /decrypt-pan-verification');
      // Mock decrypted JSON response provided by you
      return res.status(200).json({
        msg: {
          "LastUpdate": "",
          "Name": "KAMESH THIRUMALAISAMY",
          "NameOnTheCard": "KAMESH THIRUMALAISAMY",
          "PanHolderStatusType": "Individual",
          "PanNumber": "EAFPK5159B",
          "STATUS": "Active",
          "StatusDescription": "Existing and Valid",
          "panHolderStatusType": "Individual",
          "source_id": 2
        },
        status: 1
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    // Same decryption URL as Aadhaar verification
    const apiUrl = process.env.TRUTHSCREEN_PAN_VERIFY_DECRYPT_URL || 'https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen PAN Verification decrypt API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, { responseData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen PAN Verification decrypt response:', { status: response.status, data: response.data });

    // This endpoint returns the final JSON object
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in PAN Verification /decrypt-pan-verification:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to decrypt PAN verification details';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;