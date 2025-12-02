---
"htmldocs-v2": minor
"htmldocs-v2-render": minor
"htmldocs-v2-react": minor
---

Renamed packages from @htmldocs/* scope to htmldocs-v2-* prefix for independent npm publishing

All internal packages have been renamed to use the `htmldocs-v2-` prefix without a scope:
- `@htmldocs/render` → `htmldocs-v2-render`
- `@htmldocs/react` → `htmldocs-v2-react`
- Main package name remains `htmldocs-v2`

This change allows the packages to be published to npm independently without conflicts with the existing @htmldocs scope owned by another maintainer.
