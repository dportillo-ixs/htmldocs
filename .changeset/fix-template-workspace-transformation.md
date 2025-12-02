---
"htmldocs-v2": patch
---

Fix starter template to use workspace protocol and proper version transformation

The `init` command now correctly transforms `workspace:*` dependencies to proper semver ranges (e.g., `^0.4.1`) when users run `pnpx htmldocs-v2@latest init`. This fixes the issue where users would get hardcoded versions that don't exist on npm.

**Changes:**
- Template dependencies now use `workspace:*` instead of hardcoded versions
- init.ts properly converts `workspace:*` to `^VERSION` during project initialization
- Regenerated pnpm-lock.yaml to match package.json
