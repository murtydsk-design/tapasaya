require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5001;

async function startServer() {
  console.log('⚔️ Starting TAPASYA Backend Foundation...');
  
  // Verify Database Connection on Startup
  const dbHealth = await testConnection();
  if (dbHealth.connected) {
    console.log(`✅ Neon PostgreSQL Database Connected. DB Time: ${dbHealth.timestamp}`);
  } else {
    console.warn(`⚠️ Warning: Neon PostgreSQL Database Connection Check Failed: ${dbHealth.error}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 TAPASYA Express API running on port ${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
