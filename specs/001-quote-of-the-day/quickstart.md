# Quickstart & Validation Guide: Quote of the Day

**Feature**: `001-quote-of-the-day`  
**Date**: 2026-10-14  

---

## 1. Prerequisites & Setup

### Environment
- Any modern web browser (Chrome, Firefox, Safari, Edge).
- Node.js (version 18+ or 20+) to run the automated test suite.

### Setup Commands
```bash
# Clone/enter repository directory
cd /Users/baris/Documents/spec-kit-week2

# Start local static server (required for ES modules):
python3 -m http.server 8000
```

---

## 2. Running Automated Tests

To verify behavioral contracts, storage persistence, and DOM logic:

```bash
# Run unit and contract tests
npm test
```

### Expected Output
- `Quote Catalog`: Validates that the built-in catalog contains exactly 10 quotes, each with non-empty text and author (SC-006).
- `QuoteService`: Validates random selection, consecutive duplicate avoidance, and boundary handling for small/empty catalogs.
- `StorageService`: Validates storage serialization, retrieval, corrupted JSON recovery, and in-memory degradation.
- `Integration / App`: Validates initial DOM rendering, clicking "New quote", favoriting/unfavoriting, and preserving favorite state after simulated reloads.
- Coverage threshold $\ge 85\%$ passed.

---

## 3. Manual End-to-End Validation Scenarios

### Scenario 1: Initial Page Load (P1)
1. Run `python3 -m http.server` and open `http://localhost:8000` in the browser.
2. **Verify**:
   - A non-empty quote text appears inside `#quote-text`.
   - An author name appears inside `#quote-author`.
   - The favorite button displays in its unfavorited state (outline heart, `aria-pressed="false"`).

### Scenario 2: Requesting New Quotes (P2)
1. Note the currently displayed quote text.
2. Click the **"New quote"** button.
3. **Verify**:
   - The displayed quote immediately changes to a different quote.
   - The previous quote is not repeated immediately.
   - The author attribution updates to match the new quote.

### Scenario 3: Favoriting Across Page Reloads (P3)
1. On the currently displayed quote, click the **Favorite** toggle button.
2. **Verify**:
   - The favorite button immediately updates to the active state (filled heart, `aria-pressed="true"`, `is-favorited` class).
3. Inspect `localStorage.getItem('qotd_favorites_v1')` in browser Developer Tools:
   - Confirm the current quote ID is included in the stored JSON array.
4. Reload the browser page (`F5` or `Cmd+R`).
5. Click **"New quote"** until the previously favorited quote reappears (or set it in state).
6. **Verify**:
   - When the favorited quote is displayed, the favorite button is automatically shown in its favorited state.
7. Click the **Favorite** button again to unfavorite it.
8. Reload the browser.
9. **Verify**:
   - The quote now remains in the unfavorited state.

### Scenario 4: Storage Resilience (Private/Incognito Mode)
1. Open the page in a Private / Incognito window or disable local storage in browser settings.
2. Click **Favorite** and **New quote**.
3. **Verify**:
   - The UI does not crash or display console errors.
   - Favorite state toggles correctly for the active session.
