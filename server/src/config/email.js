const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '"AuraSole Footwear" <support@aurasole.com>';

let transporter = null;

const isConfigured = Boolean(SMTP_USER && SMTP_PASS);

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // Mock transporter for development logging
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 [MOCK EMAIL DISPATCHED] — No SMTP credentials set in .env');
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
};
