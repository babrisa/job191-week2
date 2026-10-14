import test from "node:test";
import assert from "node:assert/strict";
import { App } from "../../src/app.js";
import { QuoteService } from "../../src/services/quote-service.js";
import { StorageService } from "../../src/services/storage.js";
import { createMockDocument } from "../test-dom.js";

const TEST_CATALOG = [
  { id: "q-1", text: "Quote One", author: "Author One" },
  { id: "q-2", text: "Quote Two", author: "Author Two" },
  { id: "q-3", text: "Quote Three", author: "Author Three" }
];

function setupTestApp(initialStorage = {}) {
  const store = new Map(Object.entries(initialStorage));
  const mockStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };

  const doc = createMockDocument();
  const quoteCard = doc.registerElement("quote-card", "article");
  quoteCard.setAttribute("aria-live", "polite");
  const quoteText = doc.registerElement("quote-text", "blockquote");
  const quoteAuthor = doc.registerElement("quote-author", "cite");
  const newQuoteBtn = doc.registerElement("new-quote-btn", "button");
  const favoriteBtn = doc.registerElement("favorite-btn", "button");
  const favoriteIcon = doc.registerElement("favorite-icon", "span");

  const quoteService = new QuoteService(TEST_CATALOG);
  const storageService = new StorageService(mockStorage);

  const app = new App({
    quoteService,
    storageService,
    elements: {
      quoteCard,
      quoteText,
      quoteAuthor,
      newQuoteBtn,
      favoriteBtn,
      favoriteIcon
    }
  });

  return { app, doc, quoteService, storageService, mockStorage, elements: { quoteCard, quoteText, quoteAuthor, newQuoteBtn, favoriteBtn, favoriteIcon } };
}

test("Integration US1: App displays initial quote and author on initialization", () => {
  const { app, elements } = setupTestApp();
  app.init();

  assert.ok(elements.quoteText.textContent.length > 0, "Quote text must be populated");
  assert.ok(elements.quoteAuthor.textContent.length > 0, "Quote author must be populated");
  assert.equal(elements.quoteCard.getAttribute("aria-live"), "polite");

  const current = app.currentQuote;
  assert.ok(current, "Current quote must be set");
  assert.equal(elements.quoteText.textContent, current.text);
  assert.equal(elements.quoteAuthor.textContent, `— ${current.author}`);
  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "false");
});

test("Integration US2: Clicking 'New quote' updates quote and author without consecutive repeat", () => {
  const { app, elements } = setupTestApp();
  app.init();

  const firstQuote = app.currentQuote;
  elements.newQuoteBtn.click();

  const secondQuote = app.currentQuote;
  assert.notEqual(firstQuote.id, secondQuote.id, "Consecutive quote ID must not be identical");
  assert.equal(elements.quoteText.textContent, secondQuote.text);
  assert.equal(elements.quoteAuthor.textContent, `— ${secondQuote.author}`);
});

test("Integration US3: Clicking favorite button toggles favorite state and persists to storage", () => {
  const { app, elements, storageService } = setupTestApp();
  app.init();

  const quoteId = app.currentQuote.id;
  assert.equal(storageService.isFavorite(quoteId), false);
  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "false");
  assert.equal(elements.favoriteBtn.classList.has("is-favorited"), false);

  // Favorite the quote
  elements.favoriteBtn.click();
  assert.equal(storageService.isFavorite(quoteId), true);
  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "true");
  assert.equal(elements.favoriteBtn.classList.has("is-favorited"), true);
  assert.equal(elements.favoriteIcon.textContent, "♥");

  // Unfavorite the quote
  elements.favoriteBtn.click();
  assert.equal(storageService.isFavorite(quoteId), false);
  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "false");
  assert.equal(elements.favoriteBtn.classList.has("is-favorited"), false);
  assert.equal(elements.favoriteIcon.textContent, "♡");
});

test("Integration US3: Displays favorited state when navigating to a previously favorited quote", () => {
  // Pre-seed storage with q-2 favorited
  const { app, elements } = setupTestApp({
    qotd_favorites_v1: JSON.stringify(["q-2"])
  });
  app.init();

  // Force render quote q-2
  app.renderQuote({ id: "q-2", text: "Quote Two", author: "Author Two" });

  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "true");
  assert.equal(elements.favoriteBtn.classList.has("is-favorited"), true);
  assert.equal(elements.favoriteIcon.textContent, "♥");

  // Force render quote q-1 (not favorited)
  app.renderQuote({ id: "q-1", text: "Quote One", author: "Author One" });
  assert.equal(elements.favoriteBtn.getAttribute("aria-pressed"), "false");
  assert.equal(elements.favoriteBtn.classList.has("is-favorited"), false);
  assert.equal(elements.favoriteIcon.textContent, "♡");
});

test("Integration Defensive: Handles missing quotes or null targets gracefully", () => {
  const { app, elements } = setupTestApp();

  // Test renderQuote(null)
  app.renderQuote(null);
  assert.equal(app.currentQuote, null);

  // Test handleToggleFavorite() when currentQuote is null
  app.handleToggleFavorite();
  assert.equal(app.currentQuote, null);

  // Test renderQuote with missing author fallback
  app.renderQuote({ id: "q-no-author", text: "Anonymous wisdom", author: "" });
  assert.equal(elements.quoteAuthor.textContent, "— Unknown");

  // Test updateFavoriteUI with missing button element
  const headlessApp = new App({
    quoteService: app.quoteService,
    storageService: app.storageService,
    elements: {}
  });
  headlessApp.init();
  headlessApp.renderQuote({ id: "q-headless", text: "Text", author: "Author" });
  assert.ok(headlessApp.currentQuote);
});
