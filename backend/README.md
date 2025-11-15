# Crypto-to-Fiat Backend API

A Node.js/Express backend scaffold demonstrating integration patterns for crypto-to-fiat swap flows with Nigerian payment providers, KYC verification, SMS notifications, and fraud detection.

## 🚨 IMPORTANT SECURITY NOTICE

This is a **SCAFFOLD/DEMO** implementation intended to show integration patterns. **DO NOT use in production without:**

1. **Proper security hardening**
2. **Database integration** (PostgreSQL, MongoDB, etc.)
3. **Authentication & Authorization** (JWT, OAuth2)
4. **API key encryption** (Never store in plain text)
5. **Rate limiting and DDoS protection**
6. **Logging and monitoring**
7. **Approved vendor contracts** for KYC/BVN verification
8. **NDPR compliance** (Nigeria Data Protection Regulation)

## Features

- ✅ Crypto-to-fiat swap flow endpoints
- ✅ KYC integration scaffold (BVN/NIN verification)
- ✅ Payment provider integration (Paystack & Flutterwave)
- ✅ SMS notifications (Termii & Twilio)
- ✅ Basic fraud detection rules
- ✅ Nigerian bank account verification
- ✅ Transaction monitoring

## Prerequisites

- Node.js 14+ and npm
- API keys from payment/SMS providers (see Setup section)

## Installation

1. Clone the repository
```bash
cd backend
npm install
```

2. Create `.env` file
```bash
cp .env.example .env
```

3. Configure your API keys in `.env`

## Configuration

### Required API Keys

#### Paystack (https://paystack.com)
```env
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

#### Flutterwave (https://flutterwave.com)
```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your_key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_key
```

#### Termii (https://termii.com)
```env
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=YourApp
```

#### Twilio (https://twilio.com) - Optional
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### KYC/BVN Verification

For **production BVN verification**, you MUST use approved providers:

- **Youverify** (https://youverify.co) - Recommended
- **Smile Identity** (https://usesmileid.com)
- **Dojah** (https://dojah.io)

```env
KYC_PROVIDER_API_KEY=your_kyc_api_key
KYC_PROVIDER_API_URL=https://api.provider.com/v1
```

⚠️ **CRITICAL BVN SECURITY NOTES:**
- NEVER store BVN in your database
- Always verify server-side only
- Log all verification attempts
- Comply with NDPR regulations
- Get user consent before verification

## Running the Server

### Development Mode
```bash
npm run dev
# or with nodemon
nodemon server.js
```

### Production Mode
```bash
npm start
```

Server runs on: `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Swap Endpoints

#### Get Exchange Rates
```
GET /api/swap/rates?cryptoCurrency=BTC&fiatCurrency=NGN
```

#### Calculate Quote
```
POST /api/swap/quote
Content-Type: application/json

{
  "cryptoCurrency": "BTC",
  "cryptoAmount": 0.01,
  "fiatCurrency": "NGN"
}
```

#### Initiate Swap
```
POST /api/swap/initiate
Content-Type: application/json

{
  "userId": "user123",
  "cryptoCurrency": "BTC",
  "cryptoAmount": 0.01,
  "fiatCurrency": "NGN",
  "walletAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "recipientDetails": {
    "accountNumber": "0123456789",
    "accountName": "John Doe",
    "bankCode": "057"
  }
}
```

#### Get Transaction Status
```
GET /api/swap/status/:transactionId
```

### KYC Endpoints

#### Submit KYC
```
POST /api/kyc/submit
Content-Type: application/json

{
  "userId": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "08012345678",
  "address": "123 Main St, Lagos",
  "bvn": "12345678901",
  "idType": "national_id",
  "idNumber": "A12345678"
}
```

#### Verify BVN
```
POST /api/kyc/verify-bvn
Content-Type: application/json

{
  "userId": "user123",
  "bvn": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01"
}
```

#### Get KYC Status
```
GET /api/kyc/status/:userId
```

#### Get KYC Levels
```
GET /api/kyc/levels
```

### Payment Endpoints

#### Initialize Paystack Payment
```
POST /api/payment/paystack/initialize
Content-Type: application/json

{
  "email": "user@example.com",
  "amount": 50000,
  "currency": "NGN",
  "reference": "unique_ref"
}
```

#### Verify Paystack Payment
```
GET /api/payment/paystack/verify/:reference
```

#### Initialize Flutterwave Payment
```
POST /api/payment/flutterwave/initialize
Content-Type: application/json

{
  "email": "user@example.com",
  "amount": 50000,
  "tx_ref": "unique_tx_ref",
  "currency": "NGN"
}
```

#### Get Nigerian Banks
```
GET /api/payment/banks?provider=paystack
```

#### Resolve Bank Account
```
GET /api/payment/resolve-account?accountNumber=0123456789&bankCode=057&provider=paystack
```

