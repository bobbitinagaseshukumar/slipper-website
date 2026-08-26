const paymentService = require('../services/paymentService');
const { RAZORPAY_KEY_ID } = require('../config/razorpay');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * 1. Get Public Razorpay Configuration Key
 */
const getPaymentConfig = async (req, res, next) => {
  try {
    return successResponse(res, 'Payment config retrieved', {
      keyId: RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Create Razorpay Order
 */
const createOrder = async (req, res, next) => {
  try {
    const { addressId, items, couponCode, notes } = req.body;
    const userId = req.user ? req.user.id : null;

    const orderData = await paymentService.createRazorpayOrder({
      userId,
      addressId,
      items,
      couponCode,
      notes,
    });

    return successResponse(res, 'Razorpay order created successfully', orderData, 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to create payment order', 400);
  }
};

/**
 * 3. Verify Razorpay Payment Signature and Fulfill Order
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderNumber,
      addressId,
      items,
      couponCode,
      notes,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return errorResponse(res, 'Missing required payment verification parameters.', 400);
    }

    // Verify cryptographic signature
    const isValid = paymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return errorResponse(res, 'Payment signature verification failed. Untrusted response.', 400);
    }

    const userId = req.user.id;

    // Fulfill and record the order atomically in database
    const confirmedOrder = await paymentService.fulfillPaidOrder({
      userId,
      addressId,
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      couponCode,
      notes,
    });

    return successResponse(res, 'Payment verified and order confirmed successfully! 🎉', {
      orderNumber: confirmedOrder.orderNumber,
      status: confirmedOrder.status,
      paymentStatus: confirmedOrder.paymentStatus,
      finalAmount: confirmedOrder.finalAmount,
    });
  } catch (error) {
    return errorResponse(res, error.message || 'Payment fulfillment failed', 400);
  }
};

/**
 * 4. Razorpay Webhook Handler
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const event = req.body;

    console.log(`🔔 [RAZORPAY WEBHOOK RECEIVED]: ${event.event}`);

    // In a production setup, verify webhook secret if configured
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      console.log(`Payment captured for order ${paymentEntity?.order_id}: ₹${paymentEntity?.amount / 100}`);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  handleWebhook,
};
