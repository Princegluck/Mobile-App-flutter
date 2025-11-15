const express = require('express');
const router = express.Router();
const kycService = require('../services/kycService');

/**
 * Submit KYC information
 * POST /api/kyc/submit
 */
router.post('/submit', async (req, res, next) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      bvn,
      nin,
      phoneNumber,
      address,
      idType,
      idNumber,
      selfieImage,
      idImage
    } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName || !dateOfBirth || !phoneNumber) {
      return res.status(400).json({
        error: 'Missing required KYC fields'
      });
    }

    const kycSubmission = await kycService.submitKYC({
      userId,
      firstName,
      lastName,
      dateOfBirth,
      bvn,
      nin,
      phoneNumber,
      address,
      idType,
      idNumber,
      selfieImage,
      idImage
    });

    res.json(kycSubmission);
  } catch (error) {
    next(error);
  }
});

/**
 * Verify BVN (Bank Verification Number)
 * POST /api/kyc/verify-bvn
 * 
 * NOTE: This is a scaffold endpoint. In production:
 * - Use approved KYC providers (Youverify, Smile Identity, Dojah)
 * - Never store BVN in your database
 * - Always verify on the server-side
 * - Comply with NDPR (Nigeria Data Protection Regulation)
 */
router.post('/verify-bvn', async (req, res, next) => {
  try {
    const { userId, bvn, firstName, lastName, dateOfBirth } = req.body;

    if (!userId || !bvn || !firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        error: 'Missing required fields for BVN verification'
      });
    }

    // Validate BVN format (11 digits)
    if (!/^\d{11}$/.test(bvn)) {
      return res.status(400).json({
        error: 'Invalid BVN format. BVN must be 11 digits'
      });
    }

    const verification = await kycService.verifyBVN({
      userId,
      bvn,
      firstName,
      lastName,
      dateOfBirth
    });

    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * Verify NIN (National Identity Number)
 * POST /api/kyc/verify-nin
 */
router.post('/verify-nin', async (req, res, next) => {
  try {
    const { userId, nin, firstName, lastName } = req.body;

    if (!userId || !nin || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields for NIN verification'
      });
    }

    // Validate NIN format (11 digits)
    if (!/^\d{11}$/.test(nin)) {
      return res.status(400).json({
        error: 'Invalid NIN format. NIN must be 11 digits'
      });
    }

    const verification = await kycService.verifyNIN({
      userId,
      nin,
      firstName,
      lastName
    });

    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * Get KYC status
 * GET /api/kyc/status/:userId
 */
router.get('/status/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const status = await kycService.getKYCStatus(userId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * Get KYC verification levels
 * GET /api/kyc/levels
 */
router.get('/levels', (req, res) => {
  res.json({
    levels: [
      {
        level: 1,
        name: 'Basic',
        requirements: ['Phone number verification', 'Email verification'],
        limits: {
          daily: 50000, // NGN
          monthly: 500000
        }
      },
      {
        level: 2,
        name: 'Standard',
        requirements: ['BVN verification', 'Personal information', 'Address'],
        limits: {
          daily: 500000,
          monthly: 5000000
        }
      },
      {
        level: 3,
        name: 'Enhanced',
        requirements: ['ID verification', 'Selfie verification', 'Proof of address'],
        limits: {
          daily: 5000000,
          monthly: 50000000
        }
      }
    ]
  });
});

module.exports = router;
