const authService = require('../services/authService');
const sessionService = require('../services/sessionService');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Register Customer Controller
 */
const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return errorResponse(res, 'Validation failed', 422, errors);
    }

    const { name, email, phone, password } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.register({
      name,
      email,
      phone,
      password,
      userAgent,
      ipAddress,
    });

    return successResponse(res, 'Registration successful. Welcome to AuraSole!', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login Controller
 */
const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return errorResponse(res, 'Validation failed', 422, errors);
    }

    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.login({
      email,
      password,
      userAgent,
      ipAddress,
    });

    return successResponse(res, 'Login successful. Welcome back!', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Authenticated User Controller
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'Profile retrieved successfully', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout Controller (Revokes current session)
 */
const logout = async (req, res, next) => {
  try {
    if (req.session?.id && req.user?.id) {
      await sessionService.revokeSession(req.session.id, req.user.id, 'USER_LOGOUT');
    }
    return successResponse(res, 'Successfully logged out.');
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password Controller
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Please provide an email address.', 400);
    }

    const result = await authService.forgotPassword(email);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password Controller
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return errorResponse(res, 'Password reset token is required.', 400);
    }

    if (!password || password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters long.', 422);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match.', 422);
    }

    const result = await authService.resetPassword(token, password);
    return successResponse(res, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Firebase OAuth Sync Controller
 */
const firebaseSync = async (req, res, next) => {
  try {
    const { firebaseUid, email, name, photoURL, loginProvider } = req.body;

    if (!firebaseUid || !email) {
      return errorResponse(res, 'Firebase UID and email are required for authentication synchronization.', 400);
    }

    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.firebaseSync({
      firebaseUid,
      email,
      name,
      photoURL,
      loginProvider,
      userAgent,
      ipAddress,
    });

    const message = result.isNewCustomer
      ? `Welcome to AuraSole Footwear, ${result.user.name.split(' ')[0]}! Let's set up your profile.`
      : `Welcome back, ${result.user.name.split(' ')[0]}! Ready to find your next favorite pair?`;

    return successResponse(res, message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Onboarding Profile Controller
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.completeOnboarding(userId, req.body);
    return successResponse(res, 'Your slipper profile has been completed successfully! Enjoy shopping.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  firebaseSync,
  completeOnboarding,
};
