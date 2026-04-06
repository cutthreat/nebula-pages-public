# AI PR Review Prompt

Review only the pull request diff for this repository.

Output rules:
- Findings first.
- Mention only concrete bugs, regressions, hidden risks, and missing tests.
- If there are no findings, say that explicitly and mention residual risk briefly.
- Do not restate the whole diff.
- Keep the review bounded to the changed lines and their immediate consequences.

Repository-specific risk lenses:
- broken local asset references in static HTML pages
- visual regression risk in public entry points such as `index.html`, `home.html`, and auth flows
- accidental drift between page HTML and paired CSS or JS assets
- publish-surface regressions that would break GitHub Pages
- hidden risk from editing shared static assets used by multiple pages
