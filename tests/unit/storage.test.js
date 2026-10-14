import test from "node:test";
import assert from "node:assert/strict";
import { StorageService, STORAGE_KEY } from "../../src/services/storage.js";
import { QUOTES } from "../../src/data/quotes.js";

/**
 * Creates an in-memory storage mock mimicking the Storage interface.
 */
function createMockStorage(initialData = {}) {
  const store = new Map(Object.entries(initialData));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get size() {
      return store.size;
    }
  };
}

test("Catalog Invariant: Exactly 10 quotes with text and author (SC-006, FR-002)", () => {
  assert.equal(QUOTES.length, 10, "Catalog must have exactly 10 quotes");

  const seenIds = new Set();
  for (const quote of QUOTES) {
    assert.ok(typeof quote.id === "string" && quote.id.trim().length > 0, "ID must be a non-empty string");
    assert.ok(!seenIds.has(quote.id), `Duplicate quote ID found: ${quote.id}`);
    seenIds.add(quote.id);

    assert.ok(typeof quote.text === "string" && quote.text.trim().length >= 1, "Text must be non-empty");
    assert.ok(typeof quote.author === "string" && quote.author.trim().length >= 1, "Author must be non-empty");
  }
});

test("StorageService: Defaults to empty favorites on clean storage", () => {
  const backend = createMockStorage();
  const service = new StorageService(backend);

  assert.equal(service.isFavorite("q-001"), false);
  assert.deepEqual(service.getAllFavorites(), []);
});

test("StorageService: Toggles favorite on and off and persists to backend", () => {
  const backend = createMockStorage();
  const service = new StorageService(backend);

  // Toggle on
  const res1 = service.toggleFavorite("q-001");
  assert.equal(res1, true);
  assert.equal(service.isFavorite("q-001"), true);
  assert.deepEqual(service.getAllFavorites(), ["q-001"]);

  // Verify backend contains JSON
  const stored = JSON.parse(backend.getItem(STORAGE_KEY));
  assert.deepEqual(stored, ["q-001"]);

  // Toggle off
  const res2 = service.toggleFavorite("q-001");
  assert.equal(res2, false);
  assert.equal(service.isFavorite("q-001"), false);
  assert.deepEqual(service.getAllFavorites(), []);

  const storedAfter = JSON.parse(backend.getItem(STORAGE_KEY));
  assert.deepEqual(storedAfter, []);
});

test("StorageService: Restores state across new instances from same storage backend (persists across reloads)", () => {
  const backend = createMockStorage();
  const service1 = new StorageService(backend);

  service1.toggleFavorite("q-002");
  service1.toggleFavorite("q-005");

  // Simulate page reload with a new service instance reading the same backend
  const service2 = new StorageService(backend);
  assert.equal(service2.isFavorite("q-002"), true);
  assert.equal(service2.isFavorite("q-005"), true);
  assert.equal(service2.isFavorite("q-001"), false);
  assert.deepEqual(service2.getAllFavorites().sort(), ["q-002", "q-005"]);
});

test("StorageService: Corrupted storage recovery gracefully falls back to empty set", () => {
  // Test invalid JSON syntax
  const backend1 = createMockStorage({ [STORAGE_KEY]: "{not valid json}" });
  const service1 = new StorageService(backend1);
  assert.deepEqual(service1.getAllFavorites(), []);

  // Test non-array JSON
  const backend2 = createMockStorage({ [STORAGE_KEY]: JSON.stringify({ favorite: "q-001" }) });
  const service2 = new StorageService(backend2);
  assert.deepEqual(service2.getAllFavorites(), []);

  // Test array with non-string elements
  const backend3 = createMockStorage({ [STORAGE_KEY]: JSON.stringify([123, null]) });
  const service3 = new StorageService(backend3);
  assert.deepEqual(service3.getAllFavorites(), []);
});

test("StorageService: Gracefully falls back to in-memory store when storage access throws error", () => {
  const faultyBackend = {
    getItem: () => {
      throw new Error("SecurityError: Storage is blocked in private browsing");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {},
    clear: () => {}
  };

  const service = new StorageService(faultyBackend);
  assert.equal(service.isPersistent, false);

  // Still functions in-memory
  const toggled = service.toggleFavorite("q-003");
  assert.equal(toggled, true);
  assert.equal(service.isFavorite("q-003"), true);
  assert.deepEqual(service.getAllFavorites(), ["q-003"]);
});

test("StorageService: Clear removes all favorites from memory and backend", () => {
  const backend = createMockStorage();
  const service = new StorageService(backend);

  service.toggleFavorite("q-001");
  service.toggleFavorite("q-002");
  assert.equal(service.getAllFavorites().length, 2);

  service.clear();
  assert.equal(service.getAllFavorites().length, 0);
  assert.equal(backend.getItem(STORAGE_KEY), null);
});

test("StorageService: Rejects invalid or empty quote IDs defensively", () => {
  const service = new StorageService(createMockStorage());
  assert.equal(service.isFavorite(null), false);
  assert.equal(service.isFavorite(""), false);
  assert.equal(service.isFavorite(123), false);

  assert.equal(service.toggleFavorite(null), false);
  assert.equal(service.toggleFavorite(""), false);
  assert.equal(service.toggleFavorite(undefined), false);
  assert.deepEqual(service.getAllFavorites(), []);
});

test("StorageService: Handles write errors during setItem gracefully", () => {
  const writeFailingBackend = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError: LocalStorage quota exceeded");
    },
    removeItem: () => {},
    clear: () => {}
  };

  const service = new StorageService(writeFailingBackend);
  assert.equal(service.isPersistent, true);

  // Toggle favorite triggers setItem which throws
  const res = service.toggleFavorite("q-001");
  assert.equal(res, true);
  assert.equal(service.isPersistent, false); // downgraded to in-memory
  assert.equal(service.isFavorite("q-001"), true);
});

test("StorageService: Works when initialized with null or undefined backend", () => {
  const service = new StorageService(null);
  assert.equal(service.isPersistent, false);
  assert.equal(service.toggleFavorite("q-001"), true);
  assert.equal(service.isFavorite("q-001"), true);
});
