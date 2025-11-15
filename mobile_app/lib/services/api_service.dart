import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl;

  ApiService({required this.baseUrl});

  // Helper method for GET requests
  Future<Map<String, dynamic>> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    try {
      final response = await http.get(url);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Helper method for POST requests
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    final url = Uri.parse('$baseUrl$endpoint');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Handle API response
  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']?['message'] ?? 'Request failed');
    }
  }

  // Swap endpoints
  Future<Map<String, dynamic>> getExchangeRates(
    String cryptoCurrency,
    String fiatCurrency,
  ) async {
    return get('/api/swap/rates?cryptoCurrency=$cryptoCurrency&fiatCurrency=$fiatCurrency');
  }

  Future<Map<String, dynamic>> calculateQuote(
    String cryptoCurrency,
    double cryptoAmount,
    String fiatCurrency,
  ) async {
    return post('/api/swap/quote', {
      'cryptoCurrency': cryptoCurrency,
      'cryptoAmount': cryptoAmount,
      'fiatCurrency': fiatCurrency,
    });
  }

  Future<Map<String, dynamic>> initiateSwap(Map<String, dynamic> swapData) async {
    return post('/api/swap/initiate', swapData);
  }

  Future<Map<String, dynamic>> getTransactionStatus(String transactionId) async {
    return get('/api/swap/status/$transactionId');
  }

  // KYC endpoints
  Future<Map<String, dynamic>> submitKYC(Map<String, dynamic> kycData) async {
    return post('/api/kyc/submit', kycData);
  }

  Future<Map<String, dynamic>> verifyBVN(Map<String, dynamic> bvnData) async {
    return post('/api/kyc/verify-bvn', bvnData);
  }

  Future<Map<String, dynamic>> getKYCStatus(String userId) async {
    return get('/api/kyc/status/$userId');
  }

  Future<Map<String, dynamic>> getKYCLevels() async {
    return get('/api/kyc/levels');
  }

  // SMS endpoints
  Future<Map<String, dynamic>> sendVerificationCode(
    String phoneNumber,
    String provider,
  ) async {
    return post('/api/sms/send-code', {
      'phoneNumber': phoneNumber,
      'provider': provider,
    });
  }

  Future<Map<String, dynamic>> verifyCode(
    String phoneNumber,
    String code,
  ) async {
    return post('/api/sms/verify-code', {
      'phoneNumber': phoneNumber,
      'code': code,
    });
  }

  // Payment endpoints
  Future<Map<String, dynamic>> initializePaystackPayment(
    Map<String, dynamic> paymentData,
  ) async {
    return post('/api/payment/paystack/initialize', paymentData);
  }

  Future<Map<String, dynamic>> initializeFlutterwavePayment(
    Map<String, dynamic> paymentData,
  ) async {
    return post('/api/payment/flutterwave/initialize', paymentData);
  }

  Future<Map<String, dynamic>> getBanks(String provider) async {
    return get('/api/payment/banks?provider=$provider');
  }

  Future<Map<String, dynamic>> resolveAccount(
    String accountNumber,
    String bankCode,
    String provider,
  ) async {
    return get('/api/payment/resolve-account?accountNumber=$accountNumber&bankCode=$bankCode&provider=$provider');
  }

  // Fraud detection
  Future<Map<String, dynamic>> analyzeTransaction(
    Map<String, dynamic> transactionData,
  ) async {
    return post('/api/fraud/analyze', transactionData);
  }
}
