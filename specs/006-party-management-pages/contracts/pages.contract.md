# Page Contracts: Party Management Pages

**Feature**: Party Management Pages (F006)  
**Date**: 2025-11-06  
**Status**: Phase 1 Design

## Party List Page Contract

**Route**: `/parties`  
**File Location**: `src/app/parties/page.tsx`  
**Page Type**: List/Dashboard page

### Page Specification

#### Data Source

```typescript
// During development (F006 - mock)
import { MOCK_PARTIES } from '@/lib/mockData/parties';

// Future (F014+)
// const parties = await getPartiesByUserId(userId);
```

#### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header: "My Parties"                                │
│ Subtitle: "Manage your D&D campaign parties"        │
├─────────────────────────────────────────────────────┤
│ [+ Create New Party]  [Search...]                   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┐         │
│ │ PartyCard 1 │ PartyCard 2 │ PartyCard 3 │ (grid) │
│ ├─────────────┼─────────────┼─────────────┤         │
│ │ PartyCard 4 │             │             │         │
│ └─────────────┴─────────────┴─────────────┘         │
└─────────────────────────────────────────────────────┘
```

#### Page Elements

1. **Header Section**:
   - Page title: "My Parties"
   - Description: "Manage your D&D campaign parties"
   - Call-to-action button: "+ Create New Party" → navigates to `/parties/new`

2. **Search/Filter Section** (Future - F014+):
   - Search box for party name filtering (UI present, non-functional)
   - Sort options (UI present, non-functional)

3. **Empty State** (if no parties):
   - Icon + message: "No parties yet"
   - Button: "Create your first party"

4. **Party Grid**:
   - Responsive grid layout:
     - Mobile: 1 column
     - Tablet (768px+): 2 columns
     - Desktop (1024px+): 3 columns
   - Gap: 24px (spacing)
   - Max width: 1400px, centered with padding

5. **Each Party Card** (using PartyCard component):
   - Shows: Party name, description preview (truncated), member count, role composition
   - Click navigates to `/parties/:id`
   - Hover effect: subtle shadow increase, slight scale

#### Behavior Specification

| User Action | Expected Behavior |
|-------------|-------------------|
| Page load | List displays with mock parties or empty state |
| Click party card | Navigate to `/parties/:id` |
| Click "Create New Party" | Navigate to `/parties/new` |
| Resize window | Grid re-flows (1 → 2 → 3 columns) |
| Search box (future) | Shows placeholder "Search parties..." |

#### Error Handling

- Party data fails to load: Show error message "Failed to load parties. Please try again."
- Invalid party ID in URL: User stays on list
- Page permission denied: (Future) Redirect to login

#### Styling Requirements

- Page background: Light/dark mode support
- Padding: 24px on mobile, 32px+ on desktop
- Typography:
  - Page title: Large heading (h1), 32px/bold
  - Subtitle: Medium gray, 16px
  - Consistent with existing design system from F001

#### Performance

- Initial load target: <2s (mock data)
- No database calls during F006 (mock data only)
- Responsive image loading (future)

#### Accessibility

- ✅ Semantic HTML (`<main>`, `<section>`, `<h1>`)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation: Tab through cards and buttons
- ✅ Color contrast: AA standard
- ✅ Responsive text sizing

---

## Party Detail Page Contract

**Route**: `/parties/:id`  
**File Location**: `src/app/parties/[id]/page.tsx`  
**Page Type**: Detail/View page

### Page Specification

#### Data Source

```typescript
// During development (F006 - mock)
const party = MOCK_PARTIES.find(p => p.id === params.id);

// Future (F014+)
// const party = await getPartyById(params.id);
```

#### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ ← Back   [Edit]  [Delete]                            │
├──────────────────────────────────────────────────────┤
│ Party Name (Large Heading)                           │
│ Campaign Setting (Subtitle)                          │
│ Description paragraph...                             │
├──────────────────────────────────────────────────────┤
│ [Composition Summary Card]                           │
│ Members: 4 | Avg Level: 4.75 | Tier: Beginner       │
│ Tank: 1 | Healer: 1 | DPS: 2 | Support: 0           │
├──────────────────────────────────────────────────────┤
│ Party Members:                                       │
│ ┌──────────────┬──────────────┐                      │
│ │ MemberCard 1 │ MemberCard 2 │ (grid/list)        │
│ ├──────────────┼──────────────┤                      │
│ │ MemberCard 3 │ MemberCard 4 │                      │
│ └──────────────┴──────────────┘                      │
└──────────────────────────────────────────────────────┘
```

#### Page Elements

1. **Header with Navigation**:
   - Back button: Navigates to `/parties`
   - Edit button: Navigates to `/parties/:id/edit`
   - Delete button: Opens DeleteConfirmModal
   - Breadcrumb (optional): Party list > {Party name}

