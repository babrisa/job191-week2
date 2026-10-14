# UI & DOM Contract: Quote of the Day

**Feature**: `001-quote-of-the-day`  
**Date**: 2026-10-14  

---

## 1. DOM Element Identification & Roles

The interface binds to standard semantic DOM identifiers:

| Element ID | HTML Tag | Role / ARIA Attributes | Purpose |
| :--- | :--- | :--- | :--- |
| `quote-card` | `<article>` or `<section>` | `aria-live="polite"` | Container for the displayed quote. Announces updates to assistive tech. |
| `quote-text` | `<blockquote>` | None | Displays the quote text. |
| `quote-author` | `<cite>` | None | Displays the author attribution preceded by an em-dash. |
| `new-quote-btn` | `<button>` | `type="button"`, `aria-label="Get a new quote"` | Triggers display of a new, non-repeating quote. |
| `favorite-btn` | `<button>` | `type="button"`, `aria-pressed="false|true"`, `aria-label="Toggle favorite status"` | Toggles favorite status of the current quote. |
| `favorite-icon` | `<span>` or `<svg>` | `aria-hidden="true"` | Visual icon indicating favorited state (filled heart vs outline heart). |

---

## 2. Event Contracts & Interactions

### 2.1 "New quote" Button Interaction
- **Trigger**: Click or `Enter`/`Space` keypress on `#new-quote-btn`.
- **Preconditions**: Built-in catalog is loaded.
- **Contract**:
  1. Calls `QuoteService.getRandomQuote(currentQuoteId)`.
  2. Updates `#quote-text.textContent` with `selectedQuote.text`.
  3. Updates `#quote-author.textContent` with `selectedQuote.author`.
  4. Calls `StorageService.isFavorite(selectedQuote.id)`.
  5. Sets `#favorite-btn[aria-pressed]` to match favorite status.
  6. Updates `#favorite-btn` visual classes (`is-favorited` vs default).

### 2.2 "Favorite" Button Interaction
- **Trigger**: Click or `Enter`/`Space` keypress on `#favorite-btn`.
- **Preconditions**: Active quote is rendered with valid ID.
- **Contract**:
  1. Inverts the favorite state for `currentQuote.id`.
  2. Calls `StorageService.toggleFavorite(currentQuote.id)`.
  3. Updates `#favorite-btn.setAttribute('aria-pressed', isNowFavorited)`.
  4. Toggles CSS class `is-favorited` on `#favorite-btn`.

---

## 3. Visual & Accessibility State Contract

| State | `aria-pressed` | CSS Class on `#favorite-btn` | Icon State |
| :--- | :--- | :--- | :--- |
| **Not Favorited** | `"false"` | None | Outline heart / Inactive style |
| **Favorited** | `"true"` | `is-favorited` | Filled heart / Active accent color |
