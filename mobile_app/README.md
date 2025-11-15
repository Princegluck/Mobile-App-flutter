# Crypto-Fiat Mobile App (Flutter)

A Flutter mobile application scaffold demonstrating crypto-to-fiat swap flows with Nigerian payment provider integrations, KYC verification, and SMS notifications.

## 🚨 IMPORTANT SECURITY NOTICE

This is a **SCAFFOLD/DEMO** implementation intended to show integration patterns. **DO NOT use in production without:**

1. **Proper authentication** (Firebase Auth, custom JWT, etc.)
2. **Secure API communication** (HTTPS, API key encryption)
3. **Environment-specific configuration** (development, staging, production)
4. **Error handling and retry logic**
5. **Proper state management** (BLoC, Riverpod, or enhanced Provider)
6. **Comprehensive testing** (unit, widget, integration tests)
7. **Security audits** for sensitive operations

## Features

- ✅ Crypto-to-fiat swap interface
- ✅ Real-time exchange rate display
- ✅ KYC verification flow (BVN/NIN)
- ✅ Payment integration (Paystack & Flutterwave)
- ✅ Bank account verification
- ✅ SMS verification (ready for integration)
- ✅ Transaction tracking
- ✅ Multi-level KYC system

## Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode (for mobile emulation)
- Backend API running (see backend/README.md)

## Installation

### 1. Install Flutter

Follow the official Flutter installation guide:
https://docs.flutter.dev/get-started/install

### 2. Clone and Setup

```bash
cd mobile_app
flutter pub get
```

### 3. Configure Backend URL

Edit `lib/main.dart` and update the API base URL:

```dart
Provider<ApiService>(
  create: (_) => ApiService(baseUrl: 'http://YOUR_BACKEND_URL:3000'),
),
```

**For Android Emulator:**
- Use `http://10.0.2.2:3000` to connect to localhost

**For iOS Simulator:**
- Use `http://localhost:3000`

**For Physical Device:**
- Use your computer's IP address: `http://192.168.x.x:3000`

### 4. Run the App

```bash
# Check devices
flutter devices

# Run on connected device/emulator
flutter run

# Run in release mode
flutter run --release
```

## Project Structure

```
mobile_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── screens/
│   │   ├── home_screen.dart      # Dashboard/home
│   │   ├── swap_screen.dart      # Crypto swap interface
│   │   ├── kyc_screen.dart       # KYC verification
│   │   └── payment_screen.dart   # Payment management
│   ├── services/
│   │   └── api_service.dart      # API communication
│   ├── models/
│   │   ├── swap_transaction.dart # Swap data models
│   │   └── kyc_status.dart       # KYC data models
│   ├── widgets/                  # Reusable widgets
│   └── utils/                    # Utilities & helpers
├── assets/                       # Images, fonts, etc.
├── android/                      # Android-specific files
├── ios/                          # iOS-specific files
├── pubspec.yaml                  # Dependencies
└── README.md                     # This file
```

## Main Screens

### 1. Home Screen
- Dashboard with feature cards
- Quick access to all features
- Security notices

### 2. Swap Screen
- Select crypto currency (BTC, ETH, USDT)
- Enter amount to swap
- Get real-time quote
- View fees and exchange rates
- Enter recipient bank details
- Initiate swap transaction
- View deposit address and instructions

### 3. KYC Screen
- View KYC levels and limits
- Submit basic information
- BVN verification
- NIN verification (future)
- Check KYC status
- Track verification progress

### 4. Payment Screen
Three tabs:
- **Pay In**: Initialize payments (Paystack/Flutterwave)
- **Pay Out**: Bank transfers and payouts
- **Banks**: Browse Nigerian banks

## API Integration

The app communicates with the backend API through `ApiService`:

```dart
// Example usage
final apiService = Provider.of<ApiService>(context, listen: false);

// Get exchange rates
final rates = await apiService.getExchangeRates('BTC', 'NGN');

// Calculate quote
final quote = await apiService.calculateQuote('BTC', 0.01, 'NGN');

// Submit KYC
final result = await apiService.submitKYC({
  'userId': 'user123',
  'firstName': 'John',
  'lastName': 'Doe',
  // ...
});
```

## Dependencies

Key packages used:

- **provider**: State management
- **http**: HTTP client
- **dio**: Advanced HTTP client
- **shared_preferences**: Local storage
- **flutter_form_builder**: Form handling
- **form_builder_validators**: Form validation
- **qr_flutter**: QR code generation
- **image_picker**: Image selection
- **intl**: Internationalization and formatting

See `pubspec.yaml` for complete list.

## Configuration

### Android Configuration

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Internet permission -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Camera permission (for QR scanning) -->
<uses-permission android:name="android.permission.CAMERA" />
```

### iOS Configuration

Edit `ios/Runner/Info.plist`:

```xml
<!-- Camera permission -->
<key>NSCameraUsageDescription</key>
<string>Camera access is required for QR code scanning</string>

