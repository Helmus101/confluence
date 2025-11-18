# Confluence Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing from professional productivity tools
- **Primary References**: Linear (clean hierarchy, excellent typography), Notion (information density), Airbnb (trust indicators)
- **Rationale**: Professional networking tool requiring clarity, efficiency, and trust-building. Users need to quickly scan contacts, understand match quality, and make decisions confidently.

## Core Design Principles

1. **Information Clarity**: Dense data presented with clear hierarchy
2. **Trust Signals**: Visual indicators for connector quality and match confidence
3. **Efficient Actions**: Primary actions always visible and accessible
4. **Professional Polish**: Clean, modern aesthetic that inspires confidence

## Typography System

**Font Families** (via Google Fonts CDN):
- Primary: Inter (all weights) - UI, body text
- Accent: Space Grotesk (medium, semibold) - headings, emphasis

**Hierarchy**:
- Hero headlines: 3xl - 5xl, semibold/bold
- Page titles: 2xl, semibold
- Section headers: xl, semibold
- Card titles: lg, medium
- Body text: base, regular
- Metadata/labels: sm, medium (tracking-wide for labels)
- Fine print: xs, regular

## Layout System

**Spacing Primitives**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6, p-8
- Section spacing: gap-6, gap-8, gap-12
- Page margins: mx-4 (mobile), mx-auto max-w-7xl (desktop)
- Card spacing: space-y-4, space-y-6

**Grid System**:
- Search results: Single column mobile, 2-column tablet (md:grid-cols-2)
- Contact cards: Grid with auto-fit minmax(320px, 1fr)
- Stats dashboard: 2-4 columns (grid-cols-2 lg:grid-cols-4)

## Page Layouts

### Landing Page
**Hero Section** (70vh):
- Centered headline + subheading
- Single primary CTA button
- Background: Subtle gradient or abstract professional networking visual (nodes/connections pattern)
- Image: Abstract illustration of professional connections - interconnected nodes forming a network map, modern and minimalist style

**Features Section** (3 columns on desktop):
- Icon-title-description cards
- Highlight: Direct matches, Indirect intros, LLM-powered enrichment

**Social Proof**:
- Stats bar: "X connections made" "Y universities" "Z% success rate"
- Simple testimonial cards (2-column)

**CTA Footer**: Prominent signup prompt

### Dashboard (Main Application View)
**Top Bar**: 
- Logo left, search bar center (prominent, w-full max-w-2xl), profile/notifications right

**Search Interface**:
- Large search input with filter chips below (Company, Industry, Role, Location)
- Advanced filters in collapsible panel

**Results Layout**:
- Two distinct sections: "Direct Matches" and "Indirect Opportunities"
- Each result card shows: Company logo placeholder, Name/Title, Match confidence badge, Primary action button

### Onboarding Flow
**Multi-step progress indicator** at top (steps: Upload → Review → Enrich → Complete)

**Upload Screen**:
- Large dropzone (border-dashed, h-64)
- Alternative: Manual entry form (simple fields: name, company, title, LinkedIn URL)
- Preview table of parsed contacts before enrichment

### Contact Detail View
**Split Layout** (60/40 on desktop):
- Left: Contact information card (enriched data, confidence scores)
- Right: Action panel - "Request Introduction" or "Generate Message"

### Intros Management
**Tabbed Interface**:
- "Requests Sent" | "Requests Received" | "Completed"
- List view with status badges (rounded-full px-3 py-1)
- Expandable cards showing conversation thread

### Admin Dashboard
**Metrics Grid** (4-column):
- Total users, Active intros, Success rate, Avg response time
- Charts: Simple line graphs for trends
- Recent activity feed

## Component Library

### Cards
- Elevated cards: rounded-lg shadow-sm border
- Hover state: shadow-md transition
- Internal spacing: p-6
- Header with icon/avatar + title + metadata row

### Buttons
**Primary**: Solid background, medium roundedness (rounded-md), px-6 py-3, font-medium
**Secondary**: Border variant, same sizing
**Tertiary**: Text-only with hover underline
**Icon buttons**: Square (p-2), rounded-md

### Badges
- Status indicators: rounded-full px-3 py-1 text-sm font-medium
- Confidence scores: Percentage with visual bar
- Trust indicators: Star icon + numeric rating

### Forms
- Input fields: rounded-md border px-4 py-2.5, focus ring
- Labels: text-sm font-medium mb-2
- Helper text: text-xs mt-1
- File upload: Dashed border dropzone with icon

### Search & Filters
- Search bar: Large input with icon, rounded-full on landing, rounded-md in app
- Filter chips: Removable tags (rounded-full with X button)
- Dropdown filters: Custom select with checkboxes

### Modals
- Centered overlay: max-w-lg to max-w-2xl
- Header with title + close button
- Body with scrollable content
- Footer with action buttons (right-aligned)

### Trust Elements
- Connector score card: Avatar + name + trust metrics (response rate %, successful intros count)
- Confidence indicator: Progress bar or percentage badge with visual weight

### Data Display
- Contact list: Avatar + name/title stacked, company secondary, action on right
- Timeline view: Vertical line with status nodes for intro progression
- Empty states: Icon + message + CTA

## Icons
**Library**: Heroicons (via CDN)
- Search: magnifying-glass
- Upload: arrow-up-tray
- Success: check-circle
- Profile: user-circle
- Filter: funnel
- Direct match: link
- Indirect: share

## Images

### Hero Section
**Type**: Abstract illustration
**Description**: Professional network visualization - clean geometric nodes connected by lines forming a web pattern, modern gradient treatment, suggests connectivity and opportunity
**Placement**: Full-width background image with subtle overlay, content centered over it
**Treatment**: Slight blur or opacity overlay to ensure text readability

### Feature Cards
**Type**: Icons (not images)
**Style**: Outlined style matching Heroicons aesthetic

### Trust Indicators
**Type**: Avatar placeholders
**Description**: Circular profile images for connectors
**Size**: 40x40px in cards, 64x64px in detail views

### Empty States
**Type**: Simple illustrations
**Description**: Friendly line-art illustrations for "No contacts yet", "No intro requests"
**Style**: Minimal, single-accent-color illustrations

## Animations

**Minimal Use Only**:
- Page transitions: Simple fade-in (200ms)
- Card hover: Subtle lift with shadow change (150ms)
- Loading states: Skeleton screens (no spinners)
- Success confirmations: Brief scale animation on checkmark (300ms)

**Avoid**: Scroll-triggered animations, parallax, complex transitions

## Responsive Behavior

**Breakpoints**:
- Mobile-first: Stack all multi-column layouts
- Tablet (md: 768px): 2-column grids, persistent sidebar
- Desktop (lg: 1024px): Full layouts, 3-4 column grids

**Mobile Optimizations**:
- Bottom navigation bar for main app sections
- Full-screen modals
- Simplified filter UI (drawer instead of sidebar)
- Touch-friendly target sizes (min 44x44px)

## Accessibility Standards

- All interactive elements have clear focus states (ring-2 ring-offset-2)
- Form fields paired with labels (proper for/id relationships)
- Status indicators use both color AND text/icons
- Minimum contrast ratio 4.5:1 for text
- Skip navigation links for keyboard users
- ARIA labels for icon-only buttons

---

**Design Philosophy**: Professional, trustworthy, and efficient. Every element serves the core user journey: upload contacts → search opportunities → make warm introductions. Visual hierarchy guides users through complex information while maintaining a clean, modern aesthetic that inspires confidence in the platform.