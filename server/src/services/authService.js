const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const sessionService = require('./sessionService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_slipper_store_luxury_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'; // 30-day token boundary, inactivity governed by DB session

const generateToken = (userId, role, sessionToken = '', sessionId = '') => {
  return jwt.sign({ userId, role, sessionToken, sessionId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
};

/**
 * Register a new customer & create initial DB session
 */
const register = async ({ name, email, phone, password, userAgent = '', ipAddress = '' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check existing email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists. Please log in.');
    error.statusCode = 409;
    throw error;
  }

  // Check phone if provided
  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      const error = new Error('An account with this phone number already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user + default cart + wishlist in transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    await tx.cart.create({
      data: { userId: user.id },
    });

    await tx.wishlist.create({
      data: { userId: user.id },
    });

    return user;
  });

  // Create Session in Database
  const session = await sessionService.createSession({
    userId: newUser.id,
    userAgent,
    ipAddress,
  });

  const token = generateToken(newUser.id, newUser.role, session.sessionToken, session.id);

  return {
    user: sanitizeUser(newUser),
    token,
    session: {
      id: session.id,
      deviceType: session.deviceType,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
    },
  };
};

/**
 * Log in a user (Customer or Admin) & create active DB session
 */
const login = async ({ email, password, userAgent = '', ipAddress = '' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'BLOCKED' || user.status === 'DELETED') {
    const error = new Error('This account has been suspended. Please contact customer support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create Session in Database
  const session = await sessionService.createSession({
    userId: user.id,
    userAgent,
    ipAddress,
  });

  const token = generateToken(user.id, user.role, session.sessionToken, session.id);

  return {
    user: sanitizeUser(user),
    token,
    session: {
      id: session.id,
      deviceType: session.deviceType,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
    },
  };
};

/**
 * Initiate Forgot Password
 */
const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Always return generic success to prevent email enumeration
  if (!user) {
    return { success: true, message: 'If an account exists with this email, recovery instructions have been sent.' };
  }

  // Generate crypto token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiry,
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔑 Password Reset Link for ${normalizedEmail}: /reset-password/${rawToken}`);
  }

  return {
    success: true,
    message: 'If an account exists with this email, recovery instructions have been sent.',
    devResetToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
  };
};

/**
 * Reset Password with token & force revoke existing sessions
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error('This password reset link is invalid or has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // For maximum account security: Revoke all existing sessions and force re-login on all devices
  await sessionService.revokeAllUserSessions(user.id, 'PASSWORD_RESET');

  return { success: true, message: 'Password has been successfully updated. All sessions have been logged out for security. Please log in with your new password.' };
};

/**
 * Synchronize Firebase Authenticated Customer & Create DB session
 */
const firebaseSync = async ({ firebaseUid, email, name, photoURL, loginProvider = 'GOOGLE', userAgent = '', ipAddress = '' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid },
        { email: normalizedEmail },
      ],
    },
    include: {
      addresses: true,
      orders: { select: { id: true } },
    },
  });

  let isNewCustomer = false;

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: user.firebaseUid || firebaseUid,
        lastLoginAt: new Date(),
        profileImage: photoURL || user.profileImage,
        loginProvider: loginProvider || user.loginProvider,
      },
      include: {
        addresses: true,
        orders: { select: { id: true } },
      },
    });
  } else {
    isNewCustomer = true;
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firebaseUid,
          name: name ? name.trim() : 'Valued Footwear Enthusiast',
          email: normalizedEmail,
          profileImage: photoURL || null,
          loginProvider,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          isProfileComplete: false,
          lastLoginAt: new Date(),
          welcomeEmailSentAt: new Date(),
        },
      });

      await tx.cart.create({
        data: { userId: newUser.id },
      });

      await tx.wishlist.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    user.addresses = [];
    user.orders = [];
  }

  // Create active session in DB
  const session = await sessionService.createSession({
    userId: user.id,
    userAgent,
    ipAddress,
  });

  const token = generateToken(user.id, user.role, session.sessionToken, session.id);

  return {
    user: sanitizeUser(user),
    token,
    session: {
      id: session.id,
      deviceType: session.deviceType,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
    },
    isNewCustomer,
    isProfileComplete: user.isProfileComplete || Boolean(user.phone && user.addresses?.length > 0),
  };
};

/**
 * Complete Profile Onboarding for New or Returning Customer
 */
const completeOnboarding = async (userId, data) => {
  const { phone, address, preferredSize, preferredCategory } = data;

  const updateData = {
    isProfileComplete: true,
  };

  if (phone) updateData.phone = phone.trim();
  if (preferredSize) updateData.preferredSize = String(preferredSize);
  if (preferredCategory) updateData.preferredCategory = preferredCategory;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  if (address && address.fullName && address.addressLine1 && address.postalCode) {
    const existingCount = await prisma.address.count({ where: { userId } });
    await prisma.address.create({
      data: {
        userId,
        fullName: address.fullName.trim(),
        phone: address.phone ? address.phone.trim() : (phone || user.phone || '9999999999'),
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2 ? address.addressLine2.trim() : null,
        landmark: address.landmark ? address.landmark.trim() : null,
        city: address.city ? address.city.trim() : 'City',
        state: address.state ? address.state.trim() : 'State',
        postalCode: address.postalCode.trim(),
        country: address.country || 'India',
        addressType: address.addressType || 'HOME',
        isDefault: existingCount === 0,
      },
    });
  }

  const updatedProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });

  return sanitizeUser(updatedProfile);
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  firebaseSync,
  completeOnboarding,
  sanitizeUser,
};
