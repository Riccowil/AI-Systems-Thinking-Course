import { useState, useCallback, useRef } from "react";

const C = {
  bg: "#0d0f16", canvas: "#121420", panel: "#161928", panelBorder: "#1f2440",
  node: "#1a1e32", nodeBorder: "#283050", text: "#e2e6f0", textSec: "#7580a0",
  textMuted: "#404a68", accent: "#7c5cfc", accentGlow: "#7c5cfc44",
  teal: "#00d4aa", blue: "#6b8aff", pink: "#ff6b8a", danger: "#ff5555", gold: "#ffd700",
};

const TOTAL_ROUNDS = 12;

const SCENARIOS = {
  llm_confidence: {
    title: "LLM Output Reliability Pipeline",
    subtitle: "Validation layer accumulation",
    difficulty: "Medium",
    symptom: "LLM produces unreliable outputs that fail downstream checks",
    symptomatic: {
      label: "Add Validation Layers",
      desc: "Stack retry logic, regex checks, and human review. Catches bad outputs fast.",
      quickEffect: 28, erosionRate: 10,
      erosionChannel: "Complexity blocks prompt improvements. Cost grows. Team normalizes workarounds.",
    },
    fundamental: {
      label: "Restructure Prompt Architecture",
      desc: "Redesign input pipeline, improve context engineering, fix upstream data quality.",
      delay: 4, buildRate: 14, longEffect: 50,
    },
    transition: {
      label: "Keep validation while rebuilding prompt pipeline in parallel",
      target: "Replace 80% of validation layers within 2 quarters",
    },
    erosionChannels: ["Knowledge Drain", "Complexity Creep"],
  },
  agent_edge_cases: {
    title: "AI Agent Error Handling",
    subtitle: "Exception handler sprawl",
    difficulty: "Hard",
    symptom: "Agent crashes on edge cases, team adds exception handlers each time",
    symptomatic: {
      label: "Add Exception Handlers",
      desc: "Catch each new failure with a specific handler. Keeps agent running.",
      quickEffect: 25, erosionRate: 12,
      erosionChannel: "Handler spaghetti blocks architecture improvements. Team stops reporting root causes.",
    },
    fundamental: {
      label: "Redesign Agent State Machine",
      desc: "Build a robust state machine with graceful degradation and self-healing loops.",
      delay: 5, buildRate: 12, longEffect: 55,
    },
    transition: {
      label: "Categorize handlers while building state machine underneath",
      target: "Migrate 70% of handlers to state machine within 3 months",
    },
    erosionChannels: ["Complexity Creep", "Normalization"],
  },
  tool_latency: {
    title: "MCP Tool Call Performance",
    subtitle: "Timeout and retry accumulation",
    difficulty: "Easy",
    symptom: "Tool calls intermittently timeout, causing cascading delays",
    symptomatic: {
      label: "Increase Timeouts & Add Retries",
      desc: "Bump timeout limits and add retry logic. Requests eventually succeed.",
      quickEffect: 22, erosionRate: 8,
      erosionChannel: "Latency budget consumed by retries. Team forgets why the API was slow.",
    },
    fundamental: {
      label: "Profile and Optimize API Layer",
      desc: "Trace bottleneck, add caching, optimize query patterns, fix connection pooling.",
      delay: 3, buildRate: 16, longEffect: 45,
    },
    transition: {
      label: "Keep retries while profiling and patching hot paths",
      target: "Reduce p95 latency by 60% within 6 weeks",
    },
    erosionChannels: ["Knowledge Drain", "Normalization"],
  },
};

const OPTIMAL_PATHS = {
  llm_confidence: { seq: "SSTTFFFFFFFFFFF".slice(0,12).split(""), finalMetrics: { severity: 12, capacity: 82, dependency: 8, will: 62 }},
  agent_edge_cases: { seq: "SSSTFFFFFFFFFF".slice(0,12).split(""), finalMetrics: { severity: 18, capacity: 75, dependency: 12, will: 55 }},
  tool_latency: { seq: "STFFFFFFFFFFFF".slice(0,12).split(""), finalMetrics: { severity: 8, capacity: 88, dependency: 5, will: 68 }},
};

