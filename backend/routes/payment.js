const express = require('express');
const router = express.Router();
const paystackService = require('../services/paystackService');
const flutterwaveService = require('../services/flutterwaveService');

/**
 * Initialize payment (Paystack)
 * POST /api/payment/paystack/initialize
 */
router.post('/paystack/initialize', async (req, res, next) => {
  try {
    const { email, amount, currency, metadata, reference } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        error: 'email and amount are required'
      });
    }

    const payment = await paystackService.initializePayment({
      email,
      amount,
      currency: currency || 'NGN',
      metadata,
      reference
    });

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

/**
 * Verify payment (Paystack)
 * GET /api/payment/paystack/verify/:reference
 */
router.get('/paystack/verify/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;
    const verification = await paystackService.verifyPayment(reference);
    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * Initialize payment (Flutterwave)
 * POST /api/payment/flutterwave/initialize
 */
router.post('/flutterwave/initialize', async (req, res, next) => {
  try {
    const {
      email,
      phone_number,
      name,
      amount,
      currency,
      tx_ref,
      redirect_url,
      meta
    } = req.body;

    if (!email || !amount || !tx_ref) {
      return res.status(400).json({
        error: 'email, amount, and tx_ref are required'
      });
    }

    const payment = await flutterwaveService.initializePayment({
      email,
      phone_number,
      name,
      amount,
      currency: currency || 'NGN',
      tx_ref,
      redirect_url,
      meta
    });

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

/**
 * Verify payment (Flutterwave)
 * GET /api/payment/flutterwave/verify/:transactionId
 */
router.get('/flutterwave/verify/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const verification = await flutterwaveService.verifyPayment(transactionId);
    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * Paystack webhook for payment notifications
 * POST /api/payment/paystack/webhook
 */
router.post('/paystack/webhook', async (req, res, next) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    
    // Verify webhook signature
    const isValid = paystackService.verifyWebhookSignature(
      JSON.stringify(req.body),
      hash
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Handle different event types
    await paystackService.handleWebhookEvent(event);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

/**
 * Flutterwave webhook for payment notifications
 * POST /api/payment/flutterwave/webhook
 */
router.post('/flutterwave/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['verif-hash'];
    
    // Verify webhook signature
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Handle webhook event
    await flutterwaveService.handleWebhookEvent(event);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

/**
 * Create payout (Bank transfer)
 * POST /api/payment/payout
 */
router.post('/payout', async (req, res, next) => {
  try {
    const {
      provider, // 'paystack' or 'flutterwave'
      amount,
      recipientCode,
      accountNumber,
      accountName,
      bankCode,
      currency,
      reference,
      narration
    } = req.body;

    if (!provider || !amount) {
      return res.status(400).json({
        error: 'provider and amount are required'
      });
    }

    let payout;
    if (provider === 'paystack') {
      payout = await paystackService.createTransfer({
        amount,
        recipientCode,
        reference,
        reason: narration
      });
    } else if (provider === 'flutterwave') {
      payout = await flutterwaveService.createTransfer({
        amount,
        accountNumber,
        accountName,
        bankCode,
        currency: currency || 'NGN',
        reference,
        narration
      });
    } else {
      return res.status(400).json({
        error: 'Invalid payment provider'
      });
    }

    res.json(payout);
  } catch (error) {
    next(error);
  }
});

/**
 * Get list of Nigerian banks
 * GET /api/payment/banks
 */
router.get('/banks', async (req, res, next) => {
  try {
    const { provider } = req.query;
    
    let banks;
    if (provider === 'flutterwave') {
      banks = await flutterwaveService.getBanks();
    } else {
      // Default to Paystack
      banks = await paystackService.getBanks();
    }

    res.json(banks);
  } catch (error) {
    next(error);
  }
});

/**
 * Resolve bank account details
 * GET /api/payment/resolve-account
 */
router.get('/resolve-account', async (req, res, next) => {
  try {
    const { accountNumber, bankCode, provider } = req.query;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        error: 'accountNumber and bankCode are required'
      });
    }

    let accountDetails;
    if (provider === 'flutterwave') {
      accountDetails = await flutterwaveService.resolveAccount(accountNumber, bankCode);
    } else {
      accountDetails = await paystackService.resolveAccount(accountNumber, bankCode);
    }

    res.json(accountDetails);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
