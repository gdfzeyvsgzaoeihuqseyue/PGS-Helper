const qrcodeMessages = {
    enterShortLinkQrId: '📸 *Générer un QR Code pour un lien court*\n\nEnvoyez l\'ID du lien court pour lequel vous souhaitez générer un QR code :',
    enterUrlForQr: '📸 *Générer un QR Code pour une URL*\n\nEnvoyez l\'URL pour laquelle vous souhaitez générer un QR code :',

    qrCodeCreated: (qrCode) => `✅ *QR Code créé avec succès !*

🆔 *ID :* \`${qrCode.id}\`
📝 *Titre :* ${qrCode.title}
${qrCode.shortLink ? `🔗 *Lien associé :* ${qrCode.shortLink.shortLink || qrCode.shortLink}` : `🌐 *URL :* ${qrCode.url}`}
🖼️ *Type :* ${qrCode.qrCodeType}

Vous pouvez maintenant télécharger ou partager ce QR code.`,

    qrCodeFound: (qrCode) => `✅ *QR Code trouvé !*

🆔 *ID :* \`${qrCode.id}\`
📝 *Titre :* ${qrCode.title}
${qrCode.shortLink ? `🔗 *Lien associé :* ${qrCode.shortLink.shortLink || qrCode.shortLink}` : `🌐 *URL :* ${qrCode.url}`}
🖼️ *Type :* ${qrCode.qrCodeType}
📅 *Créé le :* ${new Date(qrCode.createdAt).toLocaleDateString('fr-FR')}
🔄 *Modifié le :* ${new Date(qrCode.updatedAt).toLocaleDateString('fr-FR')}`,

    qrCodeNotFound: '❌ *QR Code introuvable*\n\nAucun QR code correspondant à cet identifiant n\'a été trouvé.',

    qrCodeDeleted: '✅ *QR Code supprimé*\n\nLe QR code a été supprimé avec succès.',

    qrCodeUpdated: (qrCode) => `✅ *QR Code mis à jour !*

🆔 *ID :* \`${qrCode.id}\`
📝 *Nouveau titre :* ${qrCode.title}
🖼️ *Format :* ${qrCode.options.format || 'png'}
📏 *Taille :* ${qrCode.options.size || 300}px`,

    enterQrCodeIdForSearch: '🔍 *Rechercher un QR Code*\n\nEnvoyez l\'ID du QR code que vous recherchez :',
    enterQrCodeIdForUpdate: '✏️ *Modifier un QR Code*\n\nEnvoyez l\'ID du QR code que vous souhaitez modifier :',
    enterQrCodeNewOptions: (qrCode) => `✏️ *Modifier les options du QR Code*\n\nQR Code actuel: ${qrCode.title}\n\nEnvoyez les nouvelles options au format "clé:valeur, clé2:valeur2".\n\nExemple: \`title:Mon Nouveau QR, format:svg, size:400, foregroundColor:#FF0000\``,
    enterQrCodeIdForDelete: '🗑️ *Supprimer un QR Code*\n\nEnvoyez l\'ID du QR code que vous souhaitez supprimer :',

    confirmDeleteQrCode: (qrCode) => `⚠️ *Confirmation de suppression*

Êtes-vous sûr de vouloir supprimer ce QR code ?

🆔 *ID :* \`${qrCode.id}\`
📝 *Titre :* ${qrCode.title}
${qrCode.shortLink ? `🔗 *Lien associé :* ${qrCode.shortLink.shortLink || qrCode.shortLink}` : `🌐 *URL :* ${qrCode.url}`}

*Cette action est irréversible !*`,

    noQrCodesFound: '📭 *Aucun QR Code trouvé*\n\nVous n\'avez pas encore créé de QR codes.',

    qrCodeListHeader: (currentPage, totalPages) => `📋 *Vos QR Codes* (Page ${currentPage}/${totalPages})\n\n`,
    qrCodeListItem: (qrCode) => {
      const type = qrCode.qrCodeType === 'shortlink' ? '🔗 Lien' : '🌐 URL';
      const associated = qrCode.shortLink ? `\`${qrCode.shortLink.shortCode || qrCode.shortLink}\`` : qrCode.url;
      return `📸 *${qrCode.title}*\nType: ${type} - Associé: ${associated}\nID: \`${qrCode.id}\`\n\n`;
    }
};

module.exports = qrcodeMessages;
