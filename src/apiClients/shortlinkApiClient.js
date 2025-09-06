const BaseApiClient = require('./baseApiClient');

class ShortlinkApiClient extends BaseApiClient {
  constructor() {
    super('/eqt/link'); 
  }

   // Créer un lien court
  async createShortLink(longUrl, alias = null) {
    try {
      const response = await this.client.post('/', {
        longUrl,
        ...(alias && { alias })
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

  // Obtenir tous les liens
  async getAllLinks(page = 1, limit = 10) {
    try {
      const response = await this.client.get('/', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un lien spécifique
  async getLink(identifier) {
    try {
      const response = await this.client.get(`/${identifier}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

    // Modifier un lien
  async updateLink(id, longUrl) {
    try {
      const response = await this.client.put(`/${id}`, {
        longUrl
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   // Supprimer un lien
  async deleteLink(id) {
    try {
      const response = await this.client.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   // Activer/Désactiver un lien
  async toggleLinkStatus(id, disable) {
    try {
      const response = await this.client.put(`/${id}/disable`, {
        disable
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
 // Obtenir l'historique d'un lien
  async getLinkLogs(linkId) {
    try {
      const response = await this.client.get(`/${linkId}/logs`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les métadonnées d'une URL
  async getMetadata(url) {
    try {
      const response = await this.client.get('/get-metadata', {
        params: { url }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ShortlinkApiClient();
