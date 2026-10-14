/**
 * Lightweight mock DOM environment for headless unit/integration testing in Node.js.
 */
class MockClassList {
  constructor() {
    this._classes = new Set();
  }
  add(cls) {
    this._classes.add(cls);
  }
  remove(cls) {
    this._classes.delete(cls);
  }
  toggle(cls, force) {
    if (typeof force === "boolean") {
      if (force) {
        this._classes.add(cls);
      } else {
        this._classes.delete(cls);
      }
      return force;
    }
    if (this._classes.has(cls)) {
      this._classes.delete(cls);
      return false;
    } else {
      this._classes.add(cls);
      return true;
    }
  }
  contains(cls) {
    return this._classes.has(cls);
  }
  has(cls) {
    return this._classes.has(cls);
  }
}

export class MockElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.textContent = "";
    this.attributes = new Map();
    this.classList = new MockClassList();
    this.eventListeners = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  dispatchEvent(event) {
    const type = typeof event === "string" ? event : event.type;
    const handlers = this.eventListeners.get(type) || [];
    for (const h of handlers) {
      h(event);
    }
  }

  click() {
    this.dispatchEvent({ type: "click", target: this });
  }
}

export function createMockDocument() {
  const elements = new Map();

  return {
    registerElement(id, tagName = "div") {
      const el = new MockElement(tagName, id);
      elements.set(id, el);
      return el;
    },
    getElementById(id) {
      return elements.get(id) || null;
    }
  };
}
