const shortlinkKeyboards = {
  shortLinkMenu: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔗 Créer un lien', callback_data: 'create_link' },
          { text: '📋 Mes liens', callback_data: 'list_links' }
        ],
        [
          { text: '🔍 Rechercher', callback_data: 'search_link' },
          { text: '✏️ Modifier', callback_data: 'edit_link' }
        ],
        [
          { text: '🔄 Activer/Désactiver', callback_data: 'toggle_link' },
          { text: '🗑️ Supprimer', callback_data: 'delete_link' }
        ],
        [
          { text: '📈 Historique', callback_data: 'link_history' }
        ],
        [
          { text: '🔙 Menu principal', callback_data: 'main_menu' }
        ]
      ]
    }
  },

  confirmDelete: (linkId) => ({
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Confirmer', callback_data: `confirm_delete_${linkId}` },
          { text: '❌ Annuler', callback_data: 'main_menu' }
        ]
      ]
    }
  }),
};

module.exports = shortlinkKeyboards;
