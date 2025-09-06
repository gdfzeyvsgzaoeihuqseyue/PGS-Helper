const api = require('@apiClients');
const sessionManager = require('@services/sessionManager');
const keyboards = require('@utils/keyboards');
const messages = require('@utils/messages');
const { escapeMarkdownV2 } = require('@utils/markdownUtils');
const logger = require('@utils/logger');

class LinkActions {
  // Initialiser la création d'un lien
  async initCreateLink(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterUrl, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_url' });
  }

  // Gérer l'entrée de l'URL
  async handleUrlInput(bot, chatId, text) {
    if (!this.isValidUrl(text)) {
      await bot.sendMessage(chatId, messages.common.invalidUrl, keyboards.backToMain);
      sessionManager.delete(chatId);
      return;
    }

    sessionManager.set(chatId, {
      action: 'waiting_alias',
      longUrl: text
    });

    await bot.sendMessage(chatId, messages.shortlink.enterAlias, { parse_mode: 'Markdown', ...keyboards.mainMenu });
  }

  // Gérer l'entrée de l'alias
  async handleAliasInput(bot, chatId, text) {
    const userState = sessionManager.get(chatId);
    if (!userState || !userState.longUrl) {
      logger.warn(`No longUrl found in session for chat ${chatId} during alias input.`);
      await bot.sendMessage(chatId, messages.common.actionNotRecognized, keyboards.mainMenu);
      sessionManager.delete(chatId);
      return;
    }

    const alias = text.toLowerCase() === 'skip' ? null : text;

    try {
      const result = await api.shortlink.createShortLink(userState.longUrl, alias);

      const link = result.link;
      await bot.sendMessage(chatId, messages.shortlink.linkCreated(link), { parse_mode: 'Markdown', ...keyboards.mainMenu });

    } catch (error) {
      logger.error('Error creating shortlink:', error);
      if (error.message && error.message.includes('L\'alias') && error.message.includes('est déjà utilisé.')) {
        await bot.sendMessage(chatId, messages.shortlink.aliasAlreadyUsed(alias), { parse_mode: 'Markdown', ...keyboards.backToMain });
      } else {
        await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain });
      }
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Lister tous les liens
  async listLinks(bot, chatId, messageId, page = 1) {
    try {
      const result = await api.shortlink.getAllLinks(page, 5);

      if (!result.success || result.data.length === 0) {
        await bot.editMessageText(messages.shortlink.noLinksFound, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMain
        });
        return;
      }

      let message = messages.shortlink.linkListHeader(result.currentPage, result.totalPages);

      result.data.forEach((link) => {
        message += messages.shortlink.linkListItem(link);
      });

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              ...(page > 1 ? [{ text: '⬅️ Précédent', callback_data: `list_page_${page - 1}` }] : []),
              ...(page < result.totalPages ? [{ text: 'Suivant ➡️', callback_data: `list_page_${page + 1}` }] : [])
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
      logger.error('Error fetching shortlinks:', error);
      await bot.editMessageText(messages.common.apiError, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMain
      });
    }
  }

  // Initialiser la recherche d'un lien
  async initSearchLink(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterIdentifier, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_search' });
  }

  // Gérer la recherche d'un lien
  async handleSearchInput(bot, chatId, text) {
    try {
      const result = await api.shortlink.getLink(text);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        return;
      }

      const link = result.data;
      let analyticsInfo = '';

      if (link.analytics && link.analytics.length > 0) {
        analyticsInfo = `\n\n📊 **Derniers clics :**\n`;
        link.analytics.slice(0, 3).forEach((analytic) => {
          const date = new Date(analytic.timestamp).toLocaleDateString('fr-FR');
          analyticsInfo += `• ${date} - ${analytic.source?.country || 'Inconnu'}\n`;
        });
      }

      await bot.sendMessage(chatId, messages.shortlink.linkFound(link) + analyticsInfo, { parse_mode: 'Markdown', ...keyboards.mainMenu });

    } catch (error) {
      logger.error('Error searching shortlink:', error);
      await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Initialiser la modification d'un lien
  async initEditLink(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterEditId, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_edit_id' });
  }

  // Gérer l'ID pour la modification
  async handleEditIdInput(bot, chatId, text) {
    try {
      const result = await api.shortlink.getLink(text);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      const link = result.data;
      sessionManager.set(chatId, {
        action: 'waiting_new_url',
        linkId: link.id,
        currentUrl: link.longUrl
      });

      await bot.sendMessage(chatId, `✏️ **Modifier le lien**\n\n📍 **URL actuelle :** ${link.longUrl}\n\n${messages.shortlink.enterNewUrl}`, { parse_mode: 'Markdown', ...keyboards.backToMain }); 

    } catch (error) {
      logger.error('Error getting link for edit:', error);
      await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      sessionManager.delete(chatId);
    }
  }

  // Gérer la nouvelle URL
  async handleNewUrlInput(bot, chatId, text) {
    if (!this.isValidUrl(text)) {
      await bot.sendMessage(chatId, messages.common.invalidUrl, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      sessionManager.delete(chatId);
      return;
    }

    const userState = sessionManager.get(chatId);
    if (!userState || !userState.linkId) {
      logger.warn(`No linkId found in session for chat ${chatId} during new URL input.`);
      await bot.sendMessage(chatId, messages.common.actionNotRecognized, { parse_mode: 'Markdown', ...keyboards.mainMenu }); 
      sessionManager.delete(chatId);
      return;
    }

    try {
      const result = await api.shortlink.updateLink(userState.linkId, text);

      if (result.success) {
        await bot.sendMessage(chatId, messages.shortlink.linkUpdated(result.data), { parse_mode: 'Markdown', ...keyboards.mainMenu });
      } else {
        await bot.sendMessage(chatId, `❌ **Erreur**\n\n${result.message}`, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
      }

    } catch (error) {
      logger.error('Error updating shortlink:', error);
      await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Initialiser le toggle d'un lien
  async initToggleLink(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterToggleId, {
      chat_id: chatId,
      message_id: messageId,
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_toggle_id' });
  }

  // Gérer l'ID pour le toggle
  async handleToggleIdInput(bot, chatId, text) {
    try {
      const result = await api.shortlink.getLink(text);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      const link = result.data;
      const newStatus = !link.disabled;
      const statusText = newStatus ? 'désactiver' : 'activer';
      const statusEmoji = newStatus ? '🔒' : '🔓';

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: `✅ ${statusEmoji} ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`, callback_data: `toggle_${link.id}_${newStatus ? 'disable' : 'enable'}` },
              { text: '❌ Annuler', callback_data: 'main_menu' }
            ]
          ]
        }
      };

      await bot.sendMessage(chatId, `🔄 **Changer le statut**\n\n🔗 **Lien :** \`${link.shortLink}\`\n📍 **URL :** ${link.longUrl}\n${link.disabled ? '🔒 **Statut actuel :** Désactivé' : '🟢 **Statut actuel :** Actif'}\n\nVoulez-vous ${statusText} ce lien ?`, { parse_mode: 'Markdown', ...keyboard });

    } catch (error) {
      logger.error('Error getting link for toggle:', error);
      await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Confirmer le toggle
  async confirmToggle(bot, chatId, messageId, linkId, disable) {
    try {
      const result = await api.shortlink.toggleLinkStatus(linkId, disable);

      if (result.success) {
        await bot.editMessageText(messages.shortlink.linkToggled(result.data, disable), {
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
      logger.error('Error toggling shortlink status:', error);
      await bot.editMessageText(messages.common.apiError, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMain
      });
    }
  }

  // Initialiser la suppression d'un lien
  async initDeleteLink(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterDeleteId, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_delete_id' });
  }

  // Gérer l'ID pour la suppression
  async handleDeleteIdInput(bot, chatId, text) {
    try {
      const result = await api.shortlink.getLink(text);

      if (!result.success) {
        await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      const link = result.data;
      await bot.sendMessage(chatId, messages.shortlink.confirmDelete(link), { parse_mode: 'Markdown', ...keyboards.shortlink.confirmDelete(link.id) });

    } catch (error) {
      logger.error('Error getting link for deletion:', error);
      await bot.sendMessage(chatId, messages.shortlink.linkNotFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
    }
  }

  // Confirmer la suppression
  async confirmDelete(bot, chatId, messageId, linkId) {
    try {
      const result = await api.shortlink.deleteLink(linkId);

      if (result.success !== false) {
        await bot.editMessageText(messages.shortlink.linkDeleted, {
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
      logger.error('Error deleting shortlink:', error);
      await bot.editMessageText(messages.common.apiError, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMain
      });
    }
  }

  // Initialiser l'historique d'un lien
  async initLinkHistory(bot, chatId, messageId) {
    await bot.editMessageText(messages.shortlink.enterHistoryId, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMain
    });

    sessionManager.set(chatId, { action: 'waiting_history_id' });
  }

  // Gérer l'ID pour l'historique
  async handleHistoryIdInput(bot, chatId, text) {
    try {
      const result = await api.shortlink.getLinkLogs(text);

      if (!result.success || result.data.length === 0) {
        await bot.sendMessage(chatId, messages.shortlink.noLinksFound, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
        sessionManager.delete(chatId);
        return;
      }

      let message = `📈 *Historique du lien*\n\n`;
      message += `🆔 *ID :* \`${escapeMarkdownV2(result.linkDetails.id)}\`\n`;
      message += `🔗 *Code :* \`${escapeMarkdownV2(result.linkDetails.shortCode)}\`\n`;
      message += `📅 *Créé le :* ${new Date(result.linkDetails.createdAt).toLocaleDateString('fr-FR')}\n\n`;

      message += `📝 *Modifications :*\n`;
      result.data.forEach((log, index) => {
        const date = new Date(log.LogAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        message += `\n${index + 1}. **${escapeMarkdownV2(log.eventType)}** - ${escapeMarkdownV2(date)}\n`;
        if (log.oldUrl && log.newUrl) {
          message += `   📍 Ancien : ${escapeMarkdownV2(log.oldUrl)}\n`;
          message += `   📍 Nouveau : ${escapeMarkdownV2(log.newUrl)}\n`;
        }
      });

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboards.backToMain });

    } catch (error) {
      logger.error('Error fetching link history:', error);
      await bot.sendMessage(chatId, messages.common.apiError, { parse_mode: 'Markdown', ...keyboards.backToMain }); 
    } finally {
      sessionManager.delete(chatId);
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

module.exports = new LinkActions();
