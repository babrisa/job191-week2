import test from "node:test";
import assert from "node:assert/strict";
import { QuoteService, FALLBACK_QUOTE } from "../../src/services/quote-service.js";
import { QUOTES } from "../../src/data/quotes.js";

test("QuoteService: Returns fallback quote when initialized with empty catalog", () => {
  const service = new QuoteService([]);
  assert.equal(service.totalCount, 0);
  const quote = service.getRandomQuote();
  assert.deepEqual(quote, FALLBACK_QUOTE);
});

test("QuoteService: Returns the single quote when catalog has length 1", () => {
  const single = { id: "solo", text: "Solo quote", author: "Solo Author" };
  const service = new QuoteService([single]);
  assert.equal(service.totalCount, 1);
  assert.deepEqual(service.getRandomQuote(), single);
  assert.deepEqual(service.getRandomQuote("solo"), single);
});

test("QuoteService: Selects a valid quote from QUOTES catalog (US1 - MVP)", () => {
  const service = new QuoteService(QUOTES);
  assert.equal(service.totalCount, 10);

  const quote = service.getRandomQuote();
  assert.ok(quote, "Returned quote must not be null/undefined");
  assert.ok(typeof quote.id === "string" && quote.id.startsWith("q-"));
  assert.ok(typeof quote.text === "string" && quote.text.length > 0);
  assert.ok(typeof quote.author === "string" && quote.author.length > 0);

  // Must match one of the entries in QUOTES
  const found = QUOTES.find((q) => q.id === quote.id);
  assert.deepEqual(quote, found);
});

test("QuoteService: Never returns the same quote consecutively when catalog >= 2 (US2)", () => {
  const service = new QuoteService(QUOTES);
  let current = service.getRandomQuote();

  for (let i = 0; i < 100; i++) {
    const next = service.getRandomQuote(current.id);
    assert.notEqual(next.id, current.id, `Iteration ${i}: Consecutive duplicate quote returned: ${next.id}`);
    current = next;
  }
});

test("QuoteService: Correctly alternates in a two-quote catalog (US2 boundary)", () => {
  const twoQuotes = [
    { id: "quote-a", text: "Alpha", author: "Author A" },
    { id: "quote-b", text: "Beta", author: "Author B" }
  ];
  const service = new QuoteService(twoQuotes);

  const first = service.getRandomQuote("quote-a");
  assert.equal(first.id, "quote-b");

  const second = service.getRandomQuote("quote-b");
  assert.equal(second.id, "quote-a");
});
