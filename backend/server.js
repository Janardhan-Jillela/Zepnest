require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const { testConnection } = require('./src/config/database');

// Import all models to register associations before sync
require('./src/models/User');
require('./src/models/ServiceRequest');

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * connectWithRetry — Attempts DB connection with exponential back-off.
 * Handles cloud DB cold starts (TiDB Serverless, Railway, etc.)
 */
const connectWithRetry = async (attempt = 1) => {
  try {
    await testConnection();
    console.log(`✅ Database connection established (attempt ${attempt}).`);
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error(`❌ Could not connect to database after ${MAX_RETRIES} attempts.`);
      console.error(`   Error: ${err.message}`);
      console.error(`   Check your DB credentials in .env`);
      process.exit(1);
    }
    const delay = RETRY_DELAY_MS * attempt;
    console.warn(`⚠️  DB connection failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay / 1000}s...`);
    await new Promise((r) => setTimeout(r, delay));
    return connectWithRetry(attempt + 1);
  }
};

/**
 * Handle unexpected disconnections after the server is running.
 * Re-authenticate to restore the connection pool.
 */
sequelize.addHook('afterDisconnect', async () => {
  console.warn('⚠️  DB disconnected. Attempting to reconnect...');
  try {
    await testConnection();
    console.log('✅ DB reconnected successfully.');
  } catch (err) {
    console.error('❌ DB reconnection failed:', err.message);
  }
});

const start = async () => {
  try {
    // Step 1: Connect to database with retry
    await connectWithRetry();

    // Step 2: Sync all models (alter: true updates columns without dropping data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized.');

    // Step 3: Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀  Zepnest API          http://localhost:${PORT}`);
      console.log(`📚  Swagger Docs         http://localhost:${PORT}/api/docs`);
      console.log(`❤️   Health Check         http://localhost:${PORT}/api/health`);
      console.log(`🗄️   Database             ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
      console.log(`🌍  Environment          ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Server and DB connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
