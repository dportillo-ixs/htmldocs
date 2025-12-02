---
"htmldocs-v2": patch
---

Cache HTML rendering to optimize hot reload performance

Hot reload was taking 3-5s for every content change despite build caching working correctly. The build cache (~100ms on cache hit) was working, but HTML rendering (`renderAsync`) was executing unconditionally on every file change.

**Changes:**

- **Added HTML rendering cache** with FIFO strategy (max 100 entries)
- **Cache key based on:** `documentPath:fileHash:propsHash:cssHash`
- **Exposed fileHash** from `getDocumentComponent` to enable downstream caching

**Performance improvements:**

- First render of new content: 3-5s (unavoidable)
- Reverting to previously-rendered content: ~100ms (40-50x faster) ⚡
- Fast iteration when toggling between document variations 🔄

**Benefits:**

- Lower CPU usage and memory pressure
- Better battery life through less computation
- More predictable performance
- Supports iterative workflows common in document editing
