const axios = require('axios');

/**
 * Termii Service - SMS provider for Africa
 * Documentation: https://developers.termii.com/
 */

const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

/**
 * Send SMS
 */
async function sendSMS(phoneNumber, message) {
  try {
    // Ensure phone number is in international format
    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await axios.post(
      `${TERMII_BASE_URL}/sms/send`,
      {
        to: formattedNumber,
        from: process.env.TERMII_SENDER_ID || 'YourApp',
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      messageId: response.data.message_id,
      balance: response.data.balance,
      data: response.data
    };
  } catch (error) {
    console.error('Termii send SMS error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send SMS');
  }
}

/**
 * Send OTP
 */
async function sendOTP(phoneNumber, pinLength = 6) {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await axios.post(
      `${TERMII_BASE_URL}/sms/otp/send`,
      {
        api_key: process.env.TERMII_API_KEY,
        message_type: 'NUMERIC',
        to: formattedNumber,
        from: process.env.TERMII_SENDER_ID || 'YourApp',
        channel: 'generic',
        pin_attempts: 3,
        pin_time_to_live: 10, // minutes
        pin_length: pinLength,
        pin_placeholder: '< 1234 >',
        message_text: 'Your verification code is < 1234 >. Valid for 10 minutes.',
        pin_type: 'NUMERIC'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      pinId: response.data.pinId,
      to: response.data.to,
      smsStatus: response.data.smsStatus
    };
  } catch (error) {
    console.error('Termii send OTP error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send OTP');
  }
}

/**
 * Verify OTP
 */
async function verifyOTP(pinId, pin) {
  try {
    const response = await axios.post(
      `${TERMII_BASE_URL}/sms/otp/verify`,
      {
        api_key: process.env.TERMII_API_KEY,
        pin_id: pinId,
        pin: pin
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      verified: response.data.verified,
      msisdn: response.data.msisdn
    };
  } catch (error) {
    console.error('Termii verify OTP error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify OTP');
  }
}

/**
 * Get message status
 */
async function getMessageStatus(messageId) {
  try {
    // Note: Termii doesn't have a direct status endpoint
    // This is a placeholder implementation
    return {
      status: 'success',
      messageId,
      deliveryStatus: 'delivered'
    };
  } catch (error) {
    console.error('Termii get status error:', error.message);
    throw new Error('Failed to get message status');
  }
}

/**
 * Get account balance
 */
async function getBalance() {
  try {
    const response = await axios.get(
      `${TERMII_BASE_URL}/get-balance?api_key=${process.env.TERMII_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      balance: response.data.balance,
      currency: response.data.currency
    };
  } catch (error) {
    console.error('Termii get balance error:', error.response?.data || error.message);
    throw new Error('Failed to get account balance');
  }
}

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace with 234 (Nigeria country code)
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  // Add + prefix if not present
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  
  return cleaned;
}

module.exports = {
  sendSMS,
  sendOTP,
  verifyOTP,
  getMessageStatus,
  getBalance
};
