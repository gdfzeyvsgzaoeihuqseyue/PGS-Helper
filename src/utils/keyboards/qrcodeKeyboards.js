const qrcodeKeyboards = {
  qrCodeMenu: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '➕ QR pour Lien', callback_data: 'create_qr_for_link' },
          { text: '➕ QR pour URL', callback_data: 'create_qr_for_url' }
        ],
        [
          { text: '📋 Mes QR Codes', callback_data: 'list_qrcodes' },
          { text: '🔍 Rechercher QR', callback_data: 'search_qrcode' }
        ],
        [
          { text: '✏️ Modifier QR', callback_data: 'edit_qrcode' },
          { text: '🗑️ Supprimer QR', callback_data: 'delete_qrcode' }
        ],
        [
          { text: '🔙 Menu principal', callback_data: 'main_menu' }
        ]
      ]
    }
  },

  confirmDeleteQrCode: (qrCodeId) => ({
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Confirmer', callback_data: `confirm_delete_qrcode_${qrCodeId}` },
          { text: '❌ Annuler', callback_data: 'main_menu' }
        ]
      ]
    }
  })
};

module.exports = qrcodeKeyboards;
