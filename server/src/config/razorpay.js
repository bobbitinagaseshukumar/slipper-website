const Razorpay = require('razorpay');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const isConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

let razorpayInstance = null;

if (isConfigured) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  // Mock instance for development & testing when keys are not yet configured in .env
  razorpayInstance = {
    orders: {
      create: async (options) => {
        console.log('💳 [MOCK RAZORPAY ORDER CREATED] — Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for live mode');
        console.log(`   Amount: ₹${options.amount / 100} (${options.currency})`);
        console.log(`   Receipt: ${options.receipt}`);
        return {
          id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };
      },
    },
    payments: {
      fetch: async (paymentId) => ({
        id: paymentId,
        entity: 'payment',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
      }),
    },
  };
}

module.exports = {
  razorpayInstance,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  isConfigured,
};
