const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const otpService = require('../services/otpService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_slipper_store_luxury_2026_secure';
const JWT_EXPIRES_IN = '7d';

/**
 * 1. Public / Customer: Request OTP
 */
const sendCustomerOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'LOGIN', name } = req.body;
    if (!email || !email.includes('@')) {
      return errorResponse(res, 'Please provide a valid email address.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user && (user.status === 'BLOCKED' || user.status === 'DELETED')) {
      return errorResponse(res, 'Your account has been restricted. Please contact support.', 403);
    }

    const result = await otpService.generateAndSendOTP({
      email: normalizedEmail,
      userId: user?.id || null,
      name: name || user?.name || 'Customer',
      purpose,
    });

    return successResponse(res, `Verification code sent to ${normalizedEmail}`, result);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to send verification code', 400);
  }
};

/**
 * 2. Public / Customer: Verify OTP and Issue Session
 */
const verifyCustomerOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose = 'LOGIN', name } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 'Email and verification code are required.', 400);
    }

    // Verify OTP cryptographically
    const verification = await otpService.verifyOTP({ email, otp, purpose });

    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // If new registration, create user profile atomically
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || 'AuraSole Member',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      // Initialize Cart & Wishlist
      await prisma.cart.create({ data: { userId: user.id } });
      await prisma.wishlist.create({ data: { userId: user.id } });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    // Generate JWT Auth Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return successResponse(res, 'Verification successful! Welcome to AuraSole.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || 'OTP verification failed', 400);
  }
};

/**
 * 3. Admin: Step 1 — Credentials Check & Mandatory Admin OTP Dispatch
 */
const sendAdminLoginOTP = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required for admin authentication.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return errorResponse(res, 'Invalid administrator credentials.', 401);
    }

    if (admin.status !== 'ACTIVE') {
      return errorResponse(res, 'Your administrative account is suspended.', 403);
    }

    // Verify Password
    if (admin.passwordHash) {
      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'Invalid administrator credentials.', 401);
      }
    }

    // Dispatch mandatory Admin OTP
    const result = await otpService.generateAndSendOTP({
      email: normalizedEmail,
      userId: admin.id,
      name: admin.name,
      purpose: 'ADMIN_LOGIN',
    });

    return successResponse(
      res,
      `Administrator security code dispatched to ${normalizedEmail}`,
      { email: normalizedEmail, ...result }
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to initiate admin authentication', 400);
  }
};

/**
 * 4. Admin: Step 2 — Verify Mandatory Admin OTP and Authorize Session
 */
const verifyAdminLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 'Admin email and 6-digit verification code are required.', 400);
    }

    const verification = await otpService.verifyOTP({
      email,
      otp,
      purpose: 'ADMIN_LOGIN',
    });

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return errorResponse(res, 'Unauthorized access.', 403);
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Record Activity
    await prisma.adminActivity.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_2FA_LOGIN',
        details: 'Admin authenticated successfully with 2-Factor OTP',
      },
    });

    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, 'Admin 2FA verification verified successfully.', {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || 'Admin OTP verification failed', 400);
  }
};

module.exports = {
  sendCustomerOTP,
  verifyCustomerOTP,
  sendAdminLoginOTP,
  verifyAdminLoginOTP,
};
