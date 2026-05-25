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
