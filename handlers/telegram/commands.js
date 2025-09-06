// handlers/telegram/commands.js
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const sessionApiClient = require('@utils/sessionApiClient'); // NEW: Import session API client

/**
 * Sets up command handlers for the Telegram bot.
 * @param {TelegramBot} bot The Telegram bot instance.
 * @param {Map} userStates A map to store user states. // This parameter will be removed soon
 */
function setupCommandHandlers(bot, userStates) { // userStates will be removed from here
  // Commande /start
  bot.onText(/\/start/, async (msg) => { // MODIFIED: Added async
    const chatId = msg.chat.id;
    await sessionApiClient.delete(chatId); // MODIFIED: Delete state via API

    bot.sendMessage(chatId, messages.common.welcome, keyboards.mainMenu);
  });

  // Commande /help
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, messages.common.help, keyboards.backToMain);
  });
}

module.exports = setupCommandHandlers;
