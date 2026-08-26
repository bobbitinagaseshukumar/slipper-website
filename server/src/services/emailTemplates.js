/**
 * AuraSole Footwear — High-Impact Responsive HTML Email Templates
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Base Email Wrapper Layout
 */
const baseLayout = ({
  title,
  preheader = '',
  content,
  isPromotional = false,
  unsubscribeUrl = '',
  storeName = 'AuraSole',
  tagline = 'Premium Footwear Studio',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address = 'Showroom 42, Slipper Heritage Lane, Luxury Avenue, Mumbai - 400001',
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8F5EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; }
    .btn-primary { background-color: #121417; color: #FFFFFF !important; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; }
    .btn-accent { background-color: #C8A97E; color: #121417 !important; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; }
  </style>
</head>
<body style="background-color: #F8F5EE; margin: 0; padding: 24px 12px;">
  <!-- Preheader text for email client inbox snippet -->
  <div style="display: none; font-size: 1px; color: #F8F5EE; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #EFECE6;">
    <!-- Brand Header -->
    <tr>
      <td align="center" style="padding: 32px 24px 20px 24px; background: linear-gradient(180deg, #121417 0%, #1E2229 100%);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              ${
                logo
                  ? `<img src="${logo}" alt="${storeName}" style="max-height: 48px; margin-bottom: 8px;" />`
                  : `<div style="width: 44px; height: 44px; background-color: #C8A97E; border-radius: 14px; display: inline-block; line-height: 44px; font-size: 22px; font-weight: 900; color: #121417; text-align: center;">${storeName.charAt(0)}</div>`
              }
              <h1 style="margin: 12px 0 2px 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">
                ${storeName}
              </h1>
              <p style="margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #C8A97E;">
                ${tagline}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content Body -->
    <tr>
      <td style="padding: 36px 32px 32px 32px; font-size: 14px; line-height: 1.6; color: #333333;">
        ${content}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px 32px 32px; background-color: #FBF9F4; border-top: 1px solid #EFECE6; text-align: center; font-size: 11px; color: #777777;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #121417;">
          ${storeName} — Official Showroom & Online Store
        </p>
        <p style="margin: 0 0 12px 0; color: #888888;">
          ${address}
        </p>
        <p style="margin: 0 0 12px 0;">
          Need assistance? Reach us at <a href="mailto:${supportEmail}" style="color: #A88656; font-weight: bold;">${supportEmail}</a> or WhatsApp at <strong>${whatsappNumber}</strong>.
        </p>
        ${
          isPromotional
            ? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #E0DDD7;">
                <p style="margin: 0; color: #999999;">
                  You received this email because you subscribed to ${storeName} promotional updates.
                </p>
                <p style="margin: 6px 0 0 0;">
                  <a href="${unsubscribeUrl || `${FRONTEND_URL}/account`}" style="color: #A88656; text-decoration: underline;">
                    Manage Email Preferences or Unsubscribe
                  </a>
                </p>
              </div>`
            : ''
        }
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Welcome Email Template
 */
const welcomeTemplate = ({
  name,
  email,
  storeName = 'AuraSole',
  logo = null,
  tagline = 'Premium Footwear Studio',
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = name ? name.split(' ')[0] : 'Footwear Enthusiast';
  return baseLayout({
    title: `Welcome to ${storeName}! 👋`,
    preheader: `Your account is ready. Discover doctor-engineered cloud slippers at ${storeName}.`,
    storeName,
    logo,
    tagline,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #121417; margin: 0 0 16px 0;">
        Welcome to ${storeName}, ${customerName}! 👋
      </h2>
      <p style="margin: 0 0 14px 0;">
        Your customer account has been successfully created. We are excited to welcome you to our dedicated slipper footwear studio.
      </p>
      <p style="margin: 0 0 20px 0;">
        Whether you are searching for our signature <strong>Dual-Density Cloud Recovery Slides</strong>, doctor-approved <strong>Orthopedic Arch Slippers</strong>, or all-weather <strong>Everyday Flip-Flops</strong>, every pair is handcrafted to give your feet pure luxury support.
      </p>

      <div style="background-color: #F8F5EE; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #EAE6DD;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #A88656;">
          Your Member Privileges
        </h3>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #444444; line-height: 1.8;">
          <li>Free Doorstep Express Delivery on eligible orders</li>
          <li>7-Day Hassle-Free Exchange & Return Policy</li>
          <li>Live Courier Tracking & Instant WhatsApp Support</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0 12px 0;">
        <a href="${FRONTEND_URL}/shop" class="btn-primary">
          Explore Slipper Collections
        </a>
      </div>
    `,
  });
};

/**
 * 2. Order Placed Confirmation Template
 */
