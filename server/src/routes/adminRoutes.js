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
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// 4. Subcategories
router.get('/subcategories', adminController.getSubCategories);
router.post('/subcategories', adminController.createSubCategory);
router.delete('/subcategories/:id', adminController.deleteSubCategory);

// 4. Orders
router.get('/orders', adminController.getAdminOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// 5. Customers
router.get('/customers', adminController.getAdminCustomers);
router.patch('/customers/:id/status', adminController.updateCustomerStatus);
router.post('/customers/:id/force-logout', adminController.forceLogoutCustomer);
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

module.exports = router;
