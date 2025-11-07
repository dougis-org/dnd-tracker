# Visual Design System - D&D Tracker

**Version**: 1.0.0  
**Last Updated**: 2025-11-07  
**Status**: Foundation (locked for consistency across all features)  
**Tailwind CSS**: v4 (with modern `bg-linear-to-*` gradient syntax)

## Purpose

This document defines visual design standards, component variants, color systems, and layout patterns for all D&D Tracker features (F001-F060). All features must comply with these standards to ensure visual consistency and optimal user experience.

---

## Important: Tailwind CSS v4 Syntax

This project uses **Tailwind CSS v4**, which introduced new gradient class syntax:

- **Old (v3)**: `bg-gradient-to-b from-slate-50 to-white` ❌
- **New (v4)**: `bg-linear-to-b from-slate-50 to-white` ✅

All gradient utilities use the `bg-linear-to-*` prefix. This is the correct, standard syntax for this project.

---

## 1. Color System

### 1.1 Core Palette

Based on shadcn/ui with D&D-themed extensions for game-specific semantics.

#### Primary Colors (UI Chrome)

| Name | Tailwind Class | Hex | Usage |
|------|---|---|---|
| **Primary** | `blue-600` | `#2563eb` | Main CTAs, links, active states |
| **Primary Light** | `blue-50` | `#eff6ff` | Hover backgrounds, light surfaces |
| **Primary Dark** | `blue-900` | `#1e3a8a` | Dark mode active states |

#### Semantic Colors (D&D Specific)

| Concept | Light | Dark | Tailwind | Usage |
|---------|-------|------|----------|-------|
| **Tank (Role)** | `#3b82f6` (blue-500) | `#1e40af` (blue-800) | `text-blue-500` / `bg-blue-100` | Party member role badge |
| **Healer (Role)** | `#10b981` (emerald-500) | `#065f46` (emerald-800) | `text-emerald-500` / `bg-emerald-100` | Party member role badge |
| **DPS (Role)** | `#ef4444` (red-500) | `#991b1b` (red-900) | `text-red-500` / `bg-red-100` | Party member role badge |
| **Support (Role)** | `#f59e0b` (amber-500) | `#b45309` (amber-800) | `text-amber-500` / `bg-amber-100` | Party member role badge |
| **Health (Positive)** | `#22c55e` (green-500) | `#166534` (green-800) | `text-green-500` / `bg-green-100` | HP bars, success states |
| **Damage/Warning** | `#ef4444` (red-500) | `#991b1b` (red-900) | `text-red-500` / `bg-red-100` | Low HP, critical alerts |
| **Neutral/Info** | `#6b7280` (gray-500) | `#374151` (gray-700) | `text-gray-500` / `bg-gray-100` | Secondary info, unassigned roles |

#### Status Colors

| Status | Light | Dark | Tailwind | Example |
|--------|-------|------|----------|---------|
| **Success** | `#10b981` (green-500) | `#065f46` | `text-green-500` | Form submission success |
| **Error** | `#ef4444` (red-500) | `#991b1b` | `text-red-500` | Form validation errors |
| **Warning** | `#f59e0b` (amber-500) | `#b45309` | `text-amber-500` | Usage limit warnings |
| **Info** | `#3b82f6` (blue-500) | `#1e40af` | `text-blue-500` | Informational messages |

#### Neutral Palette

| Purpose | Light | Dark | Tailwind |
|---------|-------|------|----------|
| **Background** | `#ffffff` | `#0f172a` | `bg-white` / `dark:bg-slate-950` |
| **Surface** | `#f8fafc` | `#1e293b` | `bg-slate-50` / `dark:bg-slate-900` |
| **Border** | `#e2e8f0` | `#334155` | `border-slate-200` / `dark:border-slate-700` |
| **Text Primary** | `#0f172a` | `#f1f5f9` | `text-slate-950` / `dark:text-slate-50` |
| **Text Secondary** | `#475569` | `#cbd5e1` | `text-slate-600` / `dark:text-slate-300` |

### 1.2 Role Badge Design

**Tank Badge**:

```
Background: bg-blue-100 dark:bg-blue-950
Text: text-blue-700 dark:text-blue-300
Border: border-blue-300 dark:border-blue-700
Icon: Shield (optional)
```

**Healer Badge**:

```
Background: bg-emerald-100 dark:bg-emerald-950
Text: text-emerald-700 dark:text-emerald-300
Border: border-emerald-300 dark:border-emerald-700
Icon: Cross/Wand (optional)
```

**DPS Badge**:

