/**
 * Brevo (formerly Sendinblue) Transactional & Marketing Email Service Integration
 * 
 * Supports:
 * 1. Brevo v3 REST API (https://api.brevo.com/v3/smtp/email) via native Node fetch
 * 2. Brevo Contact Sync (https://api.brevo.com/v3/contacts) for subscribers & customers
 * 3. Account Status & Credit Verification (https://api.brevo.com/v3/account)
 */

const getBrevoApiKey = () => {
  return (
    process.env.BREVO_API_KEY ||
    process.env.SENDINBLUE_API_KEY ||
    process.env.BREVO_SMTP_KEY ||
    ''
  ).trim();
};

const getBrevoSender = () => {
  const defaultEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'support@aurasole.com';
  const defaultName = process.env.BREVO_SENDER_NAME || 'AuraSole Footwear';
  return {
    email: defaultEmail.trim(),
    name: defaultName.trim(),
  };
};

/**
 * Check if Brevo API is configured and operational
 */
const isBrevoConfigured = () => {
  const key = getBrevoApiKey();
  return Boolean(key && key.length > 5);
};

/**
 * Send Transactional Email using Brevo REST API v3
 */
const sendEmailViaBrevo = async ({
  to,
  subject,
  html,
  senderName,
  senderEmail,
  tags = [],
  replyTo = null,
}) => {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    throw new Error('Brevo API key is not set. Please add BREVO_API_KEY to your .env configuration.');
  }

  const defaultSender = getBrevoSender();
  const sender = {
    name: senderName || defaultSender.name,
    email: senderEmail || defaultSender.email,
  };

  const recipientList = Array.isArray(to)
    ? to.map((item) => (typeof item === 'string' ? { email: item.trim() } : item))
    : [{ email: to.trim() }];

  const payload = {
    sender,
    to: recipientList,
    subject,
    htmlContent: html,
    tags,
  };

  if (replyTo) {
    payload.replyTo = typeof replyTo === 'string' ? { email: replyTo } : replyTo;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || data?.code || `HTTP ${response.status}: Failed to send email via Brevo`;
      console.error('❌ Brevo API Dispatch Error:', errorMsg, data);
      throw new Error(`Brevo Error: ${errorMsg}`);
    }

    console.log(`✅ [BREVO EMAIL DISPATCHED] MessageID: ${data.messageId || data.messageIds?.join(', ')} to ${recipientList.map(r => r.email).join(', ')}`);
    return {
      success: true,
      messageId: data.messageId || (data.messageIds && data.messageIds[0]) || `brevo-${Date.now()}`,
      provider: 'BREVO_REST_API',
      data,
    };
  } catch (err) {
    console.error('❌ brevoService.sendEmailViaBrevo exception:', err.message);
    throw err;
  }
};

/**
 * Add or Update Contact in Brevo CRM / Contact List
 */
const syncContactToBrevo = async ({ email, name = '', listIds = [], attributes = {} }) => {
  const apiKey = getBrevoApiKey();
  if (!apiKey) return { success: false, reason: 'BREVO_NOT_CONFIGURED' };

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        attributes: {
          FIRSTNAME: name.split(' ')[0] || '',
          LASTNAME: name.split(' ').slice(1).join(' ') || '',
          ...attributes,
        },
        listIds,
        updateEnabled: true,
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err) {
    console.warn('⚠️ Syncing contact to Brevo failed:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Check Brevo Account Health & Credit Balances
 */
const getBrevoAccountInfo = async () => {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { configured: false, reason: 'No BREVO_API_KEY present in environment variables.' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        configured: true,
        valid: false,
        error: data.message || 'Invalid Brevo API Key',
      };
    }

    return {
      configured: true,
      valid: true,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      planType: data.plan?.type,
      credits: data.plan?.credits || data.plan?.creditsType,
      relay: data.relay,
    };
  } catch (err) {
    return { configured: true, valid: false, error: err.message };
  }
};

module.exports = {
  isBrevoConfigured,
  getBrevoApiKey,
  getBrevoSender,
  sendEmailViaBrevo,
  syncContactToBrevo,
  getBrevoAccountInfo,
};
