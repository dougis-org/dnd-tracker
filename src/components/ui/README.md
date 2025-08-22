# UI Components

This directory contains reusable UI components built with shadcn/ui and Tailwind
CSS. These components provide a consistent design system for the D&D Combat
Tracker application.

## Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🎲</Button>

// States
<Button disabled>Disabled</Button>

// Custom styling
<Button className="w-full">Full width</Button>
```

**Props:**

- `variant`: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `asChild`: boolean - Renders as child component (requires @radix-ui/react-slot)
- All standard button HTML attributes

### Card

A card container component with optional header, content, and footer sections.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Card description goes here
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter className="justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Continue</Button>
  </CardFooter>
</Card>
```

**Components:**

- `Card`: Main container
- `CardHeader`: Header section with padding
- `CardTitle`: Styled title element
- `CardDescription`: Muted description text
- `CardContent`: Main content area
- `CardFooter`: Footer section with flex layout

### Input

A styled input component supporting various input types.

```tsx
import { Input } from "@/components/ui/input"

// Basic usage
<Input placeholder="Enter text" />

// Different types
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Level" min="1" max="20" />

// States
<Input disabled placeholder="Disabled input" />
<Input required placeholder="Required field" />

// Custom styling
<Input className="max-w-sm" />
```

**Props:**

- All standard input HTML attributes
- `type`: Standard HTML input types
- `className`: Additional CSS classes

## Design System

### Colors

The components use CSS custom properties for theming:

- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary brand color
- `--secondary`: Secondary color
- `--muted`: Muted text and backgrounds
- `--accent`: Accent color for highlights
- `--destructive`: Error/danger color
- `--border`: Border color
- `--input`: Input field background
- `--ring`: Focus ring color

### Dark Mode

Dark mode is supported through the `dark` class on the html element. All
components automatically adapt to the current theme.

### Customization

Components can be customized by:

1. **CSS Variables**: Modify the color tokens in `globals.css`
2. **Tailwind Config**: Extend the theme in `tailwind.config.ts`
3. **Component Props**: Use `className` prop to add custom styles
4. **Variants**: Extend component variants using class-variance-authority

## Development

### Adding New Components

1. Create the component in `src/components/ui/`
2. Export it from `src/components/ui/index.ts`
3. Add comprehensive tests in `__tests__/`
4. Document usage in this README

### Testing

All components have comprehensive test coverage:

```bash
npm test -- --testPathPatterns="ui/__tests__"
```

### Quality Checks

Run these commands after making changes:

```bash
npm run lint:fix
npm run test:ci
```

## Dependencies

- **@radix-ui/react-slot**: Polymorphic component support
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging
- **lucide-react**: Icon library (available for use)

## Examples

See the main page (`src/app/page.tsx`) for live examples of all components in use.
