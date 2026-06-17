const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/** Safe user object — never expose password field */
const safeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/** Generate signed JWT with user id, email, and role in payload */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'zepnest-api',
      audience: 'zepnest-client',
    }
  );
};

/* =========================================================
   POST /api/auth/register
   ========================================================= */
const register = async (req, res, next) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed.', 400, errors.array());
    }

    const { fullName, email, phoneNumber, password, role } = req.body;

    // 2. Check email uniqueness (case-insensitive)
    const existing = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    // 3. Hash password with cost factor 12 (production-safe)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Persist user to database
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber?.trim() || null,
      password: hashedPassword,
      // Prevent self-assigning admin role on registration
      role: role === 'admin' ? 'customer' : (role || 'customer'),
    });

    // 5. Generate JWT
    const token = generateToken(user);

    return sendSuccess(
      res,
      'Registration successful. Welcome to Zepnest!',
      { token, user: safeUser(user) },
      201
    );
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   POST /api/auth/login
   ========================================================= */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed.', 400, errors.array());
    }

    const { email, password } = req.body;

    // Fetch user including password field (excluded by defaultScope)
    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Use same error message for wrong email AND wrong password
    // (prevents user enumeration attacks)
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Check account is active
    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Contact support.', 403);
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Update last login timestamp
    await user.update({ lastLoginAt: new Date() });

    const token = generateToken(user);

    return sendSuccess(res, 'Login successful.', {
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GET /api/auth/profile  (was /me)
   Returns full authenticated user profile
   ========================================================= */
const getProfile = async (req, res, next) => {
  try {
    // Reload from DB to always return fresh data
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }
    return sendSuccess(res, 'Profile retrieved successfully.', {
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   PUT /api/auth/profile
   Update name, phone, role (not email/password here)
   ========================================================= */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed.', 400, errors.array());
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const { fullName, phoneNumber, role } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber?.trim() || null;
    // Only allow role change if not trying to self-promote to admin
    if (role !== undefined && role !== 'admin') updates.role = role;

    await user.update(updates);

    return sendSuccess(res, 'Profile updated successfully.', {
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   Backwards-compat alias for GET /api/auth/me
   ========================================================= */
const getMe = getProfile;

module.exports = { register, login, getProfile, getMe, updateProfile };
