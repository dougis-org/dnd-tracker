# Component Contracts: Party Management Pages

**Feature**: Party Management Pages (F006)  
**Date**: 2025-11-06  
**Status**: Phase 1 Design

## Contract Overview

This document defines the interface contracts for all reusable components in Party Management feature. Each component specifies:

- Props interface with types
- Required vs. optional props
- Expected behavior
- Styling approach
- Test coverage requirements

---

## PartyCard Component

**Location**: `src/components/parties/PartyCard.tsx`  
**Purpose**: Displays party summary as a clickable card on party list page  
**Context**: Party list page (`/parties`)

### Props Contract

```typescript
interface PartyCardProps {
  party: Party;
  onClick?: (partyId: string) => void;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| party | Party | Yes | Full Party entity data |
| onClick | function | No | Callback when card clicked; receives partyId |

### Behavior Specification

- **Rendering**: Display party name, description (truncated to 2 lines), and composition summary
- **Composition Summary**: Show role distribution as icons/counts (e.g., "🛡️ 1 Tank • 🩹 1 Healer • ⚔️ 2 DPS")
- **Member Preview**: Show member count and average level (e.g., "4 members • Avg Level 4.75")
- **Styling**:
  - Border: light gray, rounded corners, subtle shadow
  - Hover state: shadow increase, slight scale up (transform: scale(1.02))
  - Dark mode: border and text colors adjust via Tailwind dark mode
- **Click Behavior**: If onClick provided, invoke it on card click
- **Accessibility**:
  - Use semantic HTML (button or link)
  - Add aria-label with party name
  - Keyboard navigation support

### Test Coverage

- Unit test: Component renders with mock party data
- Unit test: Role composition displays correctly
- Unit test: Click handler called with correct partyId
- Unit test: Responsive sizing works on mobile/desktop
- Integration: Link navigates to correct party detail page

---

## PartyDetail Component

**Location**: `src/components/parties/PartyDetail.tsx`  
**Purpose**: Reusable display for party information and member list  
**Context**: Party detail page (`/parties/:id`), Party edit form context

### Props Contract

```typescript
interface PartyDetailProps {
  party: Party;
  variant?: 'view' | 'edit';
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| party | Party | Yes | Full Party entity to display |
| variant | 'view' \| 'edit' | No | Display mode; 'view' hides action buttons, 'edit' shows them |
| onEditClick | function | No | Callback when Edit button clicked |
| onDeleteClick | function | No | Callback when Delete button clicked |

### Behavior Specification

- **Header Section**:
  - Party name (large heading)
  - Campaign setting (subtitle)
  - Description (paragraph)
- **Composition Summary**:
  - Card with stats: Member count, average level, party tier
  - Role distribution as visual chart (4 bars for Tank/Healer/DPS/Support)
- **Member List**:
  - Use MemberCard component with 'detail' variant
  - Render all members in a grid or list layout
  - Sort by role (Tank → Healer → DPS → Support)
- **Action Buttons** (if variant='edit'):
  - "Edit" button → calls onEditClick
  - "Delete" button → calls onDeleteClick
- **Styling**:
  - Full-width layout with max-width constraint (1000px)
  - Member cards arranged in responsive grid (1-2 columns)
  - Consistent spacing via Tailwind gap utilities

### Test Coverage

- Unit test: Renders party name, description, and composition
- Unit test: MemberCard components render for each member
- Unit test: Member list sorted by role
- Unit test: Edit/Delete buttons shown only when variant='edit'
- Unit test: Click handlers called correctly
- Integration: Part of detail page integration test

---

## PartyForm Component

**Location**: `src/components/parties/PartyForm.tsx`  
**Purpose**: Reusable form for creating and editing parties  
**Context**: Create page (`/parties/new`), Edit page (`/parties/:id/edit`)

### Props Contract

```typescript
interface PartyFormProps {
  initialData?: Party;
  mode: 'create' | 'edit';
  onSubmit: (data: PartyFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface PartyFormData {
  name: string;
  description: string;
  campaignSetting: string;
  members: PartyMember[];
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| initialData | Party | No | Pre-populate form for edit mode; omit for create |
| mode | 'create' \| 'edit' | Yes | Determines form heading and submit button text |
| onSubmit | function | Yes | Called with PartyFormData on form submission |
| onCancel | function | No | Called when Cancel button clicked |
| isLoading | boolean | No | Disables form during submission |

### Behavior Specification

- **Form Fields**:
  - Party name (text input, required, max 100 chars)
  - Description (textarea, optional, max 500 chars)
  - Campaign setting (text input, optional, max 200 chars)
- **Member Management Section**:
  - Display current members (if edit mode) using MemberCard with 'edit' variant
  - "Add Member" button to show MemberForm component
  - Support removing members (via MemberCard delete callback)
  - Validate minimum 1 member
- **Form Buttons**:
  - Submit button: Label "Create Party" (mode=create) or "Save Changes" (mode=edit)
  - Cancel button: Calls onCancel if provided
  - Submit disabled if: form invalid or isLoading=true
- **Validation**:
  - Name: required, 1-100 characters
  - Members: minimum 1 required
  - Real-time validation feedback via field errors
  - Show "Not Implemented" message on submission (mock-only feature)
- **Styling**:
  - Use shadcn/ui Form components for consistency
  - Stack fields vertically with consistent spacing
  - Responsive: full-width on mobile, constrained width on desktop

### Test Coverage

- Unit test: Form renders with all fields
- Unit test: Form pre-populates in edit mode
- Unit test: Validation errors display for invalid input
- Unit test: onSubmit called with correct data
- Unit test: Member add/remove functionality
- Integration: Full form submission flow on create/edit pages

---

## MemberCard Component

**Location**: `src/components/parties/MemberCard.tsx`  
**Purpose**: Displays individual party member information in various contexts  
**Context**: PartyDetail, PartyForm member list, edit mode

### Props Contract

```typescript
interface MemberCardProps {
  member: PartyMember;
  variant?: 'detail' | 'edit' | 'preview';
  onRemove?: (memberId: string) => void;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| member | PartyMember | Yes | PartyMember entity to display |
| variant | 'detail' \| 'edit' \| 'preview' | No | Display variant; default 'detail' |
| onRemove | function | No | Called when Remove button clicked (edit variant only) |

### Behavior Specification

- **Always Shown**:
  - Member name (heading)
  - Class and race (e.g., "Paladin • Half-Orc")
  - Level (e.g., "Level 5")
  - Role badge with color coding
- **Detail/Edit Variants** (additional):
  - AC and HP with visual HP bar
  - Stats displayed in grid format
- **Edit Variant** (additional):
  - "Remove" button below stats
  - Edit button (if needed)
- **Preview Variant** (minimal):
  - Name, class, level only
  - Compact layout for space efficiency
- **Styling**:
  - Bordered card with rounded corners
  - Role-based color for left border accent
  - Responsive padding and spacing
  - Hover effect: subtle shadow increase

### Test Coverage

- Unit test: Renders member info correctly
- Unit test: Different variants display expected content
- Unit test: Role badge displays correct color
- Unit test: HP bar renders correctly
- Unit test: Remove button calls onRemove with memberId
- Unit test: Responsive layout works

---

## MemberForm Component

**Location**: `src/components/parties/MemberForm.tsx`  
**Purpose**: Form for adding/editing individual party members  
**Context**: PartyForm member management section

### Props Contract

```typescript
interface MemberFormProps {
  onSubmit: (memberData: PartyMember) => void;
  onCancel: () => void;
  initialData?: PartyMember;
  isEditing?: boolean;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onSubmit | function | Yes | Called with member data on form submission |
| onCancel | function | Yes | Called when Cancel button clicked |
| initialData | PartyMember | No | Pre-populate for editing existing member |
| isEditing | boolean | No | If true, changes button labels to "Update" |

### Behavior Specification

- **Form Fields**:
  - Character name (text input, required)
  - Class dropdown (required, D&D 5e classes)
  - Race dropdown (required, D&D 5e races)
  - Level (number input, 1-20, required)
  - AC (number input, 1-30, required)
  - HP (number input, positive, required)
  - Role selector (optional, dropdown with Tank/Healer/DPS/Support)
- **Validation**:
  - All required fields must have values
  - Level must be 1-20
  - AC must be 1-30
  - HP must be positive
- **Buttons**:
  - Submit button: "Add Member" (mode=add) or "Update Member" (mode=edit)
  - Cancel button: Calls onCancel
- **Styling**:
  - Inline form or modal dialog
  - Consistent with PartyForm styling

### Test Coverage

- Unit test: Form renders all fields
- Unit test: Form validation works correctly
- Unit test: onSubmit called with correct data
- Unit test: Pre-population works in edit mode
- Unit test: Class/race dropdowns have all options

---

## RoleSelector Component

**Location**: `src/components/parties/RoleSelector.tsx`  
**Purpose**: Dropdown selector for party member roles  
**Context**: MemberForm, MemberCard (edit variant)

### Props Contract

```typescript
interface RoleSelectorProps {
  value?: PartyRole;
  onChange?: (role: PartyRole) => void;
  label?: string;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | PartyRole \| undefined | No | Currently selected role |
| onChange | function | No | Called when role selection changes |
| label | string | No | Form field label |

### Behavior Specification

- **Options**:
  - Tank (blue) - "Primary melee defender"
  - Healer (green) - "Support and healing"
  - DPS (red) - "High damage output"
  - Support (purple) - "Control and utility"
  - Unassigned (gray) - "Role not assigned"
- **Display**:
  - Each option shows color swatch, role name, and description
  - Current selection highlighted
  - Icon representation of role
- **Accessibility**:
  - Uses native select or accessible dropdown (Radix UI)
  - Keyboard navigation support
  - aria-label on button/select

### Test Coverage

- Unit test: All role options render
- Unit test: onChange called with correct role
- Unit test: Value prop sets selected option
- Unit test: Keyboard navigation works

---

## DeleteConfirmModal Component

**Location**: `src/components/parties/DeleteConfirmModal.tsx`  
**Purpose**: Confirmation dialog for party deletion  
**Context**: Party detail/edit pages when delete action triggered

### Props Contract

```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean;
  partyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Control modal open/closed state |
| partyName | string | Yes | Name of party being deleted (for confirmation message) |
| onConfirm | function | Yes | Called when user confirms deletion |
| onCancel | function | Yes | Called when user cancels |
| isLoading | boolean | No | Disable buttons during deletion |

### Behavior Specification

- **Content**:
  - Heading: "Delete Party?"
  - Message: "Are you sure you want to delete '{partyName}'? This action cannot be undone."
  - Warning icon or styling
- **Buttons**:
  - "Cancel" button (secondary style, calls onCancel)
  - "Delete" button (destructive style, calls onConfirm, disabled if isLoading)
- **Modal Features**:
  - Centered on screen
  - Escape key closes modal (calls onCancel)
  - Focus trap within modal
  - Backdrop click closes (calls onCancel)
- **Accessibility**:
  - Proper ARIA labels
  - Role="dialog"
  - Focus management

### Test Coverage

- Unit test: Modal displays when isOpen=true
- Unit test: Modal hidden when isOpen=false
- Unit test: Buttons call correct callbacks
- Unit test: Escape key closes modal
- Unit test: Focus trap works

---

## PartyCompositionSummary Component

**Location**: `src/components/parties/PartyCompositionSummary.tsx`  
**Purpose**: Displays party stats and role composition visually  
**Context**: Party detail page, party list card summary

### Props Contract

```typescript
interface PartyCompositionSummaryProps {
  party: Party;
  compact?: boolean;
}
```

### Detailed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| party | Party | Yes | Party entity with members |
| compact | boolean | No | If true, show minimal summary; if false, detailed |

### Behavior Specification

- **Stats Display**:
  - Member count
  - Average level
  - Party tier (Beginner/Intermediate/Advanced/Expert based on level)
  - Level range (e.g., "4-5")
- **Role Composition**:
  - Visual bars for each role (Tank/Healer/DPS/Support)
  - Count for each role
  - Color-coded bars matching role colors
- **Compact vs. Full**:
  - Compact: Single line with icons and counts
  - Full: Cards or grid with detailed breakdown
- **Styling**:
  - Consistent color scheme with roles
  - Responsive layout

### Test Coverage

- Unit test: Stats calculated correctly
- Unit test: Role distribution accurate
- Unit test: Compact/full layouts render differently
- Unit test: Party tier determined correctly

---

## Summary Table

| Component | Location | Reused In | Props | Complexity |
|-----------|----------|-----------|-------|-----------|
| PartyCard | parties/ | Party List | 2 | Low |
| PartyDetail | parties/ | Detail/Edit pages | 4 | Medium |
| PartyForm | parties/ | Create/Edit pages | 5 | High |
| MemberCard | parties/ | Detail/Edit/List | 3 | Medium |
| MemberForm | parties/ | PartyForm | 4 | Medium |
| RoleSelector | parties/ | MemberForm | 3 | Low |
| DeleteConfirmModal | parties/ | Detail page | 5 | Low |
| PartyCompositionSummary | parties/ | Detail/Card | 2 | Medium |

**Total Components**: 8  
**Total Estimated LOC**: ~800-1000 lines (averaging 100-125 per component)  
**All files fit within 450-line limit**: ✅
