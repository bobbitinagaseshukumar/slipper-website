const nodemailer = require('nodemailer');

const BREVO_API_KEY = (
  process.env.BREVO_API_KEY ||
  process.env.SENDINBLUE_API_KEY ||
  process.env.BREVO_SMTP_KEY ||
  ''
).trim();

const SMTP_HOST = process.env.SMTP_HOST || (BREVO_API_KEY ? 'smtp-relay.brevo.com' : 'smtp.gmail.com');
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
const SMTP_USER = process.env.SMTP_USER || (BREVO_API_KEY ? process.env.BREVO_SENDER_EMAIL : '');
const SMTP_PASS = process.env.SMTP_PASS || BREVO_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL 
  ? `"${process.env.BREVO_SENDER_NAME || 'AuraSole Footwear'}" <${process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER}>`
  : '"AuraSole Footwear" <support@aurasole.com>';

let transporter = null;

const hasBrevoApiKey = Boolean(BREVO_API_KEY && BREVO_API_KEY.length > 5);
const hasSmtpCreds = Boolean(SMTP_USER && SMTP_PASS);

const isConfigured = hasBrevoApiKey || hasSmtpCreds;

if (hasSmtpCreds || hasBrevoApiKey) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER || 'apikey',
      pass: SMTP_PASS || BREVO_API_KEY,
    },
  });
} else {
  // Mock transporter for development logging when no credentials set
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 [MOCK EMAIL DISPATCHED] — Add BREVO_API_KEY or SMTP credentials to .env to send live emails');
      console.log(`   To: ${mailOptions.to}`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   Preview (HTML length): ${mailOptions.html?.length || 0} bytes`);
      return {
        messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    },
    verify: async () => true,
  };
}

module.exports = {
  transporter,
  EMAIL_FROM,
  isConfigured,
  hasBrevoApiKey,
  provider: hasBrevoApiKey ? 'BREVO' : hasSmtpCreds ? 'SMTP' : 'MOCK',
};
