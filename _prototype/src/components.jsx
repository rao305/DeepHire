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
