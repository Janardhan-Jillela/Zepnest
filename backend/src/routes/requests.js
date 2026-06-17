const express = require('express');
const { body } = require('express-validator');
const {
  createRequest, getRequests, getRequest, updateRequest,
  updateStatus, deleteRequest, uploadImage, getStats,
} = require('../controllers/requestController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Service request management
 */

const requestBodyValidators = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ min: 3, max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('category')
    .isIn(['cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'other'])
    .withMessage('Invalid category.'),
  body('address').trim().notEmpty().withMessage('Address is required.'),
  body('preferredTime').isISO8601().withMessage('Preferred time must be a valid date-time.'),
];

/**
 * @swagger
 * /api/requests/stats:
 *   get:
 *     summary: Get request stats for current user
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Stats object }
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: List service requests (paginated + search)
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, completed, cancelled] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of requests }
 */
router.get('/', getRequests);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new service request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRequest'
 *     responses:
 *       201: { description: Request created }
 *       400: { description: Validation error }
 */
router.post('/', requestBodyValidators, createRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get a single service request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Service request }
 *       404: { description: Not found }
 */
router.get('/:id', getRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update a service request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Request updated }
 *       400: { description: Cannot edit completed/cancelled request }
 *       404: { description: Not found }
 */
router.put('/:id', requestBodyValidators, updateRequest);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update request status
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, in_progress, completed, cancelled] }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Invalid transition }
 */
router.patch('/:id/status', updateStatus);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete a service request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Request deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', deleteRequest);

/**
 * @swagger
 * /api/requests/{id}/image:
 *   post:
 *     summary: Upload an image for a request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Image uploaded }
 */
router.post('/:id/image', upload.single('image'), uploadImage);

module.exports = router;
