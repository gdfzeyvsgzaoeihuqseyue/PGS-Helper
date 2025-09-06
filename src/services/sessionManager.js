const logger = require('@utils/logger');

// For production, this should be replaced with a persistent storage (e.g., Redis, database)
const userStates = new Map();

class SessionManager {
  /**
   * Sets the state for a given chat ID.
   * @param {number} chatId
   * @param {object} state - The state object to store (e.g., { action: 'waiting_url', data: { longUrl: '...' } })
   */
  set(chatId, state) {
    userStates.set(chatId, state);
    logger.debug(`Session for chat ${chatId} set to:`, state);
  }

  /**
   * Gets the state for a given chat ID.
   * @param {number} chatId
   * @returns {object|undefined} The stored state or undefined if not found.
   */
  get(chatId) {
    const state = userStates.get(chatId);
    logger.debug(`Session for chat ${chatId} retrieved:`, state);
    return state;
  }

  /**
   * Deletes the state for a given chat ID.
   * @param {number} chatId
   * @returns {boolean} True if the state was deleted, false otherwise.
   */
  delete(chatId) {
    const deleted = userStates.delete(chatId);
    if (deleted) {
      logger.debug(`Session for chat ${chatId} deleted.`);
    } else {
      logger.warn(`Tentative de suppression de session non existante pour ${chatId}.`);
    }
    return deleted;
  }

  /**
   * Checks if a session exists for a given chat ID.
   * @param {number} chatId
   * @returns {boolean} True if a session exists, false otherwise.
   */
  has(chatId) {
    return userStates.has(chatId);
  }
}

module.exports = new SessionManager();
