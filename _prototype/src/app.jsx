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
