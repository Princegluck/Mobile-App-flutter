const axios = require('axios');

/**
 * Flutterwave Service - Africa's payment gateway
 * Documentation: https://developer.flutterwave.com/docs
 */

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

/**
 * Initialize payment
 */
async function initializePayment(paymentData) {
  const {
    email,
    phone_number,
    name,
    amount,
    currency,
    tx_ref,
    redirect_url,
    meta
  } = paymentData;

  try {
    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      {
        tx_ref: tx_ref || `FLW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: currency || 'NGN',
        redirect_url: redirect_url || 'https://your-app.com/payment/callback',
        payment_options: 'card,banktransfer,ussd,account',
        customer: {
          email,
          phone_number,
          name
        },
        customizations: {
          title: 'Crypto Swap Payment',
          description: 'Payment for crypto-to-fiat swap',
          logo: 'https://your-app.com/logo.png'
        },
        meta
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      paymentLink: response.data.data.link
    };
  } catch (error) {
    console.error('Flutterwave initialize payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
}

/**
 * Verify payment
 */
async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      verified: response.data.data.status === 'successful',
      amount: response.data.data.amount,
      currency: response.data.data.currency,
      chargedAmount: response.data.data.charged_amount
    };
  } catch (error) {
    console.error('Flutterwave verify payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
}

/**
 * Create transfer (payout)
 */
async function createTransfer(transferData) {
  const {
    accountNumber,
    accountName,
    bankCode,
    amount,
    currency,
    reference,
    narration
  } = transferData;

  try {
    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/transfers`,
      {
        account_bank: bankCode,
        account_number: accountNumber,
        amount,
        currency: currency || 'NGN',
        reference: reference || `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        narration: narration || 'Crypto swap payout',
        callback_url: 'https://your-app.com/transfer/callback',
        debit_currency: currency || 'NGN'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      data: response.data.data,
      transferId: response.data.data.id,
      reference: response.data.data.reference
    };
  } catch (error) {
    console.error('Flutterwave create transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create transfer');
  }
}

/**
 * Get list of banks
 */
async function getBanks() {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/banks/NG`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      banks: response.data.data
    };
  } catch (error) {
    console.error('Flutterwave get banks error:', error.response?.data || error.message);
    throw new Error('Failed to fetch banks');
  }
}

/**
 * Resolve account number
 */
async function resolveAccount(accountNumber, bankCode) {
  try {
    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/accounts/resolve`,
      {
        account_number: accountNumber,
        account_bank: bankCode
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      status: 'success',
      accountName: response.data.data.account_name,
      accountNumber: response.data.data.account_number
    };
  } catch (error) {
    console.error('Flutterwave resolve account error:', error.response?.data || error.message);
    throw new Error('Failed to resolve account number');
  }
}

/**
 * Get transfer fee
 */
async function getTransferFee(amount, currency = 'NGN') {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transfers/fee?amount=${amount}&currency=${currency}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    return {
      status: 'success',
      fee: response.data.data[0].fee
    };
  } catch (error) {
    console.error('Flutterwave get transfer fee error:', error.response?.data || error.message);
    throw new Error('Failed to get transfer fee');
  }
}

/**
 * Handle webhook events
 */
async function handleWebhookEvent(event) {
  console.log('Flutterwave webhook event:', event.event);

  switch (event.event) {
    case 'charge.completed':
      console.log('Payment completed:', event.data.tx_ref);
      // Update transaction status in database
      break;
    
    case 'transfer.completed':
      console.log('Transfer completed:', event.data.reference);
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
  createTransfer,
  getBanks,
  resolveAccount,
  getTransferFee,
  handleWebhookEvent
};