```
Background: bg-red-100 dark:bg-red-950
Text: text-red-700 dark:text-red-300
Border: border-red-300 dark:border-red-700
Icon: Sword (optional)
```

**Support Badge**:

```
Background: bg-amber-100 dark:bg-amber-950
Text: text-amber-700 dark:text-amber-300
Border: border-amber-300 dark:border-amber-700
Icon: Staff (optional)
```

**Unassigned Badge** (default for F006, can be optional later):

```
Background: bg-gray-100 dark:bg-gray-900
Text: text-gray-700 dark:text-gray-300
Border: border-gray-300 dark:border-gray-700
```

---

## 2. Typography

### 2.1 Font Family

- **Primary Font**: System font stack via Tailwind default

  ```css
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  ```

### 2.2 Text Hierarchy

| Level | Font Size | Line Height | Weight | Usage |
|-------|-----------|------------|--------|-------|
| **H1** | 32px / `text-4xl` | 1.125 | 700 | Page titles, feature headings |
| **H2** | 28px / `text-3xl` | 1.143 | 700 | Section headings |
| **H3** | 24px / `text-2xl` | 1.167 | 600 | Subsection headings |
| **H4** | 20px / `text-xl` | 1.2 | 600 | Component titles |
| **Body Large** | 16px / `text-base` | 1.5 | 400 | Primary text |
| **Body Regular** | 14px / `text-sm` | 1.428 | 400 | Secondary text |
| **Label** | 12px / `text-xs` | 1.333 | 600 | Form labels, badges |
| **Caption** | 11px / `text-xs` | 1.364 | 400 | Helper text, timestamps |

### 2.3 Line Heights

- **Headings**: Tighter line height (1.125-1.2) for visual hierarchy
- **Body**: Default 1.5 for readability
- **Labels**: 1.333 for compact form fields

---

## 3. Spacing System

### 3.1 Spacing Scale

Tailwind's default spacing scale (4px base unit):

| Scale | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| **0** | 0px | `p-0` | No padding/margin |
| **1** | 4px | `p-1` | Tight spacing, micro interactions |
| **2** | 8px | `p-2` | Small padding |
| **3** | 12px | `p-3` | Component internal spacing |
| **4** | 16px | `p-4` | Standard padding |
| **6** | 24px | `p-6` | Medium section padding |
| **8** | 32px | `p-8` | Large section padding |
| **12** | 48px | `p-12` | Page-level padding |

### 3.2 Common Spacing Patterns

**Card Padding**: `p-4` (16px)  
**Section Padding**: `p-6` (24px)  
**Page Padding**: `p-8` (32px)  
**Grid Gap**: `gap-4` (16px) for cards, `gap-6` (24px) for sections

---

## 4. Layout & Responsive Design

### 4.1 Breakpoints

| Breakpoint | Width | Tailwind | Usage |
|-----------|-------|----------|-------|
| **Mobile** | 320px - 640px | `sm:` | Phone screens |
| **Tablet** | 641px - 1024px | `md:` / `lg:` | Tablet, small desktops |
| **Desktop** | 1025px+ | `xl:` / `2xl:` | Full desktop, wide screens |

### 4.2 Grid Systems

#### Party List / Entity Lists (1-3 Columns)

**Mobile (≤640px)**:

```
1 column layout
grid-cols-1
Width: 100% - 2×padding
```

**Tablet (641px - 1024px)**:

```
2 column layout
grid-cols-2
Gap: 1rem (16px)
```

**Desktop (≥1025px)**:

```
3 column layout
grid-cols-3
Gap: 1rem (16px)
```

#### Standard Responsive Grid (4-6 Columns)

**Mobile**: 1 column (`grid-cols-1`)  
**Tablet**: 2 columns (`grid-cols-2`)  
**Desktop**: 3-4 columns (`grid-cols-3` / `grid-cols-4`)

### 4.3 Container Widths

| Context | Max Width | Tailwind | Usage |
|---------|-----------|----------|-------|
| **Content (lists)** | 1280px | `max-w-7xl` | Party lists, encounter lists |
| **Modal/Form** | 640px | `max-w-2xl` | Delete confirmation, create forms |
| **Page Width** | 1400px | custom | Full-width pages with padding |

---

## 5. Component Patterns

### 5.1 Cards

**Base Card**:

```tsx
// Tailwind classes
className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-shadow"
```

**Card Sizes**:

- **Compact**: `p-3` (party list cards)
- **Regular**: `p-4` (member cards, default)
- **Large**: `p-6` (detail pages)

**Border Radius**: `rounded-lg` (8px) for all cards

### 5.2 Buttons

