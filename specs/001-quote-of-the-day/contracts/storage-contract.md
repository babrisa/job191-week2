# Service & Storage Contracts: Quote of the Day

**Feature**: `001-quote-of-the-day`  
**Date**: 2026-10-14  

---

## 1. StorageService Contract

The `StorageService` manages client-side persistence of favorite quote IDs.

### 1.1 Interface Definition

```javascript
export class StorageService {
  /**
   * Initializes storage with optional custom storage provider (defaults to window.localStorage)
   * @param {Storage} [storageBackend] - Optional storage implementation for test mocking
   */
  constructor(storageBackend = window.localStorage);

  /**
   * Checks whether a quote is currently favorited.
   * @param {string} quoteId - The unique ID of the quote
   * @returns {boolean} True if favorited, false otherwise
   */
  isFavorite(quoteId);

  /**
   * Toggles the favorited status of a quote.
   * @param {string} quoteId - The unique ID of the quote
   * @returns {boolean} The new favorited status (true if now favorited, false if removed)
   */
  toggleFavorite(quoteId);

  /**
   * Returns a copy of all favorited quote IDs.
   * @returns {string[]} Array of favorited quote IDs
   */
  getAllFavorites();

  /**
   * Clears all stored favorites (useful for testing and reset flows).
   */
  clear();
}
```

### 1.2 Error & Boundary Behavior
- If `storageBackend` throws a `SecurityError` or `QuotaExceededError`:
  - Logs a warning via the logger.
  - Switches `isPersistent` flag to `false`.
  - Maintains state in an internal `Set<string>` in memory.
  - Continues returning valid results without throwing unhandled errors to the caller.

---

## 2. QuoteService Contract

The `QuoteService` manages catalog access and quote selection logic.

### 2.1 Interface Definition

```javascript
export class QuoteService {
  /**
   * Initializes service with a catalog of quotes (fixed at exactly 10 quotes per FR-002, SC-006).
   * @param {Array<{id: string, text: string, author: string}>} catalog
   */
  constructor(catalog);

  /**
   * Retrieves a quote at random from the catalog, avoiding consecutive selection of excludeId if possible.
   * @param {string} [excludeId] - ID of currently displayed quote
   * @returns {{id: string, text: string, author: string}} The selected quote
   */
  getRandomQuote(excludeId = null);

  /**
   * Returns the total count of quotes in the catalog.
   * @returns {number}
   */
  get totalCount();
}
```

### 2.2 Error & Boundary Behavior
- If catalog is empty (`totalCount === 0`), `getRandomQuote()` returns a fallback quote:
  `{ id: "fallback-0", text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" }`.
- If catalog has length 1, `getRandomQuote(excludeId)` returns that sole quote even if it matches `excludeId`.
- If catalog has length $\ge 2$, `getRandomQuote(excludeId)` is guaranteed to return a quote where `quote.id !== excludeId`.
