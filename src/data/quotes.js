/**
 * Built-in catalog of quotes.
 * Conforms to FR-002 and SC-006: exactly 10 quotes, each with non-empty text and author.
 *
 * Constraints verbatim:
 * - id: non-empty string, unique within catalog array q-001 through q-010
 * - text: non-empty string, trimmed length >= 1
 * - author: non-empty string
 */
export const QUOTES = Object.freeze([
  {
    id: "q-001",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    id: "q-002",
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    id: "q-003",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    id: "q-004",
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    id: "q-005",
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman"
  },
  {
    id: "q-006",
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    id: "q-007",
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  },
  {
    id: "q-008",
    text: "Premature optimization is the root of all evil.",
    author: "Donald Knuth"
  },
  {
    id: "q-009",
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs"
  },
  {
    id: "q-010",
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  }
]);
