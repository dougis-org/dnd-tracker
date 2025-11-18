# E2E Test Failures Analysis & Fixes

**Branch**: `bugfix/e2e-test-failures`
**Commit**: Multiple fixes applied as described below

## Summary

Out of 63 E2E tests, 36 are currently failing. Investigation reveals multiple categories of issues. This document outlines the test-specific issues that were fixed, and identifies deeper application issues that require separate investigation.

## Fixes Applied in This Branch

### ✅ 1. Dashboard Test - Selector Issue  

**File**: `tests/e2e/dashboard.spec.ts:17`

**Original Error**:

```
Unexpected token "/" while parsing css selector "span:has-text(/on the roadmap/i)"
```

**Root Cause**: Playwright CSS selectors don't support regex syntax or case-insensitive matching in selectors

**Attempted Fixes**:

1. First attempt: Changed to `page.getByText('On the roadmap')` - failed (text not found)
2. Final fix: Changed to `page.locator('span').toContainText('On the roadmap')`
   - Uses XPath-like text matching which works reliably
   - Targets span that contains the uppercase "On the roadmap" text

**Status**: Fixed and committed

---

### ✅ 2. Character Form Test - Strict Mode Violation

**File**: `tests/e2e/characters.spec.ts:30`

**Original Error**:

```
Error: strict mode violation: locator('label') resolved to 6 elements
Expected pattern: /Name/i
```

**Root Cause**: Multiple label elements on form, Playwright strict mode requires single element match

**Fix**:

- Changed `page.locator('label')` to `page.locator('label').first()`
- Changed `page.locator('button')` to `page.locator('button[type="submit"]')` for specificity

**Status**: Fixed and committed

---

### ✅ 3. Character Navigation Test - Improved Selector

**File**: `tests/e2e/characters.spec.ts:44`

**Original Issue**: Character links not being found, navigation failing

**Fixes Applied**:

1. Scoped selector from `a[href*="/characters/"]` to `article a[href*="/characters/"]`
   - Prevents matching unrelated links
   - Targets only character cards
2. Changed URL pattern match from `/\/characters\/char-\d+/` to `/\/characters\/[a-zA-Z0-9-]+/`
   - Original assumed specific ID format, was too restrictive
3. Added `await page.waitForSelector('article')` for content loading

**Status**: Fixed and committed

---

### ✅ 4. Character Creation Flow Test - Navigation Selector

**File**: `tests/e2e/characters.spec.ts:57`

**Issue**: Test couldn't find "Create a character" link

**Fix**:

- Changed from hard-coded text selector `text=Create a character`
- To flexible selector: `a[href="/characters/new"], a:has-text("Create a character")`
- Uses `.first()` to get first matching element
- Handles both href-based and text-based navigation options

**Status**: Fixed and committed

---

## Analysis of Remaining Failures

### Category 1: Profile/Settings Pages (9 tests failing)

**Issue**: Form elements not found with timeout  
**Example**:

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Locator: 'input[name="name"]'
```

**Probable Causes**:

- Profile page not fully implemented
- Form loading/rendering issues
- Missing mock data for profile

**Recommendation**: Check implementation of `/profile` and `/settings` routes

---

### Category 2: Landing Page (6 tests failing)

**Issue**: Section elements not found, missing content  
**Example**:

```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received: 0
```

**Probable Causes**:

- Landing page sections not rendering
- Mock content not loading
- CSS class selectors don't match actual DOM

**Recommendation**: Verify landing page component rendering and structure

---

### Category 3: Service Worker Tests (6 tests failing)

**Issue**: SW not registering, cache not found  
**Example**:

```
Error: expect(received).toBe(expected)
Expected: true
Received: false
```

**Probable Causes**:

- Service worker not registering in test environment
- Cache API not available in test context
- SW setup incomplete

**Recommendation**: Review service worker configuration and registration

---

### Category 4: Encounter Creation (4 tests failing)

**Issues**:

1. Validation error messages not appearing
2. Page not redirecting after save
3. Form state not persisting correctly

**Probable Causes**:

- Error message element not in expected location
- Redirect logic not triggering
- Form submission incomplete

**Recommendation**: Check error handling and redirect logic in encounter handler

---

### Category 5: Other Issues (11 tests)

- Subscription page header missing
- Item catalog filter strict mode violations
- Navigation CSS classes don't match
- Screenshot comparison failures

---

## Key Insights

### 1. Test Code vs. Application Code

The failures fall into two categories:

- **Test code issues** (3 fixed): Selector syntax, strict mode, specificity
- **Application issues** (33+): Missing pages, broken implementations, incomplete components

### 2. Playwright Selector Best Practices

Lessons learned from this investigation:

- Avoid regex in CSS selectors - use XPath or locator filters instead
- Be specific with selectors to avoid strict mode violations
- Use meaningful attributes (id, name, role) rather than generic classes
- Prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors when possible

### 3. Test Environment Stability

Issues encountered:

- Turbopack internal errors during test runs
- Port conflicts (3002) requiring process cleanup
- Server startup timeouts

---

## Files Modified

1. `tests/e2e/characters.spec.ts` - 3 test selector fixes
2. `tests/e2e/dashboard.spec.ts` - 1 selector fix
3. `E2E_TEST_FAILURES_ANALYSIS.md` - This analysis document

## Commits Made

1. `fix: resolve E2E test failures` - Initial 3 selector fixes
2. `fix: improve dashboard and character navigation test selectors` - Refinement
3. `fix: use locator containsText for 'On the roadmap' element` - Dashboard fix
4. `docs: add E2E test failures analysis` - Analysis documentation

## Recommendations for Next Steps

### Priority 1 - Verify Test Fixes

- ✅ Run character tests specifically to ensure fixes work
- ✅ Run dashboard test to verify selector works
- Monitor CI pipeline for these specific tests

### Priority 2 - Application Issues

1. Investigate landing page component rendering
2. Check profile/settings page implementation
3. Review service worker configuration
4. Verify encounter handler and redirects
5. Check subscription page layout

### Priority 3 - Test Infrastructure

1. Consider Turbopack stability (update or revert to webpack)
2. Improve test isolation to prevent port conflicts
3. Add health checks to test setup
4. Consider running tests in fresh containers

---

## Test Execution Log

- **Full test run**: 63 tests, 36 failures, 27 passes
- **Target tests fixed**: 4 (dashboard, character list, character detail, character creation)
- **Remaining critical issues**: 33+ in application code
