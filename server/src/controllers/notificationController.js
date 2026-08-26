const prisma = require('../config/db');
const emailService = require('../services/emailService');
const brevoService = require('../services/brevoService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Subscribe Email (Handles duplicate subscriptions gracefully)
 */
const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return errorResponse(res, 'Please provide a valid email address.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = req.user ? req.user.id : null;

    // Check if subscription already exists
    let sub = await prisma.emailSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (sub) {
      if (!sub.subscribed) {
        sub = await prisma.emailSubscription.update({
          where: { email: normalizedEmail },
          data: {
            subscribed: true,
            userId: userId || sub.userId,
            unsubscribedAt: null,
          },
        });
      }
    } else {
      sub = await prisma.emailSubscription.create({
        data: {
          email: normalizedEmail,
          userId,
          subscribed: true,
        },
      });
    }

    return successResponse(res, "You're subscribed! You'll receive fresh drops and exclusive deals.", sub);
  } catch (error) {
    next(error);
  }
};

/**
 * Unsubscribe Email
 */
const unsubscribe = async (req, res, next) => {
  try {
    const { token, email } = req.body;

    if (!token && !email) {
      return errorResponse(res, 'Unsubscribe token or email is required.', 400);
    }

    let sub = null;
    if (token) {
      sub = await prisma.emailSubscription.findUnique({ where: { unsubscribeToken: token } });
    } else if (email) {
      sub = await prisma.emailSubscription.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (!sub) {
      return successResponse(res, 'You have been unsubscribed from promotional emails.');
    }

    await prisma.emailSubscription.update({
      where: { id: sub.id },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    return successResponse(res, 'You have been successfully unsubscribed from promotional emails.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    let sub = await prisma.emailSubscription.findUnique({ where: { email } });

    if (!sub) {
      sub = await prisma.emailSubscription.create({
        data: {
          email,
          userId: req.user.id,
          subscribed: true,
        },
      });
    }

    return successResponse(res, 'Preferences retrieved successfully.', sub);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Customer Preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { subscribed, promoEmails, newProducts, festivalDeals, coupons, flashSales, specialOffers } = req.body;

    const sub = await prisma.emailSubscription.upsert({
      where: { email },
      update: {
        subscribed: subscribed !== undefined ? subscribed : undefined,
        promoEmails: promoEmails !== undefined ? promoEmails : undefined,
        newProducts: newProducts !== undefined ? newProducts : undefined,
        festivalDeals: festivalDeals !== undefined ? festivalDeals : undefined,
        coupons: coupons !== undefined ? coupons : undefined,
        flashSales: flashSales !== undefined ? flashSales : undefined,
        specialOffers: specialOffers !== undefined ? specialOffers : undefined,
        unsubscribedAt: subscribed === false ? new Date() : null,
      },
      create: {
        email,
        userId: req.user.id,
        subscribed: subscribed !== undefined ? subscribed : true,
        promoEmails: promoEmails !== undefined ? promoEmails : true,
        newProducts: newProducts !== undefined ? newProducts : true,
        festivalDeals: festivalDeals !== undefined ? festivalDeals : true,
        coupons: coupons !== undefined ? coupons : true,
        flashSales: flashSales !== undefined ? flashSales : true,
        specialOffers: specialOffers !== undefined ? specialOffers : true,
      },
    });

    return successResponse(res, 'Email preferences updated successfully.', sub);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create & Dispatch Email Campaign
 */
const createCampaign = async (req, res, next) => {
  try {
    const { title, type, subject, headline, message, imageUrl, ctaText, ctaUrl, sendNow = true } = req.body;

    if (!title || !subject || !message) {
      return errorResponse(res, 'Title, subject, and message are required for an email campaign.', 400);
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        title: title.trim(),
        type: type || 'SPECIAL_OFFER',
        subject: subject.trim(),
        headline: headline ? headline.trim() : title.trim(),
        message: message.trim(),
        imageUrl: imageUrl || null,
        ctaText: ctaText || 'Explore Slippers',
        ctaUrl: ctaUrl || null,
        status: 'DRAFT',
      },
    });

    if (sendNow) {
      await emailService.dispatchCampaign(campaign.id);
    }

    return successResponse(res, 'Campaign created and queued for delivery.', campaign, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Campaign List
 */
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return successResponse(res, 'Campaigns retrieved.', campaigns);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Send Test Email
 */
const sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const targetEmail = email || req.user.email;

    const result = await emailService.sendTestEmail(targetEmail);
    if (result.success) {
      return successResponse(res, `Test email dispatched to ${targetEmail}`);
    }
    return errorResponse(res, result.error || 'Failed to send test email', 500);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Email Logs
 */
const getEmailLogs = async (req, res, next) => {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
    return successResponse(res, 'Logs retrieved.', logs);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Subscribers
 */
const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await prisma.emailSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return successResponse(res, 'Subscribers retrieved.', subscribers);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Check Brevo API Health & Credit Balance
 */
const getBrevoStatus = async (req, res, next) => {
  try {
    const status = await brevoService.getBrevoAccountInfo();
    return successResponse(res, 'Brevo engine status retrieved.', status);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Send Direct Brevo Test Email
 */
const sendTestBrevoEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const targetEmail = email || req.user?.email || 'support@aurasole.com';

    const result = await brevoService.sendEmailViaBrevo({
      to: targetEmail,
      subject: 'AuraSole — Brevo API Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #1c1917; color: #ffffff; border-radius: 12px;">
          <h2 style="color: #d97706; margin-top: 0;">⚡ Brevo Notification Engine Operational</h2>
          <p>This email confirms that your Brevo API Key is active and successfully dispatching transactional emails for AuraSole Footwear.</p>
          <p style="font-size: 12px; color: #a8a29e;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
      tags: ['SYSTEM_TEST', 'BREVO_VERIFICATION'],
    });

    return successResponse(res, `Brevo test email sent successfully to ${targetEmail}`, result);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to dispatch email via Brevo', 500);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  createCampaign,
  getCampaigns,
  sendTestEmail,
  getEmailLogs,
  getSubscribers,
  getBrevoStatus,
  sendTestBrevoEmail,
};
