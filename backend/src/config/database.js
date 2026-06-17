const { Sequelize } = require('sequelize');
require('dotenv').config();

const isCloudDB = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

/**
 * Sequelize Database Connection
 *
 * Features:
 * - Auto-detects cloud vs local and enables SSL for cloud
 * - Connection pooling (max 10 concurrent connections)
 * - Automatic reconnection via retry logic in server.js
 * - Underscored naming (snake_case columns, camelCase JS)
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'zepnest_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || (isCloudDB ? 4000 : 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => console.log(`[SQL] ${msg}`)
      : false,

    // Connection pool — handles multiple simultaneous users
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: 30000,   // max ms to get a connection before throwing
      idle: 10000,      // ms before idle connection is released
      evict: 60000,     // ms interval to evict old idle connections
    },

    define: {
      timestamps: true,
      underscored: true,   // JS: fullName → DB column: full_name
      freezeTableName: true,
    },

    // Retry on connection loss (e.g., TiDB serverless cold start)
    retry: {
      max: 3,
      timeout: 5000,
    },

    // SSL required for TiDB Cloud, Railway, PlanetScale, and most cloud MySQL
    ...(isCloudDB && {
      dialectOptions: {
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
        connectTimeout: 60000,
      },
    }),

    // Local development — longer timeouts are fine without SSL
    ...(!isCloudDB && {
      dialectOptions: {
        connectTimeout: 30000,
      },
    }),
  }
);

/**
 * testConnection — Verify DB is reachable.
 * Called at server startup and on reconnect attempts.
 */
const testConnection = async () => {
  await sequelize.authenticate();
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
