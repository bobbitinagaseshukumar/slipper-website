const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const sessionService = require('./sessionService');
const emailService = require('./emailService');
const storeSettingsService = require('./storeSettingsService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_slipper_store_luxury_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (userId, role, sessionToken = '', sessionId = '') => {
  return jwt.sign({ userId, role, sessionToken, sessionId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
};

/**
 * Helper to log auth audit events into AdminActivity
 */
const logAuthActivity = async ({ action, description, performedBy = 'SYSTEM', targetId = null, targetType = 'USER', metadata = {} }) => {
  try {
    await prisma.adminActivity.create({
      data: {
        action,
        description,
        performedBy,
        targetId,
        targetType,
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (err) {
    console.warn(`[AuditLog] Failed to log auth activity: ${action}`, err.message);
  }
};

/**
 * Validate password against store password policy
 */
const validatePasswordPolicy = (password, settings) => {
  const minLength = settings.passwordMinLength || 6;
  if (!password || password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long.`);
  }
  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter (A-Z).');
  }
  if (settings.passwordRequireNumber && !/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number (0-9).');
  }
  if (settings.passwordRequireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new Error('Password must contain at least one special character (e.g. !@#$%^&*).');
  }
};

/**
 * Get Public Authentication Settings for the Customer Login/Register Page
 */
const getPublicAuthSettings = async () => {
  const store = await storeSettingsService.getStoreSettings().catch(() => ({}));
  const customFields = await prisma.customRegistrationField.findMany({
    where: { isEnabled: true },
    orderBy: { displayOrder: 'asc' },
  });

  return {
    emailLoginEnabled: store.emailLoginEnabled !== false,
    googleLoginEnabled: store.googleLoginEnabled !== false,
    facebookLoginEnabled: store.facebookLoginEnabled !== false,
    phoneLoginEnabled: store.phoneLoginEnabled !== false,
    otpLoginEnabled: store.otpLoginEnabled !== false,
    registrationEnabled: store.registrationEnabled !== false,
    forgotPasswordEnabled: store.forgotPasswordEnabled !== false,
    loginTitle: store.loginTitle || 'Welcome Back',
    loginSubtitle: store.loginSubtitle || 'Step into your personalized comfort showroom and orders.',
    loginWelcomeMessage: store.loginWelcomeMessage || 'Doctor-Engineered Cloud Slippers • Handcrafted Daily Luxury',
    loginBgImage: store.loginBgImage || null,
    registerTitle: store.registerTitle || 'Create Your Account',
    registerSubtitle: store.registerSubtitle || 'Join for exclusive slipper drops & priority shipping.',
    registerWelcomeMessage: store.registerWelcomeMessage || 'Handcrafted luxury comfort engineered for everyday elegance.',
    passwordPolicy: {
      minLength: store.passwordMinLength || 6,
      requireUppercase: Boolean(store.passwordRequireUppercase),
      requireNumber: Boolean(store.passwordRequireNumber),
      requireSpecialChar: Boolean(store.passwordRequireSpecialChar),
    },
    registrationFields: customFields.map((f) => ({
      id: f.id,
      fieldName: f.fieldName,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      placeholder: f.placeholder,
      options: f.options ? f.options.split(',').map((s) => s.trim()) : [],
      isRequired: f.isRequired,
      isCustomerEditable: f.isCustomerEditable,
      displayOrder: f.displayOrder,
    })),
  };
};

/**
 * Register a new customer with dynamic field validation & password rules
 */
const register = async ({
  name,
  email,
  password,
  phone = null,
  whatsappNumber = null,
  customFields = {},
  userAgent = '',
  ipAddress = '',
}) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));

  if (settings.registrationEnabled === false) {
    const error = new Error('Customer registration is temporarily disabled by store administrator.');
    error.statusCode = 403;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check existing email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('This email is already registered. Please log in or use Forgot Password.');
    error.statusCode = 409;
    throw error;
  }

  // Check unique phone if provided
  if (phone && phone.trim()) {
    const cleanPhone = phone.trim();
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      const error = new Error('An account with this phone number already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Enforce password policy
  validatePasswordPolicy(password, settings);

  // Validate all enabled and required custom fields
  const activeCustomFields = await prisma.customRegistrationField.findMany({
    where: { isEnabled: true },
  });

  const mergedCustomFields = { ...customFields };
  if (whatsappNumber && !mergedCustomFields.whatsappNumber) {
    mergedCustomFields.whatsappNumber = whatsappNumber;
  }
  if (phone && !mergedCustomFields.phone) {
    mergedCustomFields.phone = phone;
  }

  for (const field of activeCustomFields) {
    if (field.isRequired) {
      const val = mergedCustomFields[field.fieldKey] || (field.fieldKey === 'phone' ? phone : (field.fieldKey === 'whatsappNumber' ? whatsappNumber : null));
      if (!val || String(val).trim() === '') {
        const error = new Error(`${field.fieldName} is required to create an account.`);
        error.statusCode = 422;
        throw error;
      }
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user in transaction with cart & wishlist
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : (mergedCustomFields.phone ? String(mergedCustomFields.phone).trim() : null),
        whatsappNumber: whatsappNumber ? whatsappNumber.trim() : (mergedCustomFields.whatsappNumber ? String(mergedCustomFields.whatsappNumber).trim() : null),
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isBlocked: false,
        customFields: mergedCustomFields,
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

  // Log audit event
  await logAuthActivity({
    action: 'ACCOUNT_CREATED',
    description: `Customer account registered for ${normalizedEmail}`,
    performedBy: newUser.id,
    targetId: newUser.id,
    metadata: { ipAddress, userAgent },
  });

  // Send Welcome Email asynchronously
  emailService.sendWelcomeEmail(newUser.id).catch((err) => console.error('Welcome email error:', err.message));

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
 * Log in a user (Customer or Admin) & enforce blocked account security
 */
const login = async ({ email, password, userAgent = '', ipAddress = '' }) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is blocked or suspended by administrator
  if (user.isBlocked || user.status === 'BLOCKED' || user.status === 'SUSPENDED' || user.status === 'DELETED') {
    const error = new Error('Your account has been temporarily blocked. Please contact customer support.');
    error.statusCode = 403;
    throw error;
  }

  // If customer login and email login is disabled
  if (user.role === 'CUSTOMER' && settings.emailLoginEnabled === false) {
    const error = new Error('Email login is currently disabled by store administrator.');
    error.statusCode = 403;
    throw error;
  }

  if (!user.passwordHash) {
    const error = new Error('This account was created via social login. Please sign in with Google or Facebook.');
    error.statusCode = 400;
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

  // Log audit activity
  await logAuthActivity({
    action: 'CUSTOMER_LOGIN',
    description: `User logged in: ${normalizedEmail}`,
    performedBy: user.id,
    targetId: user.id,
    metadata: { ipAddress, userAgent },
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
 * Google OAuth Authentication
 */
const googleAuth = async ({ email, name, photoURL, googleId, userAgent = '', ipAddress = '' }) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));
  if (settings.googleLoginEnabled === false) {
    const error = new Error('Google login is currently disabled by store administrator.');
    error.statusCode = 403;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    if (user.isBlocked || user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      const error = new Error('Your account has been temporarily blocked. Please contact customer support.');
      error.statusCode = 403;
      throw error;
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: user.profileImage || photoURL || null,
        lastLoginAt: new Date(),
        loginProvider: user.loginProvider || 'GOOGLE',
        emailVerified: true,
      },
    });
  } else {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name ? name.trim() : 'Valued Footwear Enthusiast',
          email: normalizedEmail,
          profileImage: photoURL || null,
          loginProvider: 'GOOGLE',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          isBlocked: false,
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      await tx.cart.create({ data: { userId: newUser.id } });
      await tx.wishlist.create({ data: { userId: newUser.id } });

      return newUser;
    });

    emailService.sendWelcomeEmail(user.id).catch((err) => console.error('Welcome email error:', err.message));
  }

  await logAuthActivity({
    action: 'GOOGLE_LOGIN',
    description: `User authenticated via Google: ${normalizedEmail}`,
    performedBy: user.id,
    targetId: user.id,
    metadata: { ipAddress, userAgent },
  });

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
 * Facebook OAuth Authentication
 */
const facebookAuth = async ({ email, name, photoURL, facebookId, userAgent = '', ipAddress = '' }) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));
  if (settings.facebookLoginEnabled === false) {
    const error = new Error('Facebook login is currently disabled by store administrator.');
    error.statusCode = 403;
    throw error;
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : `${facebookId}@facebook.aurasole.com`;

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    if (user.isBlocked || user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      const error = new Error('Your account has been temporarily blocked. Please contact customer support.');
      error.statusCode = 403;
      throw error;
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: user.profileImage || photoURL || null,
        lastLoginAt: new Date(),
        loginProvider: user.loginProvider || 'FACEBOOK',
        emailVerified: true,
      },
    });
  } else {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name ? name.trim() : 'Valued Footwear Enthusiast',
          email: normalizedEmail,
          profileImage: photoURL || null,
          loginProvider: 'FACEBOOK',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          isBlocked: false,
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      await tx.cart.create({ data: { userId: newUser.id } });
      await tx.wishlist.create({ data: { userId: newUser.id } });

      return newUser;
    });

    emailService.sendWelcomeEmail(user.id).catch((err) => console.error('Welcome email error:', err.message));
  }

  await logAuthActivity({
    action: 'FACEBOOK_LOGIN',
    description: `User authenticated via Facebook: ${normalizedEmail}`,
    performedBy: user.id,
    targetId: user.id,
    metadata: { ipAddress, userAgent },
  });

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
 * Initiate Forgot Password with Brevo Email & Single-Use Short-Lived Token
 */
const forgotPassword = async (email) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));
  if (settings.forgotPasswordEnabled === false) {
    const error = new Error('Password reset is temporarily disabled by store administrator.');
    error.statusCode = 403;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Generic message to prevent email enumeration
  if (!user) {
    return { success: true, message: 'If an account exists with this email, recovery instructions have been sent.' };
  }

  if (user.isBlocked || user.status === 'BLOCKED') {
    return { success: true, message: 'If an account exists with this email, recovery instructions have been sent.' };
  }

  // Generate secure 32-byte crypto token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiry,
    },
  });

  // Send password reset email via Brevo REST API
  await emailService.sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetToken: rawToken,
    expiresHours: 1,
  }).catch((err) => console.error('Failed to send reset email:', err.message));

  await logAuthActivity({
    action: 'PASSWORD_RESET_REQUESTED',
    description: `Password reset link generated for ${normalizedEmail}`,
    performedBy: user.id,
    targetId: user.id,
  });

  return {
    success: true,
    message: 'If an account exists with this email, recovery instructions have been sent.',
    devResetToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
  };
};

/**
 * Reset Password with token validation & session revocation
 */
const resetPassword = async (rawToken, newPassword) => {
  const settings = await storeSettingsService.getStoreSettings().catch(() => ({}));
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

  // Validate new password against admin policy
  validatePasswordPolicy(newPassword, settings);

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

  // Revoke all existing sessions for security
  await sessionService.revokeAllUserSessions(user.id, 'PASSWORD_RESET');

  await logAuthActivity({
    action: 'PASSWORD_RESET_COMPLETED',
    description: `Password successfully reset for ${user.email}`,
    performedBy: user.id,
    targetId: user.id,
  });

  return {
    success: true,
    message: 'Password has been successfully updated. All sessions have been logged out for security. Please log in with your new password.',
  };
};

/**
 * Update Customer Profile (checks editable custom fields)
 */
const updateProfile = async (userId, data) => {
  const { name, phone, whatsappNumber, preferredSize, preferredCategory, customFields = {} } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const activeCustomFields = await prisma.customRegistrationField.findMany({
    where: { isEnabled: true },
  });

  const existingCustomFields = typeof user.customFields === 'object' && user.customFields !== null ? user.customFields : {};
  const updatedCustomFields = { ...existingCustomFields };

  // Only update fields where isCustomerEditable === true
  for (const [key, value] of Object.entries(customFields)) {
    const fieldDef = activeCustomFields.find((f) => f.fieldKey === key);
    if (fieldDef && fieldDef.isCustomerEditable === false) {
      // Keep existing value if read-only for customer
      continue;
    }
    updatedCustomFields[key] = value;
  }

  const updateData = {
    customFields: updatedCustomFields,
  };

  if (name) updateData.name = name.trim();
  if (phone) updateData.phone = phone.trim();
  if (whatsappNumber) updateData.whatsappNumber = whatsappNumber.trim();
  if (preferredSize) updateData.preferredSize = String(preferredSize);
  if (preferredCategory) updateData.preferredCategory = preferredCategory;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return sanitizeUser(updatedUser);
};

module.exports = {
  getPublicAuthSettings,
  register,
  login,
  googleAuth,
  facebookAuth,
  forgotPassword,
  resetPassword,
  updateProfile,
  sanitizeUser,
  logAuthActivity,
};
