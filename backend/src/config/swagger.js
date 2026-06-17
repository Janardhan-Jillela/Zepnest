const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zepnest Service Request API',
      version: '1.0.0',
      description: 'API for managing home-care service requests on the Zepnest platform.',
      contact: { name: 'Zepnest Engineering' },
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ServiceRequest: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string', enum: ['cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'other'] },
            address: { type: 'string' },
            preferredTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
            imageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
