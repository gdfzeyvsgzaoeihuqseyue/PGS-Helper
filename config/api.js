import axios from 'axios';
import { config } from './config.js';

class PGSApiClient {
  constructor() {
    this.baseURL = config.pgs.apiUrl;
    this.token = config.pgs.apiToken;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur API PGS:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la requête GET ${endpoint}: ${error.message}`);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la requête POST ${endpoint}: ${error.message}`);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la requête PUT ${endpoint}: ${error.message}`);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la requête DELETE ${endpoint}: ${error.message}`);
    }
  }
}

export const pgsApi = new PGSApiClient();