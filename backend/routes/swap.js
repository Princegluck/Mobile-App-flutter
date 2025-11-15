const express = require('express');
const router = express.Router();
const swapService = require('../services/swapService');
const fraudService = require('../services/fraudService');

/**
 * Get current crypto-to-fiat exchange rates
 * GET /api/swap/rates
 */
router.get('/rates', async (req, res, next) => {
  try {
    const { cryptoCurrency, fiatCurrency } = req.query;
    
    if (!cryptoCurrency || !fiatCurrency) {
      return res.status(400).json({
        error: 'cryptoCurrency and fiatCurrency are required'
      });
    }

    const rates = await swapService.getExchangeRates(cryptoCurrency, fiatCurrency);
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

/**
 * Calculate swap quote
 * POST /api/swap/quote
 */
router.post('/quote', async (req, res, next) => {
  try {
    const { cryptoCurrency, cryptoAmount, fiatCurrency } = req.body;

    if (!cryptoCurrency || !cryptoAmount || !fiatCurrency) {
      return res.status(400).json({
        error: 'cryptoCurrency, cryptoAmount, and fiatCurrency are required'
      });
    }

    const quote = await swapService.calculateQuote(
      cryptoCurrency,
      cryptoAmount,
      fiatCurrency
    );

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

/**
 * Initialize a swap transaction
 * POST /api/swap/initiate
 */
router.post('/initiate', async (req, res, next) => {
  try {
    const {
      userId,
      cryptoCurrency,
      cryptoAmount,
      fiatCurrency,
      walletAddress,
      recipientDetails
    } = req.body;

    // Validate required fields
    if (!userId || !cryptoCurrency || !cryptoAmount || !fiatCurrency) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Run fraud detection check
    const fraudCheck = await fraudService.checkTransaction({
      userId,
      amount: cryptoAmount,
      currency: cryptoCurrency,
      type: 'crypto_to_fiat'
    });

    if (!fraudCheck.approved) {
      return res.status(403).json({
        error: 'Transaction flagged for review',
        reason: fraudCheck.reason,
        requiresReview: true
      });
    }

    // Initiate swap
    const swapTransaction = await swapService.initiateSwap({
      userId,
      cryptoCurrency,
      cryptoAmount,
      fiatCurrency,
      walletAddress,
      recipientDetails
    });

    res.json(swapTransaction);
  } catch (error) {
    next(error);
  }
});

/**
 * Get swap transaction status
 * GET /api/swap/status/:transactionId
 */
router.get('/status/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const status = await swapService.getTransactionStatus(transactionId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * Confirm crypto deposit
 * POST /api/swap/confirm-deposit
 */
router.post('/confirm-deposit', async (req, res, next) => {
  try {
    const { transactionId, txHash } = req.body;

    if (!transactionId || !txHash) {
      return res.status(400).json({
        error: 'transactionId and txHash are required'
      });
    }

    const result = await swapService.confirmDeposit(transactionId, txHash);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
