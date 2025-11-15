import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/swap_transaction.dart';

class SwapScreen extends StatefulWidget {
  const SwapScreen({super.key});

  @override
  State<SwapScreen> createState() => _SwapScreenState();
}

class _SwapScreenState extends State<SwapScreen> {
  final _formKey = GlobalKey<FormState>();
  final _cryptoAmountController = TextEditingController();
  final _userIdController = TextEditingController(text: 'user123');
  final _accountNumberController = TextEditingController();
  final _accountNameController = TextEditingController();
  final _bankCodeController = TextEditingController(text: '057');

  String _selectedCrypto = 'BTC';
  String _selectedFiat = 'NGN';
  SwapQuote? _quote;
  bool _isLoading = false;
  SwapTransaction? _transaction;

  final List<String> _cryptoCurrencies = ['BTC', 'ETH', 'USDT'];
  final List<String> _fiatCurrencies = ['NGN', 'USD'];

  @override
  void dispose() {
    _cryptoAmountController.dispose();
    _userIdController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    _bankCodeController.dispose();
    super.dispose();
  }

  Future<void> _getQuote() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _quote = null;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final response = await apiService.calculateQuote(
        _selectedCrypto,
        double.parse(_cryptoAmountController.text),
        _selectedFiat,
      );

      setState(() {
        _quote = SwapQuote.fromJson(response);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _initiateSwap() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final response = await apiService.initiateSwap({
        'userId': _userIdController.text,
        'cryptoCurrency': _selectedCrypto,
        'cryptoAmount': double.parse(_cryptoAmountController.text),
        'fiatCurrency': _selectedFiat,
        'recipientDetails': {
          'accountNumber': _accountNumberController.text,
          'accountName': _accountNameController.text,
          'bankCode': _bankCodeController.text,
        },
      });

      setState(() {
        _transaction = SwapTransaction.fromJson(response);
        _isLoading = false;
      });

      if (mounted) {
        _showTransactionDialog();
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

  void _showTransactionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Swap Initiated'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Transaction ID: ${_transaction!.transactionId}'),
              const SizedBox(height: 8),
              Text('Status: ${_transaction!.status}'),
              const SizedBox(height: 16),
              const Text(
                'Deposit Address:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              SelectableText(
                _transaction!.depositAddress,
                style: const TextStyle(fontFamily: 'monospace'),
              ),
              const SizedBox(height: 16),
              Text(_transaction!.instructions),
            ],
          ),
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
        title: const Text('Swap Crypto to Fiat'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // User ID (for demo)
                TextFormField(
                  controller: _userIdController,
                  decoration: const InputDecoration(
                    labelText: 'User ID',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Required' : null,
                ),
                const SizedBox(height: 16),

                // Crypto Currency Dropdown
                DropdownButtonFormField<String>(
                  value: _selectedCrypto,
                  decoration: const InputDecoration(
                    labelText: 'Crypto Currency',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.currency_bitcoin),
                  ),
                  items: _cryptoCurrencies.map((crypto) {
                    return DropdownMenuItem(
                      value: crypto,
                      child: Text(crypto),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() => _selectedCrypto = value!);
                  },
                ),
                const SizedBox(height: 16),

                // Crypto Amount
                TextFormField(
                  controller: _cryptoAmountController,
                  decoration: const InputDecoration(
                    labelText: 'Crypto Amount',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.numbers),
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

                // Fiat Currency Dropdown
                DropdownButtonFormField<String>(
                  value: _selectedFiat,
                  decoration: const InputDecoration(
                    labelText: 'Fiat Currency',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.money),
                  ),
                  items: _fiatCurrencies.map((fiat) {
                    return DropdownMenuItem(
                      value: fiat,
                      child: Text(fiat),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() => _selectedFiat = value!);
                  },
                ),
                const SizedBox(height: 20),

                // Get Quote Button
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _getQuote,
                  icon: const Icon(Icons.calculate),
                  label: const Text('Get Quote'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                ),

                // Quote Display
                if (_quote != null) ...[
                  const SizedBox(height: 20),
                  Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Quote Details',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Divider(),
                          _buildQuoteRow(
                            'Exchange Rate',
                            '1 ${_quote!.cryptoCurrency} = ${_quote!.exchangeRate.toStringAsFixed(2)} ${_quote!.fiatCurrency}',
                          ),
                          _buildQuoteRow(
                            'Gross Amount',
                            '${_quote!.grossAmount.toStringAsFixed(2)} ${_quote!.fiatCurrency}',
                          ),
                          _buildQuoteRow(
                            'Fee (${_quote!.feePercentage}%)',
                            '${_quote!.fee.toStringAsFixed(2)} ${_quote!.fiatCurrency}',
                          ),
                          const Divider(),
                          _buildQuoteRow(
                            'Net Amount',
                            '${_quote!.netAmount.toStringAsFixed(2)} ${_quote!.fiatCurrency}',
                            bold: true,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],

                // Recipient Details
                if (_quote != null) ...[
                  const SizedBox(height: 20),
                  const Text(
                    'Recipient Bank Details',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _accountNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Account Number',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.account_balance),
                    ),
                    keyboardType: TextInputType.number,
                    maxLength: 10,
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _accountNameController,
                    decoration: const InputDecoration(
                      labelText: 'Account Name',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _bankCodeController,
                    decoration: const InputDecoration(
                      labelText: 'Bank Code',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.code),
                      helperText: 'e.g., 057 for Zenith, 058 for GTBank',
                    ),
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Required' : null,
                  ),
                  const SizedBox(height: 20),

                  // Initiate Swap Button
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _initiateSwap,
                    icon: const Icon(Icons.swap_horiz),
                    label: const Text('Initiate Swap'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],

                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.all(20.0),
                    child: Center(child: CircularProgressIndicator()),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuoteRow(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
