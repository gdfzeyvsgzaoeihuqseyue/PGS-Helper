const setupCommandHandlers = require('./telegram/commands');
const setupCallbackHandlers = require('./telegram/callbacks');
const setupMessageHandlers = require('./telegram/messages');

/**
 * Sets up all Telegram bot event handlers.
 * @param {TelegramBot} bot The Telegram bot instance.
 * @param {Map} userStates A map to store user states. // This parameter is no longer needed
 */
function setupTelegramHandlers(bot) { // userStates parameter removed
  setupCommandHandlers(bot); // userStates parameter removed
  setupCallbackHandlers(bot); // userStates parameter removed
  setupMessageHandlers(bot); // userStates parameter removed
}

module.exports = setupTelegramHandlers;
