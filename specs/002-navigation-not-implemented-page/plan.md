```markdown
---
title: F002 Implementation Plan
---

## Plan

Day 1 (TDD-first):

- Morning (2-3 hrs):
  - Add failing unit tests for `GlobalNav` and `Breadcrumbs`
  - Add Playwright skeleton test for navigation

- Midday (3-4 hrs):
  - Implement `NotImplementedPage` and `GlobalNav` (desktop + mobile)
  - Wire into `MainLayout`

- Afternoon (2-3 hrs):
  - Implement Breadcrumbs and unit tests
  - Finish Playwright smoke test and run full test:ci
  - Finalize PR checklist and open PR

Risks / Contingencies:

- If the app router structure differs (app vs pages), adapt route wiring accordingly.
- If additional accessibility fixes are required, schedule a follow-up small PR.

```
