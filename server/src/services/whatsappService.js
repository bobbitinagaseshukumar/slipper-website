const storeSettingsService = require('./storeSettingsService');

/**
 * Retrieve the active Store WhatsApp Number & Store Name from Database Settings
 */
const getStoreWhatsAppConfig = async () => {
  try {
    const settings = await storeSettingsService.getStoreSettings();
    const cleanPhone = (settings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
    return {
      storeName: settings.storeName || 'AuraSole',
      whatsappNumber: cleanPhone,
    };
  } catch (err) {
    console.error('Failed to read store WhatsApp setting:', err.message);
    return {
      storeName: 'AuraSole',
      whatsappNumber: '919876543210',
    };
  }
};

const getStoreWhatsAppNumber = async () => {
  const cfg = await getStoreWhatsAppConfig();
  return cfg.whatsappNumber;
};

/**
 * Build structured, beautiful pre-filled WhatsApp message for an Order
 */
const formatOrderWhatsAppMessage = ({
  orderNumber,
  customerName,
  whatsappNumber,
  items,
  subtotal,
  discount = 0,
  deliveryFee = 0,
  totalAmount,
  shippingAddress,
  storeName = 'AuraSole',
}) => {
  const itemListText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName || item.name}*\n   Size: UK ${item.size || 'Standard'} | Color: ${item.color || 'Classic'}\n   Qty: ${item.quantity} | Price: ₹${item.unitPrice || item.price} (Subtotal: ₹${(item.unitPrice || item.price) * item.quantity})`
    )
    .join('\n\n');

  const addressText = typeof shippingAddress === 'string'
    ? shippingAddress
    : `${shippingAddress.fullName || customerName}, ${shippingAddress.addressLine1 || ''}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`;

  const message = `Hello *${storeName}* 👋

I would like to place an order.

📦 *Order ID:* #${orderNumber}
👤 *Customer Name:* ${customerName}
📱 *WhatsApp Number:* ${whatsappNumber || 'Same'}

🛍️ *Products Ordered:*
${itemListText}

──────────────────
*Subtotal:* ₹${subtotal}
*Discount:* -₹${discount}
*Delivery Fee:* ₹${deliveryFee}
*Total Amount:* ₹${totalAmount}

📍 *Delivery Address:*
${addressText}

Please verify stock and confirm my order. Thank you!`;

  return message;
};

/**
 * Build Single-Product Quick Inquiry message
 */
const formatProductQuickInquiryMessage = ({
  productName,
  size,
  color,
  price,
  quantity = 1,
  productUrl,
  storeName = 'AuraSole',
}) => {
  return `Hello *${storeName}* 👋

I would like to inquire / order this slipper:

🩴 *Slipper:* ${productName}
📏 *Selected Size:* UK ${size || 'Standard'}
🎨 *Colorway:* ${color || 'Classic'}
🔢 *Quantity:* ${quantity}
💰 *Price:* ₹${price}

🔗 *Product Link:* ${productUrl || 'N/A'}

Please let me know if this size is currently in stock!`;
};

/**
 * Generate full URL-encoded click-to-chat WhatsApp link
 */
const generateWhatsAppUrl = (phone, text) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};

module.exports = {
  getStoreWhatsAppConfig,
  getStoreWhatsAppNumber,
  formatOrderWhatsAppMessage,
  formatProductQuickInquiryMessage,
  generateWhatsAppUrl,
};
