# TypeWriterPro Design Guidelines

## Design Approach

**Selected Approach:** Design System with Reference Inspiration  
**Primary References:** VS Code (editor interface), Notion (document experience), Typora (Markdown focus)  
**Design System:** Custom system drawing from Fluent Design principles with productivity-focused refinements

**Key Principles:**
- Clean, distraction-free editing environment
- Clear visual hierarchy between editor and preview
- Seamless RTL/LTR support without visual disruption
- Professional yet approachable interface

---

## Typography

**Font Families:**
- **English/Code:** 'Inter' for UI, 'JetBrains Mono' for editor
- **Farsi/RTL:** 'Vazirmatn' for all Persian text and mixed content
- **Fallback:** system-ui, sans-serif

**Hierarchy:**
- Menu bar: 14px medium weight
- Editor content: 16px (user adjustable 12-24px)
- Preview headings: H1 32px, H2 24px, H3 20px, H4 18px
- Settings labels: 14px regular
- Buttons/actions: 14px medium

---

## Layout System

**Spacing Units:** Tailwind-based with 2, 4, 6, 8, 12, 16, 24 unit increments
- Tight spacing: 2-4 units (p-2, m-4)
- Standard spacing: 6-8 units (p-6, gap-8)
- Section spacing: 12-16 units (py-12, mb-16)
- Large spacing: 24 units (py-24 for major sections)

**Grid Structure:**
- Application uses flexible split-pane layout (not traditional grid)
- Editor/Preview: Resizable 50/50 split (user adjustable 30/70 to 70/30)
- Sidebar: Fixed 280px width when expanded, 0px when collapsed
- Settings panel: 400px fixed overlay from right

---

## Core Layout Components

### Application Shell
- **Top Menu Bar:** Full-width, 48px height, fixed position
  - Left: App logo + menu items (File, Edit, View, Tools)
  - Right: Theme toggle + settings icon
  - Background: Subtle elevation with 1px bottom border
  
### Main Workspace (3-panel layout)
- **Left Sidebar (collapsible):** 280px width
  - Document outline (auto-generated from headings)
  - Recent files list
  - Padding: p-4, gap-2 between items
  
- **Center Editor Panel:** Flexible width
  - Monaco editor embedded, full height minus menu bar
  - No padding (editor handles internal spacing)
  - Line numbers on left (configurable)
  
- **Right Preview Panel (toggleable):** Flexible width
  - Live Markdown preview
  - Padding: p-8 for content breathing room
  - Matches editor scroll position

### Settings Panel Overlay
- Slides in from right, 400px width
- Semi-transparent backdrop (backdrop-blur)
- Close button top-right
- Sections: Font Settings, Editor Settings, Appearance
- Padding: p-6, gap-4 between sections

---

## Component Library

### Navigation (Menu Bar)
- Horizontal menu with dropdown support
- Items: px-4 py-2 spacing
- Hover state: subtle background change
- Active dropdown: shadow-lg, rounded corners
- Icons: 16px, aligned with text

### Editor Integration
- Monaco container: Full bleed, no borders
- Minimap: Optional, right side
- Status bar bottom: 32px height with file info, cursor position, language mode
- RTL/LTR indicator: Visual badge when auto-detected

### Preview Panel
- Clean typography rendering
- Code blocks: Background panel with syntax highlighting
- Tables: Full borders, alternating row backgrounds
- Blockquotes: Left border accent (4px width)
- Links: Underlined on hover
- Images: Max-width with centered alignment

### Buttons & Controls
- Primary action: Filled, 10px padding vertical, 20px horizontal, rounded-md
- Secondary: Outlined with border-2
- Icon buttons: Square 36px, rounded-md, centered icon
- Disabled state: 50% opacity

### Forms (Settings Panel)
- Labels: mb-2, font-medium
- Select dropdowns: Full width, p-2, border rounded
- Number inputs: w-24, p-2
- Toggle switches: Modern pill design, 48px width
- Spacing between form groups: mb-6

### Table Builder Modal
- Centered overlay, 600px width
- Grid preview: 8x8 cell selector
- Visual cell hover feedback
- Generate button: bottom-right, primary style
- Padding: p-6

### Modals & Overlays
- Centered on screen
- Max-width: 600px for dialogs, 400px for alerts
- Backdrop: Semi-transparent dark (rgba with backdrop-blur)
- Padding: p-6
- Close icon: top-right corner

---

## Responsive Behavior

**Desktop (>1024px):**
- Full 3-panel layout as described
- Menu bar with all items visible
- Settings panel 400px overlay

**Tablet (768px-1024px):**
- Editor/Preview stacked or side-by-side (user toggle)
- Sidebar collapses to hamburger menu
- Settings panel full-screen overlay

**Mobile (<768px):**
- Single panel view (Editor OR Preview)
- Toggle button to switch views
- Menu bar collapses to hamburger
- Settings panel: full-screen modal
- Simplified toolbar with essential actions only

---

## Theming Architecture

**Light Theme:**
- Background: Pure white (#FFFFFF)
- Surface: Light gray (#F8F9FA)
- Text: Dark gray (#1A1A1A)
- Borders: Light gray (#E0E0E0)
- Accent: Blue (#2563EB)

**Dark Theme:**
- Background: Deep dark (#1E1E1E)
- Surface: Charcoal (#252526)
- Text: Light gray (#E0E0E0)
- Borders: Dark gray (#3E3E42)
- Accent: Bright blue (#3B82F6)

**Theme Affects:**
- Editor background and syntax colors (Monaco theme switching)
- Preview panel background and text
- Menu bar and sidebar
- All UI components and borders
- Modal overlays

---

## RTL/LTR Visual Treatment

- Direction changes are content-based, not UI-based
- UI always LTR (menu bar, buttons, settings)
- Editor content: Auto-detects and applies direction per paragraph
- Preview: Matches editor direction exactly
- Visual indicator: Small badge showing current direction when auto-detected
- No layout shifts when direction changes—only text alignment

---

## Accessibility
- All interactive elements: min 44px touch target
- Keyboard navigation: Full support with visible focus rings
- Screen reader: Proper ARIA labels on all controls
- Color contrast: WCAG AA compliant in both themes
- Focus trap in modals

---

## No Images Required
This is a productivity tool—no hero images or marketing visuals needed. All visual interest comes from typography, spacing, and the editor/preview split interface.