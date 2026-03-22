import { useState, useCallback, useEffect, useRef } from "react";

const MEADOWS_HIERARCHY = [
  { level: 12, label: "Transcending paradigms", tier: "high", color: "#ff6bcc" },
  { level: 11, label: "Mindset / paradigm", tier: "high", color: "#ff6bcc" },
  { level: 10, label: "Goals of the system", tier: "high", color: "#ff6bcc" },
  { level: 9, label: "Self-organization", tier: "high", color: "#c96bff" },
  { level: 8, label: "Rules of the system", tier: "high", color: "#c96bff" },
  { level: 7, label: "Information flows", tier: "medium", color: "#6b8aff" },
  { level: 6, label: "Feedback loop structure", tier: "medium", color: "#6b8aff" },
  { level: 5, label: "Feedback loop delays", tier: "medium", color: "#6b8aff" },
  { level: 4, label: "Negative feedback strength", tier: "low", color: "#ffb347" },
  { level: 3, label: "Positive feedback gain", tier: "low", color: "#ffb347" },
  { level: 2, label: "Buffer / stock sizes", tier: "low", color: "#ffb347" },
  { level: 1, label: "Constants / parameters", tier: "low", color: "#7a839e" },
];

const AI_OPS_EXAMPLE = {
  nodes: [
    { id: "n1", label: "Agent Complexity", leverageActual: 0.28 },
    { id: "n2", label: "Token Usage", leverageActual: 0.32 },
    { id: "n3", label: "AI Spend", leverageActual: 0.49 },
    { id: "n4", label: "Team Scaling Pressure", leverageActual: 0.39 },
  ],
  edges: [
    { from: "n1", to: "n2", polarity: "+" },
    { from: "n2", to: "n3", polarity: "+" },
    { from: "n3", to: "n4", polarity: "+" },
    { from: "n4", to: "n1", polarity: "+" },
  ],
  interventions: {
    n3: {
      parameter: { label: "Budget cap at AI Spend", meadows: 1, impact: "Low — caps symptom without changing structure" },
      structural: { label: "Prompt caching + model tiering", meadows: 6, impact: "High — restructures feedback loop at token layer, projected 55% cost reduction" },
    },
    n2: {
      parameter: { label: "Set token limit per request", meadows: 1, impact: "Low — blunt constraint, degrades output quality" },
      structural: { label: "Context window optimization pipeline", meadows: 7, impact: "Medium-high — changes information flow to reduce token waste at source" },
    },
  },
};

const C = {
  bg: "#0e1019",
  canvas: "#13151f",
  panel: "#171a27",
  panelBorder: "#222640",
  node: "#1a1e30",
  nodeBorder: "#283050",
  text: "#e4e8f2",
  textSec: "#7580a0",
  textMuted: "#454d6a",
  accent: "#6b8aff",
  accentGlow: "#6b8aff44",
  gold: "#ffb347",
  goldGlow: "#ffb34733",
  green: "#00d4aa",
  pink: "#ff6bcc",
  purple: "#c96bff",
  danger: "#ff6b6b",
  gridDot: "#1c2035",
};

function computeLeverage(nodes, edges) {
  const loopCount = {};
  const connectivity = {};
  nodes.forEach((n) => {
    loopCount[n.id] = 0;
    connectivity[n.id] = 0;
  });
  edges.forEach((e) => {
    if (connectivity[e.from] !== undefined) connectivity[e.from]++;
    if (connectivity[e.to] !== undefined) connectivity[e.to]++;
  });

  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.from]) adj[e.from].push(e.to);
  });

  const visited = new Set();
  nodes.forEach((n) => {
    const stack = [[n.id, new Set([n.id])]];
    while (stack.length) {
      const [curr, path] = stack.pop();
      for (const next of adj[curr] || []) {
        if (next === n.id && path.size >= 2) {
          path.forEach((pid) => loopCount[pid]++);
          continue;
        }
        if (!path.has(next) && !visited.has(next)) {
          const np = new Set(path);
          np.add(next);
          stack.push([next, np]);
        }
      }
    }
    visited.add(n.id);
  });

  const scores = {};
  let maxRaw = 0;
  nodes.forEach((n) => {
    const raw = loopCount[n.id] * 0.5 + connectivity[n.id] * 0.3 + (edges.some((e) => e.from === n.id) ? 0.2 : 0);
    if (raw > maxRaw) maxRaw = raw;
    scores[n.id] = { raw, loopCount: loopCount[n.id], connectivity: connectivity[n.id] };
  });

  nodes.forEach((n) => {
    scores[n.id].normalized = maxRaw > 0 ? +(scores[n.id].raw / maxRaw).toFixed(2) : 0;
  });

  return scores;
}

