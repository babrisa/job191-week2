# Technical Research: Quote of the Day Page

**Feature**: `001-quote-of-the-day`  
**Date**: 2026-10-14  
**Status**: Completed  

---

## 1. Application Architecture & Technology Selection

### Decision
Use vanilla HTML5, modern CSS3, and standard ECMAScript modules (ESM) without any runtime frameworks, bundlers, or server-side dependencies. For automated testing, use a lightweight Node-based test runner (`node:test` with `jsdom`) to execute unit and DOM integration tests against the modular JavaScript files.

### Rationale
- **User Requirement**: The user explicitly specified: *"Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage."*
- **Constitutional Alignment (Principle I & III)**: Maximum simplicity (KISS/YAGNI) with clean modular code. Native ES modules provide native encapsulation and clean separation of concerns without requiring complex build toolchains.
- **Constitutional Alignment (Principle II)**: Unit and integration tests can run independently and deterministically in Node.js with simulated DOM/storage, fulfilling the requirement for automated test suites with >85% coverage.

### Alternatives Considered
- **React / Vue / Svelte**: Rejected because the feature scope is small, and a framework introduces unnecessary bundle size, build dependencies, and complexity.
- **Single monolithic HTML file with inline script**: Rejected because inline monolithic scripts hinder isolated unit testing, modularity, and maintainability (violating Constitution Principles I & II).

---

## 2. Storage & Persistence Strategy

### Decision
Implement a defensive `StorageService` abstraction that encapsulates `window.localStorage` interactions under a dedicated key (`qotd_favorites_v1`). The storage payload stores a serialized JSON array of favorited quote IDs: `string[]`.

### Defensive & Fallback Mechanics
- **Safe Detection & Access**: Check for `window.localStorage` availability inside `try...catch` blocks to protect against environments where storage is blocked (e.g., strict Privacy/Incognito modes or disabled third-party cookies).
- **In-Memory Fallback**: If `localStorage` access throws a `SecurityError` or `QuotaExceededError`, the `StorageService` automatically degrades to an in-memory `Set<string>`. The user can continue favoriting quotes for their active browser session without encountering unhandled exceptions (fulfilling Spec FR-009).
- **Schema Validation & Corruption Recovery**: When reading from `localStorage`, the raw string is parsed with `JSON.parse` inside a `try...catch`. The result is validated to be an array of non-empty strings. If invalid or corrupted, it logs a warning, falls back to an empty set, and rewrites clean data on the next save.

### Alternatives Considered
- **IndexedDB**: Rejected as overengineered for storing a simple set of favorited IDs.
- **Cookies**: Rejected due to size limits, header bloat, and lack of necessity when no server communication exists.

---

## 3. Quote Selection & Duplicate Avoidance

### Decision
Store the built-in quote catalog as an immutable array of `Quote` objects in a dedicated module (`quotes.js`). A `QuoteService` maintains the index of the currently active quote.

### Selection Algorithm
- If `catalog.length === 0`: Throw a descriptive domain error (or return fallback quote).
- If `catalog.length === 1`: Return the single quote.
- If `catalog.length > 1`: Filter the catalog to exclude the `currentQuoteId`, producing a candidate list of size $N - 1$. Select a candidate using `Math.floor(Math.random() * candidates.length)`.
- **Catalog Size & Performance**: Per FR-002 and SC-006, the catalog is fixed at exactly $N = 10$ curated quotes. With candidate list $N - 1 = 9$, selection is sub-millisecond, easily satisfying the $< 100\text{ms}$ threshold (SC-002).

### Alternatives Considered
- **Shuffled queue / Deck pattern**: Maintains an array of shuffled indices and pops items until empty, then reshuffles. Rejected as slightly more complex to serialize/maintain state, though candidate filtering achieves identical consecutive duplicate prevention with minimal state.

---

## 4. DOM Accessibility & Interaction Pattern

### Decision
- **Semantic Structure**: Use `<main>`, `<blockquote>`, `<cite>`, and accessible `<button>` elements.
- **Screen Reader Announcements**: Enclose quote text in an `aria-live="polite"` container or status region so assistive tech announces newly loaded quotes.
- **Favorite Toggle State**: Implement `aria-pressed="true|false"` and clear `aria-label` attributes on the favorite button to explicitly convey toggle status.
