# Refactoring Plan: userAdapter.test.ts

**Priority:** Optional but recommended  
**Complexity Reduction:** 205 lines → ~170 lines  
**Time Estimate:** 1-2 hours  
**Risk Level:** Low (test-only changes)

---

## Overview

`userAdapter.test.ts` is well-structured but has 3-4 sections where `.each()` parametrization would reduce code duplication and improve test clarity.

---

## Sections to Refactor

### Section 1: Error Handling Tests (Lines 124-141)

**Current Structure:**

```typescript
describe('Error Handling', () => {
  it('should reject invalid profile email on update', async () => {
    await expect(
      userAdapter.updateProfile(testUserId, { email: 'invalid-email' })
    ).rejects.toThrow();
  });

  it('should reject name exceeding 100 characters', async () => {
    const longName = 'A'.repeat(101);
    await expect(userAdapter.updateProfile(testUserId, { name: longName })).rejects.toThrow();
  });

  it('should reject empty name', async () => {
    await expect(userAdapter.updateProfile(testUserId, { name: '' })).rejects.toThrow();
  });

  it('should reject null/undefined values appropriately', async () => {
    await expect(userAdapter.updateProfile(testUserId, { name: null })).rejects.toThrow();
  });
});
```

**Refactored with .each():**

```typescript
describe('Error Handling', () => {
  it.each([
    { updates: { email: 'invalid-email' }, description: 'invalid email' },
    { updates: { name: 'A'.repeat(101) }, description: 'name exceeding max length' },
    { updates: { name: '' }, description: 'empty name' },
    { updates: { name: null }, description: 'null value' },
  ])('should reject $description on profile update', async ({ updates }) => {
    await expect(
      userAdapter.updateProfile(testUserId, updates as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    ).rejects.toThrow();
  });
});
```

**Benefits:**

- Reduces 4 tests to 1 parametrized test
- Saves ~15 lines
- Makes error scenarios immediately visible
- Easier to add new error cases

---

### Section 2: Multiple Users Tests (Lines 159-183)

**Current Structure:**

```typescript
describe('Multiple Users', () => {
  it('should maintain separate data for different users', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';

    await userAdapter.updateProfile(user1, { name: 'User One' });
    await userAdapter.updateProfile(user2, { name: 'User Two' });

    const profile1 = await userAdapter.getProfile(user1);
    const profile2 = await userAdapter.getProfile(user2);

    expect(profile1.name).toBe('User One');
    expect(profile2.name).toBe('User Two');
  });

  it('should isolate preferences per user', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';

    await userAdapter.updatePreferences(user1, { experienceLevel: 'Novice' });
    await userAdapter.updatePreferences(user2, { experienceLevel: 'Advanced' });

    const prefs1 = await userAdapter.getPreferences(user1);
    const prefs2 = await userAdapter.getPreferences(user2);

    expect(prefs1.experienceLevel).toBe('Novice');
    expect(prefs2.experienceLevel).toBe('Advanced');
  });
});
```

**Refactored with .each():**

```typescript
describe('Multiple Users', () => {
  it.each([
    {
      operation: 'profiles',
      setup: (user1: string, user2: string) => ({
        call: () => Promise.all([
          userAdapter.updateProfile(user1, { name: 'User One' }),
          userAdapter.updateProfile(user2, { name: 'User Two' }),
        ]),
        verify: async () => {
          const p1 = await userAdapter.getProfile(user1);
          const p2 = await userAdapter.getProfile(user2);
          return [p1.name === 'User One', p2.name === 'User Two'];
        },
      }),
    },
    {
      operation: 'preferences',
      setup: (user1: string, user2: string) => ({
        call: () => Promise.all([
          userAdapter.updatePreferences(user1, { experienceLevel: 'Novice' }),
          userAdapter.updatePreferences(user2, { experienceLevel: 'Advanced' }),
        ]),
        verify: async () => {
          const p1 = await userAdapter.getPreferences(user1);
          const p2 = await userAdapter.getPreferences(user2);
          return [p1.experienceLevel === 'Novice', p2.experienceLevel === 'Advanced'];
        },
      }),
    },
  ])('should isolate $operation per user', async ({ setup }) => {
    const user1 = 'user-1';
    const user2 = 'user-2';
    const test = setup(user1, user2);
    await test.call();
    const results = await test.verify();
    expect(results.every((r: boolean) => r)).toBe(true);
  });
});
```

