const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const sessionService = require('../services/sessionService');
const otpService = require('../services/otpService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validatePhone, validateEmail } = require('../validators/authValidator');

/**
 * 1. Get Consolidated Customer Dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, totalOrders, pendingOrders, deliveredOrders, wishlistCount, unreadNotifications, recentOrders] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            profileImage: true,
            createdAt: true,
          },
        }),
        prisma.order.count({ where: { userId } }),
        prisma.order.count({
          where: { userId, status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'] } },
        }),
        prisma.order.count({ where: { userId, status: 'DELIVERED' } }),
        prisma.wishlistItem.count({
          where: { wishlist: { userId } },
        }),
        prisma.notification.count({
          where: { userId, isRead: false },
        }),
        prisma.order.findMany({
          where: { userId },
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              take: 2,
              include: {
                product: {
                  select: {
                    images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
                  },
                },
              },
            },
            _count: { select: { items: true } },
          },
        }),
      ]);

    return successResponse(res, 'Dashboard summary loaded', {
      customer: user,
      summary: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        wishlistCount,
        unreadNotifications,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Profile of logged in user
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    return successResponse(res, 'Profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Update Profile of logged in user
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updateData = {};

    if (name && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (phone) {
      if (!validatePhone(phone)) {
        return errorResponse(res, 'Please enter a valid phone number.', 422);
      }
      const existing = await prisma.user.findFirst({
        where: { phone: phone.trim(), NOT: { id: req.user.id } },
      });
      if (existing) {
        return errorResponse(res, 'Phone number is already associated with another account.', 409);
      }
      updateData.phone = phone.trim();
    }

    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return successResponse(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Change Password / Security & Force Logout on All Devices
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Both current and new passwords are required.', 400);
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse(res, 'New passwords do not match.', 422);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters long.', 422);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return errorResponse(res, 'User account not found.', 404);
    }

    // Check if user has an existing password (might be OAuth-only initially)
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'The current password you entered is incorrect.', 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all active sessions and log out from all devices for maximum security
    await sessionService.revokeAllUserSessions(req.user.id, 'PASSWORD_CHANGE');

    return successResponse(
      res,
      'Your password was changed and all devices were logged out for security. Please log in with your new password.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Get Active Logged-in Devices / Sessions
 */
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getUserActiveSessions(req.user.id, req.sessionToken);
    return successResponse(res, 'Active sessions retrieved', sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Revoke a Single Device Session
 */
const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const success = await sessionService.revokeSession(sessionId, req.user.id, 'USER_LOGOUT');
    if (!success) {
      return errorResponse(res, 'Session not found or already logged out.', 404);
    }
    return successResponse(res, 'Device session logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Logout of All Devices (Customer Strict Action)
 */
const logoutAllSessions = async (req, res, next) => {
  try {
    await sessionService.revokeAllUserSessions(req.user.id, 'ALL_DEVICES_LOGOUT');
    return successResponse(res, 'Successfully logged out of all devices.');
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Request Email Change OTP
 */
const requestEmailChangeOtp = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !validateEmail(newEmail)) {
      return errorResponse(res, 'Please provide a valid new email address.', 422);
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim();

    if (normalizedNewEmail === req.user.email.toLowerCase()) {
      return errorResponse(res, 'The new email address cannot be the same as your current email.', 400);
    }

    // Check if new email is already taken
    const existing = await prisma.user.findUnique({
      where: { email: normalizedNewEmail },
    });

    if (existing) {
      return errorResponse(res, 'An account with this email address already exists.', 409);
    }

    const otpResult = await otpService.generateAndSendOTP({
      email: normalizedNewEmail,
      userId: req.user.id,
      name: req.user.name || 'Valued Customer',
      purpose: 'EMAIL_CHANGE',
    });

    return successResponse(
      res,
      `Verification code sent to ${normalizedNewEmail}. Please enter the 6-digit OTP to complete your email change.`,
      otpResult
    );
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Verify Email Change OTP & Update Database
 */
const verifyEmailChangeOtp = async (req, res, next) => {
  try {
    const { newEmail, otp } = req.body;

    if (!newEmail || !otp) {
      return errorResponse(res, 'New email address and verification OTP are required.', 400);
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim();

    const verified = await otpService.verifyOTP({
      email: normalizedNewEmail,
      otp,
      purpose: 'EMAIL_CHANGE',
    });

    if (!verified) {
      return errorResponse(res, 'Invalid or expired OTP. Please request a new verification code.', 400);
    }

    // Double check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: normalizedNewEmail },
    });

    if (existing && existing.id !== req.user.id) {
      return errorResponse(res, 'This email address is already associated with another account.', 409);
    }

    // Update Email in Database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email: normalizedNewEmail,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    // Create RED Security Notification
    try {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: '🔴 Security Alert',
          message: `Your email address was successfully updated to ${normalizedNewEmail}.`,
          type: 'SECURITY',
          severity: 'HIGH',
          isSecurityAlert: true,
          link: '/account?tab=security',
        },
      });
    } catch (notifErr) {
      console.warn('Failed to create email change notification:', notifErr.message);
    }

    return successResponse(res, 'Email address updated successfully!', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Get Security Notifications (with RED indicator)
 */
const getSecurityNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        isSecurityAlert: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return successResponse(res, 'Security notifications retrieved', notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Deactivate Customer Account (Safe anonymization)
 */
const deactivateAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'INACTIVE' },
    });

    await sessionService.revokeAllUserSessions(req.user.id, 'ACCOUNT_DEACTIVATED');

    return successResponse(res, 'Account deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  changePassword,
  getUserSessions,
  revokeSession,
  logoutAllSessions,
  requestEmailChangeOtp,
  verifyEmailChangeOtp,
  getSecurityNotifications,
  deactivateAccount,
};
