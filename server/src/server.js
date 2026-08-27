const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 AuraSole Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

// Connect to Neon PostgreSQL via Prisma
prisma.$connect()
  .then(() => {
    console.log('📦 Connected to Neon PostgreSQL via Prisma successfully.');
  })
  .catch((error) => {
    console.error('⚠️ Database connection warning on startup:', error.message);
  });

module.exports = server;