2. **Party Information**:
   - Party name (large h1 heading)
   - Campaign setting (subtitle, gray text)
   - Description (paragraph)
   - Created date (small text, optional)

3. **Composition Summary**:
   - Stats card showing:
     - Total members
     - Average level
     - Party tier (Beginner/Intermediate/Advanced/Expert)
     - Role distribution (visual bars or counts)

4. **Member List**:
   - Heading: "Party Members"
   - Grid or list of MemberCard components (variant='detail')
   - Sorted by role: Tank → Healer → DPS → Support
   - Responsive: 1-2 columns based on viewport

#### Behavior Specification

| User Action | Expected Behavior |
|-------------|-------------------|
| Page load with valid :id | Display party details |
| Page load with invalid :id | Show "Party not found" or redirect to list |
| Click back button | Navigate to `/parties` |
| Click edit button | Navigate to `/parties/:id/edit` |
| Click delete button | Show confirmation modal |
| Scroll through members | All members visible (mobile: scroll) |
| Click member card | (Future) Navigate to character detail |

#### Error States

- Party not found: "We couldn't find this party. [Return to list]"
- Party deleted: "This party has been deleted."
- Permission denied: (Future) Redirect to login
- Load error: "Failed to load party details. Please try again."

#### Styling Requirements

- Page background: Full-width with centered max-width (1000px)
- Header: Sticky (optional) or fixed position (future polish)
- Cards: Bordered, rounded corners, subtle shadows
- Typography: Consistent with design system
- Spacing: Consistent gap/padding throughout

#### Accessibility

- ✅ Semantic HTML: `<main>`, `<section>`, `<h1>`, `<h2>`
- ✅ Back button: Accessible focus, keyboard support
- ✅ Member cards: Focus indicators
- ✅ Color contrast: All text AA standard

---

## Party Create Page Contract

**Route**: `/parties/new`  
**File Location**: `src/app/parties/new/page.tsx`  
**Page Type**: Form page

### Page Specification

#### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ ← Back                                               │
├──────────────────────────────────────────────────────┤
│ Create a New Party                                   │
│ Build your adventuring group by filling out below   │
├──────────────────────────────────────────────────────┤
│ [PartyForm component]                                │
│ - Party name input                                   │
│ - Description textarea                              │
│ - Campaign setting input                            │
│ - Member management section                         │
│   - List of added members                           │
│   - "Add Member" button                             │
│ - Submit/Cancel buttons                             │
└──────────────────────────────────────────────────────┘
```

#### Page Elements

1. **Header**:
   - Back button: Navigates to `/parties`
   - Page title: "Create a New Party"
   - Subtitle: "Build your adventuring group"

2. **Form** (PartyForm component):
   - Party name (required text input)
   - Description (optional textarea)
   - Campaign setting (optional text input)
   - Member management section
   - Submit button: "Create Party" → Shows "Not Implemented" message
   - Cancel button: Navigates to `/parties`

#### Form Behavior

| User Action | Expected Behavior |
|-------------|-------------------|
| Page load | Form displays with empty fields |
| Enter party name | Input accepts up to 100 characters |
| Click "Add Member" | MemberForm appears inline |
| Fill member form + submit | Member added to preview list |
| Click remove on member | Member removed from preview |
| Click "Create Party" | Form submits with "Not Implemented" message |
| Click Cancel | Navigate back to `/parties` |

#### Form Validation

- Party name: Required, show error if empty or >100 chars
- Members: Minimum 1 required, show error if none added
- Real-time validation: Show feedback as user types
- Submit disabled: Until form valid

#### Styling

- Form fields: Stack vertically
- Responsive: Full-width on mobile, constrained width on desktop
- Member list: Scrollable if many members added
- Buttons: Full-width on mobile, inline on desktop

---

## Party Edit Page Contract

**Route**: `/parties/:id/edit`  
**File Location**: `src/app/parties/[id]/edit/page.tsx`  
**Page Type**: Form page

### Page Specification

#### Layout Structure

Same as Create page but with pre-populated data and additional delete option.

```
┌──────────────────────────────────────────────────────┐
│ ← Back                                               │
├──────────────────────────────────────────────────────┤
│ Edit Party: {Party Name}                             │
│ Update your party information and members            │
├──────────────────────────────────────────────────────┤
│ [PartyForm component - pre-populated]                │
│ - Party name (pre-filled)                           │
│ - Description (pre-filled)                          │
│ - Campaign setting (pre-filled)                     │
│ - Member management (with current members shown)    │
│ - Submit/Cancel buttons                             │
├──────────────────────────────────────────────────────┤
│ [Danger Zone]                                        │
│ [Delete Party] button                               │
└──────────────────────────────────────────────────────┘
```

#### Page Elements

1. **Header**:
   - Back button: Navigates to `/parties/:id`
   - Page title: "Edit Party: {Party Name}"
   - Subtitle: "Update your party information and members"

2. **Form** (PartyForm component, mode='edit'):
   - All fields pre-populated with current data
   - Submit button: "Save Changes" → Shows "Not Implemented" message
   - Cancel button: Navigates to `/parties/:id`

3. **Danger Zone**:
   - Section with red/warning styling
   - "Delete Party" button: Opens DeleteConfirmModal
   - Warning text: "Deleting a party cannot be undone."

#### Form Behavior

| User Action | Expected Behavior |
|-------------|-------------------|
| Page load with valid :id | Form pre-populates with party data |
| Modify party data | Changes reflected in form |
| Add/remove members | Member list updates |
| Click "Save Changes" | Form submits with "Not Implemented" message |
| Click "Delete Party" | DeleteConfirmModal appears |
| Modal "Confirm Delete" | Shows "Not Implemented" message |
| Modal "Cancel" | Modal closes, return to form |
| Click Back | Navigate to `/parties/:id` |

#### Error States

- Party not found: "We couldn't find this party."
- Permission denied: (Future) "You don't have permission to edit this party."

#### Styling

- Edit form: Same as create form styling
- Danger zone: Red border, warning colors
- Buttons:
  - Submit: Primary color
  - Cancel: Secondary color
  - Delete: Destructive/red color

---

## Page Navigation Flow

```
/parties (list)
├── Click card → /parties/:id (detail)
├── [Edit] button → /parties/:id/edit (edit)
│   ├── [Save] → (mock) /parties/:id (detail)
│   ├── [Delete] → DeleteConfirmModal
│   │   ├── [Confirm] → (mock) /parties (list)
│   │   └── [Cancel] → /parties/:id/edit
│   ├── [Cancel] → /parties/:id (detail)
│   └── [Back] → /parties/:id (detail)
├── [Delete] button → DeleteConfirmModal
│   ├── [Confirm] → (mock) /parties (list)
│   └── [Cancel] → /parties/:id (detail)
└── [+ Create New Party] → /parties/new (create)
    ├── [Create Party] → (mock) shows "Not Implemented"
    ├── [Cancel] → /parties (list)
    └── [Back] → /parties (list)
