# 80s Retro Office Design Tokens Reference

Quick reference guide for developers using the retro office design system.

---

## Color Palette

### Primary Colors (HSL format in CSS vars)

```css
/* Wood Tones */
--color-wood-dark: 25 35% 25%        /* #4a3a2a - Dark walnut */
--color-wood-medium: 28 42% 48%      /* #926b47 - Medium oak */
--color-wood-light: 35 55% 68%       /* #d4b896 - Light wood */

/* Amber (CRT Glow) */
--color-amber-glow: 38 92% 58%       /* #f5a623 - Bright amber */
--color-amber-dim: 38 72% 45%        /* #c78419 - Dimmed amber */

/* Neutrals */
--color-cream: 42 28% 88%            /* #eae4d8 - Aged paper */
--color-tan: 36 38% 72%              /* #d4c4a8 - Shag carpet */
--color-charcoal: 0 0% 18%           /* #2e2e2e - Dark text */
--color-smoke: 30 8% 25%             /* #433f3a - Muted text */

/* Accents */
--color-burnt-orange: 18 78% 52%     /* #ea5b0c - Phone buttons */
--color-olive: 82 28% 45%            /* #6b8e23 - Vintage green */
```

### Usage in Tailwind

```tsx
// Background colors
className="bg-cream"
className="bg-wood-medium"
className="bg-amber-glow"

// Text colors
className="text-charcoal"
className="text-smoke"
className="text-cream"

// Border colors
className="border-wood-light"
className="border-amber-glow"
```

---

## Typography

### Font Families

```css
/* Headings - Typewriter aesthetic */
font-family: var(--font-heading)  /* Courier Prime */
Tailwind: font-heading

/* Body - Technical manual */
font-family: var(--font-body)     /* IBM Plex Mono */
Tailwind: font-body
```

### Usage Examples

```tsx
// Headings (automatic)
<h1 className="text-3xl font-bold">DASHBOARD</h1>

// Body text (automatic)
<p>Regular body text</p>

// Force heading font
<span className="font-heading">Typewriter Style</span>

// Force body font
<span className="font-body">Monospace Style</span>
```

---

## Texture Utilities

### Available Textures

```css
.texture-wood         /* Wood grain with vertical lines */
.texture-shag         /* Shag carpet dot pattern */
.texture-paper        /* Paper with noise overlay */
.effect-scanlines     /* CRT scanline overlay */
```

### Shadow & Effect Utilities

```css
.glow-amber           /* Amber glow box shadow */
.text-embossed        /* Embossed text shadow */
.border-beveled       /* Beveled inset shadow */
.card-paper           /* Paper card with shadow + border */
.grain-overlay        /* Film grain overlay (pseudo-element) */
```

### Rotation Utilities

```css
.rotate-slight-left   /* -0.5deg rotation */
.rotate-slight-right  /* 0.5deg rotation */
```

### Usage Examples

```tsx
// Wood panel container
<div className="texture-wood p-6 border-4 border-wood-dark">
  <h2 className="text-cream text-embossed">Header</h2>
</div>

// Paper card
<div className="texture-paper card-paper p-4 rounded">
  <p>Card content</p>
</div>

// Shag carpet background
<div className="texture-shag min-h-screen">
  Page content
</div>

// Amber glow button effect
<button className="glow-amber bg-amber-glow">
  Click Me
</button>
```

---

## Component Patterns

### Button Variants

```tsx
// Amber glow primary action
<Button variant="default">Connect</Button>

// Wood panel secondary action
<Button variant="secondary">Cancel</Button>

// Burnt orange outline
<Button variant="outline">Edit</Button>

// Subtle ghost
<Button variant="ghost">Delete</Button>
```

### Input Styles

```tsx
// Index card input (automatic styling)
<Input placeholder="Enter name..." />

// With label (label maker aesthetic)
<Label>Account Name</Label>
<Input />
```

### Tab Patterns

```tsx
// File folder tabs
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">
      <FileIcon className="w-4 h-4 mr-2" />
      Documents
    </TabsTrigger>
    <TabsTrigger value="tab2">Messages</TabsTrigger>
  </TabsList>

  <TabsContent value="tab1" className="texture-paper card-paper p-6">
    Content here
  </TabsContent>
</Tabs>
```

### Badge Patterns

```tsx
// Sticky note badges
<Badge variant="default">New</Badge>      {/* Amber */}
<Badge variant="secondary">Draft</Badge>   {/* Tan */}
<Badge variant="success">Active</Badge>    {/* Olive */}
<Badge variant="outline">Pending</Badge>   {/* Outlined */}
```

### Card Patterns

```tsx
// Paper card with header
<Card className="rotate-slight-right">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Dialog Patterns

```tsx
// Paper texture modal
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>DIALOG TITLE</DialogTitle>
      <DialogDescription>
        Description text in body font
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

---

## Layout Patterns

### Page Background Options

```tsx
// Wood paneling (landing page)
<main className="min-h-screen texture-wood grain-overlay">

// Shag carpet (dashboard)
<main className="min-h-screen texture-shag grain-overlay">

// Cream paper (content areas)
<main className="min-h-screen bg-cream texture-paper">
```

### Header Panel (Wood Banner)

