# DeepHire Frontend Implementation

## Aesthetic Direction: Terminal/Command-Line Interface

A distinctive **terminal-inspired aesthetic** that communicates precision, technical sophistication, and data-driven decision making. This design avoids generic SaaS UI patterns and creates a memorable, purposeful experience.

### Design Principles

1. **Monospace Everything**: Geist Mono as the primary (and only) typeface
2. **Terminal Color Palette**:
   - Green (#00ff88): Primary actions, success states, active elements
   - Amber (#ffb454): Secondary actions, warnings, metadata
   - Red (#ff4444): Errors, destructive actions
   - Blue (#00b4ff): Processing states
3. **Sharp, Precise Layout**: Rectangles, grids, borders - no rounded corners
4. **High Contrast**: Dark background (#0a0e14) with bright accents
5. **Subtle Grid Pattern**: Background grid reinforces the data-focused aesthetic
6. **Mechanical Motion**: Sharp, precise animations rather than bouncy or organic

---

## 📁 Files Created/Modified

### Core Infrastructure
- ✅ `/src/components/providers/query-provider.tsx` - TanStack Query provider
- ✅ `/src/app/layout.tsx` - Added QueryProvider wrapper
- ✅ `/src/app/globals.css` - Terminal aesthetic CSS (grid background, custom colors, animations, slider styles)

### Components
- ✅ `/src/components/ui/status-badge.tsx` - Status badges with terminal colors and pulsing animation
- ✅ `/src/components/ui/skeleton.tsx` - Loading skeleton components
- ✅ `/src/components/ui/button.tsx` - Updated with terminal styling
- ✅ `/src/components/jobs/job-card.tsx` - Terminal-styled job cards with stats grid

### Pages
- ✅ `/src/app/(dashboard)/jobs/page.tsx` - Jobs list with:
  - Terminal header (`~/jobs`)
  - Empty state with animated rocket icon
  - Grid of job cards with staggered fade-in
  - Footer stats panel
  - Loading skeleton states

- ✅ `/src/app/(dashboard)/jobs/new/page.tsx` - 3-step job creation wizard:
  - **Step 1: JD Input** - Textarea with character counter
  - **Step 2: Role Rubric** - Editable form with tag inputs, custom sliders
  - **Step 3: Review & Save** - Summary view before saving
  - Progress stepper with visual feedback
  - Live validation (100% weight requirement)

- ✅ `/src/app/(dashboard)/jobs/[jobId]/page.tsx` - Job detail with:
  - Tabbed interface (Candidates | Role Rubric)
  - Data table with status badges, scores, actions
  - Empty states
  - Add candidate modal
  - Export CSV button

---

## 🎨 Key Visual Elements

### Terminal Headers
Every page uses a consistent header pattern:
```
┃ [Icon] ~/path/to/page
┃ DESCRIPTION IN UPPERCASE TRACKING
```

### Status Badge Variants
- **PENDING**: Gray background, gray dot
- **ANALYZING**: Blue background, pulsing blue dot
- **COMPLETE**: Green background, static green dot
- **ERROR**: Red background, static red dot

### Data Grids
Used for displaying structured information (stats, evaluation weights):
```
┌─────────────┬─────────────┐
│ LABEL       │ LABEL       │
│ 00 (value)  │ 00 (value)  │
└─────────────┴─────────────┘
```

### Custom Slider
Range inputs styled with:
- 2px height track
- Square 12px terminal-green thumb
- Glow effect on hover
- Linear gradient fill showing progress

---

## 🎬 Animations

1. **Staggered Fade-In**: List items appear sequentially with `animation-delay`
2. **Pulse Green**: Status badge dots pulse for "analyzing" state
3. **Border Hover**: Cards get terminal-green border glow on hover
4. **Loading States**: Simple opacity pulse for loading text

---

## 📊 Data Flow (TanStack Query)

### Jobs List (`/jobs`)
```
useQuery(['jobs']) → GET /api/jobs
→ JobCard[] with skeleton loading states
```

### Job Detail (`/jobs/[jobId]`)
```
useQuery(['job', jobId]) → GET /api/jobs/:id
useQuery(['candidates', jobId]) → GET /api/jobs/:id/candidates
→ Tabbed interface with candidates table
```

### Create Job (`/jobs/new`)
```
Step 1: Paste JD → Step 2: Parse & Edit → Step 3: Save
POST /api/jobs with { jd, rubric }
→ Redirect to /jobs/:id
```

---

## 🚀 Distinctive Features

### What Makes This UI Memorable

1. **Full Monospace**: Most apps use monospace for code/data only - we use it everywhere
2. **Terminal Green as Primary**: Unexpected choice that signals "technical" without being aggressive
3. **Grid Background**: Subtle but adds depth and reinforces data/structure theme
4. **No Rounded Corners**: Sharp, precise rectangles throughout
5. **Data-First**: Every piece of information is presented in a structured, grid-aligned way
6. **Tabular Numbers**: All numeric data uses monospace tabular-nums for perfect alignment
7. **Uppercase Labels**: All field labels and section headers in uppercase with wide tracking

---

## 🎯 Avoiding "AI Slop" Anti-Patterns

❌ **What we DIDN'T do:**
- Generic purple gradients
- Inter/Roboto/System fonts
- Excessive rounded corners (border-radius: 12px everywhere)
- Pastel colors on white backgrounds
- Bouncy spring animations
- Generic card layouts with icons in colored circles

✅ **What we DID do:**
- Commit to a bold, specific aesthetic (terminal/command-line)
- Use distinctive typography (monospace only)
- Choose an unexpected primary color (terminal green)
- Create visual consistency through rigid grid structures
- Design purposeful, context-appropriate components

---

## 📝 Implementation Notes

### Browser Compatibility
- Custom slider styles work in Chrome, Firefox, Safari
- CSS Grid used throughout (supported in all modern browsers)
- CSS custom properties for theming

### Performance
- TanStack Query handles caching automatically
- Animations use CSS transforms (GPU-accelerated)
- Loading states prevent layout shift

### Accessibility
- Focus visible states on all interactive elements
- Semantic HTML structure
- Color is not the only indicator (status badges have text + icons)
- Monospace font is highly readable at small sizes

---

## 🔮 Future Enhancements

1. **Terminal Typewriter Effect**: Animate headers appearing character-by-character
2. **Scan Lines**: Subtle moving scan lines on data tables for extra terminal feel
3. **Command Palette**: Cmd+K interface for quick navigation
4. **Sound Effects**: Optional terminal "beep" for actions
5. **Dark/Light Toggle**: Keep terminal aesthetic but swap to light terminal theme
6. **ASCII Art**: Small ASCII decorations in empty states

---

**Built with:**
- Next.js 16
- React 19
- TanStack Query
- Tailwind CSS
- Lucide Icons
- Geist Mono font

**Design Philosophy:**
Be bold. Be precise. Be memorable. Every pixel has a purpose.
