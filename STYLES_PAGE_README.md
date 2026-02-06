# Styles Showcase Page

## Overview

A comprehensive design system showcase page has been created at `/styles` to display all critical design styles and components in one place.

## Access Points

The styles page can be accessed from:

1. **Landing Page**: Link at bottom of hero section - "View Design System →"
2. **Dashboard**: "View Styles" button in the header next to Logout
3. **Direct URL**: Navigate to `http://localhost:3000/styles`

## What's Included

The styles page showcases:

### 1. Color Palette
- **Wood Tones**: Dark walnut, medium oak, light wood
- **Amber (CRT Glow)**: Bright amber, dimmed amber
- **Neutrals**: Cream, tan, charcoal, smoke
- **Accents**: Burnt orange, olive green

Each color includes:
- Visual swatch
- CSS class name
- Description

### 2. Typography
- **Headings**: Courier Prime font family (H1-H4)
- **Body Text**: IBM Plex Mono (base, small, extra small)
- **Text Effects**: Embossed, uppercase tracking

### 3. Textures & Effects
- Wood grain (texture-wood)
- Shag carpet (texture-shag)
- Paper texture (texture-paper)
- CRT scanlines (effect-scanlines)
- Amber glow (glow-amber)
- Paper card effect (card-paper)

### 4. Buttons
- All variants: Default, Secondary, Outline, Ghost, Destructive, Link
- All sizes: Small, Default, Large, Icon
- States: Normal, Disabled

### 5. Form Elements
- Input fields (index card style)
- Textarea (paper texture)
- Select dropdowns
- Checkboxes (vintage style with checked/unchecked/disabled states)
- Labels (bold uppercase)

### 6. Badges
- All variants: Default (amber), Secondary (tan), Success (olive), Outline, Destructive
- Sticky note aesthetic with rotation

### 7. Tabs
- File folder design with icons
- Active/inactive states
- Paper texture content areas

### 8. Cards
- Standard card
- Rotated card (slight rotation effect)
- Paper texture with wood borders

### 9. Dialog (Modal)
- Interactive example with trigger button
- Shows dialog styling with form elements

### 10. Icons & Status Indicators
- Icon sizing examples (4 sizes)
- Success messages (olive green)
- Warning messages (amber)
- Error messages (destructive red)

### 11. Animations
- Amber glow pulse
- Rotate dial (loading spinner)
- Hover lift effect
- Card rotation on hover

### 12. Layout Patterns
- Wood panel banner
- Office nameplate
- Index card stack
- CRT display effect

## Usage

This page serves as:

1. **Design Reference**: Quick visual reference for developers
2. **Component Testing**: See all components in one place
3. **Style Consistency**: Ensure design system is being used correctly
4. **Client Presentation**: Showcase the design system to stakeholders
5. **Development Guide**: Copy patterns and see live examples

## Technical Details

- **File**: `src/app/styles/page.tsx`
- **Route**: `/styles`
- **Build Status**: ✅ Successful
- **Type**: Client-side rendered page
- **Dependencies**: All UI components from `src/components/ui/`

## Features

- **Organized Sections**: Each component type in its own section
- **Interactive Elements**: Buttons, dialogs, and tabs are fully functional
- **Live Examples**: See hover states, animations, and interactions
- **Responsive Design**: Works on all screen sizes
- **Retro Styling**: The showcase page itself uses the retro design system

## Navigation

- **Back to Dashboard**: Button in header
- **Sticky Header**: Wood panel header stays visible while scrolling
- **Organized Layout**: Clean sections with clear headings

## Future Enhancements

Potential additions:
- Code snippets for each component
- Copy-to-clipboard for CSS classes
- Dark mode toggle
- Accessibility information
- Responsive breakpoint examples
- Print stylesheet

---

**Note**: This is a living document. As new components or patterns are added to the design system, they should also be added to the styles showcase page.
