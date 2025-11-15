const axios = require('axios');

/**
 * KYC Service - Handles Know Your Customer verification
 * 
 * IMPORTANT SECURITY NOTES:
 * - This is a SCAFFOLD implementation for demonstration
 * - In production, NEVER store BVN/NIN in your database
 * - Use approved KYC providers: Youverify, Smile Identity, Dojah
 * - Comply with Nigeria Data Protection Regulation (NDPR)
 * - All PII must be encrypted in transit and at rest
 * - Implement proper audit logging
 */

// Mock KYC store (use secure database in production)
const kycRecords = new Map();

/**
 * Submit KYC information
 */
async function submitKYC(kycData) {
  const {
    userId,
    firstName,
    lastName,
    dateOfBirth,
    bvn,
    nin,
    phoneNumber,
    address,
    idType,
    idNumber,
    selfieImage,
    idImage
  } = kycData;

  // Create KYC record
  const kycRecord = {
    userId,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    address,
    idType,
    idNumber,
    status: 'pending',
    level: 1,
    verifications: {
      phone: false,
      bvn: false,
      nin: false,
      identity: false,
      selfie: false
    },
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Store record (use secure database in production)
  kycRecords.set(userId, kycRecord);

  return {
    userId,
    status: 'pending',
    message: 'KYC information submitted successfully',
    nextSteps: [
      'Verify your phone number',
      'Complete BVN verification',
      'Upload identity documents'
    ]
  };
}

/**
 * Verify BVN (Bank Verification Number)
 * 
 * CRITICAL: This is a MOCK implementation
 * In production:
 * 1. Use approved providers (Youverify, Smile Identity, Dojah)
 * 2. Never store BVN in your database
 * 3. Always verify server-side only
 * 4. Log all verification attempts
 */
async function verifyBVN(verificationData) {
  const { userId, bvn, firstName, lastName, dateOfBirth } = verificationData;

  // In production, call KYC provider API
  // Example with Youverify:
  /*
  const response = await axios.post(
    `${process.env.KYC_PROVIDER_API_URL}/bvn/verify`,
    {
      bvn,
      firstName,
      lastName,
      dateOfBirth
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.KYC_PROVIDER_API_KEY}`
      }
    }
  );
  */

  // Mock verification result
  const mockVerified = true; // In production, use actual API response

  const kycRecord = kycRecords.get(userId) || {
    userId,
    verifications: {},
    status: 'pending'
  };

  kycRecord.verifications.bvn = mockVerified;
  kycRecord.updatedAt = new Date().toISOString();

  // Update KYC level based on verifications
  if (mockVerified) {
    kycRecord.level = Math.max(kycRecord.level || 1, 2);
    kycRecord.status = 'verified_level_2';
  }

  kycRecords.set(userId, kycRecord);

  return {
    userId,
    verified: mockVerified,
    level: kycRecord.level,
    message: mockVerified 
      ? 'BVN verified successfully' 
      : 'BVN verification failed. Please check your details.',
    details: mockVerified ? {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      phone: '080********', // Masked for privacy
      matchScore: 0.95
    } : null
  };
}

/**
 * Verify NIN (National Identity Number)
 */
async function verifyNIN(verificationData) {
  const { userId, nin, firstName, lastName } = verificationData;

  // In production, call KYC provider API similar to BVN
  
  // Mock verification result
  const mockVerified = true;

  const kycRecord = kycRecords.get(userId) || {
    userId,
    verifications: {},
    status: 'pending'
  };

  kycRecord.verifications.nin = mockVerified;
  kycRecord.updatedAt = new Date().toISOString();

  if (mockVerified) {
    kycRecord.level = Math.max(kycRecord.level || 1, 2);
    kycRecord.status = 'verified_level_2';
  }

  kycRecords.set(userId, kycRecord);

  return {
    userId,
    verified: mockVerified,
    level: kycRecord.level,
    message: mockVerified 
      ? 'NIN verified successfully' 
      : 'NIN verification failed. Please check your details.'
  };
}

/**
 * Get KYC status
 */
async function getKYCStatus(userId) {
  const kycRecord = kycRecords.get(userId);

  if (!kycRecord) {
    return {
      userId,
      status: 'not_started',
      level: 0,
      verifications: {},
      message: 'No KYC information found'
    };
  }

  return {
    userId,
    status: kycRecord.status,
    level: kycRecord.level,
    verifications: kycRecord.verifications,
    submittedAt: kycRecord.submittedAt,
    updatedAt: kycRecord.updatedAt,
    limits: getKYCLimits(kycRecord.level)
  };
}

/**
 * Get transaction limits based on KYC level
 */
function getKYCLimits(level) {
  const limits = {
    0: { daily: 0, monthly: 0 },
    1: { daily: 50000, monthly: 500000 },
    2: { daily: 500000, monthly: 5000000 },
    3: { daily: 5000000, monthly: 50000000 }
  };

  return limits[level] || limits[0];
}

module.exports = {
  submitKYC,
  verifyBVN,
  verifyNIN,
  getKYCStatus,
  getKYCLimits
};
