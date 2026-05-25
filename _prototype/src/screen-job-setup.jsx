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
