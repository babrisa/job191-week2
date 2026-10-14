# Week 2 — Spec-Driven Development with Spec Kit: Writeup

**Agent:** Google Antigravity (Gemini 3.8 Flash), Spec Kit integration key `agy`
**Feature:** Quote-of-the-day page (one random quote from a built-in list, a "New quote" button, favorites that persist across reloads)

## 1. Prompts given to each skill

| Stage | Prompt |
|---|---|
| Constitution | `/speckit-constitution Create principles focused on code quality, testing, and maintainability.` |
| Specify | `/speckit-specify A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads.` |
| Plan | `/speckit-plan Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage.` |
| Tasks | `/speckit-tasks` |
| Implement | `/speckit-implement` |
| Converge | `/speckit-converge` |

Refinement prompts (spec/plan only, no code changes) are listed in section 2.

## 2. Spec/plan refinements (before → after)

### Refinement 1 — catalog size (spec → plan)

While reviewing the plan, I noticed that the feature asks for a **small** built-in list, but the spec's FR-002 said only "diverse quotes" with no size, so the plan made up its own number.

Refinement prompt:

> `/speckit-specify Refine the existing spec (do not write code): the feature asks for a SMALL built-in list, but FR-002 only says "diverse quotes" with no size, and the plan inflated it to ~30-50 quotes. Update spec.md so FR-002 states the built-in list is small and fixed at exactly 10 quotes, each with text and author, and add a matching success criterion. Keep everything else unchanged.`

Then I re-ran `/speckit-plan` with the same prompt as before.

| Artifact | Before | After |
|---|---|---|
| `spec.md` FR-002 | "The system MUST supply a built-in catalog of diverse quotes ready for display without requiring external network requests." | "The system MUST supply a small built-in catalog fixed at exactly 10 quotes, each containing quote text and author attribution, ready for display without requiring external network requests." |
| `spec.md` success criteria | (none about catalog size) | SC-006: "The built-in catalog contains exactly 10 quotes, with 100% of entries having non-empty quote text and author attribution." |
| `plan.md` Scale/Scope | "Single page, ~30-50 curated built-in quotes, 1 client-side persistence key." | "Single page, fixed built-in catalog of exactly 10 curated quotes with text and author (FR-002, SC-006), 1 client-side persistence key." |

**Effect on the output:** `tasks.md` generated T004 as "Create immutable 10-quote catalog", the implementation's `src/data/quotes.js` contains exactly 10 quotes, and a unit test asserts `service.totalCount === 10`.

### Refinement 2 — run instructions (plan → quickstart)

After `/speckit-implement`, I tested the page in a browser. `quickstart.md` said to open `index.html` directly, but over `file://` Chrome blocks the ES module script (CORS error) and the page stays on "Loading inspiration...". It also listed `npm install --save-dev jsdom`, although `package.json` has no dependencies.

Refinement prompt:

> `Refine the plan artifact only (do not change code): quickstart.md is wrong in two places. (1) It says to open index.html directly in a browser, but I tested it and Chrome blocks the ES module script over file:// (CORS error, page stays on "Loading inspiration..."); it only works through a local static server. Make python3 -m http.server then http://localhost:8000 the required way to run the page. (2) It says npm install --save-dev jsdom, but package.json has no dependencies and the tests use tests/test-dom.js, so remove that step. Keep everything else unchanged.`

After: `quickstart.md` now says to run `python3 -m http.server 8000` and open `http://localhost:8000`, and the jsdom install step is gone.

## 3. Convergence outcome

- **First `/speckit-converge` (after implement):** ✅ Converged, 0 actionable findings (0 missing, 0 partial, 0 contradicts, 0 unrequested).
- **Second `/speckit-converge` (after refinement 2):** ✅ Converged, no gaps; "The codebase, specification, implementation plan, and validation guide are fully synchronized."
- All 26 tasks in `tasks.md` are marked complete.
- `npm test`: 20 tests, 20 passed, 0 failed.
- Manual browser check (served over `http://localhost`): a quote and author appear on load; 30 consecutive "New quote" clicks never repeated the previous quote; favoriting a quote turns the button red and saves it to `localStorage` (`qotd_favorites_v1`); after a reload the same quote is still shown as favorited.

## 4. How to run

```bash
python3 -m http.server 8000   # then open http://localhost:8000
npm test                      # runs the automated tests (Node 18+)
```

## 5. What I learned

SDD felt like overhead when the generated artifacts were much heavier than the feature: the constitution demanded structured logging, telemetry and 85% coverage for a single static page, and the plan produced five supporting documents. It paid off at the review gates: the catalog-size gap was visible in the spec and plan before any code existed, and fixing it there flowed automatically into the tasks, the code and the tests. The converge step reported "Converged" while the quickstart still had wrong run instructions, so I learned that convergence checks consistency between artifacts but does not replace actually running the result.
