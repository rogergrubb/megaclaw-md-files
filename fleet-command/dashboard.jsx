import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MEGA CLAW FLEET COMMAND — The Nerve Center
// ═══════════════════════════════════════════════════════════════

const CLAWS = [
  {
    id: "mac-mini",
    name: "CLAW-01 · Mac Mini",
    codename: "THE HIVE",
    ip: "100.102.214.56",
    status: "active",
    model: "Claude Sonnet 4.6",
    uptime: "4d 12h 33m",
    currentTask: "Exploring: What if daily What-If log reveals patterns?",
    taskType: "exploration",
    cpu: 23,
    mem: 61,
    tokens24h: 142800,
    experiences: 12,
    connections: 8,
    whatIfs: 7,
  },
  {
    id: "workstation",
    name: "CLAW-02 · Workstation",
    codename: "THE FORGE",
    ip: "100.118.88.97",
    status: "active",
    model: "OpenRouter Auto",
    uptime: "1d 8h 17m",
    currentTask: "Building SellFast.Now landing page components",
    taskType: "building",
    cpu: 67,
    mem: 44,
    tokens24h: 89200,
    experiences: 6,
    connections: 3,
    whatIfs: 4,
  },
  {
    id: "laptop",
    name: "CLAW-03 · Laptop",
    codename: "THE SCOUT",
    ip: "100.86.158.97",
    status: "idle",
    model: "Claude Opus 4.6",
    uptime: "0d 2h 45m",
    currentTask: "Awaiting mission...",
    taskType: "idle",
    cpu: 3,
    mem: 22,
    tokens24h: 12400,
    experiences: 2,
    connections: 1,
    whatIfs: 2,
  },
];

const PROJECTS = [
  {
    name: "Mega Claw",
    status: "active",
    phase: "Phase 2: Loose Guardrails",
    progress: 35,
    claws: ["mac-mini"],
    started: "Feb 27, 2026",
    lastActivity: "2 min ago",
    description: "Autonomous AI agent — connection engine",
    milestones: [
      { name: "Philosophy", done: true },
      { name: "Workspace Files", done: true },
      { name: "Deployment", done: true },
      { name: "Proactive Skills", done: false },
      { name: "Multi-Agent Orchestration", done: false },
      { name: "Self-Improvement Loop", done: false },
    ],
  },
  {
    name: "SellFast.Now",
    status: "active",
    phase: "Track 1: Revenue",
    progress: 18,
    claws: ["workstation"],
    started: "Feb 20, 2026",
    lastActivity: "14 min ago",
    description: "AI-assisted software projects for revenue",
    milestones: [
      { name: "Concept", done: true },
      { name: "Landing Page", done: false },
      { name: "First Client", done: false },
      { name: "First $100", done: false },
      { name: "Scaling", done: false },
    ],
  },
  {
    name: "Fleet Command Dashboard",
    status: "active",
    phase: "Build",
    progress: 80,
    claws: ["mac-mini", "laptop"],
    started: "Mar 9, 2026",
    lastActivity: "Just now",
    description: "Mission control for all Mega Claw instances",
    milestones: [
      { name: "Design", done: true },
      { name: "Build", done: true },
      { name: "Deploy to Mac Mini", done: false },
      { name: "Live Data Integration", done: false },
    ],
  },
];

const ACTIVITY_LOG = [
  { time: "9:07 PM", claw: "CLAW-01", type: "whatif", msg: "Generated: 'What if we built a client intake form that auto-generates project scope?'" },
  { time: "9:02 PM", claw: "CLAW-02", type: "build", msg: "Created React component: HeroSection.jsx for SellFast.Now" },
  { time: "8:48 PM", claw: "CLAW-01", type: "memory", msg: "Updated MEMORY.md: Proactive Agent skill patterns integrated" },
  { time: "8:31 PM", claw: "CLAW-02", type: "research", msg: "Browsing competitor landing pages via Chrome CDP" },
  { time: "8:15 PM", claw: "CLAW-01", type: "heartbeat", msg: "HEARTBEAT_OK — No pending missions. Exploring What Ifs." },
  { time: "7:44 PM", claw: "CLAW-03", type: "boot", msg: "Gateway started. SOUL.md loaded. Awaiting first mission." },
  { time: "7:30 PM", claw: "CLAW-01", type: "skill", msg: "Installed @halthelobster/proactive-agent v3.1.0" },
  { time: "6:12 PM", claw: "CLAW-02", type: "iteration", msg: "SellFast.Now: Iteration 4/25 — testing color palette variants" },
];