**Primary Button**:

```tsx
className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
```

**Secondary Button**:

```tsx
className="px-4 py-2 bg-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600 transition-colors"
```

**Danger Button** (Delete):

```tsx
className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
```

**Button Sizes**:

- **Small**: `px-3 py-1 text-sm`
- **Regular**: `px-4 py-2 text-base` (default)
- **Large**: `px-6 py-3 text-lg`

### 5.3 HP/AC Visualization

#### HP Bar

**Full HP (≥75%)**:

```tsx
className="h-2 bg-green-500 rounded-full"
```

**Damaged (50-74%)**:

```tsx
className="h-2 bg-amber-500 rounded-full"
```

**Critical (<50%)**:

```tsx
className="h-2 bg-red-500 rounded-full"
```

**Bar Container**:

```tsx
className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
```

**Example with numeric label**:

```tsx
<div className="w-full">
  <div className="flex justify-between items-center mb-1">
    <label className="text-xs font-medium">HP</label>
    <span className="text-xs text-slate-600 dark:text-slate-400">38/50</span>
  </div>
  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
    <div className="h-2 bg-amber-500 rounded-full" style={{width: '76%'}}></div>
  </div>
</div>
```

#### AC Display

Simple numeric display with optional background:

```tsx
className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono font-bold text-sm"
// Content: "AC 18"
```

### 5.4 Role Selectors (Dropdowns)

**Select Component**:

```tsx
className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
```

**Option Styling**:

- Each option displays role name with color swatch
- Example: `[●] Tank` (● colored per role)

### 5.5 Forms & Input Fields

**Form Field Container**:

```tsx
className="mb-4"
```

**Label**:

```tsx
className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
```

**Input/Textarea**:

```tsx
className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
```

**Error State**:

```tsx
className="border-red-500 focus:ring-red-500"
```

**Error Message**:

```tsx
className="mt-1 text-xs text-red-600 dark:text-red-400"
```

### 5.6 Modals & Dialogs

**Modal Overlay**:

```tsx
className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
```

**Modal Content**:

```tsx
className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
```

**Modal Header**:

```tsx
className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4"
```

**Modal Footer** (button group):

```tsx
className="flex gap-3 justify-end mt-6"
```

---

## 6. Landing Page & Marketing UI

Landing page components showcase D&D Tracker features to potential users. These follow the core design system with marketing-specific patterns.

### 6.1 Hero Section

**Hero Component Layout**:

```
Hero Section (Full Width)
├─ Background: bg-linear-to-b from-slate-50 to-white
├─ Content Column (Mobile: Full, MD+: 50%)
│  ├─ H1 Headline: text-4xl md:text-5xl font-bold text-slate-900
│  ├─ Subheading: text-lg md:text-xl text-slate-600
│  └─ CTA Button: Primary button (see 5.2)
└─ Image Column (Hidden Mobile, MD+: 50%)
   └─ Image: rounded-lg shadow-lg
```

**Tailwind Classes**:

```tsx
<section className="w-full py-12 md:py-24 bg-linear-to-b from-slate-50 to-white">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    {/* Content */}
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        {headline}
      </h1>
      <p className="text-lg md:text-xl text-slate-600 mb-8">
        {subhead}
      </p>
      <Link className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
        {ctaText}
      </Link>
    </div>
    {/* Image */}
    <div className="hidden md:flex justify-center">
      <Image src={imageUrl} alt={imageAlt} className="rounded-lg shadow-lg" />
    </div>
  </div>
</section>
```

**Responsive Behavior**:

- Mobile: Single column, full-width text
- MD+: Two-column with image on right
- Text remains left-aligned, image centered

### 6.2 Feature Showcase Section

**Feature Grid Layout**:

```
Features Section (White Background)
├─ Section Title: text-3xl md:text-4xl font-bold text-center
├─ Subtitle: text-lg text-slate-600 text-center
└─ Grid (1 col mobile, 2 cols tablet, 3 cols desktop)
   └─ FeatureCard (repeating)
      ├─ Icon: 8x8px, text-blue-600
      ├─ Title: text-xl font-semibold
      └─ Description: text-slate-600
```

**FeatureCard Styling**:

```tsx
className="p-6 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white"
```

**Responsive Grid**:

- Mobile: `grid-cols-1`
- Tablet: `grid-cols-2`
- Desktop: `grid-cols-3`
- Gap: `gap-8` (32px)

### 6.3 Testimonials Section

**Section Layout**:

