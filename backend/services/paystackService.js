const axios = require('axios');
const crypto = require('crypto');

/**
 * Paystack Service - Nigeria's leading payment provider
 * Documentation: https://paystack.com/docs/api/
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize payment
 */
async function initializePayment(paymentData) {
  const { email, amount, currency, metadata, reference } = paymentData;

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        currency: currency || 'NGN',
        metadata,
        reference: reference || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference
    };
  } catch (error) {
    console.error('Paystack initialize payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
}

/**
 * Verify payment
 */
async function verifyPayment(reference) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      verified: response.data.data.status === 'success',
      amount: response.data.data.amount / 100, // Convert from kobo
      currency: response.data.data.currency,
      paidAt: response.data.data.paid_at
    };
  } catch (error) {
    console.error('Paystack verify payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
}

/**
 * Create transfer recipient
 */
async function createTransferRecipient(recipientData) {
  const { type, name, accountNumber, bankCode, currency } = recipientData;

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: type || 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: currency || 'NGN'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      recipientCode: response.data.data.recipient_code,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack create recipient error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create transfer recipient');
  }
}

/**
 * Create transfer (payout)
 */
async function createTransfer(transferData) {
  const { amount, recipientCode, reference, reason } = transferData;

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reference: reference || `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reason: reason || 'Crypto swap payout'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      transferCode: response.data.data.transfer_code,
      reference: response.data.data.reference
    };
  } catch (error) {
    console.error('Paystack create transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create transfer');
  }
}

/**
 * Get list of banks
 */
async function getBanks() {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank?currency=NGN`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      banks: response.data.data
    };
  } catch (error) {
    console.error('Paystack get banks error:', error.response?.data || error.message);
    throw new Error('Failed to fetch banks');
  }
}

/**
 * Resolve account number
 */
async function resolveAccount(accountNumber, bankCode) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      accountName: response.data.data.account_name,
      accountNumber: response.data.data.account_number
    };
  } catch (error) {
    console.error('Paystack resolve account error:', error.response?.data || error.message);
    throw new Error('Failed to resolve account number');
  }
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Handle webhook events
 */
async function handleWebhookEvent(event) {
  console.log('Paystack webhook event:', event.event);

  switch (event.event) {
    case 'charge.success':
      console.log('Payment successful:', event.data.reference);
      // Update transaction status in database
      break;
    
    case 'transfer.success':
      console.log('Transfer successful:', event.data.reference);
      // Update payout status in database
      break;
    
    case 'transfer.failed':
      console.log('Transfer failed:', event.data.reference);
      // Handle failed transfer
      break;
    
    default:
      console.log('Unhandled event:', event.event);
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  createTransferRecipient,
  createTransfer,
  getBanks,
  resolveAccount,
  verifyWebhookSignature,
  handleWebhookEvent
};
