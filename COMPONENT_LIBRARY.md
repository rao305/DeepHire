# DeepHire Component Library

**Design Aesthetic:** Data-forward dark professional — Think Linear meets GitHub. Dark backgrounds, electric blue accents, clean monospace typography, subtle borders.

## Design Tokens

### Colors
```css
Background:    #0A0A0B (base)
Cards:         #1a1a1b
Borders:       #27272a
Hover Borders: #3a3a3c

Text Primary:  #f5f5f5
Text Secondary: #a1a1aa
Text Tertiary:  #71717a

Accent:        #2563EB (electric blue)

Status Colors:
  Green:  #22c55e
  Yellow: #eab308
  Red:    #ef4444
```

### Typography
```css
Body Text:  'Geist' (sans-serif)
Data/Mono:  'Geist Mono' (monospace)

Use .font-mono or .text-data for numeric data, scores, timestamps
Use .tabular-nums for aligned numeric columns
```

## Components

### ScoreRing

**Purpose:** Display numeric scores (0-1) as animated circular progress rings.

**Props:**
```typescript
interface ScoreRingProps {
  score: number;        // 0-1 (will be displayed as 0-100%)
  size?: 'sm' | 'md' | 'lg';
  label?: string;       // Main label below ring
  sublabel?: string;    // Secondary label
}
```

**Features:**
- Animated fill on mount (1s ease-out)
- Color-coded: green (>0.7), yellow (0.4-0.7), red (<0.4)
- Monospace numerals
- Accessible with ARIA labels

**Example:**
```tsx
<ScoreRing score={0.92} size="md" label="Technical Fit" sublabel="Excellent" />
```

---

### VerdictBadge

**Purpose:** Display claim verification status with icon.

**Props:**
```typescript
interface VerdictBadgeProps {
  verdict: ClaimVerdict; // 'SUPPORTED' | 'WEAKLY_SUPPORTED' | 'UNVERIFIED' | 'CONTRADICTED'
  className?: string;
}
```

**Verdict Mapping:**
- `SUPPORTED` → Green checkmark
- `WEAKLY_SUPPORTED` → Yellow alert triangle
- `UNVERIFIED` → Gray question mark
- `CONTRADICTED` → Red X

**Example:**
```tsx
<VerdictBadge verdict="SUPPORTED" />
```

---

### ClaimCard

**Purpose:** Display candidate claims with optional judgment and expandable evidence.

**Props:**
```typescript
interface ClaimCardProps {
  claim: ExtractedClaim;
  judgment?: JgmentResult;
  showEvidence?: boolean;
  evidence?: EvidenceSnippet[];
}
```

**Features:**
- Claim text with type badge
- Job relevance progress bar (animated)
- Optional verdict badge
- Optional confidence & reasoning
- Expandable evidence section with animation
- Color-coded claim types (skill, project, scale, etc.)

**Example:**
```tsx
<ClaimCard
  claim={claim}
  judgment={{ verdict: 'SUPPORTED', confidence: 0.92, reasoning: '...' }}
  showEvidence={true}
  evidence={snippets}
/>
```

---

### ShippedWorkCard

**Purpose:** Display ranked shipped work items with technology pills and links.

**Props:**
```typescript
interface ShippedWorkCardProps {
  item: RankedShippedWork;
  rank: number;
}
```

**Features:**
- Numbered rank badge (1=gold, 2=silver, 3=bronze)
- Title, description, impressiveness narrative
- Technology pills (color-coded by category)
- Live demo button (green) if available
- GitHub/source links
- Recency indicator
- Hover effects with subtle shadow

**Example:**
```tsx
<ShippedWorkCard item={work} rank={1} />
```

---

### RiskFlag

**Purpose:** Display risk indicators with severity levels.

**Props:**
```typescript
interface RiskFlagProps {
  flag: RiskFlag;
}

interface RiskFlag {
  type: 'jd_mirroring' | 'unsupported_claim' | 'timeline_mismatch' | 'inflated_scale' | 'thin_evidence';
  severity: 'high' | 'medium' | 'low';
  description: string;
  relatedClaim?: string;
}
```

**Severity Styling:**
- `high` → Red background, warning icon
- `medium` → Amber background, alert icon
- `low` → Gray background, info icon

**Features:**
- Icon in colored circle
- Type and severity labels
- Description text
- Optional related claim in quoted box

**Example:**
```tsx
<RiskFlag flag={{
  type: 'timeline_mismatch',
  severity: 'medium',
  description: 'Timeline discrepancy detected...',
  relatedClaim: 'Worked at Company X for 3 years'
}} />
```

---

### ProgressSteps

**Purpose:** Vertical stepper showing multi-step process status.

**Props:**
```typescript
interface ProgressStepsProps {
  steps: ProgressStep[];
}

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  detail?: string;  // Optional detail text
}
```

**Status Indicators:**
- `pending` → Gray circle
- `running` → Animated pulsing blue dot with spinner
- `completed` → Green checkmark
- `error` → Red X

**Features:**
- Connecting lines between steps (colored by status)
- Optional detail text below each step
- Accessible with proper ARIA roles

**Example:**
```tsx
<ProgressSteps steps={[
  { id: '1', label: 'Parse JD', status: 'completed', detail: 'Found 12 requirements' },
  { id: '2', label: 'Extract claims', status: 'running', detail: 'Processing...' },
  { id: '3', label: 'Verify evidence', status: 'pending' }
]} />
```

---

### Sidebar

**Purpose:** Main navigation sidebar with organization info and user avatar.

