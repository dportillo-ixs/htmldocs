---
"htmldocs-v2": patch
---

### 🚀 New Feature: Tailwind CSS Output Caching

Intelligent caching system that tracks which Tailwind className values are used in documents and skips CSS regeneration when classes haven't changed.

**Performance improvements:**
- Documents without Tailwind: ~12s (unchanged)
- Documents with Tailwind (first render): ~18s (generates CSS)
- Documents with Tailwind (editing content): **~12s** ⚡ **1.5x faster** (was ~18s)

**How it works:**
1. Extracts all `className` values from document source code
2. Creates a hash of the unique classes used
3. Caches the Tailwind CSS output with that hash
4. On rebuild, checks if classes changed
5. If unchanged: reuses cached CSS (saves ~6 seconds)
6. If changed: regenerates CSS with new classes

### 🐛 Bug Fixes

Fixed runtime errors caused by attempting to use external dependencies in isolated execution context:
- ✅ Fixed "Cannot find module 'react'" error
- ✅ Fixed "Cannot find module 'htmldocs-v2-react'" error
- ✅ Removed all user-land dependencies from esbuild external list
- ✅ Only Node.js built-ins (fs, path, crypto) remain external

**Technical explanation:**
The document code executes in an isolated VM context created by `createFakeContext()` where external npm packages aren't available. Only Node.js built-in modules can be external.

### 📦 Complete Caching Strategy

This completes a three-layer caching approach for optimal development experience:

1. ✅ **Build cache** (PR #43): Skip esbuild when file content is identical
2. ✅ **Render cache** (PR #44): Skip rendering when output is identical
3. ✅ **CSS cache** (this release): Skip Tailwind when classes unchanged

### 🎯 Real-World Impact

The most common development workflow is editing document content (text, data, props) without changing Tailwind classes. This optimization makes that workflow **1.5x faster** (~6 seconds saved per reload).
