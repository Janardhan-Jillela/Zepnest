const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/* ──────────────────────────────────────────────────────────
   Reusable validators
   ────────────────────────────────────────────────────────── */
const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number.');

const phoneValidator = body('phoneNumber')
  .optional({ nullable: true, checkFalsy: true })
  .matches(/^[+]?[\d\s\-().]{7,20}$/)
  .withMessage('Must be a valid phone number (7–20 digits).');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile management
 */

/* ──────────────────────────────────────────────────────────
   POST /api/auth/register
   ────────────────────────────────────────────────────────── */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+91 98765 43210"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass1"
 *               role:
 *                 type: string
 *                 enum: [customer, service_provider]
 *                 example: "customer"
 *     responses:
 *       201:
 *         description: Registration successful — returns JWT and user object
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register',
  [
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required.')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
    body('email')
      .isEmail().withMessage('A valid email address is required.')
      .normalizeEmail(),
    phoneValidator,
    passwordValidator,
    body('role')
      .optional()
      .isIn(['customer', 'service_provider'])
      .withMessage('Role must be "customer" or "service_provider".'),
  ],
  register
);

/* ──────────────────────────────────────────────────────────
   POST /api/auth/login
   ────────────────────────────────────────────────────────── */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate and receive a JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful — returns JWT and user object
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('A valid email is required.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.'),
  ],
  login
);

/* ──────────────────────────────────────────────────────────
   GET /api/auth/profile
   ────────────────────────────────────────────────────────── */
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get the authenticated user's full profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, getProfile);

/* ──────────────────────────────────────────────────────────
   PUT /api/auth/profile
   ────────────────────────────────────────────────────────── */
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, service_provider]
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/profile',
  authenticate,
  [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
    phoneValidator,
    body('role')
      .optional()
      .isIn(['customer', 'service_provider'])
      .withMessage('Role must be "customer" or "service_provider".'),
  ],
  updateProfile
);

/* ──────────────────────────────────────────────────────────
   GET /api/auth/me  (backwards-compat alias)
   ────────────────────────────────────────────────────────── */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Alias for GET /api/auth/profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticate, getMe);

module.exports = router;
