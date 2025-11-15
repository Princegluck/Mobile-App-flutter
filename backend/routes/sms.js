const express = require('express');
const router = express.Router();
const termiiService = require('../services/termiiService');
const twilioService = require('../services/twilioService');

/**
 * Send SMS verification code
 * POST /api/sms/send-code
 */
router.post('/send-code', async (req, res, next) => {
  try {
    const { phoneNumber, provider } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'phoneNumber is required'
      });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (in production, use Redis or database)
    // This is a simplified example
    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[phoneNumber] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    let result;
    if (provider === 'twilio') {
      result = await twilioService.sendSMS(
        phoneNumber,
        `Your verification code is: ${code}. Valid for 10 minutes.`
      );
    } else {
      // Default to Termii
      result = await termiiService.sendSMS(
        phoneNumber,
        `Your verification code is: ${code}. Valid for 10 minutes.`
      );
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      messageId: result.messageId,
      expiresIn: 600 // seconds
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify SMS code
 * POST /api/sms/verify-code
 */
router.post('/verify-code', (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({
        error: 'phoneNumber and code are required'
      });
    }

    global.verificationCodes = global.verificationCodes || {};
    const stored = global.verificationCodes[phoneNumber];

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this number'
      });
    }

    if (Date.now() > stored.expiresAt) {
      delete global.verificationCodes[phoneNumber];
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Code is valid
    delete global.verificationCodes[phoneNumber];

    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send transaction notification
 * POST /api/sms/notify
 */
router.post('/notify', async (req, res, next) => {
  try {
    const { phoneNumber, message, provider } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'phoneNumber and message are required'
      });
    }

    let result;
    if (provider === 'twilio') {
      result = await twilioService.sendSMS(phoneNumber, message);
    } else {
      result = await termiiService.sendSMS(phoneNumber, message);
    }

    res.json({
      success: true,
      message: 'Notification sent',
      messageId: result.messageId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get SMS delivery status
 * GET /api/sms/status/:messageId
 */
router.get('/status/:messageId', async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { provider } = req.query;

    let status;
    if (provider === 'twilio') {
      status = await twilioService.getMessageStatus(messageId);
    } else {
      status = await termiiService.getMessageStatus(messageId);
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
