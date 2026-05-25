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
