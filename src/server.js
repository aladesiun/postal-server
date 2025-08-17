const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await sequelize.authenticate();
    // Prefer running migrations instead of sync in production
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }
    app.listen(PORT, HOST, () => {
      console.log(`Server is running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
