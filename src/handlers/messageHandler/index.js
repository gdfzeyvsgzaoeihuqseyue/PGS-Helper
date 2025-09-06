const logger = require('@utils/logger');
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const sessionManager = require('@services/sessionManager');
const linkActions = require('@actions/shortlink/link');
const qrCodeActions = require('@actions/shortlink/qrcode');

const handleMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignorer les commandes considérées par le bot
  if (text && (text.startsWith('/start') || text.startsWith('/help'))) {
    return;
  }

  const userState = sessionManager.get(chatId);

  // Pas de session active
  if (!userState) {
    logger.debug(`No active user state for chat ${chatId}. Message: "${text}"`);
    // Optionally, you can send a message back or main menu here
    // await bot.sendMessage(chatId, messages.common.actionNotRecognized, keyboards.mainMenu);
    return;
  }

  try {
    switch (userState.action) {
      // SHORT LINKS CASES
      case 'waiting_url':
        await linkActions.handleUrlInput(bot, chatId, text);
        break;

      case 'waiting_alias':
        await linkActions.handleAliasInput(bot, chatId, text);
        break;

      case 'waiting_search':
        await linkActions.handleSearchInput(bot, chatId, text);
        break;

      case 'waiting_edit_id':
        await linkActions.handleEditIdInput(bot, chatId, text);
        break;

      case 'waiting_new_url':
        await linkActions.handleNewUrlInput(bot, chatId, text);
        break;

      case 'waiting_toggle_id':
        await linkActions.handleToggleIdInput(bot, chatId, text);
        break;

      case 'waiting_delete_id':
        await linkActions.handleDeleteIdInput(bot, chatId, text);
        break;

      case 'waiting_history_id':
        await linkActions.handleHistoryIdInput(bot, chatId, text);
        break;

      // QR CODE CASES
      case 'waiting_shortlink_qr_id':
        await qrCodeActions.handleShortLinkQrCodeIdInput(bot, chatId, text);
        break;

      case 'waiting_url_qr_input':
        await qrCodeActions.handleUrlQrCodeInput(bot, chatId, text);
        break;

      case 'waiting_qr_search_id':
        await qrCodeActions.handleSearchQrCodeInput(bot, chatId, text);
        break;

      case 'waiting_qr_update_id':
        await qrCodeActions.handleUpdateQrCodeIdInput(bot, chatId, text);
        break;

      case 'waiting_qr_update_options':
        await qrCodeActions.handleUpdateQrCodeOptionsInput(bot, chatId, text);
        break;

      case 'waiting_qr_delete_id':
        await qrCodeActions.handleDeleteQrCodeIdInput(bot, chatId, text);
        break;

      default:
        logger.warn(`Unhandled user state action: ${userState.action} for chat ${chatId}.`);
        sessionManager.delete(chatId);
        await bot.sendMessage(chatId, messages.common.actionNotRecognized, keyboards.mainMenu);
        break;
    }
  } catch (error) {
    logger.error('Error processing message:', error);
    sessionManager.delete(chatId); 
    await bot.sendMessage(chatId, messages.common.apiError, keyboards.backToMain);
  }
};

module.exports = {
  handleMessage
};