const EROSION_CHANNELS = [
  { name: "Knowledge Drain", desc: "Quick fixes prevent the team from learning root causes. Institutional knowledge never forms.", icon: "🧠" },
  { name: "Complexity Creep", desc: "Each workaround adds a layer. The system grows harder to change with every fix.", icon: "🕸" },
  { name: "Normalization", desc: "The degraded state becomes 'normal'. Team stops seeing it as a problem.", icon: "😐" },
];

const COUNTER_PATTERNS = [
  { name: "Novel Problem", principle: "No known fundamental solution exists yet.", example: "First multimodal agent deployment — no one has solved this failure mode before. Exception handlers are exploration, not debt.", test: "Is there a known fundamental solution that the team is avoiding?" },
  { name: "Legitimate Triage", principle: "Quick fix IS the right call under true emergency.", example: "Production LLM hallucinating during peak traffic. Content filter now, root cause tomorrow — as long as tomorrow actually happens.", test: "Is there a credible plan to address root cause after the crisis?" },
  { name: "Acceptable Trade-off", principle: "Cost of fundamental fix exceeds the benefit.", example: "200ms latency on 2% of API requests. Full optimization would take 3 sprints for negligible user impact.", test: "Does the cost of the fundamental solution outweigh the ongoing cost of the workaround?" },
];