```
Testimonials Section (Slate-50 Background)
├─ Section Title: text-3xl md:text-4xl font-bold
├─ Subtitle: text-lg text-slate-600
└─ Grid (1 col mobile, 2 cols desktop)
   └─ TestimonialCard (repeating)
      ├─ Star Rating: yellow-400 (★)
      ├─ Quote Text: text-slate-700
      ├─ Author Name: font-semibold text-slate-900
      └─ Author Title: text-sm text-slate-600 (optional)
```

**TestimonialCard Styling**:

```tsx
className="p-6 bg-white rounded-lg shadow-sm border border-slate-200"
```

**Background**: `bg-slate-50` for section contrast

### 6.4 Interactive Demo Section

**Section Layout**:

```
Interactive Demo Section (White Background)
├─ Section Title: text-3xl md:text-4xl font-bold text-center
├─ Subtitle: text-lg text-slate-600 text-center
├─ Toggle Buttons (Horizontal Center)
│  ├─ Active Button: bg-blue-600 text-white
│  └─ Inactive Button: bg-slate-200 text-slate-900 hover:bg-slate-300
└─ Demo Container: bg-slate-50, rounded-lg, p-8 md:p-12, border-slate-200
   └─ Demo Content (toggles based on button state)
```

**Button Styling**:

```tsx
// Active
className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg transition-colors"

// Inactive
className="px-6 py-2 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
```

**Demo Container**:

```tsx
className="bg-slate-50 rounded-lg p-8 md:p-12 border border-slate-200"
```

### 6.5 Pricing Section

**Section Layout**:

```
Pricing Section (White Background)
├─ Section Title: text-3xl md:text-4xl font-bold text-center
├─ Subtitle: text-lg text-slate-600 text-center
└─ Grid (1 col mobile, 2 cols tablet, 3 cols desktop)
   └─ PricingCard (repeating)
      ├─ Plan Name: text-2xl font-bold text-slate-900
      ├─ Price: text-3xl font-bold text-blue-600
      ├─ Features List: text-slate-700 with ✓ checkmark (text-blue-600)
      └─ CTA Button: Primary button (width: 100%)
```

**PricingCard Styling**:

```tsx
className="p-8 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
```

**Feature List Item**:

```tsx
className="text-slate-700 flex items-center gap-2"
// With checkmark: <span className="text-blue-600">✓</span>
```

### 6.6 Call-to-Action (Final CTA)

**CTA Section Layout**:

```
Final CTA Section (Dark Gradient Background)
├─ Background: bg-linear-to-b from-slate-900 to-slate-800
├─ Content (Center Aligned)
│  ├─ Headline: text-3xl md:text-4xl font-bold text-white
│  ├─ Subheading: text-xl text-slate-300
│  └─ CTA Group: Flex gap-4
│     ├─ Primary: Primary button with white text
│     └─ Secondary: Secondary/link button
```

**Background Gradient**:

```tsx
className="bg-linear-to-b from-slate-900 to-slate-800"
```

**Text Colors**:

- Headline: `text-white`
- Subheading: `text-slate-300`

**Button Styling** (in dark context):

```tsx
// Primary (over dark background)
className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"

// Secondary (text/link style)
className="px-8 py-3 border border-slate-400 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
```

---

## 7. Party Management UI (F006 Specific)

### 6.1 Party Card Layout

**Default Party Card** (list view):

```
┌─────────────────────────┐
│ The Grovewalkers        │
├─────────────────────────┤
│ 4 Members               │
│ Roles: 1 ■ 1 ■ 2 ■     │  (role badges)
│ Levels: 4-5             │
└─────────────────────────┘
```

**Compact Layout**:

- Card width: responsive (1-3 columns based on screen)
- Padding: `p-4`
- Title: `text-lg font-bold`
- Subtitle: `text-sm text-slate-600`
- Role badges: inline horizontal layout

### 6.2 Member Card Layout

**Member Card** (detail/edit view):

```
┌──────────────────────────────┐
│ Theron                       │
│ Human Paladin, Level 5       │
├──────────────────────────────┤
│ AC: 18  |  HP: 45/52         │
│                              │
│ Role: [Tank ▼]              │  (dropdown)
└──────────────────────────────┘
```

**Component Layout**:

- Header: Character name + class/race/level
- Stats row: AC | HP (visual bar with numeric)
- Role selector: Dropdown with colored options
- Optional remove button (edit view)

### 6.3 Party Composition Summary

**Summary Section** (top of detail page):

```
┌─────────────────────────────────┐
│ Party: The Grovewalkers         │
│ Members: 4  |  Avg Level: 4.75  │
├─────────────────────────────────┤
│ Roles:                          │
│  Tank (1) ■     DPS (2) ■ ■    │
│  Healer (1) ■   Support (0)    │
│                                 │
│ Level Range: 4 - 5             │
└─────────────────────────────────┘
```