<!-- Photo library permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required for uploading documents</string>
```

## Building for Production

### Android APK

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS App (requires Mac)

```bash
flutter build ios --release
```

Then open in Xcode to archive and upload to App Store.

## Testing

### Run all tests
```bash
flutter test
```

### Run with coverage
```bash
flutter test --coverage
```

### Widget testing example
```dart
testWidgets('Home screen has welcome text', (WidgetTester tester) async {
  await tester.pumpWidget(const MyApp());
  expect(find.text('Welcome to Crypto-Fiat Swap'), findsOneWidget);
});
```

## Features to Add for Production

### Security
- [ ] Implement user authentication (Firebase Auth, OAuth)
- [ ] Add biometric authentication (fingerprint, face ID)
- [ ] Secure storage for sensitive data (flutter_secure_storage)
- [ ] Certificate pinning for API calls
- [ ] Encrypt local data
- [ ] Implement session timeout

### User Experience
- [ ] Add loading skeletons
- [ ] Implement pull-to-refresh
- [ ] Add offline mode support
- [ ] Implement deep linking
- [ ] Add push notifications (FCM)
- [ ] Multi-language support
- [ ] Dark mode theme

### Features
- [ ] Transaction history
- [ ] Transaction filtering and search
- [ ] Export transaction reports
- [ ] Add more crypto currencies
- [ ] Price alerts
- [ ] Referral system
- [ ] Customer support chat

### Technical
- [ ] Implement proper error handling
- [ ] Add retry logic for failed requests
- [ ] Implement caching strategy
- [ ] Add analytics (Firebase Analytics, Mixpanel)
- [ ] Implement crash reporting (Sentry, Crashlytics)
- [ ] Add A/B testing capability
- [ ] Performance monitoring

## Nigeria-Specific Considerations

### Payment Providers
- **Paystack**: Best for Nigerian market, excellent documentation
- **Flutterwave**: Good for pan-African coverage

### KYC/BVN
- Users must consent to BVN verification
- BVN data must never be stored locally
- Use approved KYC providers only
- Comply with NDPR (Nigeria Data Protection Regulation)

### SMS Verification
- **Termii**: Cost-effective for Nigerian numbers
- **Twilio**: More expensive but reliable

### Bank Codes
Common Nigerian banks:
- Access Bank: 044
- GTBank: 058
- First Bank: 011
- UBA: 033
- Zenith Bank: 057

## Troubleshooting

### Cannot connect to backend

**Problem**: App shows network errors

**Solution**:
1. Ensure backend is running
2. Use correct IP address for your platform
3. Check firewall settings
4. For Android emulator, use `10.0.2.2` instead of `localhost`

### Build fails on iOS

**Problem**: iOS build errors

**Solution**:
```bash
cd ios
pod install
cd ..
flutter clean
flutter pub get
flutter run
```

### Hot reload not working

**Problem**: Changes not reflecting

**Solution**:
1. Perform hot restart (⌘+⇧+\ or Ctrl+Shift+\)
2. If that fails, stop and restart the app
3. Clear build cache: `flutter clean`

## Performance Tips

1. **Use const constructors** where possible
2. **Implement lazy loading** for lists
3. **Optimize images** (compress, use appropriate formats)
4. **Cache network requests** when appropriate
5. **Profile the app** regularly:
   ```bash
   flutter run --profile
   ```
6. **Use DevTools** for performance analysis:
   ```bash
   flutter pub global activate devtools
   flutter pub global run devtools
   ```

## Best Practices

### Code Organization
- Keep screens under 500 lines
- Extract reusable widgets
- Use meaningful names
- Follow Dart style guide

### State Management
- Use Provider for simple state
- Consider BLoC for complex apps
- Keep business logic separate from UI

### Error Handling
```dart
try {
  final result = await apiService.someMethod();
  // Handle success
} catch (e) {
  // Handle error
  if (e is NetworkException) {
    // Show network error
  } else {
    // Show generic error
  }
}
```

## Resources

### Flutter
- Documentation: https://docs.flutter.dev/
- Widget Catalog: https://docs.flutter.dev/development/ui/widgets
- Pub.dev: https://pub.dev/

### Payment Providers
- Paystack: https://paystack.com/docs/
- Flutterwave: https://developer.flutterwave.com/

### Nigerian Fintech
- CBN Guidelines: https://www.cbn.gov.ng/
- NDPR: https://ndpr.nitda.gov.ng/

## Support

For issues and questions:
1. Check backend logs
2. Review API responses
3. Check Flutter DevTools
4. Review this documentation

## License

ISC

## Disclaimer

This is a scaffold/demo application. Do not use in production without proper security review, testing, and compliance verification. The authors are not responsible for any financial losses or security breaches resulting from the use of this code.

---

**Remember**: This is a learning scaffold. Real production apps require:
- Professional security audit
- Legal compliance review
- User testing
- Performance optimization
- Continuous monitoring