#### Create Payout
```
POST /api/payment/payout
Content-Type: application/json

{
  "provider": "paystack",
  "amount": 50000,
  "accountNumber": "0123456789",
  "accountName": "John Doe",
  "bankCode": "057",
  "currency": "NGN",
  "narration": "Crypto swap payout"
}
```

### SMS Endpoints

#### Send Verification Code
```
POST /api/sms/send-code
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "provider": "termii"
}
```

#### Verify Code
```
POST /api/sms/verify-code
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "code": "123456"
}
```

#### Send Notification
```
POST /api/sms/notify
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "message": "Your transaction was successful",
  "provider": "termii"
}
```

### Fraud Detection Endpoints

#### Analyze Transaction
```
POST /api/fraud/analyze
Content-Type: application/json

{
  "userId": "user123",
  "amount": 1000000,
  "currency": "NGN",
  "type": "crypto_to_fiat",
  "ipAddress": "192.168.1.1",
  "deviceId": "device123"
}
```

#### Get User Risk Profile
```
GET /api/fraud/risk-profile/:userId
```

#### Report Suspicious Activity
```
POST /api/fraud/report
Content-Type: application/json

{
  "userId": "user123",
  "transactionId": "SWAP_123",
  "reason": "Suspicious pattern",
  "details": "Multiple failed attempts"
}
```

## Fraud Detection Rules

The fraud detection service implements these checks:

1. **Transaction Velocity** - Limits number of transactions per 24 hours
2. **Amount Limits** - Enforces daily transaction limits
3. **Pattern Analysis** - Detects unusual transaction patterns
4. **Time-based Rules** - Flags transactions during unusual hours
5. **User History** - Risk scoring based on user behavior

Configure thresholds in `.env`:
```env
FRAUD_DETECTION_THRESHOLD=0.7
MAX_DAILY_TRANSACTION_AMOUNT=5000000
MAX_TRANSACTION_VELOCITY=5
```

## Nigeria-Specific Integration Notes

### BVN (Bank Verification Number)
- 11-digit unique identifier for Nigerian bank customers
- Required for enhanced KYC (Level 2+)
- Must use approved verification providers
- Subject to NDPR compliance

### Payment Providers
- **Paystack**: Most popular in Nigeria, excellent documentation
- **Flutterwave**: Pan-African coverage, good for cross-border

### SMS Providers
- **Termii**: Africa-focused, competitive pricing
- **Twilio**: Global provider, higher costs but reliable

### Bank Codes
Common Nigerian bank codes:
- Access Bank: 044
- GTBank: 058
- First Bank: 011
- UBA: 033
- Zenith Bank: 057

## Development Tips

1. **Use test/sandbox keys** during development
2. **Never commit `.env` file** to version control
3. **Implement proper error handling** in production
4. **Add request validation** using middleware
5. **Use a real database** instead of in-memory storage
6. **Implement authentication** before deploying
7. **Add API rate limiting** to prevent abuse
8. **Set up monitoring** (Sentry, DataDog, etc.)

## Production Checklist

Before deploying to production:

- [ ] Replace in-memory storage with proper database
- [ ] Implement user authentication (JWT/OAuth2)
- [ ] Add API rate limiting
- [ ] Set up proper logging (Winston, Pino)
- [ ] Configure error monitoring (Sentry)
- [ ] Enable HTTPS/TLS
- [ ] Set up environment-specific configs
- [ ] Implement backup strategies
- [ ] Add comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Document all API endpoints (Swagger/OpenAPI)
- [ ] Implement webhook verification for all providers
- [ ] Add request/response validation
- [ ] Configure CORS properly
- [ ] Set up health checks and monitoring
- [ ] Implement audit logging for sensitive operations

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get exchange rates
curl http://localhost:3000/api/swap/rates?cryptoCurrency=BTC&fiatCurrency=NGN

# Calculate quote
curl -X POST http://localhost:3000/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{"cryptoCurrency":"BTC","cryptoAmount":0.01,"fiatCurrency":"NGN"}'
```

## Support & Resources

### Payment Provider Documentation
- Paystack: https://paystack.com/docs/api/
- Flutterwave: https://developer.flutterwave.com/docs

### SMS Provider Documentation
- Termii: https://developers.termii.com/
- Twilio: https://www.twilio.com/docs/sms

### KYC Provider Documentation
- Youverify: https://docs.youverify.co/
- Smile Identity: https://docs.usesmileid.com/
- Dojah: https://docs.dojah.io/

### Regulatory Resources
- Nigeria Data Protection Regulation (NDPR): https://ndpr.nitda.gov.ng/

## License

ISC

## Disclaimer

This is a scaffold/demo application. Do not use in production without proper security review, testing, and compliance verification. The authors are not responsible for any financial losses or security breaches resulting from the use of this code.
