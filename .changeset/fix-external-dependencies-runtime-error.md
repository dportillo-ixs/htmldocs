---
"htmldocs-v2": patch
---

Fix runtime errors and implement Tailwind CSS caching optimization

**Bug Fix:**
- Fixed "Cannot find module 'react'" runtime error
- Fixed "Cannot find module 'htmldocs-v2-react'" runtime error
- Removed all user-land dependencies from esbuild external list
- Only Node.js built-ins (fs, path, crypto) remain external

**Performance Optimization:**
- Implemented Tailwind CSS output caching based on className usage
- When editing documents without changing Tailwind classes: **~1.5x faster** (18s → 12s)
- Cache invalidates automatically when new classes are added
- Works alongside existing build cache and render cache

**Why external dependencies don't work:**
The code executes in an isolated context via `createFakeContext()` where external modules aren't available. Only Node.js built-in modules can be external.

**What does work:**
- ✅ Tailwind CSS caching: Saves ~6s when classes unchanged
- ✅ Build cache (PR #43): Fast when file content identical  
- ✅ Render cache (PR #44): Fast when rendering identical components

**Performance in practice:**
- Documents without Tailwind: ~12s (unchanged)
- Documents with Tailwind (first time): ~18s (unchanged)
- Documents with Tailwind (editing content): **~12s** (was 18s) ⚡ 1.5x faster
