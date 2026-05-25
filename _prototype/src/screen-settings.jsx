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
