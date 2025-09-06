// src/bot.js
require('module-alias/register'); 
require('dotenv').config();

const logger = require('@utils/logger');
const config = require('@config'); 
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const sessionManager = require('@services/sessionManager');

const TelegramBot = require('node-telegram-bot-api');
const { handleCallbackQuery } = require('@handlers/callbackHandler'); 
const { handleMessage } = require('@handlers/messageHandler'); 

// Vérification de configuration
if (!config.telegram.token) {
  logger.error('❌ TELEGRAM_BOT_TOKEN est manquant dans .env');
  process.exit(1);
}

if (!config.pgs.apiUrl) {
  logger.error('❌ PGS_API_BASE_URL est manquant dans .env');
  process.exit(1);
}

// Initialiser le bot
const bot = new TelegramBot(config.telegram.token, { polling: true });

logger.info('✅ PGS Helper Bot démarer avec succès!');

// Nom d'utilisateur du bot depuis telegram
bot.getMe().then((me) => {
  logger.info(`🤖 Nom d'utilisateur du Bot: @${me.username}`);
}).catch(err => {
  logger.error('Impossible d\'obtenir le nom d\'utilisateur du bot:', err);
});

// Polling erreurs
bot.on('polling_error', (error) => {
  logger.error('Erreur Polling:', error);
});

// Commande /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  sessionManager.delete(chatId); 
  await bot.sendMessage(chatId, messages.common.welcome, keyboards.mainMenu);
});

// Commande /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, messages.common.help, { parse_mode: 'Markdown', ...keyboards.backToMain });
});

// Handle callbacks (inline buttons)
bot.on('callback_query', (callbackQuery) => handleCallbackQuery(bot, callbackQuery));

// Handle text messages
bot.on('message', (msg) => handleMessage(bot, msg));

// Arrêt du bot
process.on('SIGINT', () => {
  logger.info('\n🛑 Arrêt du bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('\n🛑 Arrêt du bot...');
  bot.stopPolling();
  process.exit(0);
});
