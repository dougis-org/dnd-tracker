# Codacy analysis required after markdownlint fixes
# 🚨 IMMEDIATE ACTION CHECKLIST

## Quick Status

- **Issue**: #106 Security vulnerabilities in mongoose/yargs-parser
- **Branch**: `feature/106-security-mongoose-vulnerabilities`
- **Problem**: ~71 TypeScript errors after `connectToDatabase` refactor (as of Aug 27, 2025)
- **Tests**: Migration security test PASSING ✅, others failing due to TS errors

## ⚡ Priority 1 Fix Test Mocks (Required for progress)

### Files with `mockConnectToDatabase.mockResolvedValue(undefined)` (verify all fixed!)

```bash
src/app/api/characters/[id]/duplicate/__tests__/route.test.ts (lines 286, 365, 411)
```

### Fix Pattern

```typescript
// Replace this:
mockConnectToDatabase.mockResolvedValue(undefined);

// With this:
mockConnectToDatabase.mockResolvedValue({
  connection: {} as any,
  db: {} as any,
});
```

### Verification

```bash
npx tsc --noEmit  # Should reduce error count
```

## ⚡ Priority 2 Fix Remaining TypeScript Errors

### Major categories (after mock fixes)

1. **Auth mocking issues** - Clerk session types (actor property, session mocks)
2. **Schema type mismatches** - Form validation types (Zod, resolver, etc)
3. **MongoDB model types** - `_id` field typing in tests
4. **Environment variable types** - NODE_ENV requirements in env tests

### Verification (Step 4)

```bash
npx tsc --noEmit  # Target: 0 errors
npm test          # Target: All passing
```

## ⚡ Priority 3 Remove Vulnerable Dependencies

```bash
npm uninstall migrate-mongoose
rm migrate-mongoose-config.js
npm audit  # Verify clean
```

## 📍 Current connectToDatabase Interface

```typescript
export interface DatabaseConnection {
  connection: mongoose.Connection;
  db: mongoose.Connection['db'];
}
export async function connectToDatabase(): Promise<DatabaseConnection>;
```

## 🎯 Success Criteria

- [ ] 0 TypeScript errors
- [ ] All tests passing
- [ ] No Critical/High security vulnerabilities
- [ ] Ready for migration tool upgrade

---

_For full details see: `/docs/SECURITY-REFACTOR-STATUS.md`_
