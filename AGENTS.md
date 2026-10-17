# AGENTS

- Use plain JavaScript only; no frameworks, build tools, or extra npm dependencies.
- Keep business logic in `src/quiz.js` and export it with `module.exports` for Node `node:test` coverage.
- Keep DOM/browser code in `src/app.js`; do not mix UI logic into the quiz logic.
- Use CSS variables in `:root` for all colors; avoid hardcoded color values elsewhere.
- Build accessible UI: use real buttons for actions, keep focus visible, and announce changing messages with `aria-live`.
- Prefer small, testable functions and readable naming.
- Run `npm test` before finishing changes.
- Keep changes scoped to the current feature and avoid unnecessary refactors.
