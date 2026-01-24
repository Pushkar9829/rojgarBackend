// For now, we'll just log the OTP to console
// In production, integrate with SMS service like Twilio

/**
 * Send OTP via SMS (mock implementation)
 * @param {string} mobileNumber - Mobile number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
const sendOTP = async (mobileNumber, otp) => {
  try {
    // TODO: Integrate with Twilio or other SMS service
    // For development, just log it
    console.log(`OTP for ${mobileNumber}: ${otp}`);
    
    // Uncomment and configure for production with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: `Your RojgaAlert OTP is: ${otp}. Valid for 15 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}`
    });
    */
    
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

module.exports = sendOTP;