// Particle background
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.5 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 200, ${p.o})`;
        ctx.fill();
      });
      // draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 200, ${0.06 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

// Status colors
const statusColor = (s) => s === "active" ? "#00ffc8" : s === "idle" ? "#ffab00" : "#ff1744";
const taskColor = (t) => t === "building" ? "#4fc3f7" : t === "exploration" ? "#ce93d8" : t === "research" ? "#ffb74d" : t === "idle" ? "#666" : "#00ffc8";

// Circular gauge
function Gauge({ value, label, color, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ marginTop: -size + 8, height: size - 8, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, fontWeight: 700, color }}>{value}%</div>
      </div>
      <div style={{ fontSize: 9, color: "#667", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// Progress bar with milestones
function MilestoneTrack({ milestones }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", marginTop: 8 }}>
      {milestones.map((m, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", height: 4, borderRadius: 2,
            background: m.done ? "linear-gradient(90deg, #00ffc8, #00bfa5)" : "rgba(255,255,255,0.08)",
            boxShadow: m.done ? "0 0 8px rgba(0,255,200,0.3)" : "none",
          }} />
          <div style={{ fontSize: 8, color: m.done ? "#00ffc8" : "#445", letterSpacing: 0.5, textAlign: "center", lineHeight: 1.2 }}>{m.name}</div>
        </div>
      ))}
    </div>
  );
}

// Activity type badge
function TypeBadge({ type }) {
  const colors = {
    whatif: { bg: "rgba(206,147,216,0.15)", fg: "#ce93d8" },
    build: { bg: "rgba(79,195,247,0.15)", fg: "#4fc3f7" },
    memory: { bg: "rgba(0,255,200,0.12)", fg: "#00ffc8" },
    research: { bg: "rgba(255,183,77,0.15)", fg: "#ffb74d" },
    heartbeat: { bg: "rgba(255,255,255,0.05)", fg: "#556" },
    boot: { bg: "rgba(0,255,200,0.08)", fg: "#00bfa5" },
    skill: { bg: "rgba(129,212,250,0.12)", fg: "#81d4fa" },
    iteration: { bg: "rgba(255,171,0,0.12)", fg: "#ffab00" },
  };
  const c = colors[type] || colors.heartbeat;
  return (
    <span style={{
      fontFamily: "'Fira Code', monospace", fontSize: 9, letterSpacing: 1,
      textTransform: "uppercase", padding: "2px 6px", borderRadius: 3,
      background: c.bg, color: c.fg,
    }}>{type}</span>
  );
}

// Browser feed component
function BrowserFeed({ ip, codename, expanded, onToggle }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () => {
      const ts = Date.now();
      const url = `http://${ip}:18792/screenshot?t=${ts}`;
      const img = new Image();
      img.onload = () => { setImgSrc(url); setLastUpdate(new Date()); setError(false); };
      img.onerror = () => { setError(true); };
      img.src = url;
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [ip]);

  if (expanded) {
    return (
      <div onClick={onToggle} style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 4,
          color: "#00ffc8", marginBottom: 12, textTransform: "uppercase",
        }}>{codename} — Live Browser</div>
        {imgSrc ? (
          <img src={imgSrc} style={{
            maxWidth: "95%", maxHeight: "80vh", borderRadius: 8,
            border: "1px solid rgba(0,255,200,0.2)",
            boxShadow: "0 0 40px rgba(0,255,200,0.1)",
          }} />
        ) : (
          <div style={{ color: "#556", fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
            {error ? "Feed offline — capture service not running" : "Loading..."}
          </div>
        )}
        <div style={{
          fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#445", marginTop: 12,
        }}>Tap anywhere to close · Updates every 30s</div>
      </div>
    );
  }

  return (
    <div onClick={onToggle} style={{
      marginTop: 10, borderRadius: 8, overflow: "hidden", cursor: "pointer",
      border: "1px solid rgba(255,255,255,0.06)", position: "relative",
      background: "#0a0c12", minHeight: 90,
    }}>
      {imgSrc ? (
        <img src={imgSrc} style={{ width: "100%", height: "auto", display: "block", opacity: 0.85 }} />
      ) : (
        <div style={{
          height: 90, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#334",
        }}>
          {error ? "📡 Feed offline" : "⏳ Connecting..."}
        </div>
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(6,8,13,0.9))",
        padding: "16px 8px 4px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: "#00ffc8", letterSpacing: 1 }}>
          🔴 LIVE · CHROME
        </span>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: "#334" }}>
          {lastUpdate ? lastUpdate.toLocaleTimeString() : "—"}
        </span>
      </div>
    </div>
  );
}

