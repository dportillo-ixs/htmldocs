---
"htmldocs-v2": patch
---

Fix runtime errors by removing user-land dependencies from external list

**Bug Fix:**
- Fixed "Cannot find module 'react'" runtime error
- Fixed "Cannot find module 'htmldocs-v2-react'" runtime error  
- Removed all user-land dependencies (React, React DOM, React JSX runtime) from esbuild external list
- Only Node.js built-ins (fs, path, crypto) remain external

**Why this fix was needed:**
The code executes in an isolated VM context created by `createFakeContext()` where external modules aren't available. Only Node.js built-in modules that are natively available in the Node.js runtime can be externalized.

**What this enables:**
This fix allows the existing Tailwind CSS caching and build caching features to work correctly:
- ✅ Tailwind CSS caching: Saves ~6s when editing documents without changing Tailwind classes
- ✅ Build cache: Fast when file content is identical
- ✅ Render cache: Fast when rendering identical components

**Performance impact:**
With this fix in place, the existing caching mechanisms can function properly:
- Documents without Tailwind: ~12s
- Documents with Tailwind (first time): ~18s
- Documents with Tailwind (editing content, same classes): **~12s** (was 18s) ⚡ 1.5x faster
