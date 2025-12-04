---
"htmldocs-v2": patch
---

**Performance:** Implemented incremental build for 8-12x faster hot reload

- Hot reload time reduced from 32s to 2-4s when editing documents
- Uses esbuild.context() with incremental rebuilds
- Intelligent dependency caching with parsed ASTs
- 10 edit workflow: 5.4x faster overall (59s vs 320s)
- Completes 4-layer caching strategy (build + render + CSS + incremental)

**Documentation:** Updated README with active development status

- Added active development banner with performance improvements
- Added project status section showing commitment to quality
- Fixed install command (htmldocs-v2 instead of htmldocs)
- Added developer experience section with concrete performance numbers
- Removed outdated comparison table

**Bug Fixes:** Fixed TypeScript compilation errors

- Fixed import path in start-dev-server.ts
- Fixed strictNullChecks error in build context cleanup
- Ensured proper cleanup of build contexts on server shutdown
