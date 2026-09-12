const authValidator = require('../validators/auth.validator');
const authService = require('../services/auth.service');

/**
 * Handles user registration: POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const validation = authValidator.validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const result = await authService.registerUser(validation.normalizedData);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles user login: POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const validation = authValidator.validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const result = await authService.loginUser(validation.normalizedData);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles user logout: POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles retrieving current authenticated user profile: GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles Google OAuth login: POST /api/auth/google
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { token, credential } = req.body || {};
    const idToken = credential || token;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential token is required.'
      });
    }

    const result = await authService.googleLogin(idToken);

    return res.status(200).json({
      success: true,
      message: 'Authenticated with Google successfully.',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};
