const prisma = require('../config/db');
const { transporter, EMAIL_FROM, isConfigured } = require('../config/email');
const emailTemplates = require('./emailTemplates');
const storeSettingsService = require('./storeSettingsService');
const brevoService = require('./brevoService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Core Dispatcher with Idempotency, Audit Logging & Dual Provider Support (Brevo / SMTP)
 */
const sendRawEmail = async ({
  recipient,
  userId = null,
  subject,
  html,
  emailType,
  category = 'TRANSACTIONAL',
  idempotencyKey = null,
  relatedOrderId = null,
  relatedProductId = null,
  campaignId = null,
}) => {
  if (!recipient) {
    console.warn('⚠️ sendRawEmail aborted: No recipient provided.');
    return { success: false, reason: 'NO_RECIPIENT' };
  }

  // 1. Idempotency Check (prevent duplicate sends)
  if (idempotencyKey) {
    const existingLog = await prisma.emailLog.findUnique({
      where: { idempotencyKey },
    });
    if (existingLog) {
      console.log(`ℹ️ Email skipped (Already sent with key: ${idempotencyKey})`);
      return { success: true, skipped: true, logId: existingLog.id };
    }
  }

  // 2. Promotional Check (if promotional, verify recipient is subscribed)
  if (category === 'PROMOTIONAL') {
    const sub = await prisma.emailSubscription.findUnique({
      where: { email: recipient.toLowerCase().trim() },
    });
    if (!sub || !sub.subscribed) {
      console.log(`ℹ️ Promotional email skipped for unsubscribed recipient: ${recipient}`);
      return { success: false, reason: 'UNSUBSCRIBED' };
    }
  }

  // 3. Dispatch Email via Brevo REST API (if configured) or Nodemailer Transporter
  try {
    let messageId = null;
    let providerName = 'SMTP';

    if (brevoService.isBrevoConfigured()) {
      const store = await storeSettingsService.getStoreSettings().catch(() => ({}));
      const brevoRes = await brevoService.sendEmailViaBrevo({
        to: recipient,
        subject,
        html,
        senderName: store.storeName || undefined,
        senderEmail: store.supportEmail || undefined,
        tags: [emailType, category],
      });
      messageId = brevoRes.messageId;
      providerName = 'BREVO_REST_API';
    } else {
      const mailOptions = {
        from: EMAIL_FROM,
        to: recipient,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      messageId = info.messageId;
    }

    // 4. Log Success in Database
    const log = await prisma.emailLog.create({
      data: {
        idempotencyKey,
        recipient: recipient.toLowerCase().trim(),
        userId,
        emailType,
        category,
        subject,
        status: 'SENT',
        messageId: messageId || `msg-${Date.now()}`,
        relatedOrderId,
        relatedProductId,
        campaignId,
      },
    });

    return { success: true, messageId, logId: log.id, provider: providerName };
  } catch (error) {
    console.error(`❌ Failed to dispatch ${emailType} email to ${recipient}:`, error.message);

    // Log Failure safely
    try {
      await prisma.emailLog.create({
        data: {
          idempotencyKey,
          recipient: recipient.toLowerCase().trim(),
          userId,
          emailType,
          category,
          subject,
          status: 'FAILED',
          error: error.message,
          relatedOrderId,
          relatedProductId,
          campaignId,
        },
      });
    } catch (logErr) {
      console.error('Failed to write email error log:', logErr.message);
    }

    return { success: false, error: error.message };
  }
};

/**
 * High-Level Transactional & Promotional Methods
 */
const emailService = {
  /**
   * Send Welcome Email to New Customer (One-Time)
   */
  sendWelcomeEmail: (user) => {
    if (!user?.email) return;
    setImmediate(async () => {
      try {
        // Sync contact to Brevo list
        await brevoService.syncContactToBrevo({ email: user.email, name: user.name });

        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.welcomeTemplate({
          name: user.name,
          email: user.email,
          storeName,
          logo: store.logo,
          tagline: store.tagline,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
          address: store.address,
        });
        await sendRawEmail({
          recipient: user.email,
          userId: user.id,
          subject: `Welcome to ${storeName}! 👋`,
          html,
          emailType: 'WELCOME',
          category: 'TRANSACTIONAL',
          idempotencyKey: `WELCOME_USER_${user.id}`,
        });
      } catch (err) {
        console.error('Welcome email error:', err);
      }
    });
  },

  /**
   * Send Order Placed Email
   */
  sendOrderPlacedEmail: (order, user) => {
    const email = order.customerEmail || user?.email;
    if (!email) return;
    setImmediate(async () => {
      try {
        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.orderPlacedTemplate({
          order,
          user,
          storeName,
          logo: store.logo,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
        });
        await sendRawEmail({
          recipient: email,
          userId: user?.id || order.userId,
          subject: `Order Received — #${order.orderNumber} | ${storeName}`,
          html,
          emailType: 'ORDER_PLACED',
          category: 'TRANSACTIONAL',
          idempotencyKey: `ORDER_PLACED_${order.id}`,
          relatedOrderId: order.id,
        });
      } catch (err) {
        console.error('Order placed email error:', err);
      }
    });
  },

  /**
   * Send Order Confirmed Email
   */
  sendOrderConfirmedEmail: (order, user) => {
    const email = order.customerEmail || user?.email;
    if (!email) return;
    setImmediate(async () => {
      try {
        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.orderConfirmedTemplate({
          order,
          user,
          storeName,
          logo: store.logo,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
        });
        await sendRawEmail({
          recipient: email,
          userId: user?.id || order.userId,
          subject: `Your Order Is Confirmed! 🎉 — #${order.orderNumber} | ${storeName}`,
          html,
          emailType: 'ORDER_CONFIRMED',
          category: 'TRANSACTIONAL',
          idempotencyKey: `ORDER_CONFIRMED_${order.id}`,
          relatedOrderId: order.id,
        });
      } catch (err) {
        console.error('Order confirmed email error:', err);
      }
    });
  },

  /**
   * Send Order Shipped Email
   */
  sendOrderShippedEmail: (order, user, trackingNumber, courierName) => {
    const email = order.customerEmail || user?.email;
    if (!email) return;
    setImmediate(async () => {
      try {
        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.orderShippedTemplate({
          order,
          user,
          trackingNumber,
          courierName,
          storeName,
          logo: store.logo,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
        });
        await sendRawEmail({
          recipient: email,
          userId: user?.id || order.userId,
          subject: `Your Slippers Are On The Way! 🚚 — #${order.orderNumber} | ${storeName}`,
          html,
          emailType: 'ORDER_SHIPPED',
          category: 'TRANSACTIONAL',
          idempotencyKey: `ORDER_SHIPPED_${order.id}`,
          relatedOrderId: order.id,
        });
      } catch (err) {
        console.error('Order shipped email error:', err);
      }
    });
  },

  /**
   * Send Order Delivered Email
   */
  sendOrderDeliveredEmail: (order, user) => {
    const email = order.customerEmail || user?.email;
    if (!email) return;
    setImmediate(async () => {
      try {
        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.orderDeliveredTemplate({
          order,
          user,
          storeName,
          logo: store.logo,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
        });
        await sendRawEmail({
          recipient: email,
          userId: user?.id || order.userId,
          subject: `Your Order Has Been Delivered! 🎉 — #${order.orderNumber} | ${storeName}`,
          html,
          emailType: 'ORDER_DELIVERED',
          category: 'TRANSACTIONAL',
          idempotencyKey: `ORDER_DELIVERED_${order.id}`,
          relatedOrderId: order.id,
        });
      } catch (err) {
        console.error('Order delivered email error:', err);
      }
    });
  },

  /**
   * Send Order Cancelled Email
   */
  sendOrderCancelledEmail: (order, user, reason) => {
    const email = order.customerEmail || user?.email;
    if (!email) return;
    setImmediate(async () => {
      try {
        const store = await storeSettingsService.getStoreSettings();
        const storeName = store.storeName || 'AuraSole';
        const html = emailTemplates.orderCancelledTemplate({
          order,
          user,
          reason,
          storeName,
          logo: store.logo,
          supportEmail: store.supportEmail,
          whatsappNumber: store.whatsappNumber,
        });
        await sendRawEmail({
          recipient: email,
          userId: user?.id || order.userId,
          subject: `Order Cancelled — #${order.orderNumber} | ${storeName}`,
          html,
          emailType: 'ORDER_CANCELLED',
          category: 'TRANSACTIONAL',
          idempotencyKey: `ORDER_CANCELLED_${order.id}`,
          relatedOrderId: order.id,
        });
      } catch (err) {
        console.error('Order cancelled email error:', err);
      }
    });
  },

  /**
   * Send Promotional Campaign in Batches
   */
  dispatchCampaign: async (campaignId) => {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new Error('Campaign not found.');

    const store = await storeSettingsService.getStoreSettings();
    const storeName = store.storeName || 'AuraSole';

    // Find eligible active subscribers
    const subscribers = await prisma.emailSubscription.findMany({
      where: { subscribed: true },
    });

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENDING',
        recipientCount: subscribers.length,
      },
    });

    setImmediate(async () => {
      let successCount = 0;
      let failedCount = 0;

      for (const sub of subscribers) {
        try {
          const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${sub.unsubscribeToken}&email=${encodeURIComponent(sub.email)}`;
          const html = emailTemplates.campaignTemplate({
            headline: campaign.headline || campaign.title,
            message: campaign.message,
            imageUrl: campaign.imageUrl,
            ctaText: campaign.ctaText || 'Shop Now',
            ctaUrl: campaign.ctaUrl || `${FRONTEND_URL}/shop`,
            unsubscribeUrl,
            badgeText: campaign.type.replace('_', ' '),
            storeName,
            logo: store.logo,
            tagline: store.tagline,
            supportEmail: store.supportEmail,
            whatsappNumber: store.whatsappNumber,
            address: store.address,
          });

          const res = await sendRawEmail({
            recipient: sub.email,
            userId: sub.userId,
            subject: campaign.subject,
            html,
            emailType: campaign.type,
            category: 'PROMOTIONAL',
            idempotencyKey: `CAMPAIGN_${campaign.id}_${sub.id}`,
            campaignId: campaign.id,
          });

          if (res.success && !res.skipped) successCount += 1;
          else if (!res.success) failedCount += 1;
        } catch (e) {
          failedCount += 1;
        }
      }

      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          successCount,
          failedCount,
          sentAt: new Date(),
        },
      });
    });

    return { success: true, message: `Campaign queued for ${subscribers.length} subscribers.` };
  },

  /**
   * Send Test Email to Admin
   */
  sendTestEmail: async (targetEmail) => {
    const store = await storeSettingsService.getStoreSettings();
    const storeName = store.storeName || 'AuraSole';

    const html = emailTemplates.campaignTemplate({
      headline: `${storeName} Test Broadcast`,
      message: `This is a test email from the ${storeName} notification engine. All SMTP channels are operating smoothly.`,
      ctaText: 'Visit Live Storefront',
      ctaUrl: FRONTEND_URL,
      badgeText: 'System Test',
      storeName,
      logo: store.logo,
      supportEmail: store.supportEmail,
      whatsappNumber: store.whatsappNumber,
      address: store.address,
    });

    return await sendRawEmail({
      recipient: targetEmail,
      subject: `${storeName} — SMTP Test Notification`,
      html,
      emailType: 'SYSTEM_TEST',
      category: 'TRANSACTIONAL',
    });
  },

  /**
   * Send Cryptographic OTP Verification Email
   */
  sendOTPEmail: async ({ email, name, otp, purpose = 'LOGIN', expiresMinutes = 5 }) => {
    if (!email) return { success: false, reason: 'NO_EMAIL' };
    const store = await storeSettingsService.getStoreSettings();
    const storeName = store.storeName || 'AuraSole';

    const html = emailTemplates.otpTemplate({
      name,
      otp,
      purpose,
      expiresMinutes,
      storeName,
      logo: store.logo,
      supportEmail: store.supportEmail,
      whatsappNumber: store.whatsappNumber,
      address: store.address,
    });

    return await sendRawEmail({
      recipient: email,
      subject: `Your Verification Code: ${otp} — ${storeName}`,
      html,
      emailType: 'OTP_VERIFICATION',
      category: 'TRANSACTIONAL',
    });
  },
};

module.exports = emailService;
