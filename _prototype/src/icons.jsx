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
