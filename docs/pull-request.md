## 🚨 CRITICAL BUG FIX: ESM Import Error

**Problem in v0.4.10:**
- `npx htmldocs-v2@latest init` completely broken
- Error: "Dynamic require of 'tailwindcss' is not supported"
- ❌ Blocked ALL new users from initializing projects

**The Fix:**
- Replaced `require("tailwindcss")` with `import tailwindcss from "tailwindcss"`
- Replaced `require("autoprefixer")` with `import autoprefixer from "autoprefixer"`
- ESM-compliant imports at top-level

**Impact:**
- ✅ `npx htmldocs-v2@latest init` works correctly again
- ✅ No performance impact (imports cached at module load)
- ✅ No breaking changes
- ✅ All v0.4.10 performance improvements preserved (8-12x faster)

---

## 📝 NPM Package README Improvements

Updated `packages/htmldocs/README.md` (shown on npmjs.com):
- ✅ Active development banner
- ✅ Project status section highlighting v0.4.11
- ✅ Developer experience with concrete performance numbers
- ✅ Removed outdated comparison table

---

## ⚡ Performance (Inherited from v0.4.10)

**8-12x faster hot reload:**
- Before: Edit → 32s (rebuild everything)
- After: Edit → 2-4s ⚡ (incremental rebuild)
- 10 edits: 320s → 59s (5.4x faster)

**Complete 4-layer caching:**
1. ✅ Build cache
2. ✅ Render cache  
3. ✅ CSS cache
4. ✅ Incremental build

---

## 📦 What Happens After Merge

1. ✅ GitHub Actions runs release workflow
2. ✅ Changesets bumps version 0.4.10 → 0.4.11
3. ✅ Publishes to NPM as `htmldocs-v2@0.4.11`
4. ✅ Creates git tag
5. ✅ Updates CHANGELOG
6. ✅ Improved README visible on npmjs.com

---

## 🧪 Testing

```bash
# Test 1: Init command
npx htmldocs-v2@latest init test-project
# Expected: ✅ Project created successfully

# Test 2: Dev server
cd test-project
pnpm dev
# Expected: ✅ Server starts, incremental build works

# Test 3: Hot reload
# Edit a document
# Expected: ✅ Rebuild in 2-4s
```

---

**Type:** Patch release (critical bug fix + documentation)  
**Severity:** 🚨 CRITICAL - Emergency release  
**Breaking changes:** None  
**Migration:** Just update to v0.4.11