**Features:**
- Collapsible (desktop)
- Active route highlighting with electric blue left border
- Organization name and plan badge
- User avatar from Clerk
- Responsive (mobile variant placeholder)

**Routes:**
- Dashboard
- Jobs
- Candidates
- Settings

**Example:**
```tsx
<Sidebar />
```

---

### Header

**Purpose:** Page header with breadcrumbs, title, and action slot.

**Props:**
```typescript
interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  actions?: ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

**Features:**
- Optional breadcrumb navigation
- Large page title
- Action slot (right side) for buttons
- Sticky positioning with backdrop blur

**Example:**
```tsx
<Header
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'John Doe' }
  ]}
  title="Candidate Brief"
  actions={<Button>Export PDF</Button>}
/>
```

---

## Layout Components

### Sidebar + Header Pattern

```tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          breadcrumbs={[{ label: 'Dashboard' }]}
          title="Dashboard"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Typography Guidelines

### Data Display
Use monospace font for:
- Scores and percentages
- Timestamps
- Numeric IDs
- Code/technical values

```tsx
<span className="font-mono tabular-nums">92%</span>
```

### Hierarchy
```tsx
// Page Title (H1)
<h1 className="text-2xl font-bold text-[#f5f5f5]">Title</h1>

// Section Title (H2)
<h2 className="text-xl font-semibold text-[#f5f5f5]">Section</h2>

// Card Title (H3)
<h3 className="text-base font-medium text-[#f5f5f5]">Card Title</h3>

// Body Text
<p className="text-sm text-[#a1a1aa]">Description text</p>

// Label/Caption
<span className="text-xs text-[#71717a]">Label</span>
```

---

## Color Usage

### Semantic Colors

**Status:**
```tsx
// Success/Positive
bg-green-500/10 border-green-500/20 text-green-400

// Warning/Caution
bg-yellow-500/10 border-yellow-500/20 text-yellow-400

// Error/Negative
bg-red-500/10 border-red-500/20 text-red-400

// Info/Neutral
bg-gray-500/10 border-gray-500/20 text-gray-400
```

**Interactive Elements:**
```tsx
// Primary Action
bg-[#2563EB] hover:bg-[#1d4ed8] text-white

// Secondary Action
bg-[#1a1a1b] hover:bg-[#27272a] text-[#f5f5f5]

// Destructive Action
bg-red-500/10 hover:bg-red-500/20 text-red-400
```

---

## Animation Guidelines

### Transitions
```css
/* Default transition for interactive elements */
transition-colors duration-200

/* Smooth state changes */
transition-all duration-300

/* Data visualization animations */
transition-all duration-700 ease-out
```

### On-Mount Animations
```tsx
// Fade in + slide down
className="animate-in slide-in-from-top-2 duration-200"
```

### Loading States
```tsx
// Pulsing effect
className="animate-pulse"

// Spinning loader
<Loader2 className="animate-spin" />
```

---

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader announcements
- Focus indicators
- Semantic HTML

**Example:**
```tsx
<button
  onClick={handleClick}
  aria-label="Clear selection"
  aria-pressed={isPressed}
>
  Clear
</button>
```

---

## Component Showcase

To view all components in action:

```tsx
import { ComponentShowcase } from '@/components/ui/component-showcase';

export default function ShowcasePage() {
  return <ComponentShowcase />;
}
```

---

## Design Principles

1. **Data-Forward:** Numbers and metrics take visual priority
2. **Professional:** Clean, refined, not playful
3. **Dark by Default:** #0A0A0B base, designed for extended use
4. **Electric Accents:** #2563EB blue for interactive/active states
5. **Monospace for Data:** Clear distinction between text and numbers
6. **Subtle Borders:** #27272a provides gentle separation
7. **Generous Spacing:** Breathing room for complex information
8. **Status Through Color:** Immediate visual feedback

---

## Usage Examples

### Candidate Brief Page

```tsx
import {
  ScoreRing,
  ClaimCard,
  ShippedWorkCard,
  RiskFlag,
  ProgressSteps
} from '@/components/ui';
import { Header } from '@/components/layout/header';

export default function CandidateBriefPage({ candidate }) {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.name }
        ]}
        title="Candidate Brief"
        actions={<Button>Export PDF</Button>}
      />

      <div className="p-6 space-y-8">
        {/* Scores */}
        <div className="flex gap-8">
          <ScoreRing score={candidate.fitScore} label="Fit Score" />
          <ScoreRing score={candidate.evidenceScore} label="Evidence" />
          <ScoreRing score={candidate.shippedWorkScore} label="Shipped Work" />
        </div>

        {/* Claims */}
        <section>
          <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Verified Claims</h2>
          <div className="space-y-4">
            {candidate.claims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </section>

        {/* Shipped Work */}
        <section>
          <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Top Shipped Work</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {candidate.shippedWork.map((work, idx) => (
              <ShippedWorkCard key={work.id} item={work} rank={idx + 1} />
            ))}
          </div>
        </section>

        {/* Risk Flags */}
        {candidate.risks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Risk Flags</h2>
            <div className="space-y-4">
              {candidate.risks.map((risk, idx) => (
                <RiskFlag key={idx} flag={risk} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
```

---

## Future Enhancements

- Mobile-optimized sidebar
- Dark/light theme toggle (if needed)
- Additional data visualization components (charts, graphs)
- Filter and sort components for tables
- Search and autocomplete inputs
- Notification/toast system integration
- PDF export styling
