/**
 * Service to manage client-side persistent favorites.
 * Persists to localStorage under 'qotd_favorites_v1' with safe error handling and in-memory fallback.
 */
export const STORAGE_KEY = "qotd_favorites_v1";

export class StorageService {
  /**
   * @param {Storage|null} [storageBackend] - Storage backend, defaults to window.localStorage if available
   */
  constructor(storageBackend) {
    if (storageBackend !== undefined) {
      this.backend = storageBackend;
    } else {
      this.backend = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    }

    this.isPersistent = true;
    this.memoryFavorites = new Set();
    this._load();
  }

  /**
   * Loads and validates stored favorites.
   * @private
   */
  _load() {
    if (!this.backend) {
      this.isPersistent = false;
      return;
    }

    try {
      const raw = this.backend.getItem(STORAGE_KEY);
      if (raw === null || raw === undefined) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string" && id.trim().length > 0)) {
        this.memoryFavorites = new Set(parsed);
      } else {
        console.warn(`[StorageService] Corrupted storage payload for ${STORAGE_KEY}; resetting favorites.`);
        this.memoryFavorites = new Set();
      }
    } catch (err) {
      console.warn(`[StorageService] Failed to read from storage backend (${err.message}). Falling back to in-memory.`);
      this.isPersistent = false;
    }
  }

  /**
   * Persists current favorites state to backend.
   * @private
   */
  _persist() {
    if (!this.isPersistent || !this.backend) {
      return;
    }

    try {
      const array = Array.from(this.memoryFavorites);
      this.backend.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch (err) {
      console.warn(`[StorageService] Failed to write to storage backend (${err.message}). Downgrading to in-memory.`);
      this.isPersistent = false;
    }
  }

  /**
   * Checks whether a quote is favorited.
   * @param {string} quoteId
   * @returns {boolean}
   */
  isFavorite(quoteId) {
    if (!quoteId || typeof quoteId !== "string") {
      return false;
    }
    return this.memoryFavorites.has(quoteId);
  }

  /**
   * Toggles the favorite status of a quote.
   * @param {string} quoteId
   * @returns {boolean} New favorited status
   */
  toggleFavorite(quoteId) {
    if (!quoteId || typeof quoteId !== "string") {
      return false;
    }

    let newState;
    if (this.memoryFavorites.has(quoteId)) {
      this.memoryFavorites.delete(quoteId);
      newState = false;
    } else {
      this.memoryFavorites.add(quoteId);
      newState = true;
    }

    this._persist();
    return newState;
  }

  /**
   * Returns a list of all favorited quote IDs.
   * @returns {string[]}
   */
  getAllFavorites() {
    return Array.from(this.memoryFavorites);
  }

  /**
   * Clears all favorites.
   */
  clear() {
    this.memoryFavorites.clear();
    if (this.isPersistent && this.backend) {
      try {
        this.backend.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn(`[StorageService] Failed to remove storage key (${err.message}).`);
      }
    }
  }
}
