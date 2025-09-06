const shortlinkMessages = {
    linkCreated: (link) => `✅ *Lien créé avec succès !*

🔗 *Lien court :* \`${link.shortLink}\`
📍 *URL originale :* ${link.longUrl}
🆔 *Code :* \`${link.shortCode}\`
📊 *Clics :* ${link.clicks || 0}

Votre lien est maintenant actif et prêt à être partagé !`,

    linkFound: (link) => `✅ *Lien trouvé !*

🔗 *Lien court :* \`${link.shortLink}\`
📍 *URL originale :* ${link.longUrl}
🆔 *Code :* \`${link.shortCode}\`
📊 *Clics :* ${link.clicks || 0}
📅 *Créé le :* ${new Date(link.createdAt).toLocaleDateString('fr-FR')}
🔄 *Modifié le : :* ${new Date(link.updatedAt).toLocaleDateString('fr-FR')}
${link.disabled ? '🔴 *Statut :* Désactivé' : '🟢 *Statut :* Actif'}`,

    linkNotFound: '❌ *Lien introuvable*\n\nAucun lien correspondant à cet identifiant n\'a été trouvé.',

    linkDeleted: '✅ *Lien supprimé*\n\nLe lien et toutes ses données associées ont été supprimés avec succès.',

    linkUpdated: (link) => `✅ *Lien mis à jour !*

🔗 *Lien court :* \`${link.shortLink}\`
📍 *Nouvelle URL :* ${link.longUrl}
📊 *Clics :* ${link.clicks || 0}`,

    linkToggled: (link, disabled) => `✅ *Statut mis à jour !*

🔗 *Lien :* \`${link.shortLink}\`
${disabled ? '🔒 *Nouveau statut :* Désactivé' : '🟢 *Nouveau statut :* Actif'}

${disabled ? 'Le lien ne redirigera plus vers l\'URL originale.' : 'Le lien est maintenant actif et fonctionnel.'}`,

    enterUrl: '🔗 *Créer un nouveau lien*\n\nEnvoyez-moi l\'URL que vous souhaitez raccourcir :',

    enterAlias: '🏷️ *Alias personnalisé (optionnel)*\n\nVoulez-vous définir un alias personnalisé pour ce lien ?\n\nEnvoyez l\'alias souhaité ou tapez "*skip*" pour générer automatiquement :',

    aliasAlreadyUsed: (alias) => `❌ *Alias déjà utilisé*\n\nL'alias *${alias}* est déjà pris.`,

    enterIdentifier: '🔍 *Rechercher un lien*\n\nEnvoyez l\'ID du lien ou le code court que vous recherchez :',

    enterEditId: '✏️ *Modifier un lien*\n\nEnvoyez l\'ID du lien que vous souhaitez modifier :',

    enterNewUrl: '🔗 *Nouvelle URL*\n\nEnvoyez la nouvelle URL pour ce lien :',

    enterToggleId: '🔄 *Activer/Désactiver un lien*\n\nEnvoyez l\'ID du lien dont vous voulez changer le statut :',

    enterDeleteId: '🗑️ *Supprimer un lien*\n\nEnvoyez l\'ID du lien que vous souhaitez supprimer :',

    enterHistoryId: '📈 *Historique d\'un lien*\n\nEnvoyez l\'ID du lien dont vous voulez voir l\'historique :',

    confirmDelete: (link) => `⚠️ *Confirmation de suppression*

Êtes-vous sûr de vouloir supprimer ce lien ?

🔗 *Lien :* \`${link.shortLink}\`
📍 *URL :* ${link.longUrl}
📊 *Clics :* ${link.clicks || 0}

*Cette action est irréversible !*`,

    noLinksFound: '📭 *Aucun lien trouvé*\n\nVous n\'avez pas encore créé de liens courts.',

    linkListHeader: (currentPage, totalPages) => `📋 *Vos liens courts* (Page ${currentPage}/${totalPages})\n\n`,
    linkListItem: (link) => {
      const status = link.disabled ? '🔴' : '🟢';
      return `${status} *${link.shortCode}*\n🔗 \`${link.shortLink}\`\n📊 ${link.clicks || 0} clics\n🆔 \`${link.id}\`\n\n`;
    },
};

module.exports = shortlinkMessages;
