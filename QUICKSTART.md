# Quick Start Guide

Get the crypto-to-fiat scaffold running in 5 minutes!

## Prerequisites

- Node.js 14+ installed
- Flutter 3.0+ installed (optional, for mobile app)
- Git installed

## Backend (Required)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# No API keys needed for demo - defaults work out of the box!
```

### 3. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

### 4. Test It
```bash
# In a new terminal
curl http://localhost:3000/health
```

Expected output:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

## Mobile App (Optional)

### 1. Install Dependencies
```bash
cd mobile_app
flutter pub get
```

### 2. Run App
```bash
# On Android emulator/device
flutter run

# On iOS simulator (Mac only)
flutter run
```

**Note**: Backend must be running first!

## Quick API Test

Save this as `test.sh` and run it:

```bash
#!/bin/bash

# Get exchange rate
curl -s "http://localhost:3000/api/swap/rates?cryptoCurrency=BTC&fiatCurrency=NGN" | jq .

# Calculate quote
curl -s -X POST http://localhost:3000/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{"cryptoCurrency":"BTC","cryptoAmount":0.01,"fiatCurrency":"NGN"}' | jq .

# Get KYC levels
curl -s http://localhost:3000/api/kyc/levels | jq .
```

```bash
chmod +x test.sh
./test.sh
```

## What's Working?

✅ **Crypto Swap**: Calculate quotes, initiate swaps
✅ **KYC System**: Multi-level verification flow
✅ **Fraud Detection**: Transaction risk analysis
✅ **Mock Integrations**: Ready for real API keys

## Next Steps

1. **Read Documentation**:
   - Main: [README.md](README.md)
   - Backend: [backend/README.md](backend/README.md)
   - Mobile: [mobile_app/README.md](mobile_app/README.md)
   - Integration: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

2. **Get API Keys** (for real integrations):
   - Paystack: https://dashboard.paystack.com/signup
   - Flutterwave: https://dashboard.flutterwave.com/signup
   - Termii: https://termii.com

3. **Explore the Code**:
   - Backend routes: `backend/routes/`
   - Backend services: `backend/services/`
   - Mobile screens: `mobile_app/lib/screens/`

## Troubleshooting

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Flutter not found?**
```bash
# Install Flutter: https://docs.flutter.dev/get-started/install
flutter doctor
```

**Can't connect mobile app to backend?**

Edit `mobile_app/lib/main.dart`:
- Android emulator: Use `http://10.0.2.2:3000`
- iOS simulator: Use `http://localhost:3000`
- Physical device: Use `http://YOUR_IP:3000`

## Demo Credentials

No authentication required for demo! Just use any values:
- User ID: `user123`
- BVN: Any 11 digits (e.g., `12345678901`)
- Phone: Any Nigerian format (e.g., `08012345678`)

## API Endpoints

All endpoints documented in [backend/README.md](backend/README.md)

Quick reference:
```
GET  /health                          - Health check
GET  /api/swap/rates                  - Exchange rates
POST /api/swap/quote                  - Calculate quote
POST /api/swap/initiate               - Start swap
GET  /api/kyc/levels                  - KYC tiers
POST /api/kyc/submit                  - Submit KYC
POST /api/kyc/verify-bvn              - Verify BVN
POST /api/fraud/analyze               - Check fraud
```

## Features Demo

### 1. Swap Flow
```bash
# Get quote
curl -X POST http://localhost:3000/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "cryptoCurrency": "BTC",
    "cryptoAmount": 0.01,
    "fiatCurrency": "NGN"
  }'

# Initiate swap
curl -X POST http://localhost:3000/api/swap/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "cryptoCurrency": "BTC",
    "cryptoAmount": 0.01,
    "fiatCurrency": "NGN",
    "recipientDetails": {
      "accountNumber": "0123456789",
      "accountName": "John Doe",
      "bankCode": "057"
    }
  }'
```

### 2. KYC Flow
```bash
# Submit KYC
curl -X POST http://localhost:3000/api/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "08012345678",
    "address": "123 Lagos Street"
  }'

# Verify BVN (mock)
curl -X POST http://localhost:3000/api/kyc/verify-bvn \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "bvn": "12345678901",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }'
```

### 3. Fraud Check
```bash
curl -X POST http://localhost:3000/api/fraud/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 1000000,
    "currency": "NGN",
    "type": "crypto_to_fiat"
  }'
```

## Production Notes

⚠️ **This is a DEMO**. For production:

1. Add real API keys to `.env`
2. Implement authentication
3. Add database (PostgreSQL/MongoDB)
4. Enable HTTPS
5. Set up proper error handling
6. Add comprehensive logging
7. Implement rate limiting
8. Get approved KYC provider
9. Comply with NDPR
10. Security audit

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for full production setup.

## Architecture

```
Mobile App (Flutter)
        ↓
    REST API
        ↓
Express Backend (Node.js)
        ↓
   ┌────┴────┐
   ↓         ↓
Services   Routes
   ↓
External APIs:
- Paystack/Flutterwave (Payments)
- Termii/Twilio (SMS)
- Youverify/Dojah (KYC)
```

## Support

Questions? Check:
1. [README.md](README.md) - Overview
2. [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Detailed setup
3. Backend API docs - [backend/README.md](backend/README.md)
4. Mobile docs - [mobile_app/README.md](mobile_app/README.md)

## License

ISC - See [README.md](README.md) for disclaimer

---

**Made with ❤️ for Nigeria 🇳🇬**

Happy coding! 🚀