```

---

## Shared Page Behaviors

### Loading States

- During mock-data fetch: Show skeleton loaders (optional polish)
- Form submission: Show loading spinner, disable buttons

### Toast Notifications (Future Enhancement)

- Form submitted successfully: "Party saved!"
- Form submit error: "Failed to save. Please try again."
- Party deleted: "Party deleted successfully."

### Responsive Breakpoints

All pages must adapt to:
- Mobile: 375px (default: single column, full-width)
- Tablet: 768px (default: two columns where appropriate)
- Desktop: 1024px+ (default: three columns where appropriate)

### Accessibility Across All Pages

- ✅ Keyboard navigation: Tab, Shift+Tab, Enter, Escape
- ✅ Focus management: Visible focus indicators
- ✅ Skip links: (Optional) Skip to main content
- ✅ ARIA labels: All interactive elements
- ✅ Semantic HTML: Proper heading hierarchy
- ✅ Color contrast: WCAG AA standard

---

## Testing Page Contracts

### Integration Tests for Each Page

**party-list.test.tsx**:
- [ ] Renders list of parties
- [ ] PartyCard components display
- [ ] Create button navigates to /parties/new
- [ ] Party card click navigates to /parties/:id
- [ ] Responsive grid layout

**party-detail.test.tsx**:
- [ ] Renders party with correct name, description
- [ ] Displays all members in grid
- [ ] Edit button navigates to /parties/:id/edit
- [ ] Delete button opens confirmation modal
- [ ] Back button navigates to /parties

**party-create.test.tsx**:
- [ ] Form displays empty fields
- [ ] Member add/remove works
- [ ] Submit button shows "Not Implemented"
- [ ] Cancel navigates back to /parties

**party-edit.test.tsx**:
- [ ] Form pre-populates with party data
- [ ] Member edit/remove works
- [ ] Submit shows "Not Implemented"
- [ ] Delete button opens confirmation modal
- [ ] Cancel navigates to /parties/:id

---

## Success Criteria for Pages

- ✅ All 4 pages render without errors
- ✅ All navigation routes work correctly
- ✅ Forms display proper validation UI
- ✅ "Not Implemented" message shows on submit
- ✅ Responsive layout verified on 3 breakpoints
- ✅ 80%+ test coverage on page logic
- ✅ All interactive elements keyboard accessible
- ✅ No TypeScript errors
- ✅ ESLint clean