const QUIZ = [
  { q: "An AI agent crashes on a new input type no one has seen before. The team adds an exception handler. Is this burden shifting?",
    opts: ["Yes — they should fix the root cause", "No — Novel Problem (no known fix yet)", "No — Acceptable Trade-off"],
    answer: 1, explain: "No known fundamental solution exists yet. The handler is exploration, not avoidance." },
  { q: "A production chatbot generates offensive responses during a product launch. The team adds a content filter. Is this burden shifting?",
    opts: ["Yes — filters are always symptomatic", "No — Legitimate Triage (emergency with follow-up plan)", "No — Acceptable Trade-off"],
    answer: 1, explain: "Emergency response with a planned root-cause investigation is legitimate triage, not burden shifting." },
  { q: "For 6 months, a team has added retry logic for API timeouts instead of fixing the API. No one remembers why it was slow. Is this burden shifting?",
    opts: ["Yes — Knowledge Drain + Normalization", "No — the retries work fine", "No — Novel Problem"],
    answer: 0, explain: "Classic burden shift: the quick fix became permanent, the team forgot the root cause, and capacity to fix eroded." },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function SimEngine() {
  return { symptomSeverity: 70, fundamentalCapacity: 100, orgWill: 100, fixDependency: 0,
    cumulativeCost: 0, round: 0, history: [], choices: [], attemptNumber: 1 };
}

function stepSim(state, choice, scenario) {
  const s = { ...state }; s.round += 1;
  const sc = SCENARIOS[scenario];
  if (choice === "symptomatic") {
    s.symptomSeverity = clamp(s.symptomSeverity - sc.symptomatic.quickEffect + s.round * 2, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity - sc.symptomatic.erosionRate, 0, 100);
    s.fixDependency = clamp(s.fixDependency + 12, 0, 100);
    s.orgWill = clamp(s.orgWill - 5, 0, 100);
    s.cumulativeCost += 10 + s.fixDependency * 0.3;
  } else if (choice === "fundamental") {
    const dp = s.round <= sc.fundamental.delay ? 15 : 0;
    const bb = s.round > sc.fundamental.delay ? sc.fundamental.buildRate + (s.round - sc.fundamental.delay) * 3 : 0;
    s.symptomSeverity = clamp(s.symptomSeverity + dp - bb, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity + 5, 0, 100);
    s.fixDependency = clamp(s.fixDependency - 5, 0, 100);
    s.orgWill = clamp(s.orgWill - 8, 0, 100);
    s.cumulativeCost += 18;
  } else if (choice === "transition") {
    s.symptomSeverity = clamp(s.symptomSeverity - sc.symptomatic.quickEffect * 0.5 + s.round * 1.5, 0, 100);
    const bb = s.round > 2 ? sc.fundamental.buildRate * 0.7 + (s.round - 2) * 2 : 0;
    s.symptomSeverity = clamp(s.symptomSeverity - bb, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity + 2, 0, 100);
    s.fixDependency = clamp(s.fixDependency - 2, 0, 100);
    s.orgWill = clamp(s.orgWill - 3, 0, 100);
    s.cumulativeCost += 22;
  } else {
    s.symptomSeverity = clamp(s.symptomSeverity + 8 + s.round, 0, 100);
    s.orgWill = clamp(s.orgWill + 2, 0, 100);
    s.cumulativeCost += 3;
  }
  s.history = [...state.history, { round: s.round, symptom: s.symptomSeverity, capacity: s.fundamentalCapacity, dependency: s.fixDependency, will: s.orgWill, choice }];
  s.choices = [...state.choices, choice];
  return s;
}

function getGrade(sim) {
  if (!sim) return { grade: "—", color: C.textMuted, msg: "", composite: 0 };
  const sev = (100 - sim.symptomSeverity) / 100, cap = sim.fundamentalCapacity / 100;
  const dep = (100 - sim.fixDependency) / 100, wil = sim.orgWill / 100;
  const composite = sev * 0.3 + cap * 0.3 + dep * 0.2 + wil * 0.2;
  if (composite >= 0.80) return { grade: "A", color: C.teal, msg: "Excellent! You maintained capacity while managing symptoms.", composite };
  if (composite >= 0.70) return { grade: "B+", color: C.teal, msg: "Strong systems thinking. Good balance of strategies.", composite };
  if (composite >= 0.60) return { grade: "B", color: C.blue, msg: "Decent outcome. Some erosion but manageable.", composite };
  if (composite >= 0.45) return { grade: "C", color: C.gold, msg: "Mixed results. The burden shifted partially.", composite };
  if (composite >= 0.30) return { grade: "D", color: C.pink, msg: "Heavy reliance on quick fixes. Classic burden shift.", composite };
  return { grade: "F", color: C.danger, msg: "Fundamental capacity eroded. The archetype played out fully.", composite };
}

function Spark({ data, dataKey, color, h = 50 }) {
  if (!data.length) return null;
  const w = 120;
  const pts = data.map((d, i) => {
    const x = 4 + (i / Math.max(data.length - 1, 1)) * (w - 8);
    const y = h - 4 - ((d[dataKey] / 100) * (h - 8));
    return `${x},${y}`;
  }).join(" ");
  return (<svg width={w} height={h} style={{ display: "block" }}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </svg>);
}

function DebtGauge({ score }) {
  const r = 60, cx = 80, cy = 70;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score < 30 ? C.teal : score < 60 ? C.gold : score < 80 ? C.pink : C.danger;
  return (<svg width={160} height={100} viewBox="0 0 160 100">
    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={C.nodeBorder} strokeWidth={10} strokeLinecap="round" />
    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
    <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize={24} fontWeight={700} fontFamily="'JetBrains Mono', monospace">{score}</text>
    <text x={cx} y={cy + 8} textAnchor="middle" fill={C.textMuted} fontSize={8} letterSpacing="0.1em">DEBT SCORE</text>
  </svg>);
}

function LoopDiagram({ sim }) {
  const sympCount = sim.choices.filter(c => c === "symptomatic").length;
  const fundCount = sim.choices.filter(c => c === "fundamental").length;
  const b1 = sympCount > TOTAL_ROUNDS * 0.4, b2 = fundCount > TOTAL_ROUNDS * 0.3, r1 = sympCount > TOTAL_ROUNDS * 0.5;
  return (<svg width={220} height={160} viewBox="0 0 220 160">
    <circle cx={110} cy={24} r={20} fill={C.node} stroke={C.accent} strokeWidth={1.5} />
    <text x={110} y={21} textAnchor="middle" fill={C.text} fontSize={7} fontWeight={600}>Problem</text>
    <text x={110} y={31} textAnchor="middle" fill={C.textMuted} fontSize={6}>Symptom</text>
    <circle cx={185} cy={85} r={18} fill={b1 ? `${C.pink}22` : C.node} stroke={b1 ? C.pink : C.nodeBorder} strokeWidth={b1 ? 2 : 1} />
    <text x={185} y={82} textAnchor="middle" fill={b1 ? C.pink : C.textSec} fontSize={7} fontWeight={600}>Quick</text>
    <text x={185} y={92} textAnchor="middle" fill={b1 ? C.pink : C.textMuted} fontSize={6}>Fix (B1)</text>
    <circle cx={35} cy={85} r={18} fill={b2 ? `${C.teal}22` : C.node} stroke={b2 ? C.teal : C.nodeBorder} strokeWidth={b2 ? 2 : 1} />
    <text x={35} y={82} textAnchor="middle" fill={b2 ? C.teal : C.textSec} fontSize={7} fontWeight={600}>Root</text>
    <text x={35} y={92} textAnchor="middle" fill={b2 ? C.teal : C.textMuted} fontSize={6}>Fix (B2)</text>
    <circle cx={120} cy={140} r={16} fill={r1 ? `${C.danger}22` : C.node} stroke={r1 ? C.danger : C.nodeBorder} strokeWidth={r1 ? 2 : 1} />
    <text x={120} y={137} textAnchor="middle" fill={r1 ? C.danger : C.textSec} fontSize={7} fontWeight={600}>Erosion</text>
    <text x={120} y={147} textAnchor="middle" fill={r1 ? C.danger : C.textMuted} fontSize={6}>(R1)</text>
    <path d="M 128 36 Q 168 50 178 70" fill="none" stroke={b1 ? C.pink : C.textMuted} strokeWidth={b1 ? 1.8 : 1} opacity={b1 ? 0.8 : 0.3} markerEnd="url(#arr)" />
    <path d="M 92 36 Q 52 50 42 70" fill="none" stroke={b2 ? C.teal : C.textMuted} strokeWidth={b2 ? 1.8 : 1} opacity={b2 ? 0.8 : 0.3} markerEnd="url(#arr)" />
    <path d="M 170 98 Q 155 125 136 132" fill="none" stroke={r1 ? C.danger : C.textMuted} strokeWidth={r1 ? 1.8 : 1} opacity={r1 ? 0.7 : 0.2} />
    <path d="M 104 138 Q 55 125 48 100" fill="none" stroke={r1 ? C.danger : C.textMuted} strokeWidth={r1 ? 1.8 : 1} opacity={r1 ? 0.7 : 0.2} strokeDasharray="3 3" />
    <defs><marker id="arr" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill={C.textMuted} /></marker></defs>
  </svg>);
}

export default function AutomationDebtSimulator() {
  const [phase, setPhase] = useState("select"); // select | playing | results
  const [scenario, setScenario] = useState(null);
  const [sim, setSim] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [resultsTab, setResultsTab] = useState("diagnosis");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizRevealed, setQuizRevealed] = useState(false);

  const startScenario = (key) => {
    setScenario(key); setSim(SimEngine()); setPhase("playing"); setResultsTab("diagnosis"); setQuizIdx(0); setQuizAnswers([]); setQuizRevealed(false);
  };
  const makeChoice = (choice) => {
    if (!sim || sim.round >= TOTAL_ROUNDS) return;
    const next = stepSim(sim, choice, scenario);
    setSim(next);
    if (next.round >= TOTAL_ROUNDS) setPhase("results");
  };
  const tryAgain = () => {
    setAttemptNumber(a => a + 1); setSim(SimEngine()); setPhase("playing"); setResultsTab("diagnosis"); setQuizIdx(0); setQuizAnswers([]); setQuizRevealed(false);
  };

  const sc = scenario ? SCENARIOS[scenario] : null;
  const gradeResult = phase === "results" ? getGrade(sim) : null;
  const debtScore = gradeResult ? Math.round((1 - gradeResult.composite) * 100) : 0;

  const trend = (key) => {
    if (!sim || sim.history.length < 3) return "—";
    const cur = sim.history[sim.history.length - 1][key];
    const prev = sim.history[sim.history.length - 3]?.[key] ?? cur;
    return cur > prev + 3 ? "▲" : cur < prev - 3 ? "▼" : "—";
  };

  const metricVal = (key) => {
    if (!sim) return 0;
    return key === "symptom" ? sim.symptomSeverity : key === "capacity" ? sim.fundamentalCapacity : key === "dependency" ? sim.fixDependency : sim.orgWill;
  };

  const choices = [
    { key: "symptomatic", label: sc?.symptomatic.label || "", desc: sc?.symptomatic.desc || "", fx: sc ? `Severity -${sc.symptomatic.quickEffect}, Dependency +12` : "" },
    { key: "fundamental", label: sc?.fundamental.label || "", desc: sc?.fundamental.desc || "", fx: sc ? `Capacity +5, Will -8 ${sim && sim.round <= (sc?.fundamental.delay || 0) ? "(delay penalty)" : "(building!)"}` : "" },
    { key: "transition", label: "Transition Strategy", desc: sc?.transition.label || "", fx: "Balanced: partial fix + partial build" },
    { key: "nothing", label: "Do Nothing", desc: "Inaction has consequences.", fx: "" },
  ];

  const erosionActive = (ch) => {
    if (!sim) return false;
    const sympC = sim.choices.filter(c => c === "symptomatic").length;
    const fundC = sim.choices.filter(c => c === "fundamental").length;
    if (ch === "Knowledge Drain") return sympC >= 6 && fundC <= 2;
    if (ch === "Complexity Creep") return sim.fixDependency > 60;
    if (ch === "Normalization") {
      if (sim.orgWill >= 40) return false;
      const last3 = sim.history.slice(-3).map(h => h.symptom);
      return last3.length === 3 && Math.max(...last3) - Math.min(...last3) <= 10;
    }
    return false;
  };

  const S = {
    card: { background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: 14, cursor: "pointer" },
    metricBox: { background: C.node, border: `1px solid ${C.nodeBorder}`, borderRadius: 8, padding: 10 },
    btn: (active) => ({ padding: "8px 16px", borderRadius: 6, border: `1px solid ${active ? C.accent : C.panelBorder}`, background: active ? C.accent : C.panel, color: active ? C.bg : C.text, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }),
    tab: (active) => ({ padding: "6px 14px", borderRadius: 4, border: "none", background: active ? C.accent : "transparent", color: active ? C.bg : C.textSec, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }),
  };

  // === SELECT PHASE ===
  if (phase === "select") return (
    <div style={{ width: "100%", height: "100vh", background: C.bg, fontFamily: "'JetBrains Mono', monospace", color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 680, width: "100%", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.15 }}>⚙</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Automation Debt Simulator</div>
          <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.08em", marginBottom: 12 }}>ST-006 · SHIFTING THE BURDEN IN AUTOMATION</div>
          <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
            Play {TOTAL_ROUNDS} rounds. Each round, choose a quick fix, fundamental investment, transition strategy, or do nothing. Discover how automation debt accumulates.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(SCENARIOS).map(([key, sc]) => (
            <button key={key} onClick={() => startScenario(key)} style={{ ...S.card, width: 200, textAlign: "left", display: "flex", flexDirection: "column", gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + "66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.panelBorder; e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sc.title}</div>
              <div style={{ fontSize: 9, color: C.accent }}>{sc.subtitle}</div>
              <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.5 }}>{sc.symptom}</div>
              <div style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: sc.difficulty === "Easy" ? C.teal + "22" : sc.difficulty === "Hard" ? C.danger + "22" : C.gold + "22", color: sc.difficulty === "Easy" ? C.teal : sc.difficulty === "Hard" ? C.danger : C.gold, alignSelf: "flex-start" }}>{sc.difficulty}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // === PLAYING PHASE ===
  if (phase === "playing") return (
    <div style={{ width: "100%", height: "100vh", background: C.bg, fontFamily: "'JetBrains Mono', monospace", color: C.text, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.panelBorder}`, background: C.panel, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{sc.title}</div>
          <div style={{ fontSize: 9, color: C.accent }}>Round {sim.round} of {TOTAL_ROUNDS}</div>
        </div>
        <div style={{ width: 200, height: 6, background: C.nodeBorder, borderRadius: 3 }}>
          <div style={{ width: `${(sim.round / TOTAL_ROUNDS) * 100}%`, height: "100%", background: C.accent, borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: choices */}
        <div style={{ width: 320, padding: 16, overflowY: "auto", borderRight: `1px solid ${C.panelBorder}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 4 }}>SYMPTOM: {sc.symptom}</div>
          {choices.map((ch, i) => (
            <button key={ch.key} onClick={() => makeChoice(ch.key)}
              style={{ ...S.card, textAlign: "left", opacity: ch.key === "nothing" ? 0.7 : 1, fontStyle: ch.key === "nothing" ? "italic" : "normal" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.panelBorder}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>{ch.label}</div>
              <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.5, marginBottom: 4 }}>{ch.desc}</div>
              {ch.fx && <div style={{ fontSize: 9, color: C.textMuted }}>{ch.fx}</div>}
            </button>
          ))}
        </div>

        {/* Right: 2x2 dashboard */}
        <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
            {[
              { key: "symptom", label: "SEVERITY", color: C.danger, val: sim.symptomSeverity },
              { key: "capacity", label: "CAPACITY", color: C.teal, val: sim.fundamentalCapacity },
              { key: "dependency", label: "DEPENDENCY", color: C.accent, val: sim.fixDependency },
              { key: "will", label: "WILLINGNESS", color: C.blue, val: sim.orgWill },
            ].map(m => (
              <div key={m.key} style={S.metricBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em" }}>{m.label}</span>
                  <span style={{ fontSize: 9, color: m.color }}>{trend(m.key)}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: m.color, marginBottom: 6 }}>{Math.round(m.val)}</div>
                <Spark data={sim.history} dataKey={m.key} color={m.color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // === RESULTS PHASE ===
  return (
    <div style={{ width: "100%", height: "100vh", background: C.bg, fontFamily: "'JetBrains Mono', monospace", color: C.text, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.panelBorder}`, background: C.panel, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Results: {sc.title}</div>
          <div style={{ fontSize: 9, color: C.accent }}>Attempt #{attemptNumber}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={tryAgain} style={S.btn(true)}>Try Again</button>
          <button onClick={() => { setPhase("select"); setScenario(null); setAttemptNumber(1); }} style={S.btn(false)}>New Scenario</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "8px 20px", background: C.canvas, display: "flex", gap: 4, borderBottom: `1px solid ${C.panelBorder}`, zIndex: 2 }}>
        <button onClick={() => setResultsTab("diagnosis")} style={S.tab(resultsTab === "diagnosis")}>Diagnosis</button>
        <button onClick={() => setResultsTab("boundaries")} style={S.tab(resultsTab === "boundaries")}>Boundaries</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {resultsTab === "diagnosis" ? (
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Grade */}
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 64, fontWeight: 700, color: gradeResult.color }}>{gradeResult.grade}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>{gradeResult.msg}</div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>Composite: {Math.round(gradeResult.composite * 100)}%</div>
            </div>

            {/* Debt Gauge */}
            <div style={{ textAlign: "center" }}><DebtGauge score={debtScore} /></div>

            {/* B1/B2/R1 Loop Diagram */}
            <div style={{ ...S.metricBox, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>ARCHETYPE ANALYSIS</div>
              <LoopDiagram sim={sim} />
            </div>

            {/* Erosion Channels */}
            <div>
              <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>EROSION CHANNELS</div>
              {EROSION_CHANNELS.map(ch => {
                const active = erosionActive(ch.name);
                return (
                  <div key={ch.name} style={{ ...S.metricBox, marginBottom: 8, opacity: active ? 1 : 0.5, borderColor: active ? C.accent : C.nodeBorder }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{ch.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: active ? C.accent : C.textSec }}>{ch.name} {active ? "● Active" : ""}</div>
                        <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.5 }}>{ch.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optimal path comparison (2nd attempt+) */}
            {attemptNumber >= 2 && OPTIMAL_PATHS[scenario] && (
              <div style={S.metricBox}>
                <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>OPTIMAL STRATEGY COMPARISON</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Severity", yours: sim.symptomSeverity, optimal: OPTIMAL_PATHS[scenario].finalMetrics.severity, lowerBetter: true },
                    { label: "Capacity", yours: sim.fundamentalCapacity, optimal: OPTIMAL_PATHS[scenario].finalMetrics.capacity, lowerBetter: false },
                    { label: "Dependency", yours: sim.fixDependency, optimal: OPTIMAL_PATHS[scenario].finalMetrics.dependency, lowerBetter: true },
                    { label: "Willingness", yours: sim.orgWill, optimal: OPTIMAL_PATHS[scenario].finalMetrics.will, lowerBetter: false },
                  ].map(m => {
                    const better = m.lowerBetter ? m.yours <= m.optimal : m.yours >= m.optimal;
                    return (
                      <div key={m.label} style={{ fontSize: 10, padding: 8, background: C.canvas, borderRadius: 4 }}>
                        <div style={{ color: C.textMuted, fontSize: 9 }}>{m.label}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <span style={{ color: better ? C.teal : C.danger }}>You: {Math.round(m.yours)}</span>
                          <span style={{ color: C.textSec }}>Opt: {m.optimal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BOUNDARIES TAB */
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em" }}>WHEN SHIFTING THE BURDEN DOES NOT APPLY</div>

            {COUNTER_PATTERNS.map(cp => (
              <div key={cp.name} style={{ ...S.metricBox, borderColor: C.accent + "44" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 4 }}>{cp.name}</div>
                <div style={{ fontSize: 10, color: C.text, marginBottom: 4 }}>{cp.principle}</div>
                <div style={{ fontSize: 10, color: C.textSec, fontStyle: "italic", marginBottom: 6 }}>{cp.example}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>Diagnostic: {cp.test}</div>
              </div>
            ))}

            {/* Quiz */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>BOUNDARY QUIZ ({quizAnswers.length}/3)</div>
              {quizIdx < QUIZ.length ? (
                <div style={S.metricBox}>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>{QUIZ[quizIdx].q}</div>
                  {QUIZ[quizIdx].opts.map((opt, i) => {
                    const answered = quizAnswers.length > quizIdx;
                    const isCorrect = i === QUIZ[quizIdx].answer;
                    const wasChosen = answered && quizAnswers[quizIdx] === i;
                    return (
                      <button key={i} onClick={() => {
                        if (answered) return;
                        setQuizAnswers([...quizAnswers, i]);
                      }} style={{
                        ...S.card, display: "block", width: "100%", textAlign: "left", marginBottom: 6,
                        borderColor: answered ? (isCorrect ? C.teal : wasChosen ? C.danger : C.panelBorder) : C.panelBorder,
                        opacity: answered && !isCorrect && !wasChosen ? 0.5 : 1,
                      }}>
                        <div style={{ fontSize: 10, color: answered && isCorrect ? C.teal : answered && wasChosen ? C.danger : C.text }}>{opt}</div>
                      </button>
                    );
                  })}
                  {quizAnswers.length > quizIdx && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: quizAnswers[quizIdx] === QUIZ[quizIdx].answer ? C.teal : C.danger, marginBottom: 4 }}>
                        {quizAnswers[quizIdx] === QUIZ[quizIdx].answer ? "✓ Correct!" : "✗ Incorrect"}
                      </div>
                      <div style={{ fontSize: 10, color: C.textSec }}>{QUIZ[quizIdx].explain}</div>
                      <button onClick={() => setQuizIdx(quizIdx + 1)} style={{ ...S.btn(true), marginTop: 8 }}>Next →</button>
                    </div>
                  )}
                </div>
              ) : quizAnswers.length === QUIZ.length ? (
                <div style={{ ...S.metricBox, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: quizAnswers.filter((a, i) => a === QUIZ[i].answer).length >= 2 ? C.teal : C.gold }}>
                    {quizAnswers.filter((a, i) => a === QUIZ[i].answer).length}/3
                  </div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>
                    {quizAnswers.filter((a, i) => a === QUIZ[i].answer).length === 3 ? "Perfect! You understand archetype boundaries." :
                     quizAnswers.filter((a, i) => a === QUIZ[i].answer).length >= 2 ? "Good grasp of boundaries. Review the one you missed." :
                     "Review the counter-patterns above and try again."}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Testability exports -- vitest imports these as named exports; Claude.ai sandbox uses default export only
export { SimEngine, stepSim, getGrade, SCENARIOS, OPTIMAL_PATHS, COUNTER_PATTERNS, QUIZ };
