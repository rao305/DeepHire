// === src/icons.jsx ===
// Lucide-style SVG icons. Stroke 1.5, currentColor.
const Icon = ({ name, size = 16, className = "", style }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round", strokeLinejoin: "round",
    className, style,
  };
  switch (name) {
    case "briefcase": return (<svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>);
    case "user-plus": return (<svg {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 12-4.9"/><path d="M19 11v6M16 14h6"/></svg>);
    case "settings": return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "users": return (<svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case "chevrons-left": return (<svg {...props}><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>);
    case "chevrons-right": return (<svg {...props}><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>);
    case "chevron-right": return (<svg {...props}><path d="m9 18 6-6-6-6"/></svg>);
    case "chevron-down": return (<svg {...props}><path d="m6 9 6 6 6-6"/></svg>);
    case "arrow-right": return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
    case "arrow-up": return (<svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case "arrow-down": return (<svg {...props}><path d="M12 5v14M5 12l7 7 7-7"/></svg>);
    case "check": return (<svg {...props}><path d="M20 6 9 17l-5-5"/></svg>);
    case "x": return (<svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>);
    case "search": return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>);
    case "plus": return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case "github": return (<svg {...props}><path d="M15 22v-4a4 4 0 0 0-1-3c3 0 6-2 6-5.5 0-1.4-.5-2.7-1.3-3.7.3-1 .3-2-.1-3 0 0-1 0-3 1.5a11 11 0 0 0-6 0C7.5 3 6.5 3 6.5 3c-.4 1-.4 2-.1 3A5.4 5.4 0 0 0 5 9.5C5 13 8 15 11 15a4 4 0 0 0-1 3v4"/><path d="M9 18c-3 1-5-1-6-2"/></svg>);
    case "link": return (<svg {...props}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>);
    case "linkedin": return (<svg {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>);
    case "file-text": return (<svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>);
    case "upload": return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>);
    case "alert-triangle": return (<svg {...props}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.7 3h16.96a2 2 0 0 0 1.7-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>);
    case "alert-circle": return (<svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>);
    case "shield-check": return (<svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
    case "sparkles": return (<svg {...props}><path d="M12 3 13.5 8.5 19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M19 17v4M21 19h-4M5 3v3M6.5 4.5h-3"/></svg>);
    case "loader": return (<svg {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>);
    case "globe": return (<svg {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>);
    case "external": return (<svg {...props}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>);
    case "clock": return (<svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
    case "code": return (<svg {...props}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>);
    case "git-branch": return (<svg {...props}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>);
    case "git-commit": return (<svg {...props}><circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>);
    case "star": return (<svg {...props}><path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
    case "more": return (<svg {...props}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>);
    case "filter": return (<svg {...props}><path d="M22 3H2l8 9.5V19l4 2v-8.5z"/></svg>);
    case "command": return (<svg {...props}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>);
    case "image": return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>);
    case "bot": return (<svg {...props}><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>);
    case "scan": return (<svg {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>);
    case "play": return (<svg {...props}><polygon points="6 3 20 12 6 21 6 3"/></svg>);
    case "download": return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>);
    case "copy": return (<svg {...props}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
    case "thumbs-up": return (<svg {...props}><path d="M7 22V11M22 11v4a4 4 0 0 1-4 4h-5l-2 3-1-2v-4M2 13h5V8a3 3 0 0 1 3-3l1 0 3 7v6"/></svg>);
    case "thumbs-down": return (<svg {...props}><path d="M17 2v11M2 13v-4a4 4 0 0 1 4-4h5l2-3 1 2v4M22 11h-5v5a3 3 0 0 1-3 3l-1 0-3-7v-6"/></svg>);
    case "share": return (<svg {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>);
    default: return null;
  }
};
window.Icon = Icon;


// === src/data.jsx ===
// Mock data for DeepHire

const JOBS = [
  {
    id: "job-7a14",
    title: "Senior Full-Stack Engineer",
    team: "Platform · Infra",
    location: "Remote · US/EU",
    posted: "Apr 14, 2026",
    rubric: ["TypeScript", "Postgres", "Distributed systems", "Realtime infra", "On-call leadership"],
    seniority: "L5 — Senior",
    candidates: 14,
    verified: 9,
    flagged: 2,
    status: "Active",
  },
  {
    id: "job-3c91",
    title: "Founding ML Engineer",
    team: "Applied Research",
    location: "SF (hybrid)",
    posted: "May 02, 2026",
    rubric: ["PyTorch", "CUDA", "Eval infra", "LLM post-training"],
    seniority: "L6 — Staff",
    candidates: 8,
    verified: 3,
    flagged: 1,
    status: "Active",
  },
  {
    id: "job-12bf",
    title: "Developer Experience Lead",
    team: "Open Source",
    location: "Remote",
    posted: "Apr 03, 2026",
    rubric: ["Rust", "OSS maintenance", "Technical writing", "CLI/SDK design"],
    seniority: "L5 — Senior",
    candidates: 22,
    verified: 12,
    flagged: 3,
    status: "Active",
  },
  {
    id: "job-9ff2",
    title: "iOS Engineer, Performance",
    team: "Mobile",
    location: "NYC",
    posted: "Mar 28, 2026",
    rubric: ["Swift", "Instruments / profiling", "60fps UI", "Metal"],
    seniority: "L4 — Mid",
    candidates: 6,
    verified: 4,
    flagged: 0,
    status: "Paused",
  },
];

const CANDIDATES = [
  {
    id: "cand-amara",
    name: "Amara Okonkwo",
    handle: "amara-okonkwo",
    role: "Senior Full-Stack Engineer",
    jobId: "job-7a14",
    location: "Lisbon, PT",
    submitted: "2 hours ago",
    scores: { fit: 87, evidence: 92, shipped: 81, confidence: 78 },
    status: "Brief ready",
    avatar: "AO",
  },
  {
    id: "cand-quan",
    name: "Quan Vũ",
    handle: "quan-vu",
    role: "Senior Full-Stack Engineer",
    jobId: "job-7a14",
    location: "Berlin, DE",
    submitted: "Yesterday",
    scores: { fit: 74, evidence: 68, shipped: 82, confidence: 64 },
    status: "Brief ready",
    avatar: "QV",
  },
  {
    id: "cand-jess",
    name: "Jessamine Rhee",
    handle: "jess-rhee",
    role: "Senior Full-Stack Engineer",
    jobId: "job-7a14",
    location: "Toronto, CA",
    submitted: "Today, 09:12",
    scores: { fit: 0, evidence: 0, shipped: 0, confidence: 0 },
    status: "Analyzing",
    avatar: "JR",
  },
  {
    id: "cand-lior",
    name: "Lior Hartman",
    handle: "lior-h",
    role: "Founding ML Engineer",
    jobId: "job-3c91",
    location: "Tel Aviv, IL",
    submitted: "3 days ago",
    scores: { fit: 91, evidence: 88, shipped: 94, confidence: 86 },
    status: "Brief ready",
    avatar: "LH",
  },
  {
    id: "cand-pria",
    name: "Pria Bhattacharya",
    handle: "pria-b",
    role: "Developer Experience Lead",
    jobId: "job-12bf",
    location: "Bangalore, IN",
    submitted: "5 days ago",
    scores: { fit: 69, evidence: 72, shipped: 58, confidence: 60 },
    status: "Flagged",
    avatar: "PB",
  },
];

// Flagship candidate brief — Amara
const BRIEF = {
  id: "cand-amara",
  name: "Amara Okonkwo",
  handle: "amara-okonkwo",
  pronouns: "she / her",
  role: "Senior Full-Stack Engineer",
  jobId: "job-7a14",
  location: "Lisbon, Portugal · UTC+0",
  submitted: "Apr 22, 2026",
  brief: "Apr 22, 2026 · 18:42 UTC",
  links: {
    github: "github.com/amara-okonkwo",
    portfolio: "amara.codes",
    linkedin: "linkedin.com/in/amara-okonkwo",
    resume: "okonkwo_resume_2026.pdf",
  },
  scores: {
    fit: { value: 87, delta: +4, of: 100, label: "Fit Score", desc: "Match against role rubric" },
    evidence: { value: 92, delta: +6, of: 100, label: "Evidence", desc: "Strength of public support" },
    shipped: { value: 81, delta: -2, of: 100, label: "Shipped Work", desc: "Production-grade output" },
    confidence: { value: 78, delta: +1, of: 100, label: "Confidence", desc: "Overall signal coherence" },
  },
  oneLiner: "Distributed-systems engineer with strong, verifiable OSS footprint in Postgres tooling and Elixir realtime infra. Two production launches at scale; one timeline question to follow up on.",
  shipped: [
    {
      id: "ship-1",
      title: "pg-rewind-live",
      kind: "Open-source · 4.2k ★",
      blurb: "A streaming logical-replication tool for zero-downtime Postgres major-version upgrades. Maintains primary authorship and shipped 11 of last 14 releases.",
      whyImpressive: "Solves a real operational pain point with a careful, well-tested implementation. RFC-style proposal accepted into Postgres TODO list.",
      relevance: "Directly maps to the role's 'realtime infra' and 'Postgres at scale' must-haves.",
      stack: ["Rust", "Postgres WAL", "tokio", "protobuf"],
      links: [
        { kind: "repo", label: "github.com/amara-okonkwo/pg-rewind-live" },
        { kind: "demo", label: "pg-rewind.dev" },
        { kind: "writeup", label: "Engineering blog (3,400 words)" },
      ],
      metrics: [
        { k: "Stars", v: "4,218" },
        { k: "Contributors", v: "47" },
        { k: "Last commit", v: "3 days ago" },
        { k: "Tests", v: "94% cov." },
      ],
    },
    {
      id: "ship-2",
      title: "Sundial Realtime",
      kind: "Employer project · 2022–2024",
      blurb: "Led the v3 rewrite of an Elixir + Phoenix presence layer serving 2.1M peak concurrent connections across 6 regions. Drove p99 from 480ms → 92ms.",
      whyImpressive: "Public conference talk (ElixirConf EU '24) with reproducible benchmarks and a follow-up RFC adopted into Phoenix.Channel.",
      relevance: "Realtime infra leadership and on-call ownership — both explicit must-haves.",
      stack: ["Elixir", "Phoenix", "BEAM", "Kafka", "OpenTelemetry"],
      links: [
        { kind: "talk", label: "ElixirConf EU 2024 — 28 min" },
        { kind: "writeup", label: "Sundial engineering postmortem" },
      ],
      metrics: [
        { k: "Peak CCU", v: "2.1M" },
        { k: "p99 latency", v: "92ms" },
        { k: "Regions", v: "6" },
        { k: "Talk views", v: "34k" },
      ],
    },
    {
      id: "ship-3",
      title: "stream-keeper",
      kind: "Side project · 720 ★",
      blurb: "A small, beautifully-documented CLI for replaying Postgres WAL into test fixtures. Used by 11 companies (per public testimonials).",
      whyImpressive: "Strong documentation discipline and a thoughtful CLI surface. Several engineers cite it in interview prep posts.",
      relevance: "Demonstrates a clear product instinct for developer tools.",
      stack: ["Go", "Cobra", "Postgres"],
      links: [
        { kind: "repo", label: "github.com/amara-okonkwo/stream-keeper" },
        { kind: "demo", label: "Asciinema demo (3 min)" },
      ],
      metrics: [
        { k: "Stars", v: "720" },
        { k: "Releases", v: "v0.1 → v1.4" },
        { k: "Docs", v: "12 pages" },
      ],
    },
  ],
  verifiedClaims: [
    {
      id: "v1",
      claim: "Authored pg-rewind-live with 4.2k+ GitHub stars",
      source: "GitHub API · 11 sources",
      strength: 0.97,
      evidenceCount: 6,
    },
    {
      id: "v2",
      claim: "Led realtime infra at Sundial (2022–2024)",
      source: "Conference talk · LinkedIn · Crunchbase",
      strength: 0.91,
      evidenceCount: 5,
    },
    {
      id: "v3",
      claim: "Spoke at ElixirConf EU 2024",
      source: "Sched.com · YouTube · slides.com",
      strength: 0.99,
      evidenceCount: 4,
    },
    {
      id: "v4",
      claim: "Driving p99 latency from 480ms to 92ms",
      source: "Talk slides 14–22 · written postmortem",
      strength: 0.84,
      evidenceCount: 3,
    },
    {
      id: "v5",
      claim: "Contributed to Phoenix.Channel core",
      source: "GitHub PR #6182 · merged",
      strength: 0.94,
      evidenceCount: 2,
    },
  ],
  weakClaims: [
    {
      id: "w1",
      claim: "“Built a CUDA-accelerated retrieval pipeline at Sundial”",
      issue: "No public artifact. Not mentioned in talk, postmortem, or any commit footprint we can attribute.",
      severity: "ask-in-interview",
    },
    {
      id: "w2",
      claim: "“Managed a team of 6 engineers”",
      issue: "LinkedIn says 6; one ex-colleague's public org chart shows 3 direct reports. Worth clarifying.",
      severity: "minor",
    },
    {
      id: "w3",
      claim: "“5+ years TypeScript in production”",
      issue: "GitHub history shows TS commits only from late 2022. Resume claim may include side-project time.",
      severity: "minor",
    },
  ],
  risks: [
    {
      id: "r1",
      severity: "danger",
      title: "Timeline mismatch — Sundial vs. Northwind overlap",
      body: "Resume lists Sundial as Mar 2022 – Feb 2024, but LinkedIn shows Northwind through Apr 2022. Five-week unexplained overlap. Confirm whether contract or transition period.",
    },
    {
      id: "r2",
      severity: "warn",
      title: "Unsupported production claim — CUDA retrieval pipeline",
      body: "No commits, conference slides, or postmortem reference. We could not find any public artifact backing this resume bullet.",
    },
  ],
};

const EVIDENCE = {
  v1: {
    title: "Authored pg-rewind-live with 4.2k+ GitHub stars",
    strength: 0.97,
    pages: [
      { url: "github.com/amara-okonkwo/pg-rewind-live", note: "Repo. 4,218 stars. Top contributor (61% commits)." },
      { url: "github.com/amara-okonkwo/pg-rewind-live/graphs/contributors", note: "Contributor graph." },
      { url: "amara.codes/projects/pg-rewind-live", note: "Personal portfolio listing." },
      { url: "news.ycombinator.com/item?id=39281047", note: "Front-paged. 312 points. Author confirmed in thread." },
      { url: "postgresql.org/list/pgsql-hackers/2025-02/msg00214.html", note: "RFC discussion on hackers list." },
    ],
    snippets: [
      { src: "GitHub README", text: "“Maintained primarily by Amara Okonkwo (@amara-okonkwo). Shipped v0.9 — v1.4 between Aug 2024 and Apr 2026.”" },
      { src: "HN thread", text: "“I'm the author — happy to answer questions. The WAL-replay trick was the unlock; details in the design doc.”" },
      { src: "pgsql-hackers", text: "“The TODO entry now references Amara's proposal as the reference design.” — committer reply" },
    ],
    screenshot: "GitHub repo header (Playwright capture)",
  },
  v2: {
    title: "Led realtime infra at Sundial (2022–2024)",
    strength: 0.91,
    pages: [
      { url: "sundial.io/team (archive.org snapshot, Jan 2024)", note: "Listed as 'Staff Engineer, Realtime'." },
      { url: "linkedin.com/in/amara-okonkwo", note: "Self-reported tenure: Mar 2022 – Feb 2024." },
      { url: "crunchbase.com/organization/sundial", note: "Lists Amara as engineering lead in 2024 funding announcement." },
      { url: "youtube.com/watch?v=elixirconf-eu-24-aok", note: "ElixirConf talk: 'Realtime at Sundial'." },
    ],
    snippets: [
      { src: "Conference bio", text: "“Amara leads the realtime infra team at Sundial, where she rebuilt the presence layer to handle 2M+ concurrent connections.”" },
      { src: "TechCrunch Series B coverage", text: "“led by realtime infrastructure lead Amara Okonkwo.”" },
    ],
    screenshot: "ElixirConf talk page (Playwright capture)",
  },
};

window.JOBS = JOBS;
window.CANDIDATES = CANDIDATES;
window.BRIEF = BRIEF;
window.EVIDENCE = EVIDENCE;


// === src/components.jsx ===
// Shared UI primitives

const { useState, useEffect, useRef, useMemo } = React;

const Btn = ({ children, variant = "default", size, icon, iconRight, disabled, onClick, type, className = "" }) => {
  const cls = ["btn", variant !== "default" ? variant : "", size === "sm" ? "sm" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type || "button"} className={cls} disabled={disabled} onClick={onClick}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={14} /> : null}
    </button>
  );
};

const Badge = ({ children, tone = "default", dot }) => (
  <span className={"badge " + (tone !== "default" ? tone : "")}>
    {dot ? <i className="dot" /> : null}
    {children}
  </span>
);

const Progress = ({ value, max = 100, tone = "default" }) => (
  <div className={"prog " + (tone !== "default" ? tone : "")}>
    <span style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }} />
  </div>
);

const Field = ({ label, hint, optional, children }) => (
  <label className="field">
    <span className="field-label">
      {label}
      {optional ? <span className="opt">optional</span> : null}
    </span>
    {children}
    {hint ? <span className="field-hint">{hint}</span> : null}
  </label>
);

const Spinner = ({ size = 14 }) => (
  <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5"/>
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const Card = ({ title, sub, action, children, className = "", padded = true, style }) => (
  <div className={"card " + className} style={style}>
    {(title || action) ? (
      <div className="card-head">
        <div>
          {title ? <div className="card-title">{title}</div> : null}
          {sub ? <div className="card-sub">{sub}</div> : null}
        </div>
        {action ? <div className="row" style={{ gap: 8 }}>{action}</div> : null}
      </div>
    ) : null}
    {padded ? <div className="card-body">{children}</div> : children}
  </div>
);

const Sheet = ({ open, onClose, title, sub, children, width }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  return (
    <React.Fragment>
      <div className={"sheet-backdrop " + (open ? "open" : "")} onClick={onClose} />
      <div className={"sheet " + (open ? "open" : "")} style={width ? { width } : null}>
        <div className="sheet-head">
          <div style={{ minWidth: 0 }}>
            {sub ? <div className="page-eyebrow" style={{ marginBottom: 4 }}>{sub}</div> : null}
            <div className="card-title" style={{ fontSize: 15 }}>{title}</div>
          </div>
          <button className="btn ghost sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </React.Fragment>
  );
};

const Alert = ({ tone = "default", title, icon, children, action }) => (
  <div className={"alert " + (tone !== "default" ? tone : "")}>
    <Icon name={icon || (tone === "danger" ? "alert-triangle" : tone === "warn" ? "alert-circle" : "alert-circle")} size={18} className="ico" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="alert-title">{title}</div>
      <div className="alert-body">{children}</div>
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

// Avatar generated from initials with deterministic warm-toned bg
const Avatar = ({ name, size = 32 }) => {
  const initials = (name || "").split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</div>
  );
};

// Score card — used in brief header
const ScoreCard = ({ label, desc, value, of = 100, delta, tone, big }) => {
  const deltaCls = delta > 0 ? "score-delta up" : delta < 0 ? "score-delta down" : "score-delta";
  return (
    <div className="score-card">
      <div className="score-eyebrow">
        <span>{label}</span>
        {tone ? <Badge tone={tone}>{tone === "positive" ? "strong" : tone === "warn" ? "review" : tone === "danger" ? "flag" : ""}</Badge> : null}
      </div>
      <div className="score-value num">
        {value}
        <span className="over">/{of}</span>
      </div>
      <div className="muted xs">{desc}</div>
      {delta !== undefined ? (
        <div className={deltaCls}>
          <Icon name={delta > 0 ? "arrow-up" : delta < 0 ? "arrow-down" : "git-commit"} size={11} />
          {delta > 0 ? "+" : ""}{delta} vs role baseline
        </div>
      ) : null}
    </div>
  );
};

Object.assign(window, { Btn, Badge, Progress, Field, Spinner, Card, Sheet, Alert, Avatar, ScoreCard });


// === src/screen-jobs.jsx ===
// Active Jobs list (default landing)

function ScreenJobs({ go }) {
  const [query, setQuery] = useState("");
  const filtered = JOBS.filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.team.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Workspace · Acme Talent</div>
          <h1 className="page-title">Active <em>roles</em></h1>
          <div className="page-sub">Each role carries its own rubric. Candidates analysed against the rubric, with public proof-of-work surfaced as evidence.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Btn icon="filter" variant="ghost">All teams</Btn>
          <Btn icon="plus" variant="primary" onClick={() => go("job-new")}>New role</Btn>
        </div>
      </div>

      {/* Summary strip */}
      <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="score-card">
            <div className="score-eyebrow"><span>Open roles</span></div>
            <div className="score-value num">4</div>
            <div className="muted xs">2 platform, 1 ML, 1 DX</div>
          </div>
          <div className="score-card">
            <div className="score-eyebrow"><span>Candidates this week</span></div>
            <div className="score-value num">23 <span className="over">/30</span></div>
            <div className="muted xs">5 in analysis · 18 briefs ready</div>
          </div>
          <div className="score-card">
            <div className="score-eyebrow"><span>Avg evidence score</span></div>
            <div className="score-value num">78 <span className="over">/100</span></div>
            <div className="score-delta up"><Icon name="arrow-up" size={11}/>+6 vs last week</div>
          </div>
          <div className="score-card">
            <div className="score-eyebrow"><span>Time saved</span></div>
            <div className="score-value num">42<span className="over">h</span></div>
            <div className="muted xs">Estimated, last 7 days</div>
          </div>
        </div>
      </div>

      <Card
        padded={false}
        title="Roles"
        sub={`${filtered.length} of ${JOBS.length}`}
        action={
          <div className="input-prefix" style={{ width: 240 }}>
            <span className="pfx"><Icon name="search" size={12}/></span>
            <input className="input" placeholder="Search roles" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        }
      >
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Role</th>
              <th>Seniority</th>
              <th>Rubric</th>
              <th>Candidates</th>
              <th>Verified</th>
              <th>Flagged</th>
              <th>Status</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(j => (
              <tr key={j.id} className="row" onClick={() => go("brief", { id: "cand-amara" })}>
                <td>
                  <div style={{ fontWeight: 500 }}>{j.title}</div>
                  <div className="muted xs">{j.team} · {j.location}</div>
                </td>
                <td className="mono xs">{j.seniority}</td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                    {j.rubric.slice(0, 3).map(r => <Badge key={r}>{r}</Badge>)}
                    {j.rubric.length > 3 ? <span className="muted xs mono">+{j.rubric.length - 3}</span> : null}
                  </div>
                </td>
                <td className="num">{j.candidates}</td>
                <td><Badge tone="positive" dot>{j.verified}</Badge></td>
                <td>{j.flagged ? <Badge tone="danger" dot>{j.flagged}</Badge> : <span className="muted">—</span>}</td>
                <td>
                  {j.status === "Active"
                    ? <Badge tone="positive" dot>Active</Badge>
                    : <Badge>Paused</Badge>}
                </td>
                <td><Icon name="chevron-right" size={14} className="muted" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

window.ScreenJobs = ScreenJobs;


// === src/screen-job-setup.jsx ===
// Job Setup Screen — /dashboard/jobs/new

function ScreenJobSetup({ go }) {
  const [title, setTitle] = useState("Senior Full-Stack Engineer");
  const [desc, setDesc] = useState(
`We're hiring a Senior Full-Stack Engineer to own the realtime layer of our customer-facing platform.

You will:
• Lead the design and operation of our Postgres + Phoenix presence infrastructure (~2M concurrent connections, 6 regions).
• Drive p99 latency and on-call ergonomics. You set the bar.
• Mentor 2–3 engineers; lead one major launch per quarter.

You probably have:
• 5+ years shipping TypeScript and one of: Elixir, Go, Rust in production.
• Production experience with Postgres at scale (logical replication a plus).
• Public proof-of-work: OSS contributions, talks, or technical writing.

Compensation: $210–260k base + equity. Remote (US/EU).`
  );

  const [loading, setLoading] = useState(false);
  const [rubric, setRubric] = useState(null);
  const [logStep, setLogStep] = useState(0);

  const STEPS = [
    "Parsing role description",
    "Extracting must-have skills",
    "Inferring seniority signals",
    "Mapping to evidence sources",
    "Drafting rubric",
  ];

  useEffect(() => {
    if (!loading) return;
    setLogStep(0);
    const id = setInterval(() => {
      setLogStep(s => {
        if (s >= STEPS.length - 1) {
          clearInterval(id);
          setTimeout(() => {
            setLoading(false);
            setRubric({
              seniority: "L5 — Senior (high confidence)",
              mustHave: [
                { skill: "TypeScript", weight: "must-have", sourceQuote: "“5+ years shipping TypeScript”" },
                { skill: "Postgres at scale", weight: "must-have", sourceQuote: "“Postgres + Phoenix presence infrastructure”" },
                { skill: "Realtime / presence systems", weight: "must-have", sourceQuote: "“~2M concurrent connections, 6 regions”" },
                { skill: "On-call leadership", weight: "must-have", sourceQuote: "“drive on-call ergonomics”" },
              ],
              niceToHave: [
                { skill: "Elixir / Go / Rust", weight: "one-of", sourceQuote: "“and one of: Elixir, Go, Rust”" },
                { skill: "Logical replication", weight: "bonus", sourceQuote: "“logical replication a plus”" },
                { skill: "Public OSS / talks / writing", weight: "signal", sourceQuote: "“public proof-of-work”" },
              ],
              evidenceSources: ["GitHub (commits, ownership)", "Conference index (talks)", "Personal portfolio (writeups)", "Postgres mailing list", "LinkedIn (tenure cross-check)"],
            });
          }, 350);
          return s;
        }
        return s + 1;
      });
    }, 650);
    return () => clearInterval(id);
  }, [loading]);

  return (
    <div className="content" style={{ maxWidth: 1100 }}>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">New role · Draft</div>
          <h1 className="page-title">Set up the <em>rubric</em></h1>
          <div className="page-sub">Paste a JD. DeepHire extracts must-have skills, infers seniority, and decides which evidence sources to consult.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <Card title="Role description" sub="Pasted JD becomes the source of truth for the rubric.">
          <div className="stack" style={{ gap: 16 }}>
            <Field label="Job title">
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            </Field>
            <Field label="Job description" hint="Pasting the whole JD works best. We'll cite back to specific lines.">
              <textarea className="textarea" style={{ minHeight: 280 }} value={desc} onChange={e => setDesc(e.target.value)} />
            </Field>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="muted xs mono">{desc.length} chars · ~{Math.ceil(desc.split(/\s+/).length)} words</div>
              <Btn
                variant="primary"
                icon={loading ? null : "sparkles"}
                onClick={() => { setRubric(null); setLoading(true); }}
                disabled={loading || !title.trim() || !desc.trim()}
              >
                {loading ? <React.Fragment><Spinner /> Extracting…</React.Fragment> : "Generate Role Rubric"}
              </Btn>
            </div>
          </div>
        </Card>

        <div className="stack" style={{ gap: 16 }}>
          {loading ? (
            <Card title="Building rubric" sub="Streaming intermediate steps">
              <div className="stack" style={{ gap: 8 }}>
                {STEPS.map((s, i) => (
                  <div key={s} className={"step " + (i < logStep ? "done" : i === logStep ? "active" : "")}>
                    <span className="num">{i < logStep ? <Icon name="check" size={11}/> : i + 1}</span>
                    <div className="grow">
                      <div className="lbl">{s}</div>
                      {i === logStep ? <div className="sub mono">Extracting must-have skills and seniority…</div> : null}
                    </div>
                    {i === logStep ? <Spinner /> : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {rubric ? (
            <Card
              title="Role rubric"
              sub={rubric.seniority}
              action={<Badge tone="positive" dot>Ready</Badge>}
            >
              <div className="stack" style={{ gap: 18 }}>
                <div>
                  <div className="page-eyebrow" style={{ marginBottom: 8 }}>Must-have</div>
                  <div className="stack" style={{ gap: 6 }}>
                    {rubric.mustHave.map(r => (
                      <div key={r.skill} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                        <Badge tone="positive" dot>{r.weight}</Badge>
                        <div className="grow">
                          <div style={{ fontWeight: 500 }}>{r.skill}</div>
                          <div className="muted xs">cited from {r.sourceQuote}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rule" />

                <div>
                  <div className="page-eyebrow" style={{ marginBottom: 8 }}>Nice-to-have / signals</div>
                  <div className="stack" style={{ gap: 6 }}>
                    {rubric.niceToHave.map(r => (
                      <div key={r.skill} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                        <Badge>{r.weight}</Badge>
                        <div className="grow">
                          <div style={{ fontWeight: 500 }}>{r.skill}</div>
                          <div className="muted xs">cited from {r.sourceQuote}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rule" />

                <div>
                  <div className="page-eyebrow" style={{ marginBottom: 8 }}>Evidence sources we'll query</div>
                  <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
                    {rubric.evidenceSources.map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                </div>

                <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                  <Btn variant="ghost">Edit rubric</Btn>
                  <Btn variant="primary" iconRight="arrow-right" onClick={() => go("candidate-new")}>Add first candidate</Btn>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !rubric ? (
            <Card title="What you'll get">
              <div className="stack" style={{ gap: 10 }}>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <Icon name="scan" size={16} style={{ marginTop: 2, color: "var(--ink-2)" }}/>
                  <div>
                    <div style={{ fontWeight: 500 }}>A weighted rubric</div>
                    <div className="muted xs">Must-have skills, nice-to-haves, and seniority — each cited back to a line in your JD.</div>
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <Icon name="bot" size={16} style={{ marginTop: 2, color: "var(--ink-2)" }}/>
                  <div>
                    <div style={{ fontWeight: 500 }}>A retrieval plan</div>
                    <div className="muted xs">Which sources we'll consult per candidate (GitHub, talks, writing, profiles).</div>
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <Icon name="shield-check" size={16} style={{ marginTop: 2, color: "var(--ink-2)" }}/>
                  <div>
                    <div style={{ fontWeight: 500 }}>An audit trail</div>
                    <div className="muted xs">Every claim we verify links back to the page and snippet we pulled from.</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

window.ScreenJobSetup = ScreenJobSetup;


// === src/screen-candidate-upload.jsx ===
// Candidate Upload Screen — /dashboard/candidates/new

function ScreenCandidateUpload({ go }) {
  const [name, setName] = useState("");
  const [resume, setResume] = useState("");
  const [gh, setGh] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [job, setJob] = useState(JOBS[0].id);
  const [running, setRunning] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const canSubmit = name.trim() && (resume.trim() || resumeFile) && !running;

  const submit = () => {
    setRunning(true);
    setTimeout(() => go("analysis", { id: "cand-jess" }), 950);
  };

  const drop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setResumeFile({ name: f.name, size: f.size });
      setResume("(parsed from " + f.name + ")\n\nSenior Software Engineer with 7 years building distributed Python and Go services for fintech and observability companies…");
    }
  };

  return (
    <div className="content" style={{ maxWidth: 1100 }}>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Candidate intake</div>
          <h1 className="page-title">Add a <em>candidate</em></h1>
          <div className="page-sub">Drop their public surfaces. We'll extract claims from their resume, cross-check them against public proof, and produce a brief in ~90 seconds.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <Card title="Candidate materials" sub="The more public surfaces, the stronger the evidence packet.">
          <div className="stack" style={{ gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Candidate name">
                <input className="input" placeholder="Jessamine Rhee" value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field label="Role to evaluate against">
                <select className="select" value={job} onChange={e => setJob(e.target.value)}>
                  {JOBS.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Resume" hint="Drop a PDF, or paste raw text. We never display the resume; we extract claims and discard the file.">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={drop}
                style={{
                  border: "1.5px dashed var(--rule)", borderRadius: 10,
                  padding: 16, background: "var(--paper-2)",
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "var(--paper)", border: "1px solid var(--rule)",
                  display: "grid", placeItems: "center",
                }}>
                  <Icon name="upload" size={16}/>
                </div>
                <div className="grow">
                  {resumeFile ? (
                    <React.Fragment>
                      <div style={{ fontWeight: 500 }}>{resumeFile.name}</div>
                      <div className="muted xs">{(resumeFile.size/1024).toFixed(1)} KB · parsed</div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div style={{ fontWeight: 500 }}>Drop resume here</div>
                      <div className="muted xs">PDF, DOCX, or paste text below</div>
                    </React.Fragment>
                  )}
                </div>
                <Btn variant="ghost" size="sm" icon="file-text" onClick={() => setResumeFile({ name: "jess_rhee_resume.pdf", size: 184320 })}>Browse</Btn>
              </div>
              <textarea
                className="textarea"
                style={{ minHeight: 140, marginTop: 12 }}
                placeholder="…or paste raw resume text here"
                value={resume}
                onChange={e => setResume(e.target.value)}
              />
            </Field>

            <div className="rule"/>

            <div className="page-eyebrow">Public surfaces</div>

            <Field label="GitHub URL">
              <div className="input-prefix">
                <span className="pfx"><Icon name="github" size={12}/> github.com/</span>
                <input className="input" placeholder="jess-rhee" value={gh} onChange={e => setGh(e.target.value)} />
              </div>
            </Field>

            <Field label="Portfolio / personal site">
              <div className="input-prefix">
                <span className="pfx"><Icon name="globe" size={12}/> https://</span>
                <input className="input" placeholder="jess.codes" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
              </div>
            </Field>

            <Field label="LinkedIn or public profile" optional>
              <div className="input-prefix">
                <span className="pfx"><Icon name="linkedin" size={12}/> linkedin.com/in/</span>
                <input className="input" placeholder="jess-rhee" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>
            </Field>

            <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
              <div className="muted xs row" style={{ gap: 6 }}>
                <Icon name="shield-check" size={12} />
                Resume is parsed in-memory. Public pages we visit are listed in the evidence packet.
              </div>
              <Btn
                variant="primary"
                icon={running ? null : "play"}
                disabled={!canSubmit}
                onClick={submit}
              >
                {running ? <React.Fragment><Spinner/> Spinning up agents…</React.Fragment> : "Run DeepHire Analysis"}
              </Btn>
            </div>
          </div>
        </Card>

        <div className="stack" style={{ gap: 16 }}>
          <Card title="What runs next">
            <div className="stack" style={{ gap: 14 }}>
              <Stage n="1" icon="file-text" t="Claim extraction" s="Parse resume into atomic, verifiable claims (skills, tenures, projects, metrics)."/>
              <Stage n="2" icon="bot" t="Retrieval plan" s="Pick the right agent per claim: GitHub API, Browser, Web Search, Conference Index."/>
              <Stage n="3" icon="globe" t="Browser agent" s="Visit portfolio, follow demo links, capture screenshots and snippets."/>
              <Stage n="4" icon="scan" t="Cross-check" s="Match claims to retrieved evidence. Score by source quality and corroboration."/>
              <Stage n="5" icon="shield-check" t="Brief" s="Assemble the candidate brief with scores, shipped work, and flagged risks."/>
            </div>
          </Card>

          <Card title="Time & cost" sub="Estimated for this candidate">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="muted xs">Estimated analysis</div>
                <div className="num" style={{ fontFamily: "var(--serif)", fontSize: 28 }}>~90s</div>
              </div>
              <div>
                <div className="muted xs">Credits</div>
                <div className="num" style={{ fontFamily: "var(--serif)", fontSize: 28 }}>3 <span className="muted" style={{ fontSize: 14 }}>/ 200 left</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stage({ n, icon, t, s }) {
  return (
    <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "var(--paper-2)", border: "1px solid var(--rule)",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={14} />
      </div>
      <div className="grow">
        <div className="row" style={{ gap: 8 }}>
          <span className="mono xs muted">{n.padStart(2, "0")}</span>
          <span style={{ fontWeight: 500 }}>{t}</span>
        </div>
        <div className="muted xs" style={{ marginTop: 2 }}>{s}</div>
      </div>
    </div>
  );
}

window.ScreenCandidateUpload = ScreenCandidateUpload;


// === src/screen-analysis.jsx ===
// Analysis Status Screen — /dashboard/candidates/[id]/status

function ScreenAnalysis({ go, candidateId }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 700);
    return () => clearInterval(id);
  }, []);

  // Progress modeled as functions of tick; saturates after a while.
  const extractPct = Math.min(100, tick * 9);
  const retrievalPct = Math.min(100, Math.max(0, (tick - 5) * 7));
  const browserPct = Math.min(100, Math.max(0, (tick - 9) * 6));
  const overall = Math.round((extractPct + retrievalPct + browserPct) / 3);

  const cand = CANDIDATES.find(c => c.id === candidateId) || { name: "Jessamine Rhee", role: "Senior Full-Stack Engineer", handle: "jess-rhee" };

  const claims = [
    { id: "c1", text: "7 years professional software engineering experience", at: 1, status: "verified" },
    { id: "c2", text: "Authored 'thunderclap' (Go OSS, 1.8k stars)", at: 2, status: "verified" },
    { id: "c3", text: "Led migration to event-driven architecture at Northwind", at: 4, status: "checking" },
    { id: "c4", text: "Spoke at GopherCon NA 2024", at: 5, status: "checking" },
    { id: "c5", text: "Reduced infra costs by 38% (claim)", at: 6, status: "queued" },
  ];
  const visibleClaims = claims.filter(c => tick >= c.at);

  const agents = [
    { id: "github",  name: "GitHub API",       sub: "claims c1, c2, c5", start: 6,  done: 14, lines: [
      "[GET] /users/jess-rhee → 200",
      "Found 47 public repos · 1.8k stars on thunderclap",
      "Resolving commit authorship across orgs…",
      "Matched 3 PRs to claim c2 (✓ verified)",
    ]},
    { id: "browser", name: "Browser agent",    sub: "portfolio crawl",    start: 8,  done: 19, lines: [
      "Navigating https://jess.codes …",
      "Captured screenshot · 1440×900 · 184 KB",
      "Following demo link → thunderclap.dev",
      "Extracted snippet: “powering production at 4 fintechs”",
    ]},
    { id: "talks",   name: "Conference index", sub: "claim c4",           start: 10, done: 17, lines: [
      "Querying gophercon.com/2024/schedule",
      "Match: 'Rewriting our hot path in Go' — Jessamine Rhee",
      "YouTube recording: 22 min · 11k views",
    ]},
    { id: "linkedin",name: "LinkedIn parser",  sub: "tenure cross-check", start: 12, done: 20, lines: [
      "Tenure: Northwind 2022–2024 (matches resume)",
      "Cross-checking team-size claim…",
      "⚠ Public org chart shows 3 reports, resume claims 6",
    ]},
  ];

  return (
    <div className="content" style={{ maxWidth: 1280 }}>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Live analysis · Candidate {cand.handle}</div>
          <h1 className="page-title">Analysing <em>{cand.name}</em></h1>
          <div className="page-sub">DeepHire is extracting claims, dispatching agents, and assembling a brief. You can leave this page — we'll notify you when the brief is ready.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="pill"><i className="dot" style={{ background: "var(--accent)" }}/> Running · {String(Math.floor(tick * 0.7))}s elapsed</div>
          <Btn variant="ghost">Cancel</Btn>
          <Btn variant="primary" disabled={overall < 95} onClick={() => go("brief", { id: "cand-amara" })}>
            {overall < 95 ? "Open brief when ready" : "Open brief"}
          </Btn>
        </div>
      </div>

      {/* Overall bar */}
      <Card padded={false} className="grain" style={{ marginBottom: 24 }}>
        <div style={{ padding: "18px 22px" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={cand.name} size={36}/>
              <div>
                <div style={{ fontWeight: 600 }}>{cand.name}</div>
                <div className="muted xs">{cand.role} · job-7a14</div>
              </div>
            </div>
            <div className="num" style={{ fontFamily: "var(--serif)", fontSize: 36, lineHeight: 1 }}>{overall}<span className="muted" style={{ fontSize: 14 }}>%</span></div>
          </div>
          <Progress value={overall} />
          <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
            <div className="muted xs mono">12 claims · 4 agents · 31 pages visited · 6 screenshots</div>
            <div className="muted xs mono">est. {Math.max(2, Math.round((100 - overall) * 0.6))}s remaining</div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Claim extraction */}
        <Card title="Claim extraction" sub={`Extracted ${visibleClaims.length} verifiable claims`} action={<Badge tone={extractPct >= 100 ? "positive" : "indigo"} dot>{extractPct >= 100 ? "done" : "running"}</Badge>}>
          <Progress value={extractPct} />
          <div className="stack" style={{ gap: 6, marginTop: 14 }}>
            {visibleClaims.map(c => (
              <div key={c.id} className="row fade-up" style={{ alignItems: "flex-start", gap: 10 }}>
                <span className="mono xs muted" style={{ minWidth: 22 }}>{c.id}</span>
                <div className="grow xs" style={{ color: "var(--ink-2)" }}>{c.text}</div>
                {c.status === "verified"
                  ? <Badge tone="positive" dot>verified</Badge>
                  : c.status === "checking"
                  ? <Badge tone="indigo"><Spinner/></Badge>
                  : <Badge>queued</Badge>}
              </div>
            ))}
            {visibleClaims.length < claims.length ? (
              <div className="row" style={{ gap: 8, color: "var(--muted)" }}><Spinner/> <span className="xs">parsing next claim…</span></div>
            ) : null}
          </div>
        </Card>

        {/* Retrieval plan */}
        <Card title="Retrieval plan" sub="Routing claims to the best evidence source" action={<Badge tone={retrievalPct >= 100 ? "positive" : "indigo"} dot>{retrievalPct >= 100 ? "done" : "routing"}</Badge>}>
          <Progress value={retrievalPct} />
          <div className="stack" style={{ gap: 8, marginTop: 14 }}>
            {[
              { c: "c1, c2, c5", a: "GitHub API agent",       at: 6 },
              { c: "claim c3",   a: "Web Search + Browser",   at: 7 },
              { c: "claim c4",   a: "Conference Index agent", at: 9 },
              { c: "claim c3, c5", a: "LinkedIn parser",      at: 10 },
              { c: "claim c2",   a: "Hacker News index",      at: 11 },
            ].filter(r => tick >= r.at).map((r, i) => (
              <div key={i} className="row fade-up" style={{ gap: 10, alignItems: "center" }}>
                <Icon name="arrow-right" size={12} className="muted"/>
                <span className="mono xs" style={{ minWidth: 90, color: "var(--muted)" }}>{r.c}</span>
                <span className="xs grow" style={{ fontWeight: 500 }}>{r.a}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Confidence rising */}
        <Card title="Live signal" sub="Confidence as evidence accumulates">
          <div className="num" style={{ fontFamily: "var(--serif)", fontSize: 56, lineHeight: 1, marginTop: 6 }}>
            {Math.round(overall * 0.78)}<span className="muted" style={{ fontSize: 18 }}>/100</span>
          </div>
          <div className="muted xs" style={{ marginBottom: 14 }}>Provisional confidence</div>
          {/* Mini sparkline */}
          <svg viewBox="0 0 200 56" width="100%" height="56" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="var(--ink)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {(() => {
              const pts = Array.from({ length: 24 }, (_, i) => {
                const t = i / 23;
                const y = 50 - Math.min(46, (overall * 0.46) * t * (1 + 0.1 * Math.sin(i * 1.3)));
                return [i / 23 * 200, y];
              });
              const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
              return (
                <React.Fragment>
                  <path d={`${d} L200 56 L0 56 Z`} fill="url(#spk)"/>
                  <path d={d} fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
                </React.Fragment>
              );
            })()}
          </svg>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <span className="muted xs mono">t=0</span>
            <span className="muted xs mono">now</span>
          </div>
        </Card>
      </div>

      {/* Agent grid */}
      <Card padded={false} title="Browser & retrieval agents" sub="Each agent reports back here in real time" action={<Badge tone={browserPct >= 100 ? "positive" : "indigo"} dot>{browserPct >= 100 ? "done" : "active"}</Badge>}>
        <div style={{ padding: "8px 20px 16px" }}>
          <Progress value={browserPct}/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--rule)" }}>
          {agents.map((a, i) => {
            const active = tick >= a.start && tick < a.done;
            const done = tick >= a.done;
            const status = done ? "done" : active ? "running" : "queued";
            const visibleLines = a.lines.slice(0, Math.max(0, Math.min(a.lines.length, tick - a.start + 1)));
            return (
              <div key={a.id} style={{
                padding: "16px 20px",
                borderRight: i % 2 === 0 ? "1px solid var(--rule)" : "none",
                borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                minHeight: 180,
              }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: "var(--paper-2)", border: "1px solid var(--rule)",
                      display: "grid", placeItems: "center",
                    }}>
                      <Icon name={a.id === "github" ? "github" : a.id === "browser" ? "globe" : a.id === "talks" ? "play" : "linkedin"} size={13}/>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                      <div className="muted xs">{a.sub}</div>
                    </div>
                  </div>
                  {status === "done"
                    ? <Badge tone="positive" dot>done</Badge>
                    : status === "running"
                    ? <Badge tone="indigo"><Spinner/> running</Badge>
                    : <Badge>queued</Badge>}
                </div>
                {status === "queued" ? (
                  <div className="muted xs mono" style={{ marginTop: 28 }}>Waiting for upstream claims…</div>
                ) : (
                  <div>
                    {visibleLines.map((l, j) => (
                      <div key={j} className="log-line fade-up">
                        <span className="t">{String(Math.floor((a.start + j) * 0.7)).padStart(2, "0")}.{String(((a.start + j) * 7) % 10)}s</span>
                        <span className="src">{a.name.split(" ")[0]}</span>
                        <span style={{ color: l.startsWith("⚠") ? "var(--accent)" : "inherit" }}>{l}</span>
                      </div>
                    ))}
                    {active ? (
                      <div className="row" style={{ gap: 8, marginTop: 6, color: "var(--ink-2)" }}>
                        <span className="pulse-dot" style={{ color: "var(--accent)" }}/>
                        <span className="xs mono muted">streaming…</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="muted xs mono" style={{ marginTop: 16, textAlign: "center" }}>
        Press <span className="kbd">esc</span> to leave · you'll get a notification when the brief is ready
      </div>
    </div>
  );
}

window.ScreenAnalysis = ScreenAnalysis;


// === src/screen-brief.jsx ===
// Candidate Brief — the flagship screen.

function ScreenBrief({ go }) {
  const c = BRIEF;
  const [evidenceFor, setEvidenceFor] = useState(null);
  const [tab, setTab] = useState("overview");

  return (
    <div className="content full" style={{ padding: "24px 40px 80px", maxWidth: 1320, margin: "0 auto" }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 18, minWidth: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: "var(--ink)", color: "var(--paper)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--serif)", fontSize: 24, fontStyle: "italic",
            flexShrink: 0,
          }}>{c.name.split(" ").map(s => s[0]).join("")}</div>
          <div style={{ minWidth: 0 }}>
            <div className="page-eyebrow">Brief · {c.brief}</div>
            <h1 className="page-title" style={{ fontSize: 42 }}>{c.name} <em style={{ fontSize: 20, fontStyle: "italic", color: "var(--muted)" }}>{c.pronouns}</em></h1>
            <div className="row muted" style={{ gap: 14, marginTop: 8, fontSize: 13, flexWrap: "wrap" }}>
              <span>{c.role}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{c.location}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span className="row" style={{ gap: 6 }}><Icon name="github" size={12}/>{c.links.github}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span className="row" style={{ gap: 6 }}><Icon name="globe" size={12}/>{c.links.portfolio}</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Btn variant="ghost" icon="download">Export PDF</Btn>
          <Btn variant="ghost" icon="share">Share</Btn>
          <Btn variant="ghost" icon="thumbs-down">Pass</Btn>
          <Btn variant="primary" icon="thumbs-up">Advance to phone screen</Btn>
        </div>
      </div>

      {/* Score strip — instrument panel */}
      <Card padded={false} className="grain" style={{ marginBottom: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          <ScoreCard {...c.scores.fit} tone="positive"/>
          <ScoreCard {...c.scores.evidence} tone="positive"/>
          <ScoreCard {...c.scores.shipped} tone="warn"/>
          <ScoreCard {...c.scores.confidence} tone="positive"/>
        </div>
      </Card>

      {/* One-liner */}
      <div style={{
        padding: "20px 24px",
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderTop: "none",
        borderRadius: "0 0 12px 12px",
        fontFamily: "var(--serif)",
        fontSize: 20,
        lineHeight: 1.4,
        marginBottom: 28,
      }}>
        <span style={{ color: "var(--muted)", fontStyle: "italic", marginRight: 8 }}>tl;dr —</span>
        {c.oneLiner}
      </div>

      {/* Sticky tabs */}
      <div className="row" style={{ gap: 4, borderBottom: "1px solid var(--rule)", marginBottom: 22, position: "sticky", top: 56, background: "var(--bg)", zIndex: 5 }}>
        {[
          ["overview", "Overview"],
          ["shipped",  "Shipped work"],
          ["claims",   "Claim verification"],
          ["risks",    "Risk flags"],
          ["timeline", "Timeline"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: "12px 14px",
              background: "transparent",
              border: "none",
              borderBottom: tab === k ? "2px solid var(--ink)" : "2px solid transparent",
              fontWeight: tab === k ? 600 : 400,
              color: tab === k ? "var(--ink)" : "var(--muted)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >{l}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <div className="row" style={{ gap: 8, padding: "8px 0" }}>
          <Badge tone="positive" dot>{c.verifiedClaims.length} verified</Badge>
          <Badge tone="warn" dot>{c.weakClaims.length} weak</Badge>
          <Badge tone="danger" dot>{c.risks.length} risks</Badge>
        </div>
      </div>

      {/* Body — left two-col main, right rail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div className="stack" style={{ gap: 24, minWidth: 0 }}>
          {/* Risks at top — most important to recruiter */}
          {(tab === "overview" || tab === "risks") ? (
            <div className="stack" style={{ gap: 10 }}>
              {c.risks.map(r => (
                <Alert key={r.id} tone={r.severity} title={r.title}
                  action={<Btn variant="ghost" size="sm" onClick={() => setEvidenceFor({ id: "v2" })}>See evidence</Btn>}>
                  {r.body}
                </Alert>
              ))}
            </div>
          ) : null}

          {/* Best shipped work */}
          {(tab === "overview" || tab === "shipped") ? (
            <Card
              title="Best shipped work"
              sub="Ranked by relevance to the role rubric, with public corroboration."
              action={<Badge tone="positive" dot>3 strong projects</Badge>}
              padded={false}
            >
              <div className="stack" style={{ gap: 0 }}>
                {c.shipped.map((s, i) => (
                  <ShippedRow key={s.id} item={s} rank={i + 1}/>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Claim verification */}
          {(tab === "overview" || tab === "claims") ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Verified signals" sub={`${c.verifiedClaims.length} claims with strong public support`} padded={false}
                action={<Badge tone="positive" dot>strong</Badge>}>
                <div>
                  {c.verifiedClaims.map(v => (
                    <ClaimRow key={v.id} claim={v} kind="verified" onOpen={() => setEvidenceFor(v)}/>
                  ))}
                </div>
              </Card>

              <Card title="Weak or unverified" sub={`${c.weakClaims.length} claims to ask about in the interview`} padded={false}
                action={<Badge tone="warn" dot>follow up</Badge>}>
                <div>
                  {c.weakClaims.map(w => (
                    <ClaimRow key={w.id} claim={w} kind="weak"/>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {/* Timeline */}
          {(tab === "overview" || tab === "timeline") ? (
            <Card title="Verified timeline" sub="Cross-referenced from GitHub history, LinkedIn, and public mentions">
              <Timeline/>
            </Card>
          ) : null}
        </div>

        {/* Right rail */}
        <div className="stack" style={{ gap: 16, position: "sticky", top: 120 }}>
          <Card title="Decision support" sub="Auto-drafted, you decide">
            <div className="stack" style={{ gap: 10 }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                <span className="num" style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1, color: "var(--positive)" }}>87</span>
                <div className="grow xs">
                  <div style={{ fontWeight: 500, color: "var(--ink)" }}>Recommend advancing</div>
                  <div className="muted">High evidence + 2 strong shipped projects matching rubric.</div>
                </div>
              </div>
              <div className="rule"/>
              <div className="page-eyebrow">Suggested phone-screen questions</div>
              <PSQ q="Walk us through the WAL-replay design in pg-rewind-live. What did you try first that didn't work?"/>
              <PSQ q="The resume mentions a CUDA-accelerated retrieval pipeline — we couldn't find public traces. Can you describe its architecture?"/>
              <PSQ q="There's a 5-week overlap between Sundial and Northwind. Was that a transition period?"/>
            </div>
          </Card>

          <Card title="Sources consulted" sub="31 pages · 6 screenshots">
            <div className="stack" style={{ gap: 8 }}>
              <SourceRow icon="github" t="GitHub" s="47 repos · 11 PRs analysed"/>
              <SourceRow icon="globe" t="amara.codes" s="4 pages · 1 screenshot"/>
              <SourceRow icon="play" t="ElixirConf EU 2024" s="Talk + slides indexed"/>
              <SourceRow icon="linkedin" t="LinkedIn" s="Cross-checked tenures"/>
              <SourceRow icon="file-text" t="Postgres mailing list" s="2 threads referenced"/>
              <SourceRow icon="file-text" t="Hacker News" s="1 thread (39281047)"/>
            </div>
            <div className="rule"/>
            <Btn variant="ghost" size="sm" icon="external" className="grow">Open full evidence packet</Btn>
          </Card>

          <Card title="Reviewer notes">
            <textarea className="textarea" placeholder="Add a note for the hiring panel…" style={{ minHeight: 100, fontFamily: "var(--serif)", fontSize: 14 }}/>
            <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
              <span className="muted xs">Visible to panel · auto-attached to packet</span>
              <Btn size="sm" variant="primary">Save note</Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* Evidence sheet */}
      <Sheet
        open={!!evidenceFor}
        onClose={() => setEvidenceFor(null)}
        sub="Evidence packet"
        title={evidenceFor ? (EVIDENCE[evidenceFor.id]?.title || evidenceFor.claim) : ""}
      >
        {evidenceFor ? <EvidenceBody data={EVIDENCE[evidenceFor.id] || demoEvidence(evidenceFor)}/> : null}
      </Sheet>
    </div>
  );
}

function ShippedRow({ item, rank }) {
  const [expanded, setExpanded] = useState(rank === 1);
  return (
    <div style={{ borderBottom: "1px solid var(--rule-soft)", padding: "20px 24px" }}>
      <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 16, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--paper-2)", border: "1px solid var(--rule)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--serif)", fontSize: 15,
            flexShrink: 0,
          }}>{rank}</div>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.1 }}>{item.title}</div>
              <span className="muted xs mono">{item.kind}</span>
            </div>
            <div style={{ marginTop: 6, color: "var(--ink-2)", maxWidth: 70 + "ch" }}>{item.blurb}</div>
            <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {item.stack.map(s => <Badge key={s}>{s}</Badge>)}
            </div>
          </div>
        </div>
        <Btn variant="ghost" size="sm" iconRight={expanded ? "chevron-down" : "chevron-right"} onClick={() => setExpanded(e => !e)}>
          {expanded ? "Hide" : "Open"}
        </Btn>
      </div>

      {expanded ? (
        <div className="fade-up" style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 220px", gap: 20 }}>
          <div>
            <div className="page-eyebrow" style={{ marginBottom: 6 }}>Why it's impressive</div>
            <div style={{ color: "var(--ink-2)" }}>{item.whyImpressive}</div>
          </div>
          <div>
            <div className="page-eyebrow" style={{ marginBottom: 6 }}>Relevance to the role</div>
            <div style={{ color: "var(--ink-2)" }}>{item.relevance}</div>
            <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {item.links.map(l => (
                <a key={l.label} className="badge" href="#" onClick={e => e.preventDefault()} style={{ textDecoration: "none" }}>
                  <Icon name={l.kind === "repo" ? "github" : l.kind === "talk" ? "play" : l.kind === "demo" ? "external" : "file-text"} size={11}/>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{
            background: "var(--paper-2)",
            border: "1px solid var(--rule)",
            borderRadius: 8,
            padding: 12,
          }}>
            <div className="page-eyebrow" style={{ marginBottom: 8 }}>Public metrics</div>
            <div className="stack" style={{ gap: 6 }}>
              {item.metrics.map(m => (
                <div key={m.k} className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted xs">{m.k}</span>
                  <span className="mono xs" style={{ fontWeight: 600 }}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClaimRow({ claim, kind, onOpen }) {
  return (
    <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--rule-soft)" }}>
      <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
        <Icon
          name={kind === "verified" ? "shield-check" : "alert-circle"}
          size={14}
          style={{ marginTop: 2, color: kind === "verified" ? "var(--positive)" : "var(--amber)" }}
        />
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--ink)" }}>{claim.claim}</div>
          {kind === "verified" ? (
            <div className="row muted xs" style={{ gap: 8, marginTop: 6 }}>
              <span className="mono">{claim.source}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{claim.evidenceCount} sources</span>
            </div>
          ) : (
            <div className="muted xs" style={{ marginTop: 6 }}>{claim.issue}</div>
          )}
        </div>
        {kind === "verified" ? (
          <div style={{ minWidth: 88 }}>
            <div className="row" style={{ justifyContent: "flex-end", marginBottom: 4 }}>
              <span className="mono xs">{Math.round(claim.strength * 100)}%</span>
            </div>
            <Progress value={claim.strength * 100} tone="positive"/>
            <button className="btn ghost sm" style={{ marginTop: 6, height: 22, padding: "0 6px", fontSize: 11 }} onClick={onOpen}>Evidence →</button>
          </div>
        ) : (
          <Badge tone={claim.severity === "ask-in-interview" ? "warn" : "default"}>{claim.severity}</Badge>
        )}
      </div>
    </div>
  );
}

function PSQ({ q }) {
  return (
    <div style={{
      border: "1px solid var(--rule-soft)",
      borderLeft: "2px solid var(--ink)",
      borderRadius: 4,
      padding: "8px 10px",
      background: "var(--paper-2)",
      fontFamily: "var(--serif)",
      fontSize: 14,
      lineHeight: 1.4,
    }}>“{q}”</div>
  );
}

function SourceRow({ icon, t, s }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <Icon name={icon} size={14} className="muted"/>
      <div className="grow xs">
        <div style={{ fontWeight: 500, color: "var(--ink)" }}>{t}</div>
        <div className="muted">{s}</div>
      </div>
      <Icon name="external" size={12} className="muted"/>
    </div>
  );
}

function Timeline() {
  const events = [
    { y: "2018", t: "BS Computer Science, ETH Zürich", k: "education" },
    { y: "2018", t: "Software Engineer, Northwind", k: "job", verified: true },
    { y: "2020", t: "Senior Engineer, Northwind", k: "job", verified: true },
    { y: "2022", t: "First commit to pg-rewind-live", k: "oss", verified: true },
    { y: "2022", t: "Staff Eng, Realtime — Sundial", k: "job", verified: true, flag: "Overlap w/ Northwind: 5 weeks" },
    { y: "2024", t: "ElixirConf EU talk — Realtime at Sundial", k: "talk", verified: true },
    { y: "2024", t: "pg-rewind-live v1.0 release", k: "oss", verified: true },
    { y: "2026", t: "Available for new opportunities", k: "now" },
  ];
  return (
    <div style={{ position: "relative", paddingLeft: 18 }}>
      <div style={{ position: "absolute", left: 4, top: 8, bottom: 8, width: 1, background: "var(--rule)" }}/>
      <div className="stack" style={{ gap: 16 }}>
        {events.map((e, i) => (
          <div key={i} className="row" style={{ alignItems: "flex-start", gap: 14 }}>
            <div style={{
              position: "absolute", left: 0,
              width: 9, height: 9, borderRadius: 50,
              marginTop: 5,
              background: e.flag ? "var(--accent)" : e.k === "now" ? "var(--ink)" : "var(--paper)",
              border: "1.5px solid " + (e.flag ? "var(--accent)" : "var(--ink-2)"),
              transform: `translateY(${i * 32}px)`,
            }}/>
            <div className="mono xs muted" style={{ minWidth: 44 }}>{e.y}</div>
            <div className="grow">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 13 }}>{e.t}</span>
                {e.verified ? <Badge tone="positive">verified</Badge> : null}
                {e.flag ? <Badge tone="danger" dot>{e.flag}</Badge> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceBody({ data }) {
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row" style={{ gap: 10, alignItems: "center" }}>
        <Badge tone="positive" dot>strength {Math.round((data.strength || 0.9) * 100)}%</Badge>
        <span className="muted xs">{(data.pages || []).length} pages · {(data.snippets || []).length} snippets · 1 screenshot</span>
      </div>

      <div>
        <div className="page-eyebrow" style={{ marginBottom: 10 }}>Playwright screenshot</div>
        <div className="img-ph" style={{ height: 180 }}>
          <div className="stack" style={{ alignItems: "center", gap: 4 }}>
            <Icon name="image" size={22}/>
            <span>screenshot · {data.screenshot}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="page-eyebrow" style={{ marginBottom: 10 }}>Visited pages</div>
        <div className="stack" style={{ gap: 6 }}>
          {(data.pages || []).map((p, i) => (
            <div key={i} className="row" style={{ alignItems: "flex-start", gap: 10, padding: "8px 10px", border: "1px solid var(--rule-soft)", borderRadius: 6, background: "var(--paper-2)" }}>
              <Icon name="link" size={12} className="muted" style={{ marginTop: 4 }}/>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="mono xs truncate" style={{ color: "var(--ink)" }}>{p.url}</div>
                <div className="muted xs">{p.note}</div>
              </div>
              <Icon name="external" size={12} className="muted"/>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="page-eyebrow" style={{ marginBottom: 10 }}>Extracted snippets</div>
        <div className="stack" style={{ gap: 8 }}>
          {(data.snippets || []).map((s, i) => (
            <div key={i} style={{
              padding: "10px 12px",
              borderLeft: "2px solid var(--ink)",
              background: "var(--paper-2)",
              borderRadius: "0 6px 6px 0",
            }}>
              <div className="muted xs mono" style={{ marginBottom: 4 }}>{s.src}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.45 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Btn variant="ghost" icon="copy" size="sm">Copy citation</Btn>
        <Btn variant="ghost" icon="download" size="sm">Download packet</Btn>
      </div>
    </div>
  );
}

function demoEvidence(claim) {
  return {
    title: claim.claim || "Claim evidence",
    strength: claim.strength || 0.8,
    pages: [{ url: "example.com/page", note: "Reference page" }],
    snippets: [{ src: "Page text", text: "“…relevant excerpt from the page that supports this claim.”" }],
    screenshot: "Browser capture",
  };
}

window.ScreenBrief = ScreenBrief;


// === src/screen-settings.jsx ===
function ScreenSettings() {
  return (
    <div className="content" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Workspace</div>
          <h1 className="page-title"><em>Settings</em></h1>
        </div>
      </div>

      <div className="stack" style={{ gap: 16 }}>
        <Card title="Evidence sources" sub="Which public surfaces DeepHire is allowed to query">
          <div className="stack" style={{ gap: 10 }}>
            {[
              ["GitHub", "Public repos, PRs, commit authorship", true],
              ["Conference indexes", "Speakers, schedules, recordings", true],
              ["LinkedIn", "Public profile pages (tenure cross-check)", true],
              ["Hacker News", "Author confirmation in threads", true],
              ["Twitter / X", "Authored posts (signal only)", false],
              ["Mastodon", "Authored posts (signal only)", false],
            ].map(([t, s, on]) => (
              <div key={t} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{t}</div>
                  <div className="muted xs">{s}</div>
                </div>
                <div className={"row " + (on ? "" : "muted")} style={{ gap: 8 }}>
                  <Badge tone={on ? "positive" : "default"} dot>{on ? "enabled" : "off"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Team" sub="Recruiters with access to this workspace">
          <div className="stack" style={{ gap: 10 }}>
            {[
              ["Yara Bekele", "yara@acmetalent.co", "Admin"],
              ["Devon Park", "devon@acmetalent.co", "Recruiter"],
              ["Sam Rivera", "sam@acmetalent.co", "Hiring Manager"],
            ].map(([n, e, r]) => (
              <div key={n} className="row" style={{ gap: 12, padding: "6px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <Avatar name={n} size={32}/>
                <div className="grow">
                  <div style={{ fontWeight: 500 }}>{n}</div>
                  <div className="muted xs">{e}</div>
                </div>
                <Badge>{r}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

window.ScreenSettings = ScreenSettings;


// === src/app.jsx ===
// Main app shell + routing

function App() {
  const [route, setRoute] = useState({ name: "jobs", params: {} });
  const [collapsed, setCollapsed] = useState(false);

  const go = (name, params = {}) => setRoute({ name, params });

  // Top breadcrumb per route
  const crumb = (() => {
    switch (route.name) {
      case "jobs": return ["Workspace", "Active roles"];
      case "job-new": return ["Workspace", "Roles", "New role"];
      case "candidate-new": return ["Workspace", "Candidates", "New candidate"];
      case "analysis": return ["Workspace", "Candidates", "Analysing…"];
      case "brief": return ["Workspace", "Candidates", BRIEF.name];
      case "settings": return ["Workspace", "Settings"];
      default: return ["Workspace"];
    }
  })();

  return (
    <div className={"app " + (collapsed ? "collapsed" : "")}>
      <aside className="sidebar">
        <button className="collapse-toggle" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          <Icon name={collapsed ? "chevrons-right" : "chevrons-left"} size={12}/>
        </button>

        <div className="brand">
          <div className="brand-mark">D</div>
          <div className="brand-text">
            <div className="brand-name">DeepHire</div>
            <div className="brand-sub">Candidate intelligence</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section">Workspace</div>
          <NavItem icon="briefcase" label="Active roles" count="4" active={["jobs","job-new","brief","analysis"].includes(route.name)} onClick={() => go("jobs")}/>
          <NavItem icon="user-plus" label="Add candidate" active={route.name === "candidate-new"} onClick={() => go("candidate-new")}/>
          <NavItem icon="users" label="Candidates" count="23" onClick={() => go("jobs")}/>

          <div className="nav-section">Recent</div>
          {CANDIDATES.slice(0, 4).map(c => (
            <NavItem
              key={c.id}
              custom={
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <Avatar name={c.name} size={20}/>
                  <div className="label truncate">{c.name}</div>
                </div>
              }
              active={route.name === "brief" && route.params.id === c.id}
              onClick={() => go(c.id === "cand-jess" ? "analysis" : "brief", { id: c.id })}
              count={c.status === "Analyzing" ? <Spinner/> : c.status === "Flagged" ? <Icon name="alert-circle" size={11} style={{ color: "var(--accent)" }}/> : null}
            />
          ))}

          <div className="nav-section">Admin</div>
          <NavItem icon="settings" label="Settings" active={route.name === "settings"} onClick={() => go("settings")}/>
        </nav>

        <div className="sidebar-foot">
          <div className="user-card">
            <Avatar name="Yara Bekele"/>
            <div className="meta">
              <div className="name">Yara Bekele</div>
              <div className="email">Acme Talent · admin</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="breadcrumb">
            {crumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <Icon name="chevron-right" size={11} className="sep"/> : null}
                <span className={i === crumb.length - 1 ? "here" : ""}>{c}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="spacer"/>
          <div className="right">
            <div className="pill"><Icon name="command" size={12}/> <span className="muted">jump to candidate</span> <span className="kbd">⌘K</span></div>
            <div className="pill"><i className="dot"/> 4 agents healthy</div>
            <Btn variant="ghost" size="sm" icon="plus" onClick={() => go("candidate-new")}>Add candidate</Btn>
          </div>
        </div>

        {route.name === "jobs" ? <ScreenJobs go={go}/> :
         route.name === "job-new" ? <ScreenJobSetup go={go}/> :
         route.name === "candidate-new" ? <ScreenCandidateUpload go={go}/> :
         route.name === "analysis" ? <ScreenAnalysis go={go} candidateId={route.params.id}/> :
         route.name === "brief" ? <ScreenBrief go={go}/> :
         route.name === "settings" ? <ScreenSettings/> :
         null}
      </main>
    </div>
  );
}

function NavItem({ icon, label, count, active, onClick, custom }) {
  return (
    <div className={"nav-item " + (active ? "active" : "")} onClick={onClick}>
      {custom ? custom : (
        <React.Fragment>
          <Icon name={icon} size={15} className="ico"/>
          <span className="label">{label}</span>
        </React.Fragment>
      )}
      {count !== undefined && count !== null ? <span className="count">{count}</span> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);