// Claw node visualization
function ClawNode({ claw, selected, onClick }) {
  const [feedExpanded, setFeedExpanded] = useState(false);
  const isActive = claw.status === "active";
  return (
    <>
      {feedExpanded && (
        <BrowserFeed ip={claw.ip} codename={claw.codename} expanded={true}
          onToggle={() => setFeedExpanded(false)} />
      )}
      <div style={{
        padding: 16, borderRadius: 16,
        background: selected ? "rgba(0,255,200,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? "rgba(0,255,200,0.3)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.3s ease", position: "relative", overflow: "hidden",
      }}>
        {isActive && <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, #00ffc8, transparent)",
          animation: "shimmer 3s ease-in-out infinite",
        }} />}
        <div onClick={onClick} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#556", letterSpacing: 1 }}>{claw.codename}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f0", marginTop: 2 }}>{claw.name}</div>
            </div>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: statusColor(claw.status),
              boxShadow: `0 0 12px ${statusColor(claw.status)}40`,
              animation: isActive ? "pulse 2s ease-in-out infinite" : "none",
            }} />
          </div>
          <div style={{ fontSize: 12, color: taskColor(claw.taskType), marginBottom: 10, lineHeight: 1.4, fontStyle: claw.taskType === "idle" ? "italic" : "normal" }}>
            {claw.currentTask}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <Gauge value={claw.cpu} label="CPU" color="#4fc3f7" size={52} />
            <Gauge value={claw.mem} label="MEM" color="#ce93d8" size={52} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, fontWeight: 700, color: "#00ffc8" }}>{claw.experiences}</div>
              <div style={{ fontSize: 9, color: "#556", letterSpacing: 1, textTransform: "uppercase" }}>EXP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, fontWeight: 700, color: "#ce93d8" }}>{claw.whatIfs}</div>
              <div style={{ fontSize: 9, color: "#556", letterSpacing: 1, textTransform: "uppercase" }}>WHAT IF</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#445" }}>
            {claw.model} · {claw.uptime} · {(claw.tokens24h / 1000).toFixed(1)}k tokens/24h
          </div>
        </div>
        <BrowserFeed ip={claw.ip} codename={claw.codename} expanded={false}
          onToggle={() => setFeedExpanded(true)} />
      </div>
    </>
  );
}

