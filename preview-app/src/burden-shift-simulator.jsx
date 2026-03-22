import { useState, useCallback, useEffect, useRef } from "react";

const C = {
  bg: "#0d0f16",
  canvas: "#121420",
  panel: "#161928",
  panelBorder: "#1f2440",
  node: "#1a1e32",
  nodeBorder: "#283050",
  text: "#e2e6f0",
  textSec: "#7580a0",
  textMuted: "#404a68",
  accent: "#ff8c42",
  accentGlow: "#ff8c4244",
  teal: "#00d4aa",
  tealGlow: "#00d4aa33",
  blue: "#6b8aff",
  pink: "#ff6b8a",
  pinkGlow: "#ff6b8a33",
  purple: "#a78bfa",
  danger: "#ff5555",
  gold: "#ffd700",
  gridDot: "#1a1e30",
};

const SCENARIOS = {
  ai_edi: {
    title: "AI-Powered EDI Platform",
    subtitle: "From your ST-003 cubelet worked example",
    symptom: "Failed-confidence documents pile up in the queue",
    symptomatic: {
      label: "Route to Human Review",
      desc: "Add human reviewers to catch failed-confidence parses. Queue clears fast.",
      quickEffect: 30,
      erosionRate: 8,
      erosionChannel: "Human pattern knowledge stays in heads instead of feeding AI training data. Parser never improves.",
    },
    fundamental: {
      label: "Auto-Generate Training Examples",
      desc: "Every human correction auto-generates training data. Parser improves each cycle.",
      delay: 3,
      buildRate: 15,
      longEffect: 45,
    },
    transition: {
      label: "Maintain queue AND auto-generate training from corrections",
      target: "50% queue reduction in 90 days via parser improvement",
    },
  },
  llm_validation: {
    title: "LLM Output Reliability",
    subtitle: "Classic AI systems pattern",
    symptom: "LLM produces unreliable outputs that fail downstream checks",
    symptomatic: {
      label: "Add Validation Layers",
      desc: "Stack retry logic, validation rules, and human review. Works, but adds latency and cost.",
      quickEffect: 25,
      erosionRate: 10,
      erosionChannel: "Complexity blocks prompt architecture improvements. Cost and latency grow. Team normalizes workarounds.",
    },
    fundamental: {
      label: "Restructure Prompt Architecture",
      desc: "Redesign input pipeline, improve context engineering, fix upstream data quality.",
      delay: 4,
      buildRate: 12,
      longEffect: 50,
    },
    transition: {
      label: "Keep validation while rebuilding prompt pipeline in parallel",
      target: "Replace 80% of validation layers within 2 quarters",
    },
  },
  edtech: {
    title: "EdTech Content Platform",
    subtitle: "The Coursera/Udacity cautionary tale",
    symptom: "Learner completion rates declining across courses",
    symptomatic: {
      label: "More Content & Gamification",
      desc: "Add badges, streaks, and more video content. Engagement spikes temporarily.",
      quickEffect: 20,
      erosionRate: 12,
      erosionChannel: "Content layer commoditizes. Investment diverts from adaptive learning pathways. Billions lost industry-wide.",
    },
    fundamental: {
      label: "Adaptive Learning Pathways",
      desc: "AI-driven personalization that restructures the learning experience per student.",
      delay: 5,
      buildRate: 10,
      longEffect: 55,
    },
    transition: {
      label: "Maintain content while building adaptive engine underneath",
      target: "Personalized pathways for 50% of courses within 6 months",
    },
  },
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

const TOTAL_ROUNDS = 12;

function SimEngine(scenario) {
  return {
    symptomSeverity: 70,
    fundamentalCapacity: 100,
    orgWill: 100,
    fixDependency: 0,
    cumulativeCost: 0,
    round: 0,
    history: [],
    choices: [],
  };
}

function stepSim(state, choice, scenario) {
  const s = { ...state };
  s.round += 1;
  const sc = SCENARIOS[scenario];

  if (choice === "symptomatic") {
    s.symptomSeverity = clamp(s.symptomSeverity - sc.symptomatic.quickEffect + s.round * 2, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity - sc.symptomatic.erosionRate, 0, 100);
    s.fixDependency = clamp(s.fixDependency + 12, 0, 100);
    s.orgWill = clamp(s.orgWill - 5, 0, 100);
    s.cumulativeCost += 10 + s.fixDependency * 0.3;
  } else if (choice === "fundamental") {
    const delayPenalty = s.round <= sc.fundamental.delay ? 15 : 0;
    const buildBonus = s.round > sc.fundamental.delay ? sc.fundamental.buildRate + (s.round - sc.fundamental.delay) * 3 : 0;
    s.symptomSeverity = clamp(s.symptomSeverity + delayPenalty - buildBonus, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity + 5, 0, 100);
    s.fixDependency = clamp(s.fixDependency - 5, 0, 100);
    s.orgWill = clamp(s.orgWill - 8, 0, 100);
    s.cumulativeCost += 18;
  } else if (choice === "transition") {
    s.symptomSeverity = clamp(s.symptomSeverity - sc.symptomatic.quickEffect * 0.5 + s.round * 1.5, 0, 100);
    const buildBonus = s.round > 2 ? sc.fundamental.buildRate * 0.7 + (s.round - 2) * 2 : 0;
    s.symptomSeverity = clamp(s.symptomSeverity - buildBonus, 0, 100);
    s.fundamentalCapacity = clamp(s.fundamentalCapacity + 2, 0, 100);
    s.fixDependency = clamp(s.fixDependency - 2, 0, 100);
    s.orgWill = clamp(s.orgWill - 3, 0, 100);
    s.cumulativeCost += 22;
  } else {
    s.symptomSeverity = clamp(s.symptomSeverity + 8 + s.round, 0, 100);
    s.orgWill = clamp(s.orgWill + 2, 0, 100);
    s.cumulativeCost += 3;
  }

  s.history = [...state.history, {
    round: s.round,
    symptom: s.symptomSeverity,
    capacity: s.fundamentalCapacity,
    dependency: s.fixDependency,
    will: s.orgWill,
    cost: s.cumulativeCost,
    choice,
  }];
  s.choices = [...state.choices, choice];
  return s;
}

function MiniChart({ data, dataKey, color, label, height = 80, maxVal = 100 }) {
  if (!data.length) return null;
  const w = 220, h = height, pad = 4;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((d[dataKey] / maxVal) * (h - pad * 2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
          {data.length > 0 ? Math.round(data[data.length - 1][dataKey]) : 0}
        </span>
      </div>
      <svg width={w} height={h} style={{ display: "block" }}>
        <rect width={w} height={h} rx={4} fill={`${color}08`} stroke={`${color}15`} strokeWidth={1} />
        {/* Threshold line */}
        {dataKey === "capacity" && (
          <line x1={pad} y1={h - pad - 0.3 * (h - pad * 2)} x2={w - pad} y2={h - pad - 0.3 * (h - pad * 2)}
            stroke={C.danger} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
          const y = h - pad - ((d[dataKey] / maxVal) * (h - pad * 2));
          return <circle key={i} cx={x} cy={y} r={3} fill={color} opacity={0.8} />;
        })}
      </svg>
    </div>
  );
}

function LoopDiagram({ activeLoop, scenario }) {
  const sc = SCENARIOS[scenario];
  const b1Active = activeLoop === "symptomatic" || activeLoop === "transition";
  const b2Active = activeLoop === "fundamental" || activeLoop === "transition";
  const r1Active = activeLoop === "symptomatic";

  return (
    <svg width="220" height="180" style={{ display: "block" }}>
      {/* Symptom node (top center) */}
      <circle cx="110" cy="28" r="22" fill={C.node} stroke={C.accent} strokeWidth={1.5} />
      <text x="110" y="25" textAnchor="middle" fill={C.text} fontSize={8} fontFamily="'DM Sans', sans-serif" fontWeight={600}>Problem</text>
      <text x="110" y="35" textAnchor="middle" fill={C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">Symptom</text>

      {/* B1: Quick Fix (right) */}
      <circle cx="185" cy="100" r="20" fill={b1Active ? `${C.pink}22` : C.node}
        stroke={b1Active ? C.pink : C.nodeBorder} strokeWidth={b1Active ? 2 : 1} />
      <text x="185" y="97" textAnchor="middle" fill={b1Active ? C.pink : C.textSec} fontSize={7} fontFamily="'DM Sans', sans-serif" fontWeight={600}>Quick</text>
      <text x="185" y="107" textAnchor="middle" fill={b1Active ? C.pink : C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">Fix (B1)</text>

      {/* B2: Fundamental (left) */}
      <circle cx="35" cy="100" r="20" fill={b2Active ? `${C.teal}22` : C.node}
        stroke={b2Active ? C.teal : C.nodeBorder} strokeWidth={b2Active ? 2 : 1} />
      <text x="35" y="97" textAnchor="middle" fill={b2Active ? C.teal : C.textSec} fontSize={7} fontFamily="'DM Sans', sans-serif" fontWeight={600}>Root</text>
      <text x="35" y="107" textAnchor="middle" fill={b2Active ? C.teal : C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">Fix (B2)</text>

      {/* R1: Erosion (bottom) */}
      <circle cx="130" cy="158" r="18" fill={r1Active ? `${C.danger}22` : C.node}
        stroke={r1Active ? C.danger : C.nodeBorder} strokeWidth={r1Active ? 2 : 1} />
      <text x="130" y="155" textAnchor="middle" fill={r1Active ? C.danger : C.textSec} fontSize={7} fontFamily="'DM Sans', sans-serif" fontWeight={600}>Erosion</text>
      <text x="130" y="165" textAnchor="middle" fill={r1Active ? C.danger : C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">(R1)</text>

      {/* B1 arrows: Symptom -> Fix -> Symptom */}
      <path d="M 130 38 Q 170 55 178 82" fill="none" stroke={b1Active ? C.pink : C.textMuted} strokeWidth={b1Active ? 1.8 : 1} opacity={b1Active ? 0.8 : 0.3} />
      <path d="M 172 118 Q 155 135 130 38" fill="none" stroke={b1Active ? C.pink : C.textMuted} strokeWidth={b1Active ? 1.8 : 1} opacity={b1Active ? 0.8 : 0.3} strokeDasharray="4 3" />

      {/* B2 arrows: Symptom -> Fundamental -> Symptom */}
      <path d="M 90 38 Q 50 55 42 82" fill="none" stroke={b2Active ? C.teal : C.textMuted} strokeWidth={b2Active ? 1.8 : 1} opacity={b2Active ? 0.8 : 0.3} />
      <path d="M 48 118 Q 60 135 90 38" fill="none" stroke={b2Active ? C.teal : C.textMuted} strokeWidth={b2Active ? 1.8 : 1} opacity={b2Active ? 0.8 : 0.3} strokeDasharray="4 3" />

      {/* R1 arrow: Fix -> erodes -> Fundamental */}
      <path d="M 170 115 Q 160 145 148 148" fill="none" stroke={r1Active ? C.danger : C.textMuted} strokeWidth={r1Active ? 1.8 : 1} opacity={r1Active ? 0.7 : 0.2} />
      <path d="M 112 155 Q 70 145 50 118" fill="none" stroke={r1Active ? C.danger : C.textMuted} strokeWidth={r1Active ? 1.8 : 1} opacity={r1Active ? 0.7 : 0.2} strokeDasharray="3 3" />

      {/* Delay marker on B2 */}
      {b2Active && (
        <g>
          <rect x="52" y="52" width="24" height="12" rx="3" fill={C.teal} opacity={0.2} />
          <text x="64" y="61" textAnchor="middle" fill={C.teal} fontSize={7} fontWeight={600} fontFamily="'JetBrains Mono', monospace">
            delay
          </text>
        </g>
      )}
    </svg>
  );
}

export default function BurdenShiftSimulator() {
  const [scenario, setScenario] = useState(null);
  const [sim, setSim] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showArchetype, setShowArchetype] = useState(false);

  const startScenario = (key) => {
    setScenario(key);
    setSim(SimEngine(key));
    setGameOver(false);
    setShowArchetype(false);
  };

  const makeChoice = (choice) => {
    if (!sim || gameOver) return;
    const next = stepSim(sim, choice, scenario);
    setSim(next);
    if (next.round >= TOTAL_ROUNDS) setGameOver(true);
  };

  const sc = scenario ? SCENARIOS[scenario] : null;
  const lastChoice = sim?.choices?.length > 0 ? sim.choices[sim.choices.length - 1] : null;

  const getGrade = () => {
    if (!sim) return { grade: "—", color: C.textMuted, msg: "" };
    const finalSymptom = sim.symptomSeverity;
    const finalCapacity = sim.fundamentalCapacity;
    const finalCost = sim.cumulativeCost;
    const sympCount = sim.choices.filter((c) => c === "symptomatic").length;
    const fundCount = sim.choices.filter((c) => c === "fundamental").length;
    const transCount = sim.choices.filter((c) => c === "transition").length;

    if (finalCapacity < 30) return { grade: "F", color: C.danger, msg: "Fundamental solution capacity eroded below recovery threshold. Classic burden shift." };
    if (finalSymptom > 70) return { grade: "D", color: C.pink, msg: "Symptoms out of control. Too little investment in either path." };
    if (sympCount >= 8) return { grade: "C", color: C.accent, msg: "Heavy reliance on symptomatic fixes. The archetype played out." };
    if (transCount >= 4 && finalCapacity > 60) return { grade: "A", color: C.teal, msg: "Transition strategy executed. You maintained the fix while building the fundamental solution." };
    if (fundCount >= 6 && finalCapacity > 70) return { grade: "A-", color: C.teal, msg: "Strong commitment to fundamental solution despite short-term pain." };
    if (transCount >= 2 && fundCount >= 3) return { grade: "B+", color: C.blue, msg: "Good balance of strategies. Solid systems thinking." };
    if (finalCapacity > 50 && finalSymptom < 50) return { grade: "B", color: C.blue, msg: "Decent outcome. Some erosion but manageable." };
    return { grade: "C+", color: C.accent, msg: "Mixed results. The system survived but isn't thriving." };
  };

  const gradeResult = gameOver ? getGrade() : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: C.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: C.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${C.panelBorder}`, background: C.panel, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accent}33, ${C.pink}22)`,
            border: `2px solid ${C.accent}55`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>
            ⚖
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
              Burden Shift Simulator
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ST-003 · Systems Thinking Cubelet
            </div>
          </div>
        </div>
        {scenario && (
          <button
            onClick={() => { setScenario(null); setSim(null); setGameOver(false); }}
            style={{
              background: `${C.textMuted}15`, border: `1px solid ${C.panelBorder}`, color: C.textSec,
              padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
            }}
          >
            ← Scenarios
          </button>
        )}
      </div>

      {!scenario ? (
        /* Scenario Selection */
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 700, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.15 }}>⚖</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: C.text, marginBottom: 8 }}>
                Shifting the Burden
              </div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", maxWidth: 460, margin: "0 auto" }}>
                Each round, choose: apply a quick fix, invest in the fundamental solution, run a transition strategy, or do nothing.
                Watch what happens to your system over {TOTAL_ROUNDS} rounds.
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              {Object.entries(SCENARIOS).map(([key, sc]) => (
                <button
                  key={key}
                  onClick={() => startScenario(key)}
                  style={{
                    width: 200, padding: "20px 16px", borderRadius: 10, cursor: "pointer",
                    background: C.panel, border: `1px solid ${C.panelBorder}`,
                    textAlign: "left", transition: "all 0.2s",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent + "66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.panelBorder; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{sc.title}</div>
                  <div style={{ fontSize: 9, color: C.accent, letterSpacing: "0.04em" }}>{sc.subtitle}</div>
                  <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{sc.symptom}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Game Interface */
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Main area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20, overflow: "hidden" }}>
            {/* Scenario header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{sc.title}</div>
              <div style={{ fontSize: 10, color: C.accent, marginTop: 2 }}>
                Symptom: {sc.symptom}
              </div>
            </div>

            {/* Round indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.08em" }}>ROUND</span>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                  const choice = sim?.choices[i];
                  const color = choice === "symptomatic" ? C.pink : choice === "fundamental" ? C.teal : choice === "transition" ? C.blue : choice === "nothing" ? C.textMuted : C.panelBorder;
                  return (
                    <div key={i} style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: i < (sim?.round || 0) ? `${color}33` : `${C.textMuted}11`,
                      border: `1px solid ${i < (sim?.round || 0) ? color : C.panelBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, fontWeight: 600, color: i < (sim?.round || 0) ? color : C.textMuted,
                    }}>
                      {i < (sim?.round || 0) ? (choice === "symptomatic" ? "S" : choice === "fundamental" ? "F" : choice === "transition" ? "T" : "·") : i + 1}
                    </div>
                  );
                })}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginLeft: 8 }}>
                {sim?.round || 0}/{TOTAL_ROUNDS}
              </span>
            </div>

            {/* Gauge bars */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Symptom Severity", val: sim?.symptomSeverity || 70, color: C.pink, invert: true },
                { label: "Fundamental Capacity", val: sim?.fundamentalCapacity || 100, color: C.teal, invert: false },
                { label: "Fix Dependency", val: sim?.fixDependency || 0, color: C.accent, invert: true },
                { label: "Org Will", val: sim?.orgWill || 100, color: C.blue, invert: false },
              ].map((g) => (
                <div key={g.label} style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 8, color: C.textMuted, letterSpacing: "0.06em" }}>{g.label.toUpperCase()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: g.color, fontFamily: "inherit" }}>{Math.round(g.val)}</span>
                  </div>
                  <div style={{ height: 6, background: C.panelBorder, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${g.val}%`, height: "100%", borderRadius: 3,
                      background: g.invert
                        ? g.val > 70 ? C.danger : g.val > 40 ? C.accent : C.teal
                        : g.val < 30 ? C.danger : g.val < 60 ? C.accent : g.color,
                      transition: "width 0.5s ease, background 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Choice buttons */}
            {!gameOver ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => makeChoice("symptomatic")} style={{
                  flex: 1, minWidth: 140, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: `${C.pink}10`, border: `1px solid ${C.pink}33`, textAlign: "left",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.pink + "77"; e.currentTarget.style.background = C.pink + "18"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.pink + "33"; e.currentTarget.style.background = C.pink + "10"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.pink, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    💊 {sc.symptomatic.label}
                  </div>
                  <div style={{ fontSize: 9, color: C.textSec, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {sc.symptomatic.desc}
                  </div>
                </button>

                <button onClick={() => makeChoice("fundamental")} style={{
                  flex: 1, minWidth: 140, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: `${C.teal}10`, border: `1px solid ${C.teal}33`, textAlign: "left",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal + "77"; e.currentTarget.style.background = C.teal + "18"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.teal + "33"; e.currentTarget.style.background = C.teal + "10"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    🔧 {sc.fundamental.label}
                  </div>
                  <div style={{ fontSize: 9, color: C.textSec, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {sc.fundamental.desc}
                  </div>
                </button>

                <button onClick={() => makeChoice("transition")} style={{
                  flex: 1, minWidth: 140, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: `${C.blue}10`, border: `1px solid ${C.blue}33`, textAlign: "left",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue + "77"; e.currentTarget.style.background = C.blue + "18"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.blue + "33"; e.currentTarget.style.background = C.blue + "10"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    🔀 Transition Strategy
                  </div>
                  <div style={{ fontSize: 9, color: C.textSec, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {sc.transition.label}
                  </div>
                </button>

                <button onClick={() => makeChoice("nothing")} style={{
                  width: "100%", padding: "8px 16px", borderRadius: 6, cursor: "pointer",
                  background: "transparent", border: `1px solid ${C.panelBorder}`, textAlign: "center",
                }}>
                  <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                    Do nothing this round
                  </span>
                </button>
              </div>
            ) : (
              /* Game Over */
              <div style={{
                background: `linear-gradient(135deg, ${gradeResult.color}10, ${gradeResult.color}05)`,
                border: `1px solid ${gradeResult.color}33`, borderRadius: 12, padding: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 56, fontWeight: 700, color: gradeResult.color, fontFamily: "'Instrument Serif', serif", marginBottom: 8 }}>
                  {gradeResult.grade}
                </div>
                <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", maxWidth: 400, margin: "0 auto", marginBottom: 16 }}>
                  {gradeResult.msg}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 10, color: C.textMuted }}>
                  <div>Cost: <span style={{ color: C.accent, fontWeight: 700 }}>{Math.round(sim.cumulativeCost)}</span></div>
                  <div>Capacity: <span style={{ color: sim.fundamentalCapacity > 50 ? C.teal : C.danger, fontWeight: 700 }}>{Math.round(sim.fundamentalCapacity)}%</span></div>
                  <div>Dependency: <span style={{ color: sim.fixDependency > 50 ? C.danger : C.teal, fontWeight: 700 }}>{Math.round(sim.fixDependency)}%</span></div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                  <button onClick={() => startScenario(scenario)} style={{
                    padding: "8px 20px", borderRadius: 6, background: `${gradeResult.color}18`,
                    border: `1px solid ${gradeResult.color}44`, color: gradeResult.color,
                    cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  }}>
                    Replay
                  </button>
                  <button onClick={() => setShowArchetype(!showArchetype)} style={{
                    padding: "8px 20px", borderRadius: 6, background: `${C.purple}18`,
                    border: `1px solid ${C.purple}44`, color: C.purple,
                    cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  }}>
                    {showArchetype ? "Hide" : "Show"} Archetype Analysis
                  </button>
                </div>

                {showArchetype && (
                  <div style={{ textAlign: "left", marginTop: 16, padding: 16, background: `${C.purple}08`, borderRadius: 8, border: `1px solid ${C.purple}22` }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.purple, marginBottom: 8, letterSpacing: "0.06em" }}>
                      ARCHETYPE BREAKDOWN
                    </div>
                    <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}>
                      <b style={{ color: C.pink }}>B1 (Quick Fix):</b> {sc.symptomatic.label} — applied {sim.choices.filter((c) => c === "symptomatic").length}× <br />
                      <b style={{ color: C.teal }}>B2 (Fundamental):</b> {sc.fundamental.label} — applied {sim.choices.filter((c) => c === "fundamental").length}× <br />
                      <b style={{ color: C.danger }}>R1 (Erosion):</b> {sc.symptomatic.erosionChannel} <br />
                      <b style={{ color: C.blue }}>Transition:</b> {sc.transition.target} — applied {sim.choices.filter((c) => c === "transition").length}×
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Erosion warning */}
            {sim && sim.fundamentalCapacity < 40 && !gameOver && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 6,
                background: `${C.danger}12`, border: `1px solid ${C.danger}33`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <div style={{ fontSize: 10, color: C.danger, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  <b>Capacity critical.</b> Fundamental solution viability is eroding. {sim.fundamentalCapacity < 20 ? "Recovery may now cost more than the original investment would have." : "Act soon or the window closes."}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{
            width: 250, background: C.panel, borderLeft: `1px solid ${C.panelBorder}`,
            padding: 16, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* Loop diagram */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                Archetype Structure
              </div>
              <LoopDiagram activeLoop={lastChoice} scenario={scenario} />
            </div>

            {/* Charts */}
            {sim && sim.history.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                  System Trajectory
                </div>
                <MiniChart data={sim.history} dataKey="symptom" color={C.pink} label="SYMPTOM SEVERITY" />
                <MiniChart data={sim.history} dataKey="capacity" color={C.teal} label="FUNDAMENTAL CAPACITY" />
                <MiniChart data={sim.history} dataKey="dependency" color={C.accent} label="FIX DEPENDENCY" />
                <MiniChart data={sim.history} dataKey="cost" color={C.gold} label="CUMULATIVE COST" maxVal={Math.max(200, sim.cumulativeCost * 1.2)} />
              </div>
            )}

            {/* Metaphor */}
            <div style={{
              background: `linear-gradient(135deg, ${C.accent}08, ${C.pink}06)`,
              border: `1px solid ${C.accent}22`, borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>💊</div>
              <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <b style={{ color: C.accent }}>Painkillers for a broken bone.</b> Pain goes away, so you skip the doctor. Each dose lets you use the broken bone, making it heal worse. Eventually you need surgery far more invasive than the original fix.
              </div>
            </div>

            {/* Erosion channel detail */}
            <div style={{
              background: `${C.danger}08`, border: `1px solid ${C.danger}18`, borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.danger, letterSpacing: "0.08em", marginBottom: 6 }}>
                EROSION CHANNEL
              </div>
              <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {sc.symptomatic.erosionChannel}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
