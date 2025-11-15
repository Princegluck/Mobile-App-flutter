const axios = require('axios');

/**
 * Twilio Service - Global SMS provider
 * Documentation: https://www.twilio.com/docs/sms
 */

const TWILIO_BASE_URL = 'https://api.twilio.com/2010-04-01';

/**
 * Send SMS
 */
async function sendSMS(phoneNumber, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await axios.post(
      `${TWILIO_BASE_URL}/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        To: formattedNumber,
        From: fromNumber,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      status: 'success',
      messageId: response.data.sid,
      to: response.data.to,
      from: response.data.from,
      messageStatus: response.data.status,
      data: response.data
    };
  } catch (error) {
    console.error('Twilio send SMS error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send SMS via Twilio');
  }
}

/**
 * Send verification code
 */
async function sendVerificationCode(phoneNumber) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      // Fallback to regular SMS if Verify service not configured
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await sendSMS(phoneNumber, `Your verification code is: ${code}`);
      return {
        status: 'success',
        code, // In production, don't return the code
        method: 'fallback'
      };
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      new URLSearchParams({
        To: formattedNumber,
        Channel: 'sms'
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      status: 'success',
      verificationSid: response.data.sid,
      to: response.data.to,
      channel: response.data.channel,
      verificationStatus: response.data.status
    };
  } catch (error) {
    console.error('Twilio send verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send verification code');
  }
}

/**
 * Verify code
 */
async function verifyCode(phoneNumber, code) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      throw new Error('Twilio Verify service not configured');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    const response = await axios.post(
      `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
      new URLSearchParams({
        To: formattedNumber,
        Code: code
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      status: 'success',
      valid: response.data.status === 'approved',
      verificationStatus: response.data.status
    };
  } catch (error) {
    console.error('Twilio verify code error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify code');
  }
}

/**
 * Get message status
 */
async function getMessageStatus(messageId) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    const response = await axios.get(
      `${TWILIO_BASE_URL}/Accounts/${accountSid}/Messages/${messageId}.json`,
      {
        auth: {
          username: accountSid,
          password: authToken
        }
      }
    );

    return {
      status: 'success',
      messageId: response.data.sid,
      messageStatus: response.data.status,
      to: response.data.to,
      from: response.data.from,
      dateSent: response.data.date_sent,
      errorCode: response.data.error_code,
      errorMessage: response.data.error_message
    };
  } catch (error) {
    console.error('Twilio get status error:', error.response?.data || error.message);
    throw new Error('Failed to get message status');
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace with 234 (Nigeria country code)
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

module.exports = {
  sendSMS,
  sendVerificationCode,
  verifyCode,
  getMessageStatus
};
