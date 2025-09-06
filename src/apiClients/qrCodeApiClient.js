const BaseApiClient = require('./baseApiClient');

class QrCodeApiClient extends BaseApiClient {
  constructor() {
    super('/eqt/qrcode');
  }

  // Crée un QR code pour un lien court existant
  async createShortLinkQrCode(linkId, options = {}) {
    try {
      const response = await this.client.get(`/../${linkId}/qrcode`, { 
        params: {
          ...options,
          download: false
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   // Crée un QR code pour une URL
  async createUrlQrCode(url, options = {}) {
    try {
      const response = await this.client.post('/', {
        url,
        ...options,
        download: false
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupère tous les QR codes avec pagination
  async getAllQrCodes(page = 1, limit = 10) {
    try {
      const response = await this.client.get('/../qrcodes', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupère un QR code spécifique par son ID
  async getQrCode(id) {
    try {
      const response = await this.client.get(`/${id}`, {
        params: {
          download: false
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Met à jour les options d'un QR code
  async updateQrCode(id, updates = {}) {
    try {
      const response = await this.client.put(`/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Supprime un QR code par son ID
  async deleteQrCode(id) {
    try {
      const response = await this.client.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new QrCodeApiClient();
