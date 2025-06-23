const express = require('express');
const axios = require('axios');

const router = express.Router();

// =================================================================
// STEP 1: Encrypt Mobile/PAN details
// =================================================================
router.post('/encrypt', async (req, res) => {
  try {
    const { transId, docType, mobile, panNumber } = req.body;

    if (!transId || !docType || (!mobile && !panNumber)) {
      return res.status(400).json({ error: 'Missing required fields: transId, docType, and one of mobile or panNumber' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /encrypt');
      return res.status(200).json({
        requestData: 'EiL6NxA6K4u8Tqg8VanllyKLxqhtm/iNhVhDPKhackPXpd6k6ELyRqGvYkFSBn9xpdyhnS1Y/Up4jbaXtPTgx3ZTLPmUkU5/A+AnjHfaExY=:YizOFjll0clUOaqBWjly/w=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_LOOKUP_ENCRYPT_URL || 'https://www.truthscreen.com/v1/apicall/encrypt';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen UAN Lookup encrypt API:', { apiUrl, transId, docType, mobile, panNumber });
    const response = await axios.post(apiUrl, {
      transId,
      docType,
      mobile: mobile || "", // Ensure we send an empty string if null/undefined
      panNumber: panNumber || ""
    }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen UAN Lookup encrypt response:', { status: response.status, data: response.data.slice(0, 100) });

    // This endpoint returns a plain string
    const requestData = response.data;
    return res.status(200).json({ requestData });

  } catch (error) {
    console.error('Error in UAN Lookup /encrypt:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to encrypt lookup data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 2: Get UAN using the encrypted request data
// =================================================================
router.post('/get-uan', async (req, res) => {
  try {
    const { requestData } = req.body;

    if (!requestData) {
      return res.status(400).json({ error: 'Missing required field: requestData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /get-uan');
      return res.status(200).json({
        responseData: '1eByWMZHi21KgEL82XnbCa6pNdu32MA/LwacSOkFTRJdqqAdWTnxaWniYRG+02l92jQUKEvxpPdGd368UcYI21oNAw02UozkyoGvxtvrxQhj4E64Ll728neOG5ibvI3B7b5fR/eycGfzrgCm4Ulr8ze5wthBK7oDm0rTMYygPCnNd+2m1ZO8Q2MsjIm5rvWf0MZzRzeKiHSD2r7LFaFWbtCasRMvQ2LZX/MBlr53xUGETHq7f/9p+w0DNho9pM6p371V9BRL5Wthd4Tgx3NL2MWyWM4xrBqQc3vN2E/E7qhzq5hlbO3DIDKAoLVXaoxsixRfW76l8mRl+8IF/CIme4avpVSggUeshldhcWxrB1LAFvgGjYb84HYMjXsyUQplz3dWaDP76qR2MSjzaMyh9BO6tY7f5VIBE24UXjK38zIynn2Ws5wHDtA5wf4tqVFGxNMy9g+7QGjGoKeo6zbGQ9kxy1+ZM2NY+MnHdbHeW0he4c7CvGiw0hiWaoAaCvS3FUEYyyReH9Bm4FmU5Y1DoUukqFsXqYpVKXc+HSa/qaw=:54crdFU80dxkdvVAeWtelQ=='
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_LOOKUP_GET_UAN_URL || 'https://www.truthscreen.com/v1/apicall/employment/mobileToUan';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen mobileToUan API:', { apiUrl, requestData: requestData.slice(0, 50) });
    const response = await axios.post(apiUrl, { requestData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen mobileToUan response:', { status: response.status, data: response.data });

    // This endpoint returns a JSON object with a responseData field
    const { responseData } = response.data;
    if (!responseData) {
      return res.status(500).json({ error: 'Missing responseData from TruthScreen mobileToUan API' });
    }
    return res.status(200).json({ responseData });

  } catch (error) {
    console.error('Error in UAN Lookup /get-uan:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to get UAN data';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

// =================================================================
// STEP 3: Decrypt the UAN details
// =================================================================
router.post('/decrypt', async (req, res) => {
  try {
    const { responseData } = req.body;

    if (!responseData) {
      return res.status(400).json({ error: 'Missing required field: responseData' });
    }

    if (process.env.MOCK_TRUTHSCREEN === 'true') {
      console.log('Returning mock response for UAN Lookup /decrypt');
      return res.status(200).json({
        msg: {
          employment_details: [
            {
              date_of_exit: '',
              date_of_joining: '2024-10-01',
              establishment_id: 'TNMAS2319553000',
              establishment_name: 'TECHNOLADDERS SOLUTIONS PRIVATE LIMITED',
              member_id: 'TNMAS23195530000010024',
              uan: '101471811640'
            }
          ],
          uan_details: [
            {
              date_of_birth: '1998-01-28',
              gender: 'MALE',
              name: 'KAMESH THIRUMALAISAMY',
              source: 'mobile',
              uan: '101471811640'
            }
          ]
        },
        status: 1,
        tsTransId: 'TS-OHY-613765'
      });
    }

    const username = process.env.TRUTHSCREEN_USERNAME_TEST;
    const apiUrl = process.env.TRUTHSCREEN_UAN_LOOKUP_DECRYPT_URL || 'https://www.truthscreen.com/v1/apicall/decrypt';

    if (!username) {
        return res.status(500).json({ error: 'Server configuration error: Missing TRUTHSCREEN_USERNAME' });
    }

    console.log('Calling TruthScreen UAN Lookup decrypt API:', { apiUrl, responseData: responseData.slice(0, 50) });
    const response = await axios.post(apiUrl, { responseData }, {
      headers: {
        'Content-Type': 'application/json',
        'username': username
      }
    });

    console.log('TruthScreen UAN Lookup decrypt response:', { status: response.status, data: response.data });
    
    // This endpoint returns the final JSON object
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in UAN Lookup /decrypt:', {
        message: error.message,
        response: error.response ? { status: error.response.status, data: error.response.data } : null
    });
    const errorMessage = error.response?.data?.message || 'Failed to decrypt UAN details';
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;