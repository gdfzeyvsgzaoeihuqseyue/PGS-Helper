const logger = require('@utils/logger');
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const sessionManager = require('@services/sessionManager');
const linkActions = require('@actions/shortlink/link');
const qrCodeActions = require('@actions/shortlink/qrcode');

const handleCallbackQuery = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  await bot.answerCallbackQuery(callbackQuery.id); 

  try {
    switch (data) {
      case 'main_menu':
        await bot.editMessageText(messages.common.welcome, {
          chat_id: chatId,
          message_id: messageId,
          ...keyboards.mainMenu
        });
        sessionManager.delete(chatId);
        break;

      // ===============================================
      // SHORTLINK ACTIONS
      // ===============================================
      case 'shortlink_menu':
          await bot.editMessageText('🔗 *Gestion des liens*\n\nChoisissez une action :', {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            ...keyboards.shortlink.shortLinkMenu
          });
          break;

      case 'create_link':
        await linkActions.initCreateLink(bot, chatId, messageId);
        break;

      case 'list_links':
        await linkActions.listLinks(bot, chatId, messageId);
        break;

      case 'search_link':
        await linkActions.initSearchLink(bot, chatId, messageId);
        break;

      case 'edit_link':
        await linkActions.initEditLink(bot, chatId, messageId);
        break;

      case 'toggle_link':
        await linkActions.initToggleLink(bot, chatId, messageId);
        break;

      case 'delete_link':
        await linkActions.initDeleteLink(bot, chatId, messageId);
        break;

      case 'link_history':
        await linkActions.initLinkHistory(bot, chatId, messageId);
        break;

      case 'help':
        await bot.editMessageText(messages.common.help, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMain
        });
        break;

      // ===============================================
      // QR CODE ACTIONS
      // ===============================================
      case 'qr_code_menu':
        await bot.editMessageText('📸 **Gestion des QR Codes**\n\nChoisissez une action :', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.qrcode.qrCodeMenu
        });
        break;

      case 'create_qr_for_link':
        await qrCodeActions.initCreateShortLinkQrCode(bot, chatId, messageId);
        break;

      case 'create_qr_for_url':
        await qrCodeActions.initCreateUrlQrCode(bot, chatId, messageId);
        break;

      case 'list_qrcodes':
        await qrCodeActions.listQrCodes(bot, chatId, messageId);
        break;

      case 'search_qrcode':
        await qrCodeActions.initSearchQrCode(bot, chatId, messageId);
        break;

      case 'edit_qrcode':
        await qrCodeActions.initUpdateQrCode(bot, chatId, messageId);
        break;

      case 'delete_qrcode':
        await qrCodeActions.initDeleteQrCode(bot, chatId, messageId);
        break;

      default:
        if (data.startsWith('confirm_delete_')) {
          const linkId = data.replace('confirm_delete_', '');
          await linkActions.confirmDelete(bot, chatId, messageId, linkId);
        } else if (data.startsWith('toggle_')) {
          const [action, linkId, status] = data.split('_');
          await linkActions.confirmToggle(bot, chatId, messageId, linkId, status === 'disable');
        } else if (data.startsWith('list_page_')) {
          const page = parseInt(data.replace('list_page_', ''));
          await linkActions.listLinks(bot, chatId, messageId, page);
        } else if (data.startsWith('list_qrcodes_page_')) {
          const page = parseInt(data.replace('list_qrcodes_page_', ''));
          await qrCodeActions.listQrCodes(bot, chatId, messageId, page);
        } else if (data.startsWith('confirm_delete_qrcode_')) {
          const qrCodeId = data.replace('confirm_delete_qrcode_', '');
          await qrCodeActions.confirmDeleteQrCode(bot, chatId, messageId, qrCodeId);
        } else {
          logger.warn(`Unhandled callback query data: ${data}`);
          await bot.sendMessage(chatId, messages.common.actionNotRecognized, keyboards.mainMenu);
        }
        break;
    }
  } catch (error) {
    logger.error('Error processing callback query:', error);
    await bot.sendMessage(chatId, messages.common.apiError, keyboards.backToMain);
  }
};

module.exports = {
  handleCallbackQuery
};
