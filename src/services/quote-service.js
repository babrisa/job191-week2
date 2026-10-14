/**
 * Service to manage quotes catalog and random non-repeating selection.
 */
export const FALLBACK_QUOTE = Object.freeze({
  id: "fallback-0",
  text: "The journey of a thousand miles begins with a single step.",
  author: "Lao Tzu"
});

export class QuoteService {
  /**
   * @param {Array<{id: string, text: string, author: string}>} [catalog]
   */
  constructor(catalog = []) {
    this.catalog = Array.isArray(catalog) ? catalog : [];
  }

  /**
   * Total number of quotes in catalog.
   * @returns {number}
   */
  get totalCount() {
    return this.catalog.length;
  }

  /**
   * Selects a random quote from the catalog.
   * If excludeId is provided and catalog has at least 2 quotes, guaranteed to return a different quote.
   *
   * @param {string|null} [excludeId] - ID of current quote to avoid consecutive duplicates
   * @returns {{id: string, text: string, author: string}}
   */
  getRandomQuote(excludeId = null) {
    if (this.catalog.length === 0) {
      return FALLBACK_QUOTE;
    }

    if (this.catalog.length === 1) {
      return this.catalog[0];
    }

    let candidates = this.catalog;
    if (excludeId) {
      const filtered = this.catalog.filter((q) => q.id !== excludeId);
      if (filtered.length > 0) {
        candidates = filtered;
      }
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}
