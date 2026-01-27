const https = require('https');

/**
 * Send OTP via SMS using Fast2SMS
 * @param {string} mobileNumber - Mobile number (10 digits)
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
const sendOTP = async (mobileNumber, otp) => {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY?.trim();
    
    // Debug logging
    console.log('[Fast2SMS] API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'none'
    });
    
    // If no API key is configured, log to console (development mode)
    if (!apiKey || apiKey === '') {
      console.log(`[DEV MODE] OTP for ${mobileNumber}: ${otp}`);
      console.log('[DEV MODE] Fast2SMS API key not configured. Set FAST2SMS_API_KEY in .env');
      return true; // Return true in dev mode to allow testing
    }

    // Fast2SMS API endpoint
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    // Prepare OTP message - Keep it short and simple for better delivery
    // Some carriers filter messages with certain words, so keep it minimal
    // Option 1: Simple format (recommended for better delivery)
    const message = process.env.FAST2SMS_MESSAGE_FORMAT === 'simple' 
      ? `Your OTP is ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 15} min.`
      : `Your RojgaAlert OTP is ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 15} minutes.`;
    
    // Fast2SMS route options:
    // 'q' = Quick SMS (no verification needed, works immediately)
    // 'otp' = OTP route (requires website verification in Fast2SMS dashboard)
    // 'dlt' = DLT SMS (requires DLT registration with sender ID and template ID)
    const route = process.env.FAST2SMS_ROUTE || 'q';
    
    // Validate mobile number format (should be 10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      console.error(`[Fast2SMS] Invalid mobile number format: ${mobileNumber}`);
      return false;
    }
    
    // Fast2SMS API parameters
    const params = new URLSearchParams({
      authorization: apiKey,
      message: message,
      language: 'english',
      route: route,
      numbers: mobileNumber, // 10-digit mobile number
    });
    
    console.log(`[Fast2SMS] Sending OTP to: ${mobileNumber}`);
    console.log(`[Fast2SMS] Using route: ${route}`);
    console.log(`[Fast2SMS] Message: ${message}`);
    console.log(`[Fast2SMS] Message length: ${message.length} characters`);

    // Use native fetch (Node.js 18+) or fallback to https module
    let response;
    let data;
    
    if (typeof fetch !== 'undefined') {
      // Node.js 18+ has built-in fetch
      response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      data = await response.json();
    } else {
      // Fallback to https module for older Node.js versions
      data = await new Promise((resolve, reject) => {
        const requestUrl = `${url}?${params.toString()}`;
        const urlObj = new URL(requestUrl);
        
        const options = {
          hostname: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(responseData));
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });
    }

    // Log full response for debugging
    console.log('[Fast2SMS] API Response:', JSON.stringify(data, null, 2));
    
    // Check if request was successful
    if (data.return === true && data.request_id) {
      console.log(`[Fast2SMS] ✅ OTP sent successfully to ${mobileNumber}`);
      console.log(`[Fast2SMS] Request ID: ${data.request_id}`);
      console.log(`[Fast2SMS] Response message: ${Array.isArray(data.message) ? data.message.join(', ') : data.message}`);
      
      // Important: Fast2SMS may show success but SMS might not be delivered due to:
      // 1. Carrier filtering
      // 2. DND (Do Not Disturb) registration
      // 3. Account restrictions
      // 4. Network delays
      console.log(`[Fast2SMS] ⚠️  If SMS not received, check:`);
      console.log(`[Fast2SMS]    - Spam/Junk folder`);
      console.log(`[Fast2SMS]    - DND status on mobile number`);
      console.log(`[Fast2SMS]    - Fast2SMS dashboard for delivery status`);
      console.log(`[Fast2SMS]    - Account balance and restrictions`);
      
      return true;
    } else {
      console.error('[Fast2SMS] ❌ Failed to send OTP:', {
        return: data.return,
        status_code: data.status_code,
        message: data.message || 'Unknown error',
        fullResponse: data
      });
      return false;
    }
  } catch (error) {
    console.error('[Fast2SMS] Error sending OTP:', error.message);
    // In case of error, still log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FALLBACK] OTP for ${mobileNumber}: ${otp}`);
    }
    return false;
  }
};

module.exports = sendOTP;