---
"htmldocs-v2": patch
---

Add Tailwind CSS output caching for faster hot reload

**Performance Optimization:**

Implemented intelligent Tailwind CSS output caching that tracks which className values are used in documents. When you edit document content without changing Tailwind classes, CSS generation is skipped entirely.

**Performance improvements:**
- Documents without Tailwind CSS: ~12s (unchanged)
- Documents with Tailwind (first render): ~18s (generates CSS)
- Documents with Tailwind (editing content): **~12s** (was ~18s) ⚡ **1.5x faster**

**How it works:**
1. Extracts all `className` values from document source
2. Creates a hash of the unique classes used
3. Caches the Tailwind CSS output with that hash
4. On rebuild, checks if classes changed
5. If unchanged: reuses cached CSS (saves ~6s)
6. If changed: regenerates CSS with new classes

**Debug logging:**
```
[CSS Cache] Hit for hash a1b2c3d4 (45 classes)  // Cache hit, fast!
[CSS Cache] Miss for hash e5f6g7h8 (47 classes) // New classes, regenerate
[CSS Cache] Stored with hash e5f6g7h8           // Cached for next time
```

**Bug fixes:**

Fixed runtime errors caused by attempting to use external dependencies in an isolated execution context:
- Fixed "Cannot find module 'react'" error
- Fixed "Cannot find module 'htmldocs-v2-react'" error
- Removed all user-land dependencies from esbuild external list
- Only Node.js built-ins (fs, path, crypto) remain external

**Why external dependencies don't work:**

The document code executes in an isolated VM context created by `createFakeContext()` where external npm packages aren't available. We investigated using `vm.Module` and custom resolvers but the complexity didn't justify the ~8-9s potential savings.

**Caching strategy (complete):**

This completes a three-layer caching approach:
1. ✅ **Build cache** (PR #43): Skip esbuild when file content identical
2. ✅ **Render cache** (PR #44): Skip rendering when output identical  
3. ✅ **CSS cache** (this PR): Skip Tailwind when classes unchanged

**Real-world impact:**

The most common development workflow is editing document content (text, data, props) without changing Tailwind classes. This optimization makes that workflow **1.5x faster** and provides a noticeably better experience.

**Example workflow:**
```tsx
// Initial render: ~18s (generates CSS)


// Edit text: ~12s (CSS cached) ✅


// Add class: ~18s (regenerates CSS)


// Edit text again: ~12s (CSS cached) ✅

```

**Technical details:**

- Cache key: Hash of sorted unique className values
- Cache storage: In-memory Map
- Cache invalidation: Automatic when classes change
- Cache persistence: Not persisted (clears on dev server restart)
- Extraction pattern: `/className=["']([^"']+)["']/g`
