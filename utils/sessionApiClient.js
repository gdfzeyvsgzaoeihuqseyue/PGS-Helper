// utils/sessionApiClient.js
const axios = require('axios');
const config = require('@utils/config'); // Assuming config has pgs.apiUrl

const BASE_SESSION_API_URL = `${config.pgs.apiUrl}/telegram/user-session`;

const sessionApiClient = {
  /**
   * Retrieves the session data for a given chat ID.
   * @param {string} chatId The Telegram chat ID.
   * @returns {Promise<object|null>} The user session object, or null if not found.
   */
  async get(chatId) {
    try {
      // MODIFIED: Use route param for GET
      const response = await axios.get(`${BASE_SESSION_API_URL}/${chatId}`);
      return response.data; // Assuming the API returns the session object directly
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Session not found
      }
      console.error('Error getting user session from API:', error.response?.data || error.message);
      throw new Error('Failed to retrieve user session.');
    }
  },

  /**
   * Sets or updates the session data for a given chat ID.
   * This will create a new session if one doesn't exist, or update an existing one.
   * @param {string} chatId The Telegram chat ID.
   * @param {object} data The session data to store (e.g., { currentAction: 'waiting_url', tempData: { url: '...' } }).
   * @returns {Promise<object>} The updated or created user session object.
   */
  async set(chatId, data) {
    try {
      // POST request to base URL with data in body
      const response = await axios.post(BASE_SESSION_API_URL, {
        chatId,
        ...data
      });
      return response.data; // Assuming the API returns the updated session object
    } catch (error) {
      console.error('Error setting user session via API:', error.response?.data || error.message);
      throw new Error('Failed to save user session.');
    }
  },

  /**
   * Deletes the session data for a given chat ID.
   * @param {string} chatId The Telegram chat ID.
   * @returns {Promise<object|null>} The deleted user session object, or null if not found.
   */
  async delete(chatId) {
  try {
    const response = await axios.delete(`${BASE_SESSION_API_URL}/${chatId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Rien à supprimer, c’est OK
      return null;
    }
    console.error('Error deleting user session via API:', error.response?.data || error.message);
    throw new Error('Failed to delete user session.');
  }
},

};

module.exports = sessionApiClient;
