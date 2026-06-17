const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const VALID_TRANSITIONS = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * POST /api/requests
 */
const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed.', 400, errors.array());
    }

    const { title, description, category, address, preferredTime } = req.body;

    const serviceRequest = await ServiceRequest.create({
      userId: req.user.id,
      title,
      description,
      category,
      address,
      preferredTime,
      status: 'pending',
    });

    return sendSuccess(res, 'Service request created successfully.', { request: serviceRequest }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests
 * Supports: ?page=1&limit=10&search=...&status=...&category=...
 */
const getRequests = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      where.status = req.query.status;
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } },
        { address: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await ServiceRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return sendSuccess(res, 'Service requests retrieved.', {
      requests: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests/:id
 */
const getRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    if (!request) {
      return sendError(res, 'Service request not found.', 404);
    }

    return sendSuccess(res, 'Service request retrieved.', { request });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/requests/:id
 */
const updateRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed.', 400, errors.array());
    }

    const request = await ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      return sendError(res, 'Service request not found.', 404);
    }

    if (['completed', 'cancelled'].includes(request.status)) {
      return sendError(res, `Cannot edit a ${request.status} request.`, 400);
    }

    const { title, description, category, address, preferredTime } = req.body;
    await request.update({ title, description, category, address, preferredTime });

    return sendSuccess(res, 'Service request updated.', { request });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/requests/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`, 400);
    }

    const request = await ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      return sendError(res, 'Service request not found.', 404);
    }

    const allowed = VALID_TRANSITIONS[request.status];
    if (!allowed.includes(status)) {
      return sendError(
        res,
        `Cannot transition from "${request.status}" to "${status}". Allowed: ${allowed.length ? allowed.join(', ') : 'none'}.`,
        400
      );
    }

    await request.update({ status });

    return sendSuccess(res, `Status updated to "${status}".`, { request });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/requests/:id
 */
const deleteRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      return sendError(res, 'Service request not found.', 404);
    }

    // Delete associated image if exists
    if (request.imageUrl) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(request.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await request.destroy();

    return sendSuccess(res, 'Service request deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/requests/:id/image
 */
const uploadImage = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      // Clean up uploaded file
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, 'Service request not found.', 404);
    }

    if (!req.file) {
      return sendError(res, 'No image file provided.', 400);
    }

    // Delete old image if exists
    if (request.imageUrl) {
      const oldPath = path.join(__dirname, '../../uploads', path.basename(request.imageUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    await request.update({ imageUrl });

    return sendSuccess(res, 'Image uploaded successfully.', { imageUrl });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests/stats
 */
const getStats = async (req, res, next) => {
  try {
    const [total, pending, inProgress, completed, cancelled] = await Promise.all([
      ServiceRequest.count({ where: { userId: req.user.id } }),
      ServiceRequest.count({ where: { userId: req.user.id, status: 'pending' } }),
      ServiceRequest.count({ where: { userId: req.user.id, status: 'in_progress' } }),
      ServiceRequest.count({ where: { userId: req.user.id, status: 'completed' } }),
      ServiceRequest.count({ where: { userId: req.user.id, status: 'cancelled' } }),
    ]);

    return sendSuccess(res, 'Stats retrieved.', {
      stats: { total, pending, inProgress, completed, cancelled },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, getRequests, getRequest, updateRequest, updateStatus, deleteRequest, uploadImage, getStats };
