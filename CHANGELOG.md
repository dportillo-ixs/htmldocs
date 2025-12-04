# Release v0.4.11 - Critical Bug Fix

## 🚨 CRITICAL FIX: ESM Import Error

**Problem in v0.4.10:**
- `npx htmldocs-v2@latest init` completely broken
- Error: "Dynamic require of 'tailwindcss' is not supported"
- Blocked ALL new users from initializing projects

**Fix:**
- Replaced `require("tailwindcss")` with `import tailwindcss from "tailwindcss"`
- Replaced `require("autoprefixer")` with `import autoprefixer from "autoprefixer"`
- ESM-compliant imports

**Impact:**
- ✅ init command works again
- ✅ No performance regression
- ✅ No breaking changes
- ✅ All v0.4.10 performance improvements preserved (8-12x faster)

## 📝 NPM Package README Improvements

Updated `packages/htmldocs/README.md` (shown on npmjs.com):
- ✅ Active development banner
- ✅ Project status section
- ✅ Developer experience with performance numbers
- ✅ Removed comparison table

## ⚡ Performance (from v0.4.10)

- 8-12x faster hot reload
- 4-layer caching system
- 2-4s rebuild time

## 📦 What Happens After Merge

1. ✅ Changesets bumps version 0.4.10 → 0.4.11
2. ✅ Publishes to NPM
3. ✅ Updates CHANGELOG
4. ✅ Creates git tag

## 🧪 Testing

```bash
npx htmldocs-v2@latest init test-project
cd test-project
pnpm dev
```

Should work without errors.

---

**Type:** Patch (critical bug fix + docs)
**Breaking:** None
**Migration:** Just update to v0.4.11