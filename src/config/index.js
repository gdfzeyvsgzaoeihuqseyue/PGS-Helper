const dotenv = require('dotenv');
const logger = require('@utils/logger');

dotenv.config();

const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
  },
  pgs: {
    apiUrl: process.env.PGS_API_BASE_URL,
    apiKey: process.env.PGS_API_KEY, // Use apiKey instead of apiToken for consistency with .env.example
  },
  env: process.env.NODE_ENV || 'development',
};

const requiredVars = [
  'TELEGRAM_BOT_TOKEN',
  'PGS_API_BASE_URL',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    logger.error(`   - ${varName}`);
  });
  logger.error('\n📝 Please configure the .env file with the correct values.');
  process.exit(1);
}

module.exports = config;