const orderPlacedTemplate = ({
  order,
  user,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Valued Customer';
  const items = order.items || [];

  return baseLayout({
    title: `Order Received — #${order.orderNumber} | ${storeName}`,
    preheader: `Thank you for your order! Order #${order.orderNumber} is being processed.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #121417; margin: 0 0 8px 0;">
        Thank You for Your Order, ${customerName}! 🎉
      </h2>
      <p style="margin: 0 0 20px 0; color: #555555;">
        We have received your slipper order and our showroom team is preparing it for dispatch.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5EE; border-radius: 16px; padding: 18px; margin-bottom: 24px; border: 1px solid #EAE6DD; font-size: 13px;">
        <tr>
          <td style="padding-bottom: 6px;"><strong>Order ID:</strong> #${order.orderNumber}</td>
          <td align="right" style="padding-bottom: 6px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px;"><strong>Status:</strong> <span style="color: #0284C7; font-weight: bold;">Order Received</span></td>
          <td align="right" style="padding-bottom: 6px;"><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</td>
        </tr>
      </table>

      <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #121417; margin: 20px 0 10px 0;">
        Order Items (${items.length})
      </h3>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        ${items
          .map(
            (item) => `
          <tr style="border-bottom: 1px solid #EFECE6;">
            <td style="padding: 10px 0;">
              <strong>${item.productName || item.product?.name || 'Slipper'}</strong><br />
              <span style="font-size: 11px; color: #777777;">Size: ${item.size || 'Standard'} | Color: ${item.color || 'Classic'} | Qty: ${item.quantity}</span>
            </td>
            <td align="right" style="padding: 10px 0; font-weight: 700; color: #121417;">
              ₹${(item.price || item.unitPrice) * item.quantity}
            </td>
          </tr>
        `
          )
          .join('')}
        <tr>
          <td align="right" style="padding-top: 14px; font-weight: 800; font-size: 15px; color: #121417;">Total Amount:</td>
          <td align="right" style="padding-top: 14px; font-weight: 900; font-size: 16px; color: #A88656;">₹${order.totalAmount || order.finalAmount}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 32px 0 12px 0;">
        <a href="${FRONTEND_URL}/account/orders/${order.orderNumber}" class="btn-primary">
          View & Track My Order
        </a>
      </div>
    `,
  });
};

/**
 * 3. Order Confirmed Template
 */
const orderConfirmedTemplate = ({
  order,
  user,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Valued Customer';
  return baseLayout({
    title: `Your Order Is Confirmed! 🎉 — #${order.orderNumber} | ${storeName}`,
    preheader: `Great news! Your slipper order #${order.orderNumber} is confirmed and moving to packing.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #121417; margin: 0 0 10px 0;">
        Your Order Is Confirmed! 🎉
      </h2>
      <p style="margin: 0 0 16px 0;">
        Hi ${customerName}, great news! Your footwear order <strong>#${order.orderNumber}</strong> has been officially confirmed by our showroom team.
      </p>
      <p style="margin: 0 0 24px 0;">
        We are now carefully packing your slippers with protective packaging for safe doorstep delivery.
      </p>

      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${FRONTEND_URL}/account/orders/${order.orderNumber}" class="btn-primary">
          Track Order Status
        </a>
      </div>
    `,
  });
};

/**
 * 4. Order Shipped Template
 */
const orderShippedTemplate = ({
  order,
  user,
  trackingNumber,
  courierName,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Valued Customer';
  return baseLayout({
    title: `Your Slippers Are On The Way! 🚚 — #${order.orderNumber} | ${storeName}`,
    preheader: `Order #${order.orderNumber} has been dispatched. Track your delivery.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #121417; margin: 0 0 10px 0;">
        Your Order Is On Its Way 🚚
      </h2>
      <p style="margin: 0 0 18px 0;">
        Hi ${customerName}, your slippers for order <strong>#${order.orderNumber}</strong> have been packed and handed over to our courier partner.
      </p>

      <div style="background-color: #F8F5EE; border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid #EAE6DD; font-size: 13px;">
        <div style="margin-bottom: 8px;"><strong>Courier Partner:</strong> ${courierName || 'BlueDart / Express Cargo'}</div>
        <div><strong>AWB / Tracking Number:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #A88656;">${trackingNumber || 'Available shortly in portal'}</span></div>
      </div>

      <div style="text-align: center; margin: 32px 0 12px 0;">
        <a href="${FRONTEND_URL}/account/orders/${order.orderNumber}" class="btn-primary">
          Live Courier Tracking
        </a>
      </div>
    `,
  });
};

/**
 * 5. Order Delivered Template
 */
const orderDeliveredTemplate = ({
  order,
  user,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Valued Customer';
  return baseLayout({
    title: `Your Order Has Been Delivered! 🎉 — #${order.orderNumber} | ${storeName}`,
    preheader: `Package delivered! We hope you love the cloud comfort of your new slippers.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #121417; margin: 0 0 10px 0;">
        Delivered To Your Doorstep! 🎉
      </h2>
      <p style="margin: 0 0 18px 0;">
        Hi ${customerName}, your order <strong>#${order.orderNumber}</strong> has been successfully delivered.
      </p>
      <p style="margin: 0 0 24px 0;">
        We hope you enjoy the lightweight arch support and cloud comfort cushioning.
      </p>

      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${FRONTEND_URL}/account/orders/${order.orderNumber}" class="btn-primary">
          Leave Product Review
        </a>
      </div>
    `,
  });
};

/**
 * 6. Order Cancelled Template
 */
const orderCancelledTemplate = ({
  order,
  user,
  reason,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = user?.name ? user.name.split(' ')[0] : 'Valued Customer';
  return baseLayout({
    title: `Order Cancelled — #${order.orderNumber} | ${storeName}`,
    preheader: `Order #${order.orderNumber} has been cancelled.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <h2 style="font-size: 20px; font-weight: 800; color: #DC2626; margin: 0 0 10px 0;">
        Order Cancelled
      </h2>
      <p style="margin: 0 0 16px 0;">
        Hi ${customerName}, your order <strong>#${order.orderNumber}</strong> has been cancelled.
      </p>
      <div style="background-color: #FEF2F2; border-radius: 14px; padding: 16px; border: 1px solid #FEE2E2; color: #991B1B; font-size: 13px; margin: 20px 0;">
        <strong>Reason:</strong> ${reason || 'Customer request / Stock adjustment'}
      </div>
      <p style="font-size: 12px; color: #666666;">
        If you made an online payment via Razorpay, any refund will be credited back to your source account in 5-7 business days.
      </p>
    `,
  });
};

/**
 * 7. Promotional / Deal Campaign Template
 */
const campaignTemplate = ({
  headline,
  message,
  imageUrl,
  ctaText = 'Shop Now',
  ctaUrl = `${FRONTEND_URL}/shop`,
  unsubscribeUrl = '',
  badgeText = 'Exclusive Deal',
  storeName = 'AuraSole',
  logo = null,
  tagline = 'Premium Footwear Studio',
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  return baseLayout({
    title: headline,
    preheader: `${headline} — Exclusive offer from ${storeName}.`,
    isPromotional: true,
    unsubscribeUrl,
    storeName,
    logo,
    tagline,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #C8A97E; color: #121417; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1.5px;">
          ${badgeText}
        </span>
        <h2 style="font-size: 24px; font-weight: 900; color: #121417; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
          ${headline}
        </h2>
      </div>

      ${
        imageUrl
          ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${imageUrl}" alt="${headline}" style="width: 100%; max-width: 536px; border-radius: 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.08);" />
        </div>
      `
          : ''
      }

      <div style="font-size: 14px; line-height: 1.7; color: #444444; margin: 20px 0;">
        ${message.replace(/\n/g, '<br/>')}
      </div>

      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${ctaUrl}" class="btn-accent">
          ${ctaText}
        </a>
      </div>
    `,
  });
};

/**
 * 8. OTP Verification Email Template
 */
const otpTemplate = ({
  name,
  otp,
  purpose = 'LOGIN',
  expiresMinutes = 5,
  storeName = 'AuraSole',
  logo = null,
  supportEmail = 'support@aurasole.com',
  whatsappNumber = '+91 98765 43210',
  address,
}) => {
  const customerName = name ? name.split(' ')[0] : 'User';
  const purposeLabel = purpose === 'ADMIN_LOGIN'
    ? 'Admin Dashboard 2FA Sign-In'
    : purpose === 'REGISTRATION'
    ? 'New Account Verification'
    : purpose === 'PASSWORD_RESET'
    ? 'Password Reset'
    : 'Account Verification';

  return baseLayout({
    title: `Your Verification Code: ${otp} — ${storeName}`,
    preheader: `Your ${purposeLabel} code is ${otp}. Valid for ${expiresMinutes} minutes.`,
    storeName,
    logo,
    supportEmail,
    whatsappNumber,
    address,
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: #F8F5EE; color: #121417; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #EAE6DD;">
          ${purposeLabel}
        </span>
        <h2 style="font-size: 22px; font-weight: 900; color: #121417; margin: 16px 0 6px 0;">
          Hi ${customerName}, here is your verification code:
        </h2>
        <p style="font-size: 13px; color: #666666; margin: 0 0 24px 0;">
          Enter this 6-digit code to complete your security verification at ${storeName}.
        </p>

        <!-- 6-Digit OTP Highlight Box -->
        <div style="background: linear-gradient(135deg, #121417 0%, #2A2E37 100%); border-radius: 20px; padding: 24px 20px; margin: 0 auto 24px auto; max-width: 320px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);">
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #C8A97E; text-align: center; text-indent: 10px;">
            ${otp}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #A0A5B1; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px;">
            Expires in ${expiresMinutes} minutes
          </div>
        </div>

        <p style="font-size: 12px; color: #888888; margin: 0; line-height: 1.6;">
          🔒 <strong>Security Warning:</strong> ${storeName} staff will never ask for your verification code. Never share this code with anyone.
        </p>
      </div>
    `,
  });
};

module.exports = {
  welcomeTemplate,
  orderPlacedTemplate,
  orderConfirmedTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderCancelledTemplate,
  campaignTemplate,
  otpTemplate,
};
