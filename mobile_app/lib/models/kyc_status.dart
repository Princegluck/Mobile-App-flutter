class KYCStatus {
  final String userId;
  final String status;
  final int level;
  final Map<String, bool> verifications;
  final KYCLimits limits;

  KYCStatus({
    required this.userId,
    required this.status,
    required this.level,
    required this.verifications,
    required this.limits,
  });

  factory KYCStatus.fromJson(Map<String, dynamic> json) {
    return KYCStatus(
      userId: json['userId'] as String,
      status: json['status'] as String,
      level: json['level'] as int,
      verifications: Map<String, bool>.from(json['verifications'] ?? {}),
      limits: KYCLimits.fromJson(json['limits'] ?? {}),
    );
  }
}

class KYCLimits {
  final double daily;
  final double monthly;

  KYCLimits({required this.daily, required this.monthly});

  factory KYCLimits.fromJson(Map<String, dynamic> json) {
    return KYCLimits(
      daily: (json['daily'] as num?)?.toDouble() ?? 0.0,
      monthly: (json['monthly'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class KYCLevel {
  final int level;
  final String name;
  final List<String> requirements;
  final KYCLimits limits;

  KYCLevel({
    required this.level,
    required this.name,
    required this.requirements,
    required this.limits,
  });

  factory KYCLevel.fromJson(Map<String, dynamic> json) {
    return KYCLevel(
      level: json['level'] as int,
      name: json['name'] as String,
      requirements: List<String>.from(json['requirements'] ?? []),
      limits: KYCLimits.fromJson(json['limits'] ?? {}),
    );
  }
}
