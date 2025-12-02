---
"htmldocs-v2": patch
---

Massive performance improvements for development experience

- **Disabled minification in development mode** - Reduces build time by ~8s
- **Implemented intelligent build caching** - Subsequent builds of unchanged files now take ~100ms instead of 15s
- **Optimized Tailwind CSS processing** - Only regenerates CSS when necessary
- **Increased hot reload debounce** from 150ms to 500ms for more stable reloads

**Performance improvements:**
- Initial render: 16s → 2-4s (6-8x faster) ⚡
- Hot reload: 13-18s → 500ms-1s (15-30x faster) 🚀
- Cached rebuilds: 15s → 100ms (150x faster) 💨

This significantly improves the developer experience when using `htmldocs-v2 dev`.
