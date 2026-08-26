const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Validate Indian Phone format
 */
const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  return cleaned.length >= 10 && /^\d+$/.test(cleaned);
};

/**
 * Get All Addresses for Logged-In User
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return successResponse(res, 'Addresses retrieved', addresses);
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Delivery Address
 */
const createAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country = 'India',
      addressType = 'HOME',
      isDefault = false,
    } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return errorResponse(res, 'Full name is required (min 2 characters).', 422);
    }

    if (!phone || !validatePhone(phone)) {
      return errorResponse(res, 'A valid 10-digit mobile number is required.', 422);
    }

    if (!addressLine1 || addressLine1.trim().length < 5) {
      return errorResponse(res, 'Address Line 1 is required (min 5 characters).', 422);
    }

    if (!city || city.trim().length < 2) {
      return errorResponse(res, 'City is required.', 422);
    }

    if (!state || state.trim().length < 2) {
      return errorResponse(res, 'State is required.', 422);
    }

    if (!postalCode || !/^\d{6}$/.test(postalCode.trim())) {
      return errorResponse(res, 'A valid 6-digit PIN code is required.', 422);
    }

    // Check if this is user's first address
    const existingCount = await prisma.address.count({
      where: { userId: req.user.id },
    });

    const shouldBeDefault = isDefault || existingCount === 0;

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        // Reset previous default
        await tx.address.updateMany({
          where: { userId: req.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: {
          userId: req.user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          alternatePhone: alternatePhone ? alternatePhone.trim() : null,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2 ? addressLine2.trim() : null,
          landmark: landmark ? landmark.trim() : null,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          addressType,
          isDefault: shouldBeDefault,
        },
      });
    });

    return successResponse(res, 'Address saved successfully', newAddress, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Address
 */
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = req.body;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return errorResponse(res, 'Address not found.', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: req.user.id, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return await tx.address.update({
        where: { id },
        data: {
          ...(fullName && { fullName: fullName.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(alternatePhone !== undefined && { alternatePhone }),
          ...(addressLine1 && { addressLine1: addressLine1.trim() }),
          ...(addressLine2 !== undefined && { addressLine2 }),
          ...(landmark !== undefined && { landmark }),
          ...(city && { city: city.trim() }),
          ...(state && { state: state.trim() }),
          ...(postalCode && { postalCode: postalCode.trim() }),
          ...(country && { country: country.trim() }),
          ...(addressType && { addressType }),
          ...(isDefault !== undefined && { isDefault }),
        },
      });
    });

    return successResponse(res, 'Address updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Address
 */
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return errorResponse(res, 'Address not found.', 404);
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, make another one default if available
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse(res, 'Address deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Set Address as Default
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return errorResponse(res, 'Address not found.', 404);
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    return successResponse(res, 'Default delivery address updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