export default function FleetCommand() {
  const [selectedClaw, setSelectedClaw] = useState(null);
  const [activeTab, setActiveTab] = useState("fleet");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalExp = CLAWS.reduce((a, c) => a + c.experiences, 0);
  const totalConn = CLAWS.reduce((a, c) => a + c.connections, 0);
  const totalWhatIf = CLAWS.reduce((a, c) => a + c.whatIfs, 0);
  const activeClaws = CLAWS.filter(c => c.status === "active").length;

  return (
    <div style={{
      minHeight: "100vh", background: "#06080d", color: "#c8c8d8",
      fontFamily: "'DM Sans', system-ui, sans-serif", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        @keyframes shimmer { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,200,0.2); border-radius: 2px; }
      `}</style>
      <ParticleField />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", padding: "12px 16px 100px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 6, color: "#00ffc8", textTransform: "uppercase", marginBottom: 4 }}>Fleet Command</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 800, color: "#e8e8f0", letterSpacing: 2 }}>MEGA CLAW</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#445", marginTop: 6, letterSpacing: 1 }}>
            {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} · {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>

        {/* Fleet Summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20,
        }}>
          {[
            { n: `${activeClaws}/${CLAWS.length}`, l: "ACTIVE", c: "#00ffc8" },
            { n: totalExp, l: "EXPERIENCES", c: "#4fc3f7" },
            { n: totalConn, l: "CONNECTIONS", c: "#ce93d8" },
            { n: totalWhatIf, l: "WHAT IFS", c: "#ffab00" },
          ].map((m, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "12px 4px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 700, color: m.c }}>{m.n}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 7, color: "#445", letterSpacing: 1, marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 3 }}>
          {["fleet", "projects", "activity"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              background: activeTab === tab ? "rgba(0,255,200,0.1)" : "transparent",
              color: activeTab === tab ? "#00ffc8" : "#556",
              transition: "all 0.2s",
            }}>{tab}</button>
          ))}
        </div>

        {/* Fleet Tab */}
        {activeTab === "fleet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.3s ease" }}>
            {CLAWS.map(claw => (
              <ClawNode key={claw.id} claw={claw} selected={selectedClaw === claw.id}
                onClick={() => setSelectedClaw(selectedClaw === claw.id ? null : claw.id)} />
            ))}
            {/* Network visualization hint */}
            <div style={{
              textAlign: "center", padding: 16, borderRadius: 12,
              background: "rgba(0,255,200,0.03)", border: "1px dashed rgba(0,255,200,0.15)",
              fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#445",
            }}>
              🦞 {activeClaws} nodes active on Tailscale mesh · All nodes share SOUL.md
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.3s ease" }}>
            {PROJECTS.map((proj, i) => (
              <div key={i} style={{
                padding: 16, borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e8f0" }}>{proj.name}</div>
                    <div style={{ fontSize: 11, color: "#667", marginTop: 2 }}>{proj.description}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Fira Code', monospace", fontSize: 9, letterSpacing: 1,
                    padding: "3px 8px", borderRadius: 4, textTransform: "uppercase",
                    background: proj.status === "active" ? "rgba(0,255,200,0.1)" : "rgba(255,255,255,0.05)",
                    color: proj.status === "active" ? "#00ffc8" : "#556",
                  }}>{proj.status}</div>
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#00ffc8", marginBottom: 4 }}>{proj.phase}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      width: `${proj.progress}%`, height: "100%", borderRadius: 3,
                      background: "linear-gradient(90deg, #00ffc8, #4fc3f7)",
                      boxShadow: "0 0 12px rgba(0,255,200,0.3)",
                      transition: "width 1s ease",
                    }} />
                  </div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#00ffc8", fontWeight: 600 }}>{proj.progress}%</div>
                </div>
                <MilestoneTrack milestones={proj.milestones} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#445" }}>
                  <span>Started {proj.started}</span>
                  <span>Last: {proj.lastActivity}</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {proj.claws.map(c => {
                    const claw = CLAWS.find(cl => cl.id === c);
                    return claw ? (
                      <span key={c} style={{
                        fontFamily: "'Fira Code', monospace", fontSize: 8, padding: "2px 6px",
                        borderRadius: 3, background: "rgba(0,255,200,0.08)", color: "#00bfa5",
                      }}>{claw.codename}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, animation: "fadeIn 0.3s ease" }}>
            {ACTIVITY_LOG.map((entry, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                animation: `fadeIn ${0.1 + i * 0.05}s ease`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <TypeBadge type={entry.type} />
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#556" }}>{entry.claw}</span>
                  </div>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#334" }}>{entry.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "#99a", lineHeight: 1.5 }}>{entry.msg}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
