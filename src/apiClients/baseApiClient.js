const axios = require('axios');
const config = require('@config');
const logger = require('@utils/logger');

class BaseApiClient {
  constructor(endpoint = '') {
    this.baseURL = config.pgs.apiUrl + endpoint;
    this.apiKey = config.pgs.apiKey;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, 
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    // Intercepteur pour la gestion des erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error(`Erreur API pour ${this.baseURL}${error.config.url || ''}:`, error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || `Erreur API: ${error.response.status}`);
    } else if (error.request) {
      return new Error('Errur de connexion API: Aucnune réponse du serveur.');
    } else {
      return new Error(`Erreur de la requête: ${error.message}`);
    }
  }
}

module.exports = BaseApiClient;
