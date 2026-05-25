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
