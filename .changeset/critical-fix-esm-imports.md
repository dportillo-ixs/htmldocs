---
"htmldocs-v2": patch
---

**CRITICAL FIX:** Resolve ESM import error breaking init command

Fixed critical bug where `npx htmldocs-v2@latest init` would fail with "Dynamic require of 'tailwindcss' is not supported" error.

**Root cause:**
- Package uses ESM (`.mjs` output)
- Code was using CommonJS `require()` for tailwindcss and autoprefixer
- `require()` is not supported in ESM modules

**Fix:**
- Replaced `require("tailwindcss")` with `import tailwindcss from "tailwindcss"`
- Replaced `require("autoprefixer")` with `import autoprefixer from "autoprefixer"`
- Moved imports to top-level (standard ESM pattern)

**Impact:**
- ✅ `npx htmldocs-v2@latest init` now works correctly
- ✅ No performance impact (imports are cached)
- ✅ No breaking changes
- ✅ All existing functionality preserved

**Who's affected:**
This fix resolves a blocking issue for ALL users trying to initialize new projects with v0.4.10.

**Migration:**
Simply update to v0.4.11:
```bash
pnpm update htmldocs-v2@latest
```
