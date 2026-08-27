const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Authentication & Admin Role Gate
router.use(authenticateUser);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// 1. Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// 2. Products
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createProduct);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// 3. Categories
router.get('/categories', adminController.getAdminCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/reorder', adminController.reorderCategories);

// 4. Subcategories
router.get('/subcategories', adminController.getSubCategories);
router.post('/subcategories', adminController.createSubCategory);
router.patch('/subcategories/:id', adminController.updateSubCategory);
router.delete('/subcategories/:id', adminController.deleteSubCategory);
router.post('/subcategories/reorder', adminController.reorderSubCategories);

// 5. Brands (NORMAL & COMPANY BRANDING)
router.get('/brands', adminController.getAdminBrands);
router.post('/brands', adminController.createBrand);
router.patch('/brands/:id', adminController.updateBrand);
router.delete('/brands/:id', adminController.deleteBrand);
router.post('/brands/reorder', adminController.reorderBrands);
router.get('/brands/:id/products', adminController.getBrandProducts);

// 6. Orders
router.get('/orders', adminController.getAdminOrders);
router.get('/orders/:id', adminController.getAdminOrderDetails);
router.post('/orders/:id/approve', adminController.approveOrder);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Admin Notifications Center
router.get('/notifications', adminController.getAdminNotifications);
router.patch('/notifications/:id/read', adminController.markAdminNotificationRead);
router.post('/notifications/mark-all-read', adminController.markAllAdminNotificationsRead);

// 5. Customers
router.get('/customers', adminController.getAdminCustomers);
router.get('/customers/:id', adminController.getAdminCustomerDetails);
router.patch('/customers/:id/status', adminController.updateCustomerStatus);
router.patch('/customers/:id/notes', adminController.updateCustomerAdminNotes);
router.post('/customers/:id/force-logout', adminController.forceLogoutCustomer);
router.post('/customers/:id/force-password-reset', adminController.forcePasswordResetCustomer);
router.post('/customers/:id/deactivate', adminController.softDeleteCustomer);
router.delete('/customers/:id', adminController.deleteCustomer);

// 6. Reviews
router.get('/reviews', adminController.getAdminReviews);
router.patch('/reviews/:id/moderate', adminController.moderateReview);

// 7. Coupons
router.get('/coupons', adminController.getAdminCoupons);
router.post('/coupons', adminController.createCoupon);

// 8. Banners
router.get('/banners', adminController.getAdminBanners);
router.post('/banners', adminController.createBanner);

// 9. Offers & Deals
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// 10. Festival Deals
router.get('/festival-deals', adminController.getFestivalDeals);
router.post('/festival-deals', adminController.createFestivalDeal);
router.delete('/festival-deals/:id', adminController.deleteFestivalDeal);

// 11. Flash Sales
router.get('/flash-sales', adminController.getFlashSales);
router.post('/flash-sales', adminController.createFlashSale);
router.delete('/flash-sales/:id', adminController.deleteFlashSale);

// 12. Audit Logs
router.get('/audit-logs', adminController.getAdminAuditLogs);

// 13. Homepage Sections & Festival Campaigns
router.get('/sections', adminController.getAdminSections);
router.post('/sections', adminController.createAdminSection);
router.patch('/sections/:id', adminController.updateAdminSection);
router.delete('/sections/:id', adminController.deleteAdminSection);
router.post('/sections/reorder', adminController.reorderAdminSections);
router.post('/sections/:id/products', adminController.assignProductToSection);
router.delete('/sections/:id/products/:productId', adminController.removeProductFromSection);

// 14. Custom Registration Fields & Authentication Controls
router.get('/registration-fields', adminController.getAdminCustomFields);
router.post('/registration-fields', adminController.createCustomField);
router.put('/registration-fields/:id', adminController.updateCustomField);
router.delete('/registration-fields/:id', adminController.deleteCustomField);
router.post('/registration-fields/reorder', adminController.reorderCustomFields);
router.put('/customers/:id/profile', adminController.updateCustomerProfileAdmin);
router.get('/auth-logs', adminController.getAuthAuditLogs);

module.exports = router;
