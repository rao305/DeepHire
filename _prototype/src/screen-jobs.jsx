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
