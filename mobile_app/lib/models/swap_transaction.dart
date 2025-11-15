class SwapTransaction {
  final String transactionId;
  final String status;
  final String depositAddress;
  final String cryptoCurrency;
  final double cryptoAmount;
  final double expectedFiatAmount;
  final String expiresAt;
  final String instructions;

  SwapTransaction({
    required this.transactionId,
    required this.status,
    required this.depositAddress,
    required this.cryptoCurrency,
    required this.cryptoAmount,
    required this.expectedFiatAmount,
    required this.expiresAt,
    required this.instructions,
  });

  factory SwapTransaction.fromJson(Map<String, dynamic> json) {
    return SwapTransaction(
      transactionId: json['transactionId'] as String,
      status: json['status'] as String,
      depositAddress: json['depositAddress'] as String,
      cryptoCurrency: json['cryptoCurrency'] as String,
      cryptoAmount: (json['cryptoAmount'] as num).toDouble(),
      expectedFiatAmount: (json['expectedFiatAmount'] as num).toDouble(),
      expiresAt: json['expiresAt'] as String,
      instructions: json['instructions'] as String,
    );
  }
}

class SwapQuote {
  final String cryptoCurrency;
  final double cryptoAmount;
  final String fiatCurrency;
  final double exchangeRate;
  final double grossAmount;
  final double fee;
  final double feePercentage;
  final double netAmount;
  final String validUntil;
  final String quoteId;

  SwapQuote({
    required this.cryptoCurrency,
    required this.cryptoAmount,
    required this.fiatCurrency,
    required this.exchangeRate,
    required this.grossAmount,
    required this.fee,
    required this.feePercentage,
    required this.netAmount,
    required this.validUntil,
    required this.quoteId,
  });

  factory SwapQuote.fromJson(Map<String, dynamic> json) {
    return SwapQuote(
      cryptoCurrency: json['cryptoCurrency'] as String,
      cryptoAmount: (json['cryptoAmount'] as num).toDouble(),
      fiatCurrency: json['fiatCurrency'] as String,
      exchangeRate: (json['exchangeRate'] as num).toDouble(),
      grossAmount: (json['grossAmount'] as num).toDouble(),
      fee: (json['fee'] as num).toDouble(),
      feePercentage: (json['feePercentage'] as num).toDouble(),
      netAmount: (json['netAmount'] as num).toDouble(),
      validUntil: json['validUntil'] as String,
      quoteId: json['quoteId'] as String,
    );
  }
}