```tsx
<div className="texture-wood border-4 border-wood-dark p-6 shadow-xl rounded">
  <h1 className="font-heading text-cream text-embossed">
    HEADER TEXT
  </h1>
  <p className="font-body text-cream/80 text-sm">
    Subtitle or description
  </p>
</div>
```

### Content Container

```tsx
<div className="bg-cream texture-paper card-paper p-6 rounded">
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>
```

---

## Animation Classes

### Built-in Animations

```tsx
// Amber glow pulse
className="animate-pulse-glow"

// File card slide in
className="animate-file-card-in"

// File card slide out
className="animate-file-card-out"

// Rotating dial (loading)
className="animate-rotate-dial"
```

### Transition Classes

```tsx
// Standard transition
className="transition-all duration-200"

// Hover lift effect
className="hover:-translate-y-0.5 hover:shadow-xl transition-all"

// Active press effect
className="active:translate-y-0 active:shadow-md"
```

---

## Icon Recommendations

### Retro Icon Style Guide

For custom icons, use these characteristics:
- Stroke width: 2px
- Simple geometric shapes
- Mechanical/industrial aesthetic
- Avoid gradients and modern flourishes

### Common Icon Patterns

```tsx
// Filing cabinet
<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
  <rect x="3" y="8" width="18" height="12" rx="1"/>
  <path d="M6 8V5c0-1 1-2 2-2h8c1 0 2 1 2 2v3"/>
</svg>

// Rotary phone
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <circle cx="12" cy="12" r="10"/>
  <circle cx="12" cy="12" r="3" fill="currentColor"/>
  {/* Add dial holes */}
</svg>

// Index card
<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
  <rect x="3" y="5" width="18" height="14" rx="1"/>
  <line x1="6" y1="9" x2="18" y2="9"/>
  <line x1="6" y1="13" x2="15" y2="13"/>
</svg>
```

---

## Responsive Design

All retro design elements are responsive:

```tsx
// Mobile-first approach maintained
className="p-4 md:p-6 lg:p-8"

// Text scaling
className="text-xl sm:text-2xl lg:text-3xl"

// Layout adjustments
className="flex flex-col md:flex-row gap-4"
```

---

## Accessibility Notes

### Color Contrast

All color combinations meet WCAG AA standards:
- ✅ Charcoal on Cream (dark text on light bg)
- ✅ Cream on Wood-Medium (light text on dark bg)
- ✅ Amber text has sufficient contrast

### Focus States

All interactive elements have visible focus:
```css
focus-visible:ring-2 focus-visible:ring-amber-glow focus-visible:ring-offset-2
```

### Motion Preferences

Animations respect prefers-reduced-motion (built into Tailwind):
```tsx
// Automatically respects user preference
className="transition-transform motion-reduce:transition-none"
```

---

## Common Combinations

### Office Nameplate

```tsx
<div className="texture-wood border-2 border-wood-dark px-5 py-2.5 shadow-lg">
  <span className="text-xs font-bold font-body uppercase tracking-wider text-cream">
    Label Text
  </span>
</div>
```

### Index Card Stack

```tsx
<div className="relative">
  <div className="absolute texture-paper card-paper rotate-slight-right" />
  <div className="absolute texture-paper card-paper rotate-slight-left" />
  <div className="texture-paper card-paper p-4">
    Top card content
  </div>
</div>
```

### CRT Display Effect

```tsx
<div className="bg-charcoal texture-paper p-4 rounded border-2 border-wood-medium effect-scanlines">
  <p className="text-amber-glow font-body text-sm">
    Terminal-style text
  </p>
</div>
```

### Dot Matrix Output

```tsx
<div className="texture-paper border-2 border-wood-light p-4 font-mono text-sm">
  <pre className="text-charcoal">
    PROCESSING...
    ✓ STEP 1 COMPLETE
    ✓ STEP 2 COMPLETE
  </pre>
</div>
```

---

## Quick Reference Table

| Element | Primary Class | Additional Classes |
|---------|--------------|-------------------|
| Page BG | `texture-shag` or `texture-wood` | `grain-overlay` |
| Content Card | `texture-paper` | `card-paper rounded` |
| Header | `font-heading` | `text-embossed` |
| Body Text | `font-body` | `text-charcoal` or `text-smoke` |
| Primary Button | `variant="default"` | (glow-amber built-in) |
| Input | `<Input />` | (paper texture built-in) |
| Tab | `<TabsTrigger />` | (file folder built-in) |
| Badge | `variant="default"` | (rotation built-in) |

---

## Tips

1. **Layering textures**: Don't stack too many textures. Use `texture-paper` on cards over `texture-shag` or `texture-wood` backgrounds.

2. **Amber glow**: Reserve for primary actions and focus states. Don't overuse.

3. **Typography hierarchy**: Use Courier Prime for headers, IBM Plex Mono for content. Mix creates visual interest.

4. **Rotation**: Slight rotations (±0.5-1deg) add playfulness. Use sparingly on badges and cards.

5. **Shadows**: Wood-toned shadows (rgba brown) maintain warm palette. Avoid black shadows.

6. **Border radius**: Keep minimal (2px) for boxy, retro feel. Modern rounded corners break aesthetic.

---

This design token reference should be used alongside the component library to maintain consistency across the application.
