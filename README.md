# Crypto-to-Fiat Starter Scaffold

A complete starter scaffold demonstrating how to wire together crypto-to-fiat swap flows, KYC integration, SMS notifications, fiat payment providers, and basic fraud-detection hooks, tuned for Nigeria deployment.

## 🚨 IMPORTANT NOTICE

This is a **SCAFFOLD/DEMO** implementation for educational purposes. It shows integration patterns and architecture but **MUST NOT be used in production** without:

- Professional security audit
- Proper authentication & authorization
- Database implementation
- Approved vendor contracts (KYC/BVN providers)
- NDPR compliance review
- Comprehensive testing
- Production hardening

**NEVER embed API keys or secrets in the mobile app.**

## Project Structure

```
.
├── backend/              # Node.js/Express API server
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic & integrations
│   ├── server.js        # Entry point
│   └── README.md        # Backend documentation
│
├── mobile_app/          # Flutter mobile application
│   ├── lib/
│   │   ├── screens/    # UI screens
│   │   ├── services/   # API client
│   │   └── models/     # Data models
│   └── README.md       # Mobile app documentation
│
└── README.md           # This file
```

## Features

### Backend API (Node.js/Express)
- ✅ Crypto-to-fiat swap endpoints
- ✅ Exchange rate calculation
- ✅ KYC verification scaffold (BVN/NIN)
- ✅ Payment provider integration (Paystack & Flutterwave)
- ✅ SMS notifications (Termii & Twilio)
- ✅ Fraud detection rules engine
- ✅ Bank account verification
- ✅ Webhook handlers

### Mobile App (Flutter)
- ✅ Swap flow UI
- ✅ KYC verification screens
- ✅ Payment integration UI
- ✅ Multi-level KYC system
- ✅ Bank selection interface
- ✅ Transaction tracking
- ✅ Real-time quotes

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
```

Backend runs on: `http://localhost:3000`

See [backend/README.md](backend/README.md) for detailed instructions.

### 2. Mobile App Setup

```bash
cd mobile_app
flutter pub get
# Edit lib/main.dart to set backend URL
flutter run
```

See [mobile_app/README.md](mobile_app/README.md) for detailed instructions.

## Nigeria-Specific Integrations

### Payment Providers

#### Paystack (Primary)
- Most popular in Nigeria
- Excellent documentation
- Lower transaction fees
- Best for local transactions
- Website: https://paystack.com

#### Flutterwave (Alternative)
- Pan-African coverage
- Good for cross-border
- Comprehensive API
- Website: https://flutterwave.com

### KYC/BVN Verification

**CRITICAL**: BVN verification in production requires:

1. **Approved Providers**:
   - Youverify (https://youverify.co)
   - Smile Identity (https://usesmileid.com)
   - Dojah (https://dojah.io)

2. **Compliance**:
   - NDPR (Nigeria Data Protection Regulation)
   - User consent required
   - Never store BVN
   - Server-side verification only
   - Audit logging mandatory

3. **Security**:
   - Encrypted transmission
   - No client-side storage
   - Rate limiting
   - Fraud detection

### SMS Providers

#### Termii (Primary)
- Africa-focused
- Competitive pricing
- Good delivery rates
- Website: https://termii.com

#### Twilio (Alternative)
- Global coverage
- Higher cost
- Very reliable
- Website: https://twilio.com

### Bank Codes

Common Nigerian banks:
- **Access Bank**: 044
- **GTBank**: 058
- **First Bank**: 011
- **UBA**: 033
- **Zenith Bank**: 057
- **Sterling Bank**: 232
- **Fidelity Bank**: 070

Full list available via API: `/api/payment/banks`

## Architecture Overview

### Backend Flow

```
Mobile App → Express API → Services → External APIs
                              ↓
                        Fraud Detection
                              ↓
                        Response → Mobile App
```

### Swap Flow

1. User enters amount and currency
2. App requests quote from backend
3. Backend calculates with fees
4. User confirms and provides bank details
5. Backend runs fraud checks
6. Transaction initiated
7. User deposits crypto to generated address
8. Backend verifies deposit
9. Fiat payout processed to bank account
10. SMS notification sent

### KYC Flow

1. User submits basic information
2. Backend validates and stores
3. User verifies phone number (SMS)
4. User submits BVN
5. Backend calls KYC provider API
6. BVN verified against government database
7. User level upgraded
8. Transaction limits increased

### Payment Flow

1. User initiates payment
2. Backend calls payment provider API
3. Payment link generated
4. User redirected to payment gateway
5. Payment processed
6. Webhook received by backend
7. Transaction status updated
8. User notified

## API Endpoints Summary

### Swap
- `GET /api/swap/rates` - Get exchange rates
- `POST /api/swap/quote` - Calculate swap quote
- `POST /api/swap/initiate` - Start swap transaction
- `GET /api/swap/status/:id` - Check transaction status

### KYC
- `POST /api/kyc/submit` - Submit KYC information
- `POST /api/kyc/verify-bvn` - Verify BVN
- `GET /api/kyc/status/:userId` - Get KYC status
- `GET /api/kyc/levels` - Get KYC level information

### Payment
- `POST /api/payment/paystack/initialize` - Initialize Paystack payment
- `POST /api/payment/flutterwave/initialize` - Initialize Flutterwave payment
- `GET /api/payment/banks` - Get list of banks
- `GET /api/payment/resolve-account` - Verify bank account
- `POST /api/payment/payout` - Create bank transfer

### SMS
- `POST /api/sms/send-code` - Send verification code
- `POST /api/sms/verify-code` - Verify SMS code
- `POST /api/sms/notify` - Send notification

### Fraud Detection
- `POST /api/fraud/analyze` - Analyze transaction
- `GET /api/fraud/risk-profile/:userId` - Get user risk profile
- `POST /api/fraud/report` - Report suspicious activity

## Security Considerations

### Backend
1. ❌ **NO secrets in code or git**
2. ✅ Use environment variables
3. ✅ Validate all inputs
4. ✅ Implement rate limiting
5. ✅ Use HTTPS in production
6. ✅ Verify webhook signatures
7. ✅ Log security events
8. ✅ Implement proper error handling

### Mobile App
1. ❌ **NO API keys in app**
2. ✅ All sensitive operations server-side
3. ✅ Validate user input
4. ✅ Use secure storage for tokens
5. ✅ Implement certificate pinning
6. ✅ Use biometric authentication
7. ✅ Encrypt local data

### KYC/BVN
1. ❌ **NEVER store BVN**
2. ✅ Get user consent
3. ✅ Use approved providers only
4. ✅ Encrypt in transit
5. ✅ Audit all attempts
6. ✅ Comply with NDPR

## Fraud Detection Rules

The scaffold includes basic fraud detection:

1. **Velocity Checks**: Limit transactions per time period
2. **Amount Limits**: Enforce daily/monthly limits
3. **Pattern Analysis**: Detect unusual behavior
4. **Risk Scoring**: Calculate transaction risk
5. **Device Tracking**: Monitor device changes
6. **Location Checks**: Flag unusual locations

Configure in `.env`:
```env
FRAUD_DETECTION_THRESHOLD=0.7
MAX_DAILY_TRANSACTION_AMOUNT=5000000
MAX_TRANSACTION_VELOCITY=5
```

## Production Deployment

### Backend Deployment

Recommended platforms:
- **Heroku**: Easy deployment, free tier
- **DigitalOcean**: VPS, more control
- **AWS/GCP/Azure**: Enterprise-grade
- **Render**: Modern platform

Requirements:
- Node.js 14+
- PostgreSQL/MongoDB for persistence
- Redis for caching
- Process manager (PM2)
- Reverse proxy (Nginx)

### Mobile App Deployment

**Android**:
1. Build release APK/Bundle
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

**iOS**:
1. Build release IPA
2. Upload via Xcode/Transporter
3. Complete App Store Connect listing
4. Submit for review

## Regulatory Compliance

### Nigeria
- **CBN** (Central Bank of Nigeria): Payment regulations
- **NDPR**: Data protection requirements
- **CAC**: Company registration requirements
- **FIRS**: Tax obligations

### Required Licenses
- Mobile Money Operator (MMO) license
- Payment Service Provider (PSP) license
- Approval from CBN

**Note**: Obtain proper licenses before operating.

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile App Testing
```bash
cd mobile_app
flutter test
```

### Manual Testing Checklist
- [ ] Complete swap flow
- [ ] KYC submission and verification
- [ ] Payment initialization
- [ ] SMS verification
- [ ] Bank account resolution
- [ ] Error handling
- [ ] Offline behavior
- [ ] Network failures

## Known Limitations

This is a **scaffold** with intentional limitations:

1. **No real crypto wallet integration**
2. **Mock exchange rates**
3. **In-memory data storage**
4. **Simplified fraud detection**
5. **No user authentication**
6. **No database persistence**
7. **Basic error handling**
8. **No transaction reversal**

## Future Enhancements

For production readiness:

- [ ] Real crypto wallet integration
- [ ] Live exchange rate feeds
- [ ] Database implementation
- [ ] User authentication system
- [ ] Advanced fraud detection (ML)
- [ ] Transaction reconciliation
- [ ] Customer support system
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Monitoring and alerting

## Resources

### Documentation
- Backend: [backend/README.md](backend/README.md)
- Mobile: [mobile_app/README.md](mobile_app/README.md)

### External Services
- Paystack: https://paystack.com/docs
- Flutterwave: https://developer.flutterwave.com
- Termii: https://developers.termii.com
- Twilio: https://www.twilio.com/docs

### Nigerian Fintech
- CBN: https://www.cbn.gov.ng
- NDPR: https://ndpr.nitda.gov.ng
- NITDA: https://nitda.gov.ng

## Contributing

This is a learning scaffold. Contributions welcome for:
- Bug fixes
- Documentation improvements
- Additional integration examples
- Security enhancements

## License

ISC

## Disclaimer

**IMPORTANT**: This code is for educational/demonstration purposes only. 

❌ **DO NOT USE IN PRODUCTION WITHOUT**:
- Security audit
- Legal review
- Compliance verification
- Proper testing
- Professional deployment
- Ongoing maintenance

The authors assume no liability for:
- Financial losses
- Security breaches
- Regulatory violations
- Data breaches
- Service disruptions

Use at your own risk. Always consult with legal and security professionals before deploying any financial application.

## Support

For questions and issues:
1. Check the README files
2. Review API documentation
3. Check error logs
4. Consult provider documentation

---

**Made for Nigeria 🇳🇬 | Built with Node.js & Flutter**