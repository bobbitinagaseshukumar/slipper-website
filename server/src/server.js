const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify DB connectivity
    await prisma.$connect();
    console.log('📦 Connected to Neon PostgreSQL via Prisma successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 AuraSole Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
