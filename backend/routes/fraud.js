const express = require('express');
const router = express.Router();
const fraudService = require('../services/fraudService');

/**
 * Analyze transaction for fraud
 * POST /api/fraud/analyze
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const {
      userId,
      amount,
      currency,
      type,
      ipAddress,
      deviceId,
      location
    } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({
        error: 'userId, amount, and type are required'
      });
    }

    const analysis = await fraudService.checkTransaction({
      userId,
      amount,
      currency,
      type,
      ipAddress,
      deviceId,
      location
    });

    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

/**
 * Get user risk profile
 * GET /api/fraud/risk-profile/:userId
 */
router.get('/risk-profile/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await fraudService.getUserRiskProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * Report suspicious activity
 * POST /api/fraud/report
 */
router.post('/report', async (req, res, next) => {
  try {
    const {
      userId,
      transactionId,
      reason,
      details
    } = req.body;

    if (!userId || !transactionId || !reason) {
      return res.status(400).json({
        error: 'userId, transactionId, and reason are required'
      });
    }

    const report = await fraudService.reportSuspiciousActivity({
      userId,
      transactionId,
      reason,
      details
    });

    res.json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * Get fraud statistics
 * GET /api/fraud/statistics
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await fraudService.getFraudStatistics(startDate, endDate);
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
