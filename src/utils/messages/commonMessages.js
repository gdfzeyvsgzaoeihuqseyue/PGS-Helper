const commonMessages = {
    welcome: `Bienvenue dans PGS Helper!

Je suis votre assistant pour la gestion des tâches complexes de PGS.

Choisissez une option ci-dessous pour commencer.

Taper /help pour consulter la lste des commandes.`,

    help: `📖 Guide d'utilisation

🔗 Créer un lien :
- Cliquez sur "Créer un lien"
- Envoyez l'URL à raccourcir
- Optionnel : ajoutez un alias personnalisé

📋 Gestion des liens :
- Consultez tous vos liens
- Modifiez les URLs existantes
- Activez/désactivez temporairement
- Supprimez définitivement

📊 Statistiques :
- Nombre de clics par lien
- Historique des modifications
- Données analytiques détaillées

📸 Gestion des QR Codes :
- Générez des QR codes pour vos liens courts ou toute URL
- Listez, recherchez, modifiez et supprimez vos QR codes

⚙️ Commandes rapides :
/start - Retour au menu principal
/help - Afficher cette aide

Pour toute question, contactez l'administrateur.`,

    invalidUrl: '❌ *URL invalide*\n\nVeuillez fournir une URL valide commençant par http:// ou https://',

    apiError: '🚨 *Erreur de connexion*\n\nImpossible de contacter l\'API. Veuillez réessayer plus tard.',

    actionNotRecognized: '❓ Action non reconnue. Retour au menu principal.',
};

module.exports = commonMessages;
