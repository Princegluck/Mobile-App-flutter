/**
 * Fraud Detection Service
 * 
 * This service implements basic fraud detection rules.
 * In production, consider using:
 * - Machine learning models
 * - Third-party fraud detection services (Sift, Ravelin, etc.)
 * - More sophisticated rule engines
 */

// Mock user transaction history (use database in production)
const userTransactionHistory = new Map();
const suspiciousActivityReports = [];

/**
 * Check transaction for fraud
 */
async function checkTransaction(transactionData) {
  const {
    userId,
    amount,
    currency,
    type,
    ipAddress,
    deviceId,
    location
  } = transactionData;

  const riskScore = await calculateRiskScore(transactionData);
  const threshold = parseFloat(process.env.FRAUD_DETECTION_THRESHOLD) || 0.7;

  const checks = {
    velocityCheck: checkTransactionVelocity(userId),
    amountCheck: checkTransactionAmount(amount, currency),
    patternCheck: checkTransactionPattern(userId, amount, type),
    locationCheck: checkLocation(userId, location),
    deviceCheck: checkDevice(userId, deviceId)
  };

  const approved = riskScore < threshold;

  // Log transaction check
  logTransactionCheck(userId, transactionData, riskScore, approved);

  return {
    approved,
    riskScore,
    threshold,
    checks,
    reason: approved ? null : getRejectionReason(checks, riskScore),
    requiresReview: riskScore >= threshold && riskScore < 0.9,
    blocked: riskScore >= 0.9
  };
}

/**
 * Calculate risk score (0-1, higher = more risky)
 */
async function calculateRiskScore(transactionData) {
  const { userId, amount, type } = transactionData;

  let score = 0;

  // Check transaction velocity
  const velocityScore = getVelocityScore(userId);
  score += velocityScore * 0.3;

  // Check transaction amount
  const amountScore = getAmountScore(amount);
  score += amountScore * 0.25;

  // Check user history
  const historyScore = getUserHistoryScore(userId);
  score += historyScore * 0.2;

  // Check time of day (unusual hours = higher risk)
  const timeScore = getTimeScore();
  score += timeScore * 0.1;

  // Check transaction pattern
  const patternScore = getPatternScore(userId, type);
  score += patternScore * 0.15;

  return Math.min(score, 1);
}

/**
 * Check transaction velocity (number of transactions in time window)
 */
function checkTransactionVelocity(userId) {
  const history = userTransactionHistory.get(userId) || [];
  const recentTransactions = history.filter(tx => {
    const timeDiff = Date.now() - tx.timestamp;
    return timeDiff < 24 * 60 * 60 * 1000; // Last 24 hours
  });

  const maxVelocity = parseInt(process.env.MAX_TRANSACTION_VELOCITY) || 5;
  const passed = recentTransactions.length < maxVelocity;

  return {
    passed,
    count: recentTransactions.length,
    limit: maxVelocity
  };
}

/**
 * Get velocity risk score
 */
function getVelocityScore(userId) {
  const history = userTransactionHistory.get(userId) || [];
  const recentCount = history.filter(tx => {
    const timeDiff = Date.now() - tx.timestamp;
    return timeDiff < 24 * 60 * 60 * 1000;
  }).length;

  const maxVelocity = parseInt(process.env.MAX_TRANSACTION_VELOCITY) || 5;
  return Math.min(recentCount / maxVelocity, 1);
}

/**
 * Check transaction amount
 */
function checkTransactionAmount(amount, currency) {
  const maxAmount = parseFloat(process.env.MAX_DAILY_TRANSACTION_AMOUNT) || 5000000;
  
  // Convert to NGN if needed (simplified)
  let amountInNGN = amount;
  if (currency !== 'NGN') {
    // Apply conversion rate (simplified, use real rates in production)
    amountInNGN = amount * 1550; // Assuming USD to NGN
  }

  const passed = amountInNGN <= maxAmount;

  return {
    passed,
    amount: amountInNGN,
    limit: maxAmount,
    currency: 'NGN'
  };
}

/**
 * Get amount risk score
 */
function getAmountScore(amount) {
  const maxAmount = parseFloat(process.env.MAX_DAILY_TRANSACTION_AMOUNT) || 5000000;
  return Math.min(amount / maxAmount, 1);
}

/**
 * Check transaction pattern
 */
function checkTransactionPattern(userId, amount, type) {
  const history = userTransactionHistory.get(userId) || [];
  
  if (history.length === 0) {
    return {
      passed: true,
      reason: 'First transaction'
    };
  }

  // Check for unusual amount compared to history
  const avgAmount = history.reduce((sum, tx) => sum + tx.amount, 0) / history.length;
  const isUnusual = amount > avgAmount * 3;

  return {
    passed: !isUnusual,
    averageAmount: avgAmount,
    currentAmount: amount,
    ratio: amount / avgAmount
  };
}

/**
 * Get pattern risk score
 */
