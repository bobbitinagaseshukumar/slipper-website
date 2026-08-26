const crypto = require('crypto');
const prisma = require('../config/db');
const emailService = require('./emailService');

const OTP_SECRET = process.env.OTP_SECRET || 'aurasole_slipper_otp_secure_salt_2026';
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Hash raw 6-digit OTP with cryptographic salt
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(`${otp}_${OTP_SECRET}`).digest('hex');
};

/**
 * 1. Generate & Send Cryptographic OTP
 */
const generateAndSendOTP = async ({ email, userId = null, name = 'Valued Customer', purpose = 'LOGIN' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check resend cooldown
  const recentOTP = await prisma.oTPVerification.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      isUsed: false,
      invalidatedAt: null,
      createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOTP) {
    const elapsedSeconds = Math.floor((Date.now() - new Date(recentOTP.createdAt).getTime()) / 1000);
    const waitTime = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
    throw new Error(`Please wait ${waitTime} seconds before requesting a new verification code.`);
  }

  // Invalidate any previous unverified OTPs for this email and purpose
  await prisma.oTPVerification.updateMany({
    where: {
      email: normalizedEmail,
      purpose,
      isUsed: false,
      invalidatedAt: null,
    },
    data: {
      invalidatedAt: new Date(),
    },
  });

  // Generate 6-digit cryptographically secure OTP
  const rawOTP = crypto.randomInt(100000, 999999).toString();
  const otpHash = hashOTP(rawOTP);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store in database
  const otpRecord = await prisma.oTPVerification.create({
    data: {
      email: normalizedEmail,
      userId,
      purpose,
      otpHash,
      expiresAt,
      maxAttempts: MAX_ATTEMPTS,
    },
  });

  // Send via Nodemailer
  await emailService.sendOTPEmail({
    email: normalizedEmail,
    name,
    otp: rawOTP,
    purpose,
    expiresMinutes: OTP_EXPIRY_MINUTES,
  });

  return {
    success: true,
    requestId: otpRecord.id,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    cooldownSeconds: RESEND_COOLDOWN_SECONDS,
  };
};

/**
 * 2. Verify OTP
 */
const verifyOTP = async ({ email, otp, purpose = 'LOGIN' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const inputHash = hashOTP(otp.trim());

  const record = await prisma.oTPVerification.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      isUsed: false,
      invalidatedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    throw new Error('No active verification code found. Please request a new code.');
  }

  // Check expiration
  if (new Date() > new Date(record.expiresAt)) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { invalidatedAt: new Date() },
    });
    throw new Error('This verification code has expired. Please request a new code.');
  }

  // Check attempt limit
  if (record.attempts >= record.maxAttempts) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { invalidatedAt: new Date() },
    });
    throw new Error('Maximum verification attempts exceeded. Please request a new code.');
  }

  // Check hash match
  if (record.otpHash !== inputHash) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = record.maxAttempts - (record.attempts + 1);
    throw new Error(`Incorrect verification code. ${remaining} attempt(s) remaining.`);
  }

  // Mark as Used (One-Time Use)
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: {
      isUsed: true,
      verifiedAt: new Date(),
    },
  });

  return {
    verified: true,
    email: normalizedEmail,
    userId: record.userId,
    purpose: record.purpose,
  };
};

module.exports = {
  generateAndSendOTP,
  verifyOTP,
};
