# Integration Guide: Crypto-to-Fiat Scaffold

This guide provides step-by-step instructions for integrating and deploying the crypto-to-fiat scaffold for Nigerian operations.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Payment Provider Setup](#payment-provider-setup)
5. [KYC Provider Setup](#kyc-provider-setup)
6. [SMS Provider Setup](#sms-provider-setup)
7. [Testing the Integration](#testing-the-integration)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### Development Environment
- **Node.js**: v14 or higher
- **Flutter**: v3.0 or higher
- **Git**: For version control
- **Code Editor**: VS Code, Android Studio, or Xcode

### Required Accounts
Before starting, sign up for:
1. **Paystack**: https://dashboard.paystack.com/signup
2. **Flutterwave**: https://dashboard.flutterwave.com/signup
3. **Termii**: https://termii.com/
4. **Twilio** (optional): https://www.twilio.com/try-twilio
5. **KYC Provider** (for production):
   - Youverify: https://youverify.co
   - Smile Identity: https://usesmileid.com
   - Dojah: https://dojah.io

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Paystack (Get from dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Flutterwave (Get from dashboard.flutterwave.com)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx

# Termii (Get from termii.com/account/api-token)
TERMII_API_KEY=xxxxxxxxxxxxx
TERMII_SENDER_ID=YourAppName

# Fraud Detection
FRAUD_DETECTION_THRESHOLD=0.7
MAX_DAILY_TRANSACTION_AMOUNT=5000000
MAX_TRANSACTION_VELOCITY=5
```

### Step 3: Start Backend Server

```bash
npm start
```

Verify server is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T12:00:00.000Z",
  "environment": "development"
}
```

---

## Mobile App Setup

### Step 1: Install Flutter Dependencies

```bash
cd mobile_app
flutter pub get
```

### Step 2: Configure Backend URL

Edit `lib/main.dart`:

**For Android Emulator:**
```dart
Provider<ApiService>(
  create: (_) => ApiService(baseUrl: 'http://10.0.2.2:3000'),
),
```

**For iOS Simulator:**
```dart
Provider<ApiService>(
  create: (_) => ApiService(baseUrl: 'http://localhost:3000'),
),
```

**For Physical Device:**
```dart
Provider<ApiService>(
  create: (_) => ApiService(baseUrl: 'http://192.168.1.XXX:3000'),
),
```

Replace `192.168.1.XXX` with your computer's IP address.

### Step 3: Run the App

```bash
flutter run
```

---

## Payment Provider Setup

### Paystack Integration

#### 1. Create Account
- Sign up at https://dashboard.paystack.com/signup
- Verify your email and phone number
- Complete business information

#### 2. Get API Keys
- Go to Settings → API Keys & Webhooks
- Copy **Secret Key** and **Public Key**
- Add to backend `.env` file

#### 3. Configure Webhooks (Production)
- Webhook URL: `https://yourapi.com/api/payment/paystack/webhook`
- Events to listen for:
  - `charge.success`
  - `transfer.success`
  - `transfer.failed`

#### 4. Test Integration
```bash
curl -X POST http://localhost:3000/api/payment/paystack/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 50000,
    "currency": "NGN"
  }'
```

### Flutterwave Integration

#### 1. Create Account
- Sign up at https://dashboard.flutterwave.com/signup
- Complete verification process
- Add business details

#### 2. Get API Keys
- Go to Settings → API
- Copy **Secret Key** and **Public Key**
- Add to backend `.env` file

#### 3. Configure Webhooks (Production)
- Webhook URL: `https://yourapi.com/api/payment/flutterwave/webhook`
- Generate webhook secret hash
- Add to `.env` as `FLUTTERWAVE_WEBHOOK_HASH`

#### 4. Test Integration
```bash
curl -X POST http://localhost:3000/api/payment/flutterwave/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 50000,
    "tx_ref": "TXN_123456"
  }'
```

---

## KYC Provider Setup

### ⚠️ CRITICAL: For Demo Only

The scaffold includes **MOCK** BVN verification. For production, you **MUST** use approved providers.

### Production: Youverify Integration

#### 1. Create Account
- Sign up at https://youverify.co
- Submit company documents
- Wait for approval (1-3 business days)

#### 2. Get API Credentials
- Access dashboard
- Go to API section
- Copy API Key
- Note the API base URL

#### 3. Update Backend Service

Edit `backend/services/kycService.js`:

```javascript
async function verifyBVN(verificationData) {
  const { userId, bvn, firstName, lastName, dateOfBirth } = verificationData;

  // Call Youverify API
  const response = await axios.post(
    `${process.env.KYC_PROVIDER_API_URL}/identities/ng/bvn`,
    {
      id: bvn,
      isSubjectConsent: true,
      metadata: {
        firstName,
        lastName,
        dob: dateOfBirth
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.KYC_PROVIDER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Process response
  const verified = response.data.status === 'success';
  // ... rest of implementation
}
```

#### 4. Compliance Requirements
- ✅ Get explicit user consent
- ✅ Display data processing notice
- ✅ Implement audit logging
- ✅ Encrypt all PII in transit
- ✅ Don't store BVN
- ✅ Comply with NDPR

---

## SMS Provider Setup

### Termii Integration

#### 1. Create Account
- Sign up at https://termii.com
- Verify email and phone
- Fund account (minimum ₦1,000)

#### 2. Get API Key
- Go to Account → API Tokens
- Create new token
- Copy API key
- Add to backend `.env`

#### 3. Register Sender ID
- Go to Sender ID section
- Submit sender ID (max 11 characters)
- Wait for approval (24-48 hours)

#### 4. Test SMS
```bash
curl -X POST http://localhost:3000/api/sms/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "08012345678",
    "provider": "termii"
  }'
```

### Twilio Integration (Optional)

#### 1. Create Account
- Sign up at https://www.twilio.com/try-twilio
- Get $15 trial credit

#### 2. Get Credentials
- Copy Account SID
- Copy Auth Token
- Get a phone number

#### 3. Test SMS
```bash
curl -X POST http://localhost:3000/api/sms/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "provider": "twilio"
  }'
```

---

## Testing the Integration

### Complete Flow Test

#### 1. Start Backend
```bash
cd backend
npm start
```

#### 2. Start Mobile App
```bash
cd mobile_app
flutter run
```

#### 3. Test Swap Flow
1. Open app
2. Tap "Swap Crypto"
3. Enter amount: 0.01 BTC
4. Tap "Get Quote"
5. Verify quote displays
6. Enter bank details
7. Tap "Initiate Swap"
8. Note transaction ID

#### 4. Test KYC Flow
1. Tap "KYC Verification"
2. Fill basic information
3. Tap "Submit Basic Info"
4. Enter BVN (11 digits)
5. Tap "Verify BVN"
6. Check status updates

#### 5. Test Payment Flow
1. Tap "Payment"
2. Select "Paystack"
3. Enter email and amount
4. Tap "Initialize Payment"
5. Note payment link

### API Testing Script

Save as `test_integration.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Crypto-Fiat Integration"
echo "================================"

# Test 1: Health Check
echo "1. Health Check..."
curl -s $BASE_URL/health | jq .

# Test 2: Get Rates
echo -e "\n2. Exchange Rates..."
curl -s "$BASE_URL/api/swap/rates?cryptoCurrency=BTC&fiatCurrency=NGN" | jq .

# Test 3: Calculate Quote
echo -e "\n3. Calculate Quote..."
curl -s -X POST $BASE_URL/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{"cryptoCurrency":"BTC","cryptoAmount":0.01,"fiatCurrency":"NGN"}' | jq .

# Test 4: Initiate Swap
echo -e "\n4. Initiate Swap..."
curl -s -X POST $BASE_URL/api/swap/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "cryptoCurrency":"BTC",
    "cryptoAmount":0.01,
    "fiatCurrency":"NGN",
    "recipientDetails":{
      "accountNumber":"0123456789",
      "accountName":"John Doe",
      "bankCode":"057"
    }
  }' | jq .

# Test 5: KYC Levels
echo -e "\n5. KYC Levels..."
curl -s $BASE_URL/api/kyc/levels | jq .

# Test 6: Submit KYC
echo -e "\n6. Submit KYC..."
curl -s -X POST $BASE_URL/api/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "firstName":"John",
    "lastName":"Doe",
    "dateOfBirth":"1990-01-01",
    "phoneNumber":"08012345678",
    "address":"123 Lagos Street"
  }' | jq .

# Test 7: Fraud Analysis
echo -e "\n7. Fraud Analysis..."
curl -s -X POST $BASE_URL/api/fraud/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "amount":100000,
    "currency":"NGN",
    "type":"crypto_to_fiat"
  }' | jq .

echo -e "\n================================"
echo "Integration tests completed!"
```

Run tests:
```bash
chmod +x test_integration.sh
./test_integration.sh
```

---

## Production Deployment

### Backend Deployment (Heroku Example)

#### 1. Prepare for Deployment
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PAYSTACK_SECRET_KEY=sk_live_xxxxx
heroku config:set FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
# ... set all other variables
```

#### 2. Deploy
```bash
cd backend
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 3. Verify Deployment
```bash
heroku logs --tail
heroku open
```

### Mobile App Deployment

#### Android (Google Play)

1. **Update `build.gradle`**:
```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.cryptofiat"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

2. **Generate Keystore**:
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

3. **Build Release**:
```bash
flutter build appbundle --release
```

4. **Upload to Play Console**:
- Go to https://play.google.com/console
- Create app
- Upload AAB file
- Complete store listing
- Submit for review

#### iOS (App Store)

1. **Update Configuration**:
Edit `ios/Runner/Info.plist`

2. **Build Archive**:
```bash
flutter build ios --release
```

3. **Open in Xcode**:
```bash
open ios/Runner.xcworkspace
```

4. **Archive and Upload**:
- Product → Archive
- Distribute App
- Upload to App Store Connect

---

## Common Issues & Solutions

### Backend Issues

**Issue**: Port 3000 already in use
```bash
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Issue**: Environment variables not loading
```bash
# Solution: Check .env file exists and syntax
cat .env
# Restart server
npm start
```

### Mobile App Issues

**Issue**: Cannot connect to backend
```bash
# Solution: Check backend URL in main.dart
# For Android emulator, use 10.0.2.2
# For iOS, use localhost
```

**Issue**: Flutter dependencies conflict
```bash
# Solution: Clean and reinstall
flutter clean
flutter pub get
```

---

## Security Checklist

Before going live:

- [ ] All API keys in environment variables (not in code)
- [ ] HTTPS enabled for backend
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Webhook signature verification
- [ ] Audit logging for sensitive operations
- [ ] Database backups configured
- [ ] Error monitoring (Sentry, etc.)
- [ ] Security headers configured
- [ ] API authentication implemented
- [ ] Mobile app certificate pinning

---

## Support & Resources

### Documentation
- Backend API: `/backend/README.md`
- Mobile App: `/mobile_app/README.md`
- Main README: `/README.md`

### Provider Documentation
- Paystack: https://paystack.com/docs
- Flutterwave: https://developer.flutterwave.com
- Termii: https://developers.termii.com
- Youverify: https://docs.youverify.co

### Regulatory
- CBN: https://www.cbn.gov.ng
- NDPR: https://ndpr.nitda.gov.ng
- NITDA: https://nitda.gov.ng

### Community
- Flutter: https://flutter.dev/community
- Node.js: https://nodejs.org/en/get-involved

---

**End of Integration Guide**
