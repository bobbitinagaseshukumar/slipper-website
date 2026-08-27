const authService = require('../services/authService');
const sessionService = require('../services/sessionService');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get Public Authentication Settings & Active Registration Fields
 */
const getAuthSettings = async (req, res, next) => {
  try {
    const settings = await authService.getPublicAuthSettings();
    return successResponse(res, 'Authentication configuration loaded.', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Register Customer Controller
 */
const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return errorResponse(res, 'Validation failed', 422, errors);
    }

    const { name, email, phone, whatsappNumber, password, customFields } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.register({
      name,
      email,
      phone,
      whatsappNumber,
      password,
      customFields,
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
 * Google Authentication Controller
 */
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, photoURL, googleId } = req.body;
    if (!email) {
      return errorResponse(res, 'Google account email is required.', 400);
    }

    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.googleAuth({
      email,
      name,
      photoURL,
      googleId,
      userAgent,
      ipAddress,
    });

    return successResponse(res, 'Authenticated with Google successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Facebook Authentication Controller
 */
const facebookLogin = async (req, res, next) => {
  try {
    const { email, name, photoURL, facebookId } = req.body;
    if (!facebookId && !email) {
      return errorResponse(res, 'Facebook credentials required.', 400);
    }

    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    const result = await authService.facebookAuth({
      email,
      name,
      photoURL,
      facebookId,
      userAgent,
      ipAddress,
    });

    return successResponse(res, 'Authenticated with Facebook successfully.', result);
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
 * Update Profile Controller
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await authService.updateProfile(userId, req.body);
    return successResponse(res, 'Profile updated successfully.', updated);
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

    if (!password) {
      return errorResponse(res, 'New password is required.', 422);
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

module.exports = {
  getAuthSettings,
  register,
  login,
  googleLogin,
  facebookLogin,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
};