function NodePositioner(nodes) {
  const cx = 340, cy = 220, rx = 200, ry = 150;
  return nodes.map((n, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / nodes.length;
    return { ...n, x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });
}

function getEdgePath(f, t, edges, idx) {
  const dx = t.x - f.x, dy = t.y - f.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const hasReverse = edges.some((e, i) => i !== idx && e.from === edges[idx]?.to && e.to === edges[idx]?.from);
  const curve = hasReverse ? dist * 0.28 : dist * 0.14;
  const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
  const nx = -dy / dist, ny = dx / dist;
  return `M ${f.x} ${f.y} Q ${mx + nx * curve} ${my + ny * curve} ${t.x} ${t.y}`;
}

export default function LeveragePointScorer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [positioned, setPositioned] = useState([]);
  const [algoScores, setAlgoScores] = useState({});
  const [userScores, setUserScores] = useState({});
  const [userMeadows, setUserMeadows] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showInterventions, setShowInterventions] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customNodeCount, setCustomNodeCount] = useState(4);
  const [customInput, setCustomInput] = useState({});
  const [addEdgeFrom, setAddEdgeFrom] = useState("");
  const [addEdgeTo, setAddEdgeTo] = useState("");
  const [addEdgePol, setAddEdgePol] = useState("+");

  useEffect(() => {
    if (nodes.length > 0) {
      const p = NodePositioner(nodes);
      setPositioned(p);
      setAlgoScores(computeLeverage(nodes, edges));
    }
  }, [nodes, edges]);

  const loadExample = () => {
    setNodes(AI_OPS_EXAMPLE.nodes.map((n) => ({ ...n })));
    setEdges(AI_OPS_EXAMPLE.edges.map((e) => ({ ...e })));
    setUserScores({});
    setUserMeadows({});
    setRevealed(false);
    setSelectedNode(null);
    setShowInterventions(false);
    setLoaded(true);
    setCustomMode(false);
  };

  const startCustom = () => {
    setCustomMode(true);
    setLoaded(false);
    const ns = [];
    for (let i = 0; i < customNodeCount; i++) {
      ns.push({ id: `c${i}`, label: `Variable ${i + 1}`, leverageActual: null });
    }
    setNodes(ns);
    setEdges([]);
    setUserScores({});
    setUserMeadows({});
    setRevealed(false);
    setSelectedNode(null);
    setCustomInput({});
  };

  const finalizeCustom = () => {
    const updated = nodes.map((n) => ({
      ...n,
      label: customInput[n.id] || n.label,
    }));
    setNodes(updated);
    setLoaded(true);
    setCustomMode(false);
  };

  const addCustomEdge = () => {
    if (addEdgeFrom && addEdgeTo && addEdgeFrom !== addEdgeTo) {
      const exists = edges.some((e) => e.from === addEdgeFrom && e.to === addEdgeTo);
      if (!exists) {
        setEdges((prev) => [...prev, { from: addEdgeFrom, to: addEdgeTo, polarity: addEdgePol }]);
      }
    }
  };

  const setUserScore = (nodeId, val) => {
    setUserScores((prev) => ({ ...prev, [nodeId]: parseFloat(val) || 0 }));
  };

  const setMeadowsLevel = (nodeId, level) => {
    setUserMeadows((prev) => ({ ...prev, [nodeId]: level }));
  };

  const revealScores = () => setRevealed(true);

  const getScoreColor = (score) => {
    if (score >= 0.7) return C.pink;
    if (score >= 0.4) return C.accent;
    if (score >= 0.2) return C.gold;
    return C.textMuted;
  };

  const getAccuracyScore = () => {
    if (!revealed || Object.keys(userScores).length === 0) return null;
    let totalDiff = 0;
    let count = 0;
    nodes.forEach((n) => {
      const userVal = userScores[n.id] ?? 0;
      const algoVal = n.leverageActual ?? algoScores[n.id]?.normalized ?? 0;
      totalDiff += Math.abs(userVal - algoVal);
      count++;
    });
    return count > 0 ? Math.max(0, Math.round((1 - totalDiff / count) * 100)) : 0;
  };

  const accuracy = getAccuracyScore();
  const rankedNodes = [...nodes].sort((a, b) => {
    const sa = a.leverageActual ?? algoScores[a.id]?.normalized ?? 0;
    const sb = b.leverageActual ?? algoScores[b.id]?.normalized ?? 0;
    return sb - sa;
  });

  const allScored = nodes.length > 0 && nodes.every((n) => userScores[n.id] !== undefined);

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
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${C.panelBorder}`,
          background: C.panel,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.accent}33, ${C.accent}11)`,
              border: `2px solid ${C.accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ◎
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
              Leverage Point Scorer
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ST-002 · Systems Thinking Cubelet
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={loadExample}
            style={{
              background: `${C.gold}18`,
              border: `1px solid ${C.gold}44`,
              color: C.gold,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Load AI Ops CLD
          </button>
          <button
            onClick={() => { setLoaded(false); setCustomMode(false); setNodes([]); setEdges([]); setRevealed(false); setSelectedNode(null); }}
            style={{
              background: `${C.danger}12`,
              border: `1px solid ${C.danger}33`,
              color: C.danger,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {!loaded && !customMode ? (
        /* Landing / Setup Screen */
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>◎</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, marginBottom: 8, color: C.text }}>
              Find the Leverage Point
            </div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
              Score each node in a causal loop diagram by how much system behavior it governs.
              Then reveal the algorithm's scores and see how your intuition compares.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={loadExample}
                style={{
                  background: `linear-gradient(135deg, ${C.accent}22, ${C.accent}11)`,
                  border: `1px solid ${C.accent}55`,
                  color: C.accent,
                  padding: "12px 28px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                Use AI Ops Example
              </button>
              <button
                onClick={startCustom}
                style={{
                  background: `${C.textMuted}11`,
                  border: `1px solid ${C.panelBorder}`,
                  color: C.textSec,
                  padding: "12px 28px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                Build Custom CLD
              </button>
            </div>
          </div>
        </div>
      ) : customMode ? (
        /* Custom CLD Builder */
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20, color: C.text }}>
              Build Your CLD
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                NUMBER OF VARIABLES
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setCustomNodeCount(num);
                      const ns = [];
                      for (let i = 0; i < num; i++) {
                        ns.push({ id: `c${i}`, label: customInput[`c${i}`] || `Variable ${i + 1}`, leverageActual: null });
                      }
                      setNodes(ns);
                      setEdges([]);
                    }}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 6,
                      border: customNodeCount === num ? `2px solid ${C.accent}` : `1px solid ${C.panelBorder}`,
                      background: customNodeCount === num ? `${C.accent}18` : "transparent",
                      color: customNodeCount === num ? C.accent : C.textSec,
                      cursor: "pointer",
                      fontSize: 14,
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                VARIABLE NAMES
              </label>
              {nodes.map((n, i) => (
                <input
                  key={n.id}
                  value={customInput[n.id] ?? `Variable ${i + 1}`}
                  onChange={(e) => setCustomInput((p) => ({ ...p, [n.id]: e.target.value }))}
                  placeholder={`Variable ${i + 1}`}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    marginBottom: 6,
                    background: C.node,
                    border: `1px solid ${C.nodeBorder}`,
                    borderRadius: 6,
                    color: C.text,
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                CAUSAL LINKS
              </label>
              {edges.map((e, i) => {
                const fn = nodes.find((n) => n.id === e.from);
                const tn = nodes.find((n) => n.id === e.to);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 11, color: C.textSec }}>
                    <span>{customInput[e.from] || fn?.label}</span>
                    <span style={{ color: e.polarity === "+" ? C.green : C.danger, fontWeight: 700 }}>—{e.polarity}→</span>
                    <span>{customInput[e.to] || tn?.label}</span>
                    <button
                      onClick={() => setEdges((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, padding: "0 4px" }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <select
                  value={addEdgeFrom}
                  onChange={(e) => setAddEdgeFrom(e.target.value)}
                  style={{ padding: "6px 8px", background: C.node, border: `1px solid ${C.nodeBorder}`, borderRadius: 4, color: C.text, fontSize: 11, fontFamily: "inherit" }}
                >
                  <option value="">From...</option>
                  {nodes.map((n) => <option key={n.id} value={n.id}>{customInput[n.id] || n.label}</option>)}
                </select>
                <button
                  onClick={() => setAddEdgePol((p) => (p === "+" ? "-" : "+"))}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 4,
                    border: `1px solid ${addEdgePol === "+" ? C.green : C.danger}55`,
                    background: `${addEdgePol === "+" ? C.green : C.danger}18`,
                    color: addEdgePol === "+" ? C.green : C.danger,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  {addEdgePol}
                </button>
                <select
                  value={addEdgeTo}
                  onChange={(e) => setAddEdgeTo(e.target.value)}
                  style={{ padding: "6px 8px", background: C.node, border: `1px solid ${C.nodeBorder}`, borderRadius: 4, color: C.text, fontSize: 11, fontFamily: "inherit" }}
                >
                  <option value="">To...</option>
                  {nodes.map((n) => <option key={n.id} value={n.id}>{customInput[n.id] || n.label}</option>)}
                </select>
                <button
                  onClick={addCustomEdge}
                  style={{
                    padding: "6px 12px",
                    background: `${C.accent}18`,
                    border: `1px solid ${C.accent}44`,
                    color: C.accent,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "inherit",
                  }}
                >
                  Add Link
                </button>
              </div>
            </div>

            <button
              onClick={finalizeCustom}
              disabled={edges.length < nodes.length - 1}
              style={{
                padding: "12px 32px",
                background: edges.length >= nodes.length - 1 ? `linear-gradient(135deg, ${C.accent}33, ${C.accent}18)` : C.node,
                border: `1px solid ${edges.length >= nodes.length - 1 ? C.accent : C.panelBorder}`,
                color: edges.length >= nodes.length - 1 ? C.accent : C.textMuted,
                borderRadius: 8,
                cursor: edges.length >= nodes.length - 1 ? "pointer" : "not-allowed",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              Score This CLD →
            </button>
          </div>
        </div>
      ) : (
        /* Main Scoring Interface */
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* CLD Visualization */}
          <div style={{ flex: 1, position: "relative" }}>
            <svg width="100%" height="100%" style={{ background: C.canvas }}>
              <defs>
                <pattern id="lgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="0.7" fill={C.gridDot} />
                </pattern>
                <marker id="arrBlue" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 6 L 0 11 Z" fill={C.accent} />
                </marker>
                <filter id="scoreGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#lgrid)" />

              {/* Edges */}
              {edges.map((edge, idx) => {
                const f = positioned.find((n) => n.id === edge.from);
                const t = positioned.find((n) => n.id === edge.to);
                if (!f || !t) return null;
                const d = getEdgePath(f, t, edges, idx);
                return (
                  <g key={idx}>
                    <path d={d} fill="none" stroke={edge.polarity === "+" ? C.green : C.danger} strokeWidth={1.5}
                      strokeDasharray={edge.polarity === "-" ? "6 4" : "none"} markerEnd="url(#arrBlue)" opacity={0.5} />
                  </g>
                );
              })}

              {/* Nodes */}
              {positioned.map((node) => {
                const isSelected = selectedNode === node.id;
                const algoScore = node.leverageActual ?? algoScores[node.id]?.normalized ?? 0;
                const userScore = userScores[node.id];
                const scoreColor = revealed ? getScoreColor(algoScore) : userScore !== undefined ? C.accent : C.nodeBorder;
                const radius = revealed ? 44 + algoScore * 22 : 52;

                return (
                  <g key={node.id} onClick={() => setSelectedNode(node.id)} style={{ cursor: "pointer" }}>
                    {/* Score ring */}
                    {(revealed || userScore !== undefined) && (
                      <circle
                        cx={node.x} cy={node.y} r={radius + 6}
                        fill="none" stroke={scoreColor} strokeWidth={revealed ? 3 : 1.5}
                        opacity={revealed ? 0.6 : 0.3}
                        strokeDasharray={revealed ? "none" : "4 3"}
                      />
                    )}
                    <circle
                      cx={node.x} cy={node.y} r={radius}
                      fill={isSelected ? `${C.accent}15` : C.node}
                      stroke={isSelected ? C.accent : scoreColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ transition: "all 0.4s ease" }}
                    />
                    <text x={node.x} y={node.y - (revealed ? 8 : 0)} textAnchor="middle" dominantBaseline="central"
                      fill={C.text} fontSize={11} fontWeight={500} fontFamily="'DM Sans', sans-serif"
                      style={{ pointerEvents: "none" }}>
                      {node.label}
                    </text>
                    {revealed && (
                      <text x={node.x} y={node.y + 14} textAnchor="middle" dominantBaseline="central"
                        fill={scoreColor} fontSize={16} fontWeight={700} fontFamily="'JetBrains Mono', monospace"
                        filter="url(#scoreGlow)" style={{ pointerEvents: "none" }}>
                        {algoScore.toFixed(2)}
                      </text>
                    )}
                    {!revealed && userScore !== undefined && (
                      <text x={node.x} y={node.y + 14} textAnchor="middle" dominantBaseline="central"
                        fill={C.accent} fontSize={13} fontWeight={600} fontFamily="'JetBrains Mono', monospace"
                        opacity={0.6} style={{ pointerEvents: "none" }}>
                        {userScore.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Accuracy overlay */}
            {revealed && accuracy !== null && (
              <div style={{
                position: "absolute", top: 16, left: 16, background: C.panel, border: `1px solid ${C.panelBorder}`,
                borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `conic-gradient(${accuracy >= 70 ? C.green : accuracy >= 40 ? C.gold : C.danger} ${accuracy * 3.6}deg, ${C.panelBorder} 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", background: C.panel,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: accuracy >= 70 ? C.green : accuracy >= 40 ? C.gold : C.danger,
                  }}>
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Intuition Accuracy</div>
                  <div style={{ fontSize: 10, color: C.textSec }}>
                    {accuracy >= 80 ? "Expert-level systems intuition!" : accuracy >= 60 ? "Good pattern recognition." : accuracy >= 40 ? "The counterintuitive nodes tripped you up." : "The highest-leverage point isn't always the most visible."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{
            width: 290, background: C.panel, borderLeft: `1px solid ${C.panelBorder}`,
            padding: 16, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 14,
          }}>
            {/* Scoring inputs */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 10 }}>
                {revealed ? "Leverage Rankings" : "Score Each Node (0–1)"}
              </div>

              {(revealed ? rankedNodes : nodes).map((node, i) => {
                const algoVal = node.leverageActual ?? algoScores[node.id]?.normalized ?? 0;
                const userVal = userScores[node.id];
                const sc = revealed ? algoVal : userVal ?? 0;
                const color = revealed ? getScoreColor(algoVal) : C.accent;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    style={{
                      background: selectedNode === node.id ? `${C.accent}10` : `${C.textMuted}06`,
                      border: `1px solid ${selectedNode === node.id ? C.accent + "44" : C.panelBorder}`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 6, cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {revealed && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color, background: `${color}22`,
                            padding: "2px 6px", borderRadius: 3, letterSpacing: "0.04em",
                          }}>
                            #{i + 1}
                          </span>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
                          {node.label}
                        </span>
                      </div>
                      {revealed && (
                        <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
                          {algoVal.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {!revealed ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={userVal ?? 0.5}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setUserScore(node.id, e.target.value)}
                          style={{ flex: 1, accentColor: C.accent, height: 4 }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, width: 36, textAlign: "right", fontFamily: "inherit" }}>
                          {(userVal ?? 0.5).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <div style={{ flex: 1, height: 4, background: C.panelBorder, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{
                            width: `${algoVal * 100}%`, height: "100%", background: color,
                            borderRadius: 2, transition: "width 0.6s ease",
                          }} />
                        </div>
                        {userVal !== undefined && (
                          <span style={{ fontSize: 9, color: C.textMuted }}>
                            yours: {userVal.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reveal / Interventions buttons */}
            {!revealed && loaded && (
              <button
                onClick={revealScores}
                disabled={!allScored}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 8,
                  background: allScored ? `linear-gradient(135deg, ${C.accent}33, ${C.purple}22)` : C.node,
                  border: `1px solid ${allScored ? C.accent : C.panelBorder}`,
                  color: allScored ? C.accent : C.textMuted,
                  cursor: allScored ? "pointer" : "not-allowed",
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}
              >
                {allScored ? "Reveal Leverage Scores" : "Score all nodes to reveal"}
              </button>
            )}

            {revealed && AI_OPS_EXAMPLE.interventions && !customMode && (
              <button
                onClick={() => setShowInterventions(!showInterventions)}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 8,
                  background: `${C.gold}12`, border: `1px solid ${C.gold}33`,
                  color: C.gold, cursor: "pointer", fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}
              >
                {showInterventions ? "Hide" : "Show"} Intervention Comparison
              </button>
            )}

            {/* Intervention comparison panel */}
            {showInterventions && revealed && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                  Parameter vs Structural
                </div>
                {Object.entries(AI_OPS_EXAMPLE.interventions).map(([nodeId, intv]) => {
                  const nd = nodes.find((n) => n.id === nodeId);
                  const mLevel = MEADOWS_HIERARCHY.find((m) => m.level === intv.parameter.meadows);
                  const mLevelS = MEADOWS_HIERARCHY.find((m) => m.level === intv.structural.meadows);
                  return (
                    <div key={nodeId} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
                        {nd?.label}
                      </div>
                      <div style={{
                        background: `${C.danger}08`, border: `1px solid ${C.danger}22`, borderRadius: 6, padding: 10, marginBottom: 4,
                      }}>
                        <div style={{ fontSize: 10, color: C.danger, fontWeight: 600, marginBottom: 4 }}>
                          Parameter: {intv.parameter.label}
                        </div>
                        <div style={{ fontSize: 9, color: C.textSec, lineHeight: 1.5 }}>
                          Meadows Level {intv.parameter.meadows}: {mLevel?.label}
                        </div>
                        <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{intv.parameter.impact}</div>
                      </div>
                      <div style={{
                        background: `${C.green}08`, border: `1px solid ${C.green}22`, borderRadius: 6, padding: 10,
                      }}>
                        <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginBottom: 4 }}>
                          Structural: {intv.structural.label}
                        </div>
                        <div style={{ fontSize: 9, color: C.textSec, lineHeight: 1.5 }}>
                          Meadows Level {intv.structural.meadows}: {mLevelS?.label}
                        </div>
                        <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{intv.structural.impact}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Meadows Hierarchy sidebar */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                Meadows Hierarchy
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {MEADOWS_HIERARCHY.map((m) => (
                  <div
                    key={m.level}
                    onMouseEnter={() => setHoveredLevel(m.level)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "4px 8px",
                      borderRadius: 4, background: hoveredLevel === m.level ? `${m.color}12` : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, color: m.color, width: 18, textAlign: "right", fontFamily: "inherit" }}>
                      {m.level}
                    </span>
                    <div style={{ flex: 1, height: 3, background: C.panelBorder, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${(m.level / 12) * 100}%`, height: "100%", background: m.color, borderRadius: 2, opacity: 0.6 }} />
                    </div>
                    <span style={{ fontSize: 8, color: C.textSec, flex: 2 }}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, lineHeight: 1.7, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
                Higher levels = greater leverage.
                <br />
                <span style={{ color: C.gold }}>Parameter tweaks</span> are level 1.
                <br />
                <span style={{ color: C.accent }}>Structural changes</span> are level 5–7.
                <br />
                <span style={{ color: C.pink }}>Paradigm shifts</span> are level 10+.
              </div>
            </div>

            {/* Key insight */}
            {revealed && (
              <div style={{
                background: `linear-gradient(135deg, ${C.accent}08, ${C.gold}06)`,
                border: `1px solid ${C.accent}22`, borderRadius: 8, padding: 12,
              }}>
                <div style={{ fontSize: 14, marginBottom: 6 }}>🎯</div>
                <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                  <b style={{ color: C.accent }}>Same node, different leverage.</b> A budget cap and prompt caching both target AI Spend — but one is a parameter tweak (L1), the other restructures feedback (L6). The 10x ROI variance your CxO sees? It lives in this gap.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