function getPatternScore(userId, type) {
  const history = userTransactionHistory.get(userId) || [];
  
  if (history.length === 0) {
    return 0.3; // Slight risk for new users
  }

  // Check for rapid increase in transaction amounts
  const recentTransactions = history.slice(-5);
  if (recentTransactions.length >= 3) {
    const amounts = recentTransactions.map(tx => tx.amount);
    const isIncreasing = amounts.every((val, i) => i === 0 || val >= amounts[i - 1]);
    if (isIncreasing) {
      return 0.6; // Higher risk for steadily increasing amounts
    }
  }

  return 0.1;
}

/**
 * Check location
 */
function checkLocation(userId, location) {
  // In production, check if location is unusual for this user
  return {
    passed: true,
    location: location || 'unknown'
  };
}

/**
 * Check device
 */
function checkDevice(userId, deviceId) {
  // In production, check if device is known for this user
  return {
    passed: true,
    deviceId: deviceId || 'unknown'
  };
}

/**
 * Get user history score
 */
function getUserHistoryScore(userId) {
  const history = userTransactionHistory.get(userId) || [];
  
  if (history.length === 0) {
    return 0.3; // New user = moderate risk
  }
  
  if (history.length < 5) {
    return 0.2; // Few transactions = slight risk
  }

  return 0.05; // Established user = low risk
}

/**
 * Get time-based risk score
 */
function getTimeScore() {
  const hour = new Date().getHours();
  
  // Higher risk during unusual hours (2 AM - 5 AM)
  if (hour >= 2 && hour <= 5) {
    return 0.3;
  }
  
  return 0.05;
}

/**
 * Get rejection reason
 */
function getRejectionReason(checks, riskScore) {
  const reasons = [];

  if (!checks.velocityCheck.passed) {
    reasons.push(`Transaction velocity exceeded (${checks.velocityCheck.count}/${checks.velocityCheck.limit})`);
  }

  if (!checks.amountCheck.passed) {
    reasons.push(`Amount exceeds daily limit (${checks.amountCheck.amount}/${checks.amountCheck.limit})`);
  }

  if (!checks.patternCheck.passed) {
    reasons.push('Unusual transaction pattern detected');
  }

  if (reasons.length === 0) {
    reasons.push('High risk score detected');
  }

  return reasons.join('; ');
}

/**
 * Log transaction check
 */
function logTransactionCheck(userId, transactionData, riskScore, approved) {
  const history = userTransactionHistory.get(userId) || [];
  
  history.push({
    ...transactionData,
    timestamp: Date.now(),
    riskScore,
    approved
  });

  userTransactionHistory.set(userId, history);
}

/**
 * Get user risk profile
 */
async function getUserRiskProfile(userId) {
  const history = userTransactionHistory.get(userId) || [];
  
  const totalTransactions = history.length;
  const blockedTransactions = history.filter(tx => !tx.approved).length;
  const totalAmount = history.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const avgRiskScore = history.length > 0
    ? history.reduce((sum, tx) => sum + (tx.riskScore || 0), 0) / history.length
    : 0;

  let riskLevel = 'low';
  if (avgRiskScore > 0.7) riskLevel = 'high';
  else if (avgRiskScore > 0.4) riskLevel = 'medium';

  return {
    userId,
    riskLevel,
    totalTransactions,
    blockedTransactions,
    totalAmount,
    avgRiskScore,
    lastTransaction: history[history.length - 1]?.timestamp
  };
}

/**
 * Report suspicious activity
 */
async function reportSuspiciousActivity(reportData) {
  const report = {
    ...reportData,
    reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    status: 'pending_review'
  };

  suspiciousActivityReports.push(report);

  console.log('Suspicious activity reported:', report.reportId);

  return {
    reportId: report.reportId,
    status: report.status,
    message: 'Report submitted successfully. Our team will review it.'
  };
}

/**
 * Get fraud statistics
 */
async function getFraudStatistics(startDate, endDate) {
  // In production, query from database
  const allTransactions = Array.from(userTransactionHistory.values()).flat();
  
  const filtered = allTransactions.filter(tx => {
    if (!startDate || !endDate) return true;
    return tx.timestamp >= new Date(startDate).getTime() &&
           tx.timestamp <= new Date(endDate).getTime();
  });

  const totalChecks = filtered.length;
  const blocked = filtered.filter(tx => !tx.approved).length;
  const avgRiskScore = filtered.length > 0
    ? filtered.reduce((sum, tx) => sum + (tx.riskScore || 0), 0) / filtered.length
    : 0;

  return {
    totalChecks,
    blocked,
    approved: totalChecks - blocked,
    blockRate: totalChecks > 0 ? (blocked / totalChecks * 100).toFixed(2) : 0,
    avgRiskScore: avgRiskScore.toFixed(3),
    reports: suspiciousActivityReports.length
  };
}

module.exports = {
  checkTransaction,
  getUserRiskProfile,
  reportSuspiciousActivity,
  getFraudStatistics
};
