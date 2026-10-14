import { QUOTES } from "./data/quotes.js";
import { QuoteService } from "./services/quote-service.js";
import { StorageService } from "./services/storage.js";

/**
 * Controller class coordinating quotes, persistent favorites, and DOM presentation.
 */
export class App {
  /**
   * @param {object} options
   * @param {QuoteService} options.quoteService
   * @param {StorageService} options.storageService
   * @param {object} options.elements
   */
  constructor({ quoteService, storageService, elements }) {
    this.quoteService = quoteService;
    this.storageService = storageService;
    this.elements = elements;
    this.currentQuote = null;
  }

  /**
   * Initializes application events and renders initial quote.
   */
  init() {
    this._bindEvents();
    this.displayInitialQuote();
  }

  /**
   * Attaches event listeners to interactive controls.
   * @private
   */
  _bindEvents() {
    if (this.elements.newQuoteBtn) {
      this.elements.newQuoteBtn.addEventListener("click", () => {
        this.handleNewQuote();
      });
    }

    if (this.elements.favoriteBtn) {
      this.elements.favoriteBtn.addEventListener("click", () => {
        this.handleToggleFavorite();
      });
    }
  }

  /**
   * Displays the initial quote on page load.
   */
  displayInitialQuote() {
    const quote = this.quoteService.getRandomQuote();
    this.renderQuote(quote);
  }

  /**
   * Selects and renders a new quote, avoiding consecutive repeats.
   */
  handleNewQuote() {
    const currentId = this.currentQuote ? this.currentQuote.id : null;
    const nextQuote = this.quoteService.getRandomQuote(currentId);
    this.renderQuote(nextQuote);
  }

  /**
   * Toggles the favorite status of the current quote.
   */
  handleToggleFavorite() {
    if (!this.currentQuote) {
      return;
    }

    const isNowFavorited = this.storageService.toggleFavorite(this.currentQuote.id);
    this.updateFavoriteUI(isNowFavorited);
  }

  /**
   * Renders a quote to the DOM and updates favorite indicator.
   * @param {{id: string, text: string, author: string}} quote
   */
  renderQuote(quote) {
    if (!quote) {
      return;
    }

    this.currentQuote = quote;

    if (this.elements.quoteText) {
      this.elements.quoteText.textContent = quote.text;
    }

    if (this.elements.quoteAuthor) {
      this.elements.quoteAuthor.textContent = quote.author ? `— ${quote.author}` : "— Unknown";
    }

    const isFav = this.storageService.isFavorite(quote.id);
    this.updateFavoriteUI(isFav);
  }

  /**
   * Updates visual and accessibility state of favorite button.
   * @param {boolean} isFavorited
   */
  updateFavoriteUI(isFavorited) {
    const btn = this.elements.favoriteBtn;
    if (!btn) {
      return;
    }

    btn.setAttribute("aria-pressed", isFavorited ? "true" : "false");

    if (btn.classList) {
      if (btn.classList.toggle) {
        btn.classList.toggle("is-favorited", isFavorited);
      } else if (btn.classList.add && btn.classList.remove) {
        if (isFavorited) {
          btn.classList.add("is-favorited");
        } else {
          btn.classList.remove("is-favorited");
        }
      }
    }

    if (this.elements.favoriteIcon) {
      this.elements.favoriteIcon.textContent = isFavorited ? "♥" : "♡";
    }
  }
}

/**
 * Auto-bootstrap in browser environment
 */
if (typeof document !== "undefined") {
  const bootstrap = () => {
    const elements = {
      quoteCard: document.getElementById("quote-card"),
      quoteText: document.getElementById("quote-text"),
      quoteAuthor: document.getElementById("quote-author"),
      newQuoteBtn: document.getElementById("new-quote-btn"),
      favoriteBtn: document.getElementById("favorite-btn"),
      favoriteIcon: document.getElementById("favorite-icon")
    };

    const quoteService = new QuoteService(QUOTES);
    const storageService = new StorageService();

    const app = new App({
      quoteService,
      storageService,
      elements
    });

    app.init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
}
