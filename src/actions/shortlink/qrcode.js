const api = require('@apiClients');
const sessionManager = require('@services/sessionManager');
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const { escapeMarkdownV2 } = require('@utils/markdownUtils');
const logger = require('@utils/logger');

class QrCodeActions {
  // Création de QR code pour un lien court
  async initCreateShortLinkQrCode(bot, chatId, messageId) {
    await bot.editMessageText(messages.qrcode.enterShortLinkQrId, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });
    sessionManager.set(chatId, { action: 'waiting_shortlink_qr_id' });
  }

  async handleShortLinkQrCodeIdInput(bot, chatId, text) {
    const linkId = text.trim();
    try {
      const qrCode = await api.qrcode.createShortLinkQrCode(linkId, {}); // MODIFIED: Assign result directly to qrCode

      // MODIFIED: Removed if (result.success) check as API client throws on error
      await bot.sendMessage(chatId, messages.qrcode.qrCodeCreated(qrCode), {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu
      });
      await bot.sendPhoto(chatId, Buffer.from(qrCode.qrCodeBase64.split(',')[1], 'base64'), {
        caption: `QR Code pour: ${escapeMarkdownV2(qrCode.title)}`,
        parse_mode: 'MarkdownV2'
      });
    } catch (error) {
      logger.error('Error creating QR code for shortlink:', error);
      await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Création de QR code pour une URL
  async initCreateUrlQrCode(bot, chatId, messageId) {
    await bot.editMessageText(messages.qrcode.enterUrlForQr, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });
    sessionManager.set(chatId, { action: 'waiting_url_qr_input' });
  }

  async handleUrlQrCodeInput(bot, chatId, text) {
    const url = text.trim();
    if (!this.isValidUrl(url)) {
      await bot.sendMessage(chatId, messages.common.invalidUrl, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      sessionManager.delete(chatId);
      return;
    }

    try {
      const result = await api.qrcode.createUrlQrCode(url, {});

      if (result.success) {
        const qrCode = result.qrCode;
        await bot.sendMessage(chatId, messages.qrcode.qrCodeCreated(qrCode), {
          parse_mode: 'Markdown',
          ...keyboards.mainMenu
        });
        await bot.sendPhoto(chatId, Buffer.from(qrCode.qrCodeBase64.split(',')[1], 'base64'), {
          caption: `QR Code pour: ${escapeMarkdownV2(qrCode.title)}`,
          parse_mode: 'MarkdownV2'
        });
      } else {
        await bot.sendMessage(chatId, `❌ **Erreur**\n\n${result.message}`, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      }
    } catch (error) {
      logger.error('Error creating QR code for URL:', error);
      await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Lister les QR codes
  async listQrCodes(bot, chatId, messageId, page = 1) {
    try {
      const result = await api.qrcode.getAllQrCodes(page, 5);

      if (!result.success || result.data.length === 0) {
        await bot.editMessageText(messages.qrcode.noQrCodesFound, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMain
        });
        return;
      }

      let message = messages.qrcode.qrCodeListHeader(result.currentPage, result.totalPages);

      result.data.forEach((qrCode) => {
        message += messages.qrcode.qrCodeListItem(qrCode);
      });

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              ...(page > 1 ? [{ text: '⬅️ Précédent', callback_data: `list_qrcodes_page_${page - 1}` }] : []),
              ...(page < result.totalPages ? [{ text: 'Suivant ➡️', callback_data: `list_qrcodes_page_${page + 1}` }] : [])
            ],
            [{ text: '🔙 Menu principal', callback_data: 'main_menu' }]
          ]
        }
      };

      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboard
      });

    } catch (error) {
      logger.error('Error fetching QR codes:', error);
      await bot.editMessageText(messages.common.apiError, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMain
      });
    }
  }

  // Rechercher un QR code
  async initSearchQrCode(bot, chatId, messageId) {
    await bot.editMessageText(messages.qrcode.enterQrCodeIdForSearch, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });
    sessionManager.set(chatId, { action: 'waiting_qr_search_id' });
  }

  async handleSearchQrCodeInput(bot, chatId, text) {
    const qrCodeId = text.trim();
    try {
      const result = await api.qrcode.getQrCode(qrCodeId);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        return;
      }

      const qrCode = result.qrCode;
      await bot.sendMessage(chatId, messages.qrcode.qrCodeFound(qrCode), {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu
      });
      await bot.sendPhoto(chatId, Buffer.from(qrCode.qrCodeBase64.split(',')[1], 'base64'), {
        caption: `QR Code pour: ${escapeMarkdownV2(qrCode.title)}`,
        parse_mode: 'MarkdownV2'
      });

    } catch (error) {
      logger.error('Error searching QR code:', error);
      await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Mettre à jour un QR code
  async initUpdateQrCode(bot, chatId, messageId) {
    await bot.editMessageText(messages.qrcode.enterQrCodeIdForUpdate, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });
    sessionManager.set(chatId, { action: 'waiting_qr_update_id' });
  }

  async handleUpdateQrCodeIdInput(bot, chatId, text) {
    const qrCodeId = text.trim();
    try {
      const result = await api.qrcode.getQrCode(qrCodeId);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      const qrCode = result.qrCode;
      sessionManager.set(chatId, {
        action: 'waiting_qr_update_options',
        qrCodeId: qrCode.id,
        currentOptions: qrCode.options
      });

      await bot.sendMessage(chatId, messages.qrcode.enterQrCodeNewOptions(qrCode), { parse_mode: 'Markdown', ...keyboards.backToMain });

    } catch (error) {
      logger.error('Error initializing QR code update:', error);
      await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      sessionManager.delete(chatId);
    }
  }

  async handleUpdateQrCodeOptionsInput(bot, chatId, text) {
    const userState = sessionManager.get(chatId);
    if (!userState || !userState.qrCodeId) {
      logger.warn(`No qrCodeId found in session for chat ${chatId} during QR update options input.`);
      await bot.sendMessage(chatId, messages.common.actionNotRecognized, { parse_mode: 'Markdown', ...keyboards.mainMenu }); 
      sessionManager.delete(chatId);
      return;
    }

    const qrCodeId = userState.qrCodeId;
    const currentOptions = userState.currentOptions || {};

    let updates = {};
    try {
      text.split(',').forEach(part => {
        const [key, value] = part.split(':').map(s => s.trim());
        if (key && value) {
          if (!isNaN(value) && !isNaN(parseFloat(value))) {
            updates[key] = parseFloat(value);
          } else if (value.toLowerCase() === 'true') {
            updates[key] = true;
          } else if (value.toLowerCase() === 'false') {
            updates[key] = false;
          } else {
            updates[key] = value;
          }
        }
      });
    } catch (e) {
      await bot.sendMessage(chatId, '❌ **Format d\'options invalide.**\n\nVeuillez envoyer les options au format "clé:valeur, clé2:valeur2".', { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      sessionManager.delete(chatId);
      return;
    }

    const mergedOptions = { ...currentOptions, ...updates };

    try {
      const result = await api.qrcode.updateQrCode(qrCodeId, mergedOptions);

      if (result.success) {
        const updatedQrCode = result.qrCode;
        await bot.sendMessage(chatId, messages.qrcode.qrCodeUpdated(updatedQrCode), {
          parse_mode: 'Markdown',
          ...keyboards.mainMenu
        });
        await bot.sendPhoto(chatId, Buffer.from(updatedQrCode.qrCodeBase64.split(',')[1], 'base64'), {
          caption: `QR Code mis à jour pour: ${escapeMarkdownV2(updatedQrCode.title)}`,
          parse_mode: 'MarkdownV2'
        });
      } else {
        await bot.sendMessage(chatId, `❌ **Erreur**\n\n${result.message}`, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      }
    } catch (error) {
      logger.error('Error updating QR code:', error);
      await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Supprimer un QR code
  async initDeleteQrCode(bot, chatId, messageId) {
    await bot.editMessageText(messages.qrcode.enterQrCodeIdForDelete, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });
    sessionManager.set(chatId, { action: 'waiting_qr_delete_id' });
  }

  async handleDeleteQrCodeIdInput(bot, chatId, text) {
    const qrCodeId = text.trim();
    try {
      const result = await api.qrcode.getQrCode(qrCodeId);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      const qrCode = result.qrCode;
      await bot.sendMessage(chatId, messages.qrcode.confirmDeleteQrCode(qrCode), { parse_mode: 'Markdown', ...keyboards.confirmDeleteQrCode(qrCode.id) });

    } catch (error) {
      logger.error('Error getting QR code for deletion:', error);
      await bot.sendMessage(chatId, messages.qrcode.qrCodeNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  async confirmDeleteQrCode(bot, chatId, messageId, qrCodeId) {
    try {
      const result = await api.qrcode.deleteQrCode(qrCodeId);

      if (result.success) {
        await bot.editMessageText(messages.qrcode.qrCodeDeleted, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.mainMenu
        });
      } else {
        await bot.editMessageText(`❌ **Erreur**\n\n${result.message}`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMain
        });
      }
    } catch (error) {
      logger.error('Error deleting QR code:', error);
      await bot.editMessageText(messages.common.apiError, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMain
      });
    }
  }

  // Utilitaire pour valider les URLs
  isValidUrl(string) {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  }
}

module.exports = new QrCodeActions();
