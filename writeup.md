# Week 2 – Spec-Driven Development with Spec Kit

**Agent:** Google Antigravity (Gemini 3.8 Flash)
**Feature:** A quote-of-the-day page with a "New quote" button and favorites that stay after reload.

## How to run

```bash
python3 -m http.server 8000   # then open http://localhost:8000
npm test
```

## What is SDD?

Spec-Driven Development means you first write down clearly *what* you want (the spec), and then the AI agent writes the code by following that spec. At the end, the agent checks if the code really matches the spec.

Before this assignment, I made Python scripts and small programs with the help of Claude. I asked the AI to write the code, and then I gave it prompts like "fix this part, fix that part" until the app was the way I wanted in the end. With SDD you explain everything fully before any code is written, and I learned that this is better for big projects.

## Prompts I used

1. `/speckit-constitution Create principles focused on code quality, testing, and maintainability.`
2. `/speckit-specify A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads.`
3. `/speckit-plan Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage.`
4. `/speckit-tasks`
5. `/speckit-implement`
6. `/speckit-converge`

## Refining the spec (before / after)

The assignment says the page uses a **small** built-in list. But the spec only said "diverse quotes" and did not give a number, so the plan decided on its own to use **30–50 quotes**.

I asked the agent to fix the spec, not the code:

> `/speckit-specify Refine the existing spec (do not write code): the feature asks for a SMALL built-in list, but FR-002 only says "diverse quotes" with no size, and the plan inflated it to ~30-50 quotes. Update spec.md so FR-002 states the built-in list is small and fixed at exactly 10 quotes, each with text and author, and add a matching success criterion. Keep everything else unchanged.`

Then I ran `/speckit-plan` again with the same prompt.

- **Before:** spec said "a built-in catalog of diverse quotes", plan said "~30-50 curated built-in quotes".
- **After:** spec says "a small built-in catalog fixed at exactly 10 quotes", plan says "exactly 10 curated quotes".

This change went all the way to the code: the tasks asked for a 10-quote list, `src/data/quotes.js` has exactly 10 quotes, and there is a test that checks there are 10. This fix made sense to me.

I also fixed one more thing in the plan files. `quickstart.md` said you can just open `index.html`, but in Chrome the page did not load that way. It only works with a local server, so I asked the agent to change the instructions to `python3 -m http.server 8000`.

## Convergence

`/speckit-converge` said **Converged** with no missing parts. I ran it again after the quickstart fix and it was still **Converged**. All 26 tasks are done and `npm test` shows 20/20 tests passing.

## What I learned

SDD felt slower than just asking the AI to "make a quote website", because I had to go through six steps. Reading the long files after every step and translating them into Turkish was also tiring. But I got what I wanted in one go, so in the long run it felt like I saved more time. The AI can't read our minds, so instead of getting errors later it is much better to say clearly what we want, and it is best not to be stingy when we explain it.

## Would I use SDD?

I would probably not use SDD for my own programs. I like to see every step of the program myself and fix it in a simpler way. If there is a part I need to fix, I prefer to go directly to that place and fix it. With SDD, making changes later felt hard to me. Maybe it is actually easy, and I only think this way because I don't know it well yet.
