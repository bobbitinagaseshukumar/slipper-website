const crypto = require('crypto');
const prisma = require('../config/db');

const INACTIVITY_LIMIT_MS = 4 * 24 * 60 * 60 * 1000; // 4 Days Inactivity Expiry Window
const TOUCH_THROTTLE_MS = 2 * 60 * 1000; // Only update DB lastActivityAt if > 2 minutes elapsed

/**
 * Helper to parse User-Agent header into clean device, browser, and OS names
 */
const parseUserAgent = (userAgent = '') => {
  const ua = userAgent.toLowerCase();

  // Detect Device & OS
  let deviceType = 'Desktop';
  let deviceName = 'Computer';
  let os = 'Windows';

  if (ua.includes('android')) {
    deviceType = 'Mobile';
    deviceName = 'Android Phone';
    os = 'Android';
  } else if (ua.includes('iphone')) {
    deviceType = 'Mobile';
    deviceName = 'Apple iPhone';
    os = 'iOS';
  } else if (ua.includes('ipad')) {
    deviceType = 'Tablet';
    deviceName = 'Apple iPad';
    os = 'iPadOS';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    deviceType = 'Desktop';
    deviceName = 'Macintosh';
    os = 'macOS';
  } else if (ua.includes('linux')) {
    deviceType = 'Desktop';
    deviceName = 'Linux PC';
    os = 'Linux';
  } else if (ua.includes('windows')) {
    deviceType = 'Desktop';
    deviceName = 'Windows PC';
    os = 'Windows';
  }

  // Detect Browser
  let browser = 'Chrome';
  if (ua.includes('edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Google Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Apple Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  }

  return { deviceType, deviceName, browser, os };
};

/**
 * 1. Create a New Session on Login / Registration
 */
const createSession = async ({ userId, userAgent = '', ipAddress = '' }) => {
  const { deviceType, deviceName, browser, os } = parseUserAgent(userAgent);
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INACTIVITY_LIMIT_MS);

  // Check if this is a new device for this user
  const priorDeviceSession = await prisma.userSession.findFirst({
    where: {
      userId,
      deviceName,
      browser,
      os,
    },
  });

  const session = await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      deviceType,
      deviceName,
      browser,
      os,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      lastActivityAt: now,
      expiresAt,
      isRevoked: false,
    },
  });

  // If this device was not used before, dispatch a RED security notification
  if (!priorDeviceSession) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: '🔴 New Login Detected',
          message: `Your account was signed in from a new device (${deviceName} using ${browser}).`,
          type: 'SECURITY',
          severity: 'HIGH',
          isSecurityAlert: true,
          link: '/account?tab=security',
        },
      });
    } catch (notifErr) {
      console.warn('Failed to create new login notification:', notifErr.message);
    }
  }

  return session;
};

/**
 * 2. Validate Session and Touch Last Activity (Sliding Window of 4 Days Inactivity)
 */
const validateAndTouchSession = async (sessionToken) => {
  if (!sessionToken) return null;

  const session = await prisma.userSession.findUnique({
    where: { sessionToken },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  // If already explicitly revoked
  if (session.isRevoked) {
    return null;
  }

  // Check 4-day inactivity timeout from lastActivityAt
  const now = Date.now();
  const lastActiveTime = new Date(session.lastActivityAt).getTime();
  const inactiveDuration = now - lastActiveTime;

  if (inactiveDuration > INACTIVITY_LIMIT_MS) {
    // Invalidate session due to 4 days of inactivity
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'INACTIVITY_EXPIRY',
      },
    });
    return null;
  }

  // Touch session if more than 2 minutes have elapsed since last activity write
  if (inactiveDuration > TOUCH_THROTTLE_MS) {
    const updatedLastActivity = new Date();
    const newExpiresAt = new Date(now + INACTIVITY_LIMIT_MS);

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastActivityAt: updatedLastActivity,
        expiresAt: newExpiresAt,
      },
    });

    session.lastActivityAt = updatedLastActivity;
    session.expiresAt = newExpiresAt;
  }

  return session;
};

/**
 * 3. Get Active Logged-in Sessions for User
 */
const getUserActiveSessions = async (userId, currentSessionToken = '') => {
  const now = new Date();
  const sessions = await prisma.userSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: now },
    },
    orderBy: { lastActivityAt: 'desc' },
  });

  // Filter out any that exceeded 4-day inactivity
  const validSessions = [];
  for (const s of sessions) {
    const inactiveMs = now.getTime() - new Date(s.lastActivityAt).getTime();
    if (inactiveMs > INACTIVITY_LIMIT_MS) {
      await prisma.userSession.update({
        where: { id: s.id },
        data: {
          isRevoked: true,
          revokedAt: now,
          revokedReason: 'INACTIVITY_EXPIRY',
        },
      });
    } else {
      validSessions.push({
        id: s.id,
        deviceType: s.deviceType,
        deviceName: s.deviceName,
        browser: s.browser,
        os: s.os,
        lastActivityAt: s.lastActivityAt,
        createdAt: s.createdAt,
        isCurrent: s.sessionToken === currentSessionToken,
      });
    }
  }

  return validSessions;
};

/**
 * 4. Revoke a Single Session (Logout from a specific device)
 */
const revokeSession = async (sessionId, userId, reason = 'USER_LOGOUT') => {
  const session = await prisma.userSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) return false;

  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  return true;
};

/**
 * 5. Revoke All Sessions for User (Log out from all devices / Password change / Admin force logout)
 */
const revokeAllUserSessions = async (userId, reason = 'ALL_DEVICES_LOGOUT', triggeredByAdmin = false) => {
  const now = new Date();

  await prisma.userSession.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: now,
      revokedReason: reason,
    },
  });

  // Dispatch RED Security Alert
  try {
    let alertMessage = 'Your account was logged out from all devices.';
    if (reason === 'PASSWORD_CHANGE') {
      alertMessage = 'Your password was changed and all sessions were logged out for security.';
    } else if (reason === 'ADMIN_FORCE_LOGOUT') {
      alertMessage = 'An administrator has logged your account out from all active devices.';
    }

    await prisma.notification.create({
      data: {
        userId,
        title: '🔴 Security Alert',
        message: alertMessage,
        type: 'SECURITY',
        severity: 'CRITICAL',
        isSecurityAlert: true,
        link: '/account?tab=security',
      },
    });
  } catch (err) {
    console.warn('Failed to dispatch security alert notification:', err.message);
  }

  return true;
};

module.exports = {
  createSession,
  validateAndTouchSession,
  getUserActiveSessions,
  revokeSession,
  revokeAllUserSessions,
  INACTIVITY_LIMIT_MS,
};
