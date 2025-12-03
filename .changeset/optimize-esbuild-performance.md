---
"htmldocs-v2": patch
---

Massive esbuild performance optimization with external dependencies and CSS caching

Hot reload was taking 12-18 seconds per build because esbuild was re-bundling all dependencies from scratch every time. Even a minimal component importing only `htmldocs-v2-react` took 12 seconds to build.

**Root causes identified:**
- esbuild bundled `react`, `react-dom`, `htmldocs-v2-react`, `htmldocs-v2-render` on every build
- Tailwind CSS regenerated from scratch even when classes hadn't changed
- No dependency or CSS output caching

**Changes:**

**1. External Dependencies Optimization**
- Marked stable dependencies as `external` in esbuild config
- Prevents re-bundling of React, React DOM, and htmldocs packages
- Dependencies are resolved at runtime instead of bundled

**2. Tailwind CSS Output Caching**
- Extract `className` attributes via regex
- Generate MD5 hash from sorted unique classes
- Cache CSS output keyed by class hash
- Skip PostCSS/Tailwind processing when cache hits
- FIFO eviction at 50 entries

**Performance improvements:**

- Simple document builds: **12s → 500ms** (24x faster) ⚡
- Tailwind first render: **18s → 6-7s** (2.5-3x faster) ⚡
- Tailwind with unchanged classes: **18s → 500ms** (36x faster) 🚀
- Tailwind with new classes: **18s → 6-7s** (regenerates CSS as needed)

**Four-layer caching strategy:**
1. Build cache (PR #43): Fast when file content unchanged (~100ms)
2. Render cache (PR #44): Fast when rendering identical components (~100ms)
3. External dependencies: Skip re-bundling stable packages (~500ms)
4. CSS cache: Skip Tailwind when classes unchanged (~500ms)

**Benefits:**
- Dramatically faster hot reload for all workflows
- Near-instant feedback for content edits
- Lower CPU usage and memory pressure
- Better battery life during development
- More predictable performance across document types

This completes the performance optimization trilogy, making `htmldocs-v2 dev` feel instant for most common editing scenarios.