**Note:** This refactoring is more complex and may not be worth it. Could alternatively keep simple and just add notifications test using .each() for 3 data types.

**Simpler Alternative:**

```typescript
describe('Multiple Users', () => {
  const setupMultiUserTest = async (
    updateFn: (userId: string, data: any) => Promise<any>,
    getFn: (userId: string) => Promise<any>,
    updateData: [any, any],
    checkField: string
  ) => {
    const user1 = 'user-1';
    const user2 = 'user-2';
    
    await updateFn(user1, updateData[0]);
    await updateFn(user2, updateData[1]);
    
    const result1 = await getFn(user1);
    const result2 = await getFn(user2);
    
    return [result1[checkField], result2[checkField]];
  };

  it.each([
    {
      type: 'profiles',
      updateFn: userAdapter.updateProfile,
      getFn: userAdapter.getProfile,
      data: [{ name: 'User One' }, { name: 'User Two' }],
      field: 'name',
      expected: ['User One', 'User Two'],
    },
    {
      type: 'preferences',
      updateFn: userAdapter.updatePreferences,
      getFn: userAdapter.getPreferences,
      data: [{ experienceLevel: 'Novice' }, { experienceLevel: 'Advanced' }],
      field: 'experienceLevel',
      expected: ['Novice', 'Advanced'],
    },
  ])('should isolate $type per user', async ({ updateFn, getFn, data, field, expected }) => {
    const results = await setupMultiUserTest(updateFn, getFn, data, field);
    expect(results).toEqual(expected);
  });
});
```

**Benefits:**

- Tests both profiles and preferences with one parametrized test
- Reduces duplicate code
- Easier to add notification test

**Recommendation:** Use the simpler alternative - it's cleaner and easier to maintain.

---

### Section 3: localStorage Persistence Tests (Lines 184-201)

**Current:** Already concise and clear - **No refactoring needed.**

---

## Implementation Strategy

### Step 1: Refactor Error Handling (Highest Value)

- Highest impact per line saved
- Lowest complexity
- Clearest improvement
- Estimated time: 30-45 minutes

### Step 2: Optional - Refactor Multiple Users Tests

- More complex refactoring
- Good clarity improvement
- Estimated time: 1 hour (if doing simpler alternative)

### Step 3: Run Tests

- Verify all tests still pass
- Check coverage remains ~85%

---

## Risk Assessment

**Risk Level:** Low ✅

- No behavior changes, only test structure
- Existing 20+ tests validate refactoring
- Can be reverted easily if issues arise
- Pattern matches already-refactored userSchema.test.ts

---

## Timeline

| Task | Time | Risk |
|------|------|------|
| Refactor Error Handling | 30-45 min | Low ✅ |
| Run Tests & Verify | 5-10 min | Low ✅ |
| Refactor Multiple Users (Optional) | 1 hour | Low ✅ |
| Commit & Push | 5 min | Low ✅ |
| **Total** | **1.5-2.5 hours** | **Low ✅** |

---

## Decision Framework

### Do This If

- ✅ Team wants consistent `.each()` usage across all test files
- ✅ Want to improve test readability
- ✅ Have 1-2 hours available
- ✅ Want to establish stronger testing patterns

### Skip This If

- ❌ Tests are already clear and readable (they are)
- ❌ No immediate business pressure
- ❌ Prefer to focus on other features
- ❌ Less than 1 hour available

---

## Recommendation

**Refactor Error Handling section only:**

- High-value improvement
- Lowest complexity
- Quick win (30-45 minutes)
- Makes test cases immediately visible
- Matches userSchema.test.ts pattern

**Skip Multiple Users refactoring:**

- Current tests are clear and readable
- Parametrization adds complexity
- Benefits not worth the added complexity

---

## Final Notes

The codebase is already in **excellent shape**. This is an **optional enhancement** to improve consistency and test clarity. The current tests are fully functional and maintainable.
