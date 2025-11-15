import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _formKey = GlobalKey<FormState>();

  // Payment form controllers
  final _emailController = TextEditingController();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _bankCodeController = TextEditingController();

  String _selectedProvider = 'paystack';
  bool _isLoading = false;
  List<dynamic>? _banks;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadBanks();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _amountController.dispose();
    _phoneController.dispose();
    _accountNumberController.dispose();
    _bankCodeController.dispose();
    super.dispose();
  }

  Future<void> _loadBanks() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final response = await apiService.getBanks(_selectedProvider);
      setState(() {
        _banks = response['banks'] as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading banks: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _initializePayment() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      Map<String, dynamic> response;

      if (_selectedProvider == 'paystack') {
        response = await apiService.initializePaystackPayment({
          'email': _emailController.text,
          'amount': double.parse(_amountController.text),
          'currency': 'NGN',
        });
      } else {
        response = await apiService.initializeFlutterwavePayment({
          'email': _emailController.text,
          'amount': double.parse(_amountController.text),
          'phone_number': _phoneController.text,
          'tx_ref': 'TXN_${DateTime.now().millisecondsSinceEpoch}',
        });
      }

      setState(() => _isLoading = false);

      if (mounted) {
        _showPaymentDialog(response);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _resolveAccount() async {
    if (_accountNumberController.text.isEmpty ||
        _bankCodeController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter account number and bank code')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final response = await apiService.resolveAccount(
        _accountNumberController.text,
        _bankCodeController.text,
        _selectedProvider,
      );

      setState(() => _isLoading = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Account Name: ${response['accountName']}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  void _showPaymentDialog(Map<String, dynamic> response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Payment Initialized'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Reference: ${response['reference'] ?? response['data']?['tx_ref']}'),
            const SizedBox(height: 8),
            if (response['authorizationUrl'] != null)
              Text('URL: ${response['authorizationUrl']}'),
            if (response['paymentLink'] != null)
              Text('URL: ${response['paymentLink']}'),
            const SizedBox(height: 12),
            const Text(
              'In production, this would redirect to the payment gateway.',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pay In', icon: Icon(Icons.payment)),
            Tab(text: 'Pay Out', icon: Icon(Icons.send)),
            Tab(text: 'Banks', icon: Icon(Icons.account_balance)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPayInTab(),
          _buildPayOutTab(),
          _buildBanksTab(),
        ],
      ),
    );
  }

  Widget _buildPayInTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Accept Payment',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Provider Selection
                    DropdownButtonFormField<String>(
                      value: _selectedProvider,
                      decoration: const InputDecoration(
                        labelText: 'Payment Provider',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'paystack',
                          child: Text('Paystack'),
                        ),
                        DropdownMenuItem(
                          value: 'flutterwave',
                          child: Text('Flutterwave'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedProvider = value!;
                          _loadBanks();
                        });
                      },
                    ),
                    const SizedBox(height: 16),

                    // Email
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.email),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value?.isEmpty ?? true) return 'Required';
                        if (!value!.contains('@')) return 'Invalid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Amount
                    TextFormField(
                      controller: _amountController,
                      decoration: const InputDecoration(
                        labelText: 'Amount (NGN)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.money),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) return 'Required';
                        if (double.tryParse(value!) == null) {
                          return 'Invalid amount';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Phone (for Flutterwave)
                    if (_selectedProvider == 'flutterwave')
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                    const SizedBox(height: 20),

                    // Submit Button
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _initializePayment,
                      icon: const Icon(Icons.payment),
                      label: const Text('Initialize Payment'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Info Card
            const SizedBox(height: 16),
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue[800]),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'This initializes a payment link. In production, users would be redirected to complete payment.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue[900],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.all(20.0),
                child: Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayOutTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Send Money (Payout)',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Provider
                  DropdownButtonFormField<String>(
                    value: _selectedProvider,
                    decoration: const InputDecoration(
                      labelText: 'Payment Provider',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'paystack',
                        child: Text('Paystack'),
                      ),
                      DropdownMenuItem(
                        value: 'flutterwave',
                        child: Text('Flutterwave'),
                      ),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedProvider = value!;
                        _loadBanks();
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  // Account Number
                  TextFormField(
                    controller: _accountNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Account Number',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.account_balance),
                    ),
                    keyboardType: TextInputType.number,
                    maxLength: 10,
                  ),
                  const SizedBox(height: 16),

                  // Bank Code
                  TextFormField(
                    controller: _bankCodeController,
                    decoration: const InputDecoration(
                      labelText: 'Bank Code',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.code),
                      helperText: 'e.g., 057 for Zenith',
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Resolve Account Button
                  OutlinedButton.icon(
                    onPressed: _isLoading ? null : _resolveAccount,
                    icon: const Icon(Icons.search),
                    label: const Text('Verify Account'),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          Card(
            color: Colors.orange[50],
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                children: [
                  Icon(Icons.warning_amber, color: Colors.orange[800]),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Payout functionality requires sufficient balance in your payment provider account.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.orange[900],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(20.0),
              child: Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildBanksTab() {
    return _banks == null
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: _banks!.length,
            itemBuilder: (context, index) {
              final bank = _banks![index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      bank['name']?.toString().substring(0, 1) ?? '?',
                    ),
                  ),
                  title: Text(bank['name']?.toString() ?? 'Unknown'),
                  subtitle: Text('Code: ${bank['code'] ?? bank['bank_code']}'),
                  onTap: () {
                    setState(() {
                      _bankCodeController.text =
                          bank['code']?.toString() ?? bank['bank_code']?.toString() ?? '';
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Selected: ${bank['name']}'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                ),
              );
            },
          );
  }
}
