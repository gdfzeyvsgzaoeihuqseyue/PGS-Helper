const shortlinkKeyboards = require('./shortlinkKeyboards');
const qrcodeKeyboards = require('./qrcodeKeyboards');

const keyboards = {
  mainMenu: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔗 Gestion des liens', callback_data: 'shortlink_menu' },
          { text: '📸 Gestion des QR Codes', callback_data: 'qr_code_menu' }
        ],
        [
          { text: '❓ Aide', callback_data: 'help' }
        ]
      ]
    }
  },

  backToMain: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔙 Menu principal', callback_data: 'main_menu' }
        ]
      ]
    }
  },

  // Exposer les sous-claviers
  shortlink: shortlinkKeyboards,
  qrcode: qrcodeKeyboards,
};

module.exports = keyboards;