**Responsive Variant** (mobile):

- Stack role counts vertically
- Abbreviate to "Avg Lvl: 4.8"
- Single-line layout if space constrained

---

## 7. Dark Mode

### 7.1 Implementation

All colors support light/dark mode via Tailwind's `dark:` prefix.

**Example**:

```tsx
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
```

### 7.2 Role Badges (Dark Mode)

**Tank (Dark)**:

- Background: `dark:bg-blue-950`
- Text: `dark:text-blue-300`
- Border: `dark:border-blue-700`

(Same pattern for Healer, DPS, Support - use 950/800 for dark backgrounds, 300/400 for text)

---

## 8. Accessibility Standards

### 8.1 Color Contrast

All text/background combinations meet WCAG AA (4.5:1 for body text, 3:1 for large text).

### 8.2 Focus States

All interactive elements have visible focus outline:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
```

### 8.3 Semantic HTML

- Use `<button>` for buttons, `<a>` for links
- Form labels: `<label htmlFor="fieldId">`
- Sections: `<section>`, `<article>`, `<nav>` as appropriate
- Headings: Proper hierarchy (h1 → h2 → h3)

### 8.4 ARIA Labels

- Buttons without text: `aria-label="Delete"`
- Icon-only controls: `aria-label="Add member"`
- Loading states: `aria-busy="true"`

---

## 9. Motion & Transitions

### 9.1 Timing

- **Hover states**: 150-200ms (`transition-all duration-200`)
- **Modal/Fade**: 300ms (`transition-opacity duration-300`)
- **List animations**: 300-500ms for staggered entries (use CSS animation)

### 9.2 Easing

- **Default**: `ease-in-out`
- **UI feedback**: `ease-out`
- **Dismissal**: `ease-in`

### 9.3 Hover Effects

**Card Hover**:

```tsx
className="hover:shadow-lg hover:border-blue-300 transition-all duration-200"
```

**Button Hover** (already defined in component patterns)

---

## 10. Application to Upcoming Features (F007-F060)

### 10.1 Entity Management (F007, F023, F026)

Apply same card layout pattern:

- List view: 1-3 column grid
- Detail view: same member card pattern for monsters/items
- Composition summaries for creatures (CR, abilities, etc.)

### 10.2 Encounter & Combat (F008, F009)

- Initiative list: use same role badge + color system
- HP tracking: same visual bar pattern
- Status effects: use role/semantic colors for effect types
- Lair actions: prominent alert styling (amber/warning color)

### 10.3 User Management (F010, F015, F017)

- Profile cards: apply same card pattern
- Form fields: use consistent input styling
- Preference selectors: apply role badge styling to preference options

### 10.4 All Future Features

**Mandatory consistency**:

1. Use Tailwind classes from this document
2. Apply color system for semantic meaning
3. Maintain spacing scale and typography hierarchy
4. Support dark mode for all components
5. Follow accessibility standards (WCAG AA)

---

## 11. Implementation Guidelines

### 11.1 Creating New Components

1. Check this document for existing patterns
2. Reuse card, button, form patterns
3. Apply color system for semantic meaning
4. Test in light + dark modes
5. Verify focus/hover/active states
6. Add ARIA labels as needed

### 11.2 Component Variants

Document significant variants (e.g., MemberCard with/without remove button):

```tsx
type MemberCardProps = {
  character: Character;
  role: Role;
  canRemove?: boolean;
  onRemove?: () => void;
};
```

### 11.3 Testing Against Design System

- [ ] Colors match table (light/dark)
- [ ] Typography matches hierarchy
- [ ] Spacing uses defined scale
- [ ] Responsive breakpoints working
- [ ] Dark mode visually correct
- [ ] Accessibility (focus, contrast, semantic HTML)
- [ ] Motion smooth and purposeful

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-07 | Foundation: Color system, typography, spacing, D&D role badges, party UI patterns |

---

## Appendix: Color Reference Card

**Quick Reference** (copy-paste ready):

```tsx
// Roles
const ROLE_COLORS = {
  tank: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  healer: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
  dps: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  support: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
};

// HP Status
const HP_STATUS = {
  healthy: 'bg-green-500',     // ≥75%
  damaged: 'bg-amber-500',      // 50-74%
  critical: 'bg-red-500',       // <50%
};
```

---

**End of Document**

All features must reference this document and maintain visual consistency per these standards. Updates to this design system require documentation and version bump for traceability.
