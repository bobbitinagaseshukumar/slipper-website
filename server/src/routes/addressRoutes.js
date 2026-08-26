const express = require('express');
const addressController = require('../controllers/addressController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
