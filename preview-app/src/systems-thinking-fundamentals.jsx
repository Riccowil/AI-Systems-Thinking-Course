import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#0f1117",
  canvas: "#161922",
  gridLine: "#1e2230",
  node: "#1c2033",
  nodeBorder: "#2a3050",
  nodeHover: "#242b45",
  nodeSelected: "#00d4aa",
  edgePlus: "#00d4aa",
  edgeMinus: "#ff6b6b",
  textPrimary: "#e8ecf4",
  textSecondary: "#7a839e",
  textMuted: "#4a5270",
  accent: "#00d4aa",
  accentWarm: "#ffb347",
  accentDanger: "#ff6b6b",
  panel: "#181c28",
  panelBorder: "#242940",
  reinforcing: "#00d4aa",
  balancing: "#6b8aff",
  pulse: "#00d4aa",
  delay: "#c96bff",
};

const SAAS_CHURN_EXAMPLE = {
  nodes: [
    { id: "n1", label: "Onboarding\nQuality", x: 160, y: 120, stock: 40 },
    { id: "n2", label: "Support\nVolume", x: 440, y: 100, stock: 70 },
    { id: "n3", label: "Response\nTime", x: 620, y: 280, stock: 65 },
    { id: "n4", label: "Customer\nSatisfaction", x: 440, y: 440, stock: 35 },
    { id: "n5", label: "Churn\nRate", x: 160, y: 420, stock: 60 },
    { id: "n6", label: "Revenue", x: 80, y: 270, stock: 45 },
  ],
  edges: [
    { from: "n1", to: "n2", polarity: "-", delay: false },
    { from: "n2", to: "n3", polarity: "+", delay: true },
    { from: "n3", to: "n4", polarity: "-", delay: true },
    { from: "n4", to: "n5", polarity: "-", delay: false },
    { from: "n5", to: "n6", polarity: "-", delay: false },
    { from: "n6", to: "n1", polarity: "+", delay: false },
  ],
};

const NODE_RADIUS = 52;
const STOCK_BAR_W = 36;
const STOCK_BAR_H = 6;

function findCycles(nodes, edges) {
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.from]) adj[e.from].push({ to: e.to, polarity: e.polarity });
  });
  const cycles = [];
  const visited = new Set();
  function dfs(start, current, path, pathSet) {
    const neighbors = adj[current] || [];
    for (const { to, polarity } of neighbors) {
      if (to === start && path.length >= 2) {
        cycles.push([...path, { node: to, polarity }]);
        continue;
      }
      if (pathSet.has(to) || visited.has(to)) continue;
      pathSet.add(to);
      path.push({ node: to, polarity });
      dfs(start, to, path, pathSet);
      path.pop();
      pathSet.delete(to);
    }
  }
  nodes.forEach((n) => {
    const pathSet = new Set([n.id]);
    dfs(n.id, n.id, [{ node: n.id, polarity: null }], pathSet);
    visited.add(n.id);
  });
  return cycles;
}

function classifyLoop(cycle) {
  let negCount = 0;
  for (let i = 0; i < cycle.length - 1; i++) {
    if (cycle[i + 1].polarity === "-") negCount++;
  }
  return negCount % 2 === 0 ? "reinforcing" : "balancing";
}

function getEdgePath(fromNode, toNode, allEdges, idx) {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const hasReverse = allEdges.some(
    (e, i) => i !== idx && e.from === allEdges[idx]?.to && e.to === allEdges[idx]?.from
  );
  const curve = hasReverse ? dist * 0.25 : dist * 0.12;
  const mx = (fromNode.x + toNode.x) / 2;
  const my = (fromNode.y + toNode.y) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const cx = mx + nx * curve;
  const cy = my + ny * curve;
  return `M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`;
}

function getPointOnQuadratic(x0, y0, cx, cy, x1, y1, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

function parsePath(d) {
  const nums = d.match(/-?[\d.]+/g)?.map(Number) || [];
  return { x0: nums[0], y0: nums[1], cx: nums[2], cy: nums[3], x1: nums[4], y1: nums[5] };
}

const TUTORIAL_STEPS = [
  {
    title: "Linear vs Systems Thinking",
    body: "Linear thinking examines cause and effect in isolation: A causes B. Systems thinking examines how components interact through feedback loops, delays, and flows -- revealing behaviors that linear analysis misses entirely.",
  },
  {
    title: "The Five-Step Framework",
    body: "1. Define the system boundary\n2. List the key variables (stocks)\n3. Map causal relationships between them\n4. Identify feedback loops (reinforcing & balancing)\n5. Predict emergent behaviors over time",
  },
  {
    title: "Building Your First System",
    body: "Use the toolbar to add variables (stocks) to the canvas, then connect them with causal links. Set each link as positive (+) or negative (-). Add delays where effects aren't immediate. Watch the system animate.",
  },
];

const CALLOUTS = {
  firstNode: { text: "Each variable is a stock -- something that accumulates or depletes over time. Its level bar shows current magnitude.", color: COLORS.accent },
  firstEdge: { text: "Causal links show how variables influence each other. + means same-direction change; - means opposite-direction change.", color: COLORS.accent },
  firstDelay: { text: "Delays are critical! They cause oscillation and overshoot. Real systems always have delays -- ignoring them is a common failure mode.", color: COLORS.delay },
  loopDetected: { text: "Loop detected! Reinforcing loops (R) amplify change -- snowball effects. Balancing loops (B) resist change -- thermostats. Systems have both.", color: COLORS.reinforcing },
  sixVariables: { text: "Practice target: 6+ variables, at least 1 reinforcing loop, 1 balancing loop, and 1 delay. Check the panel to track your progress.", color: COLORS.accentWarm },
};

export default function SystemsThinkingFundamentals() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mode, setMode] = useState("add");
  const [connectFrom, setConnectFrom] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [detectedLoops, setDetectedLoops] = useState([]);
  const [pulseActive, setPulseActive] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [editText, setEditText] = useState("");
  const [polarity, setPolarity] = useState("+");
  const [nodeCounter, setNodeCounter] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [viewMode, setViewMode] = useState("systems");
  const [simRunning, setSimRunning] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [callout, setCallout] = useState(null);
  const [addDelay, setAddDelay] = useState(false);
  const [calloutsSeen, setCalloutsSeen] = useState(new Set());
  const svgRef = useRef(null);
  const inputRef = useRef(null);
  const simRef = useRef(null);

  // Detect loops
  useEffect(() => {
    const cycles = findCycles(nodes, edges);
    const classified = cycles.map((c) => ({
      nodes: c.map((n) => n.node),
      type: classifyLoop(c),
    }));
    const unique = [];
    const seen = new Set();
    classified.forEach((loop) => {
      const key = [...loop.nodes].slice(0, -1).sort().join(",");
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(loop);
      }
    });
    setDetectedLoops(unique);
    if (unique.length > 0 && unique.length !== detectedLoops.length) {
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 3000);
      return () => clearTimeout(t);
    }
  }, [nodes, edges]);

  // Educational callouts
  useEffect(() => {
    if (nodes.length === 1 && !calloutsSeen.has("firstNode")) {
      setCallout(CALLOUTS.firstNode);
      setCalloutsSeen((p) => new Set([...p, "firstNode"]));
      setTimeout(() => setCallout(null), 5000);
    }
    if (nodes.length >= 6 && !calloutsSeen.has("sixVariables")) {
      setCallout(CALLOUTS.sixVariables);
      setCalloutsSeen((p) => new Set([...p, "sixVariables"]));
      setTimeout(() => setCallout(null), 5000);
    }
  }, [nodes.length]);

  useEffect(() => {
    if (edges.length === 1 && !calloutsSeen.has("firstEdge")) {
      setCallout(CALLOUTS.firstEdge);
      setCalloutsSeen((p) => new Set([...p, "firstEdge"]));
      setTimeout(() => setCallout(null), 5000);
    }
    const hasDelay = edges.some((e) => e.delay);
    if (hasDelay && !calloutsSeen.has("firstDelay")) {
      setCallout(CALLOUTS.firstDelay);
      setCalloutsSeen((p) => new Set([...p, "firstDelay"]));
      setTimeout(() => setCallout(null), 5000);
    }
  }, [edges]);

  useEffect(() => {
    if (detectedLoops.length > 0 && !calloutsSeen.has("loopDetected")) {
      setCallout(CALLOUTS.loopDetected);
      setCalloutsSeen((p) => new Set([...p, "loopDetected"]));
      setTimeout(() => setCallout(null), 5000);
    }
  }, [detectedLoops.length]);

  useEffect(() => {
    if (editingNode && inputRef.current) inputRef.current.focus();
  }, [editingNode]);

  // Simulation engine
  useEffect(() => {
    if (simRunning) {
      simRef.current = setInterval(() => {
        setSimTick((t) => t + 1);
        setNodes((prev) => {
          const updated = prev.map((n) => ({ ...n }));
          const nodeMap = {};
          updated.forEach((n) => (nodeMap[n.id] = n));
          edges.forEach((edge) => {
            const src = nodeMap[edge.from];
            const tgt = nodeMap[edge.to];
            if (!src || !tgt) return;
            const influence = (src.stock - 50) * 0.03;
            const delayFactor = edge.delay ? 0.3 : 1;
            if (edge.polarity === "+") {
              tgt.stock = Math.max(0, Math.min(100, tgt.stock + influence * delayFactor));
            } else {
              tgt.stock = Math.max(0, Math.min(100, tgt.stock - influence * delayFactor));
            }
          });
          return updated;
        });
      }, 300);
      return () => clearInterval(simRef.current);
    } else {
      if (simRef.current) clearInterval(simRef.current);
    }
  }, [simRunning, edges]);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target !== svgRef.current && e.target.tagName !== "rect") return;
      if (mode === "add") {
        const pt = getSVGPoint(e);
        const id = `n${nodeCounter + 1}`;
        setNodeCounter((c) => c + 1);
        setNodes((prev) => [
          ...prev,
          { id, label: `Variable ${prev.length + 1}`, x: pt.x, y: pt.y, stock: 50 },
        ]);
        setEditingNode(id);
        setEditText(`Variable ${nodes.length + 1}`);
      }
      if (mode === "connect") {
        setConnectFrom(null);
        setSelectedNode(null);
      }
    },
    [mode, getSVGPoint, nodeCounter, nodes.length]
  );

  const handleNodeClick = useCallback(
    (nodeId, e) => {
      e.stopPropagation();
      if (mode === "connect") {
        if (!connectFrom) {
          setConnectFrom(nodeId);
          setSelectedNode(nodeId);
        } else if (connectFrom !== nodeId) {
          const exists = edges.some((ed) => ed.from === connectFrom && ed.to === nodeId);
          if (!exists) {
            setEdges((prev) => [...prev, { from: connectFrom, to: nodeId, polarity, delay: addDelay }]);
          }
          setConnectFrom(null);
          setSelectedNode(null);
        }
      } else if (mode === "delete") {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) => prev.filter((ed) => ed.from !== nodeId && ed.to !== nodeId));
      }
    },
    [mode, connectFrom, edges, polarity, addDelay]
  );

  const handleNodeDoubleClick = useCallback(
    (nodeId, e) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setEditingNode(nodeId);
        setEditText(node.label.replace("\n", " "));
      }
    },
    [nodes]
  );

  const handleNodeMouseDown = useCallback(
    (nodeId, e) => {
      if (mode === "move") {
        e.stopPropagation();
        const pt = getSVGPoint(e);
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          setDragging(nodeId);
          setDragOffset({ x: pt.x - node.x, y: pt.y - node.y });
        }
      }
    },
    [mode, getSVGPoint, nodes]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (dragging) {
        const pt = getSVGPoint(e);
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragging ? { ...n, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y } : n
          )
        );
      }
    },
    [dragging, getSVGPoint, dragOffset]
  );

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const handleEdgeClick = useCallback(
    (idx, e) => {
      e.stopPropagation();
      if (mode === "delete") {
        setEdges((prev) => prev.filter((_, i) => i !== idx));
      } else {
        setEdges((prev) =>
          prev.map((ed, i) => (i === idx ? { ...ed, polarity: ed.polarity === "+" ? "-" : "+" } : ed))
        );
      }
    },
    [mode]
  );

  const handleEdgeRightClick = useCallback((idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEdges((prev) =>
      prev.map((ed, i) => (i === idx ? { ...ed, delay: !ed.delay } : ed))
    );
  }, []);

  const finishEdit = useCallback(() => {
    if (editingNode && editText.trim()) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNode ? { ...n, label: editText.trim() } : n))
      );
    }
    setEditingNode(null);
    setEditText("");
  }, [editingNode, editText]);

  const handleStockChange = useCallback((nodeId, val) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, stock: val } : n)));
  }, []);

  const loadExample = () => {
    setNodes(SAAS_CHURN_EXAMPLE.nodes.map((n) => ({ ...n })));
    setEdges(SAAS_CHURN_EXAMPLE.edges.map((e) => ({ ...e })));
    setNodeCounter(6);
    setShowTutorial(false);
    setSimRunning(false);
    setSimTick(0);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setDetectedLoops([]);
    setConnectFrom(null);
    setSelectedNode(null);
    setNodeCounter(0);
    setSimRunning(false);
    setSimTick(0);
  };

  const loopEdgeKeys = new Set();
  detectedLoops.forEach((loop) => {
    for (let i = 0; i < loop.nodes.length - 1; i++) {
      loopEdgeKeys.add(`${loop.nodes[i]}-${loop.nodes[i + 1]}`);
    }
  });

  const reinforcingCount = detectedLoops.filter((l) => l.type === "reinforcing").length;
  const balancingCount = detectedLoops.filter((l) => l.type === "balancing").length;
  const delayCount = edges.filter((e) => e.delay).length;

  const practiceComplete =
    nodes.length >= 6 && reinforcingCount >= 1 && balancingCount >= 1 && delayCount >= 1;

  const modeButtons = [
    { key: "add", icon: "+", label: "Add" },
    { key: "connect", icon: "\u27F6", label: "Connect" },
    { key: "move", icon: "\u2725", label: "Move" },
    { key: "delete", icon: "\u2715", label: "Delete" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: COLORS.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        color: COLORS.textPrimary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${COLORS.panelBorder}`,
          background: COLORS.panel,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.accent}33, ${COLORS.accent}11)`,
              border: `2px solid ${COLORS.accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {"\u2B21"}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "-0.02em",
              }}
            >
              System Explorer
            </div>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              W1-C1 · Systems Thinking Fundamentals
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Linear vs Systems toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${COLORS.panelBorder}`,
            }}
          >
            {["linear", "systems"].map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  padding: "5px 12px",
                  fontSize: 10,
                  fontFamily: "inherit",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  background: viewMode === v ? `${COLORS.accent}22` : "transparent",
                  color: viewMode === v ? COLORS.accent : COLORS.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={loadExample}
            style={{
              background: `${COLORS.accentWarm}18`,
              border: `1px solid ${COLORS.accentWarm}44`,
              color: COLORS.accentWarm,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            SaaS Churn Example
          </button>
          <button
            onClick={() => {
              setSimRunning(!simRunning);
              if (!simRunning) setSimTick(0);
            }}
            style={{
              background: simRunning ? `${COLORS.accent}22` : `${COLORS.accent}10`,
              border: `1px solid ${simRunning ? COLORS.accent : COLORS.panelBorder}`,
              color: simRunning ? COLORS.accent : COLORS.textSecondary,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            {simRunning ? "\u25A0 Stop" : "\u25B6 Simulate"}
          </button>
          <button
            onClick={clearAll}
            style={{
              background: `${COLORS.accentDanger}12`,
              border: `1px solid ${COLORS.accentDanger}33`,
              color: COLORS.accentDanger,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Educational callout banner */}
      {callout && (
        <div
          style={{
            padding: "8px 20px",
            background: `${callout.color}12`,
            borderBottom: `1px solid ${callout.color}33`,
            fontSize: 11,
            color: callout.color,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14 }}>{"\u2139"}</span>
          <span>{callout.text}</span>
          <button
            onClick={() => setCallout(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: callout.color,
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
              opacity: 0.6,
            }}
          >
            {"\u2715"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Toolbar */}
        <div
          style={{
            width: 72,
            background: COLORS.panel,
            borderRight: `1px solid ${COLORS.panelBorder}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 16,
            gap: 4,
            flexShrink: 0,
          }}
        >
          {modeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setMode(btn.key);
                setConnectFrom(null);
                setSelectedNode(null);
              }}
              title={btn.label}
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                border: mode === btn.key ? `2px solid ${COLORS.accent}` : `1px solid transparent`,
                background: mode === btn.key ? `${COLORS.accent}18` : "transparent",
                color: mode === btn.key ? COLORS.accent : COLORS.textSecondary,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                fontSize: 18,
                transition: "all 0.15s ease",
              }}
            >
              <span>{btn.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.04em" }}>
                {btn.label.toUpperCase()}
              </span>
            </button>
          ))}

          <div style={{ width: 40, height: 1, background: COLORS.panelBorder, margin: "8px 0" }} />

          {/* Polarity toggle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: mode === "connect" ? 1 : 0.3,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: "0.08em" }}>
              POLARITY
            </span>
            <button
              onClick={() => setPolarity(polarity === "+" ? "-" : "+")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: `2px solid ${polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus}`,
                background: `${polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus}18`,
                color: polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus,
                cursor: "pointer",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              {polarity}
            </button>
          </div>

          <div style={{ width: 40, height: 1, background: COLORS.panelBorder, margin: "8px 0" }} />

          {/* Delay toggle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: mode === "connect" ? 1 : 0.3,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: "0.08em" }}>
              DELAY
            </span>
            <button
              onClick={() => setAddDelay(!addDelay)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: `2px solid ${addDelay ? COLORS.delay : COLORS.panelBorder}`,
                background: addDelay ? `${COLORS.delay}18` : "transparent",
                color: addDelay ? COLORS.delay : COLORS.textMuted,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              {"||"}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{
              background: COLORS.canvas,
              cursor:
                mode === "add"
                  ? "crosshair"
                  : mode === "move"
                  ? dragging
                    ? "grabbing"
                    : "grab"
                  : mode === "delete"
                  ? "not-allowed"
                  : "default",
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="0.8" fill={COLORS.gridLine} />
              </pattern>
              <marker id="arrowPlus" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={COLORS.edgePlus} />
              </marker>
              <marker id="arrowMinus" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={COLORS.edgeMinus} />
              </marker>
              <marker id="arrowLoop" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={COLORS.accent} />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="nodeShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Linear view overlay */}
            {viewMode === "linear" && nodes.length >= 2 && (
              <g>
                {nodes.map((node, i) => {
                  if (i >= nodes.length - 1) return null;
                  const next = nodes[i + 1];
                  return (
                    <line
                      key={`lin-${i}`}
                      x1={node.x}
                      y1={node.y}
                      x2={next.x}
                      y2={next.y}
                      stroke={COLORS.textMuted}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.4}
                    />
                  );
                })}
                <text x={10} y={24} fill={COLORS.accentWarm} fontSize={11} fontFamily="'DM Sans', sans-serif" opacity={0.8}>
                  Linear view: only sequential cause-effect shown. Feedback loops invisible.
                </text>
              </g>
            )}

            {/* Edges */}
            {viewMode === "systems" &&
              edges.map((edge, idx) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const d = getEdgePath(fromNode, toNode, edges, idx);
                const edgeKey = `${edge.from}-${edge.to}`;
                const inLoop = loopEdgeKeys.has(edgeKey);
                const color = inLoop
                  ? COLORS.accent
                  : edge.polarity === "+"
                  ? COLORS.edgePlus
                  : COLORS.edgeMinus;
                const parsed = parsePath(d);
                const midPt = getPointOnQuadratic(
                  parsed.x0, parsed.y0, parsed.cx, parsed.cy, parsed.x1, parsed.y1, 0.45
                );

                return (
                  <g key={idx}>
                    {inLoop && pulseActive && (
                      <path d={d} fill="none" stroke={COLORS.pulse} strokeWidth={6} opacity={0.3} filter="url(#glow)">
                        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.5s" repeatCount="3" />
                        <animate attributeName="stroke-width" values="6;14;6" dur="1.5s" repeatCount="3" />
                      </path>
                    )}
                    {/* Animated flow particle during simulation */}
                    {simRunning && (
                      <circle r={3} fill={color} opacity={0.8}>
                        <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={inLoop ? 2.5 : 1.8}
                      strokeDasharray={edge.polarity === "-" ? "8 4" : "none"}
                      markerEnd={
                        inLoop ? "url(#arrowLoop)" : edge.polarity === "+" ? "url(#arrowPlus)" : "url(#arrowMinus)"
                      }
                      style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                      onClick={(e) => handleEdgeClick(idx, e)}
                      onContextMenu={(e) => handleEdgeRightClick(idx, e)}
                      opacity={0.85}
                    />
                    {/* Delay marks */}
                    {edge.delay && (() => {
                      const dPt = getPointOnQuadratic(
                        parsed.x0, parsed.y0, parsed.cx, parsed.cy, parsed.x1, parsed.y1, 0.65
                      );
                      return (
                        <g>
                          <line x1={dPt.x - 4} y1={dPt.y - 6} x2={dPt.x - 4} y2={dPt.y + 6} stroke={COLORS.delay} strokeWidth={2} />
                          <line x1={dPt.x + 4} y1={dPt.y - 6} x2={dPt.x + 4} y2={dPt.y + 6} stroke={COLORS.delay} strokeWidth={2} />
                        </g>
                      );
                    })()}
                    {/* Polarity label */}
                    <g onClick={(e) => handleEdgeClick(idx, e)} onContextMenu={(e) => handleEdgeRightClick(idx, e)} style={{ cursor: "pointer" }}>
                      <circle cx={midPt.x} cy={midPt.y} r={11} fill={COLORS.panel} stroke={color} strokeWidth={1.5} />
                      <text
                        x={midPt.x}
                        y={midPt.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={color}
                        fontSize={14}
                        fontWeight={700}
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        {edge.polarity}
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const inAnyLoop = detectedLoops.some((l) => l.nodes.includes(node.id));
              const lines = node.label.split("\n");
              const stockFrac = (node.stock || 50) / 100;

              return (
                <g
                  key={node.id}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onDoubleClick={(e) => handleNodeDoubleClick(node.id, e)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  style={{ cursor: mode === "move" ? "grab" : "pointer" }}
                >
                  {inAnyLoop && pulseActive && (
                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 8} fill="none" stroke={COLORS.pulse} strokeWidth={2}>
                      <animate attributeName="r" values={`${NODE_RADIUS + 4};${NODE_RADIUS + 18};${NODE_RADIUS + 4}`} dur="1.5s" repeatCount="3" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="3" />
                    </circle>
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={isSelected ? `${COLORS.accent}22` : COLORS.node}
                    stroke={
                      isSelected
                        ? COLORS.nodeSelected
                        : inAnyLoop
                        ? COLORS.accent
                        : COLORS.nodeBorder
                    }
                    strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 1}
                    filter="url(#nodeShadow)"
                    style={{ transition: "all 0.2s" }}
                  />
                  {/* Stock level bar */}
                  <rect
                    x={node.x - STOCK_BAR_W / 2}
                    y={node.y + NODE_RADIUS - 16}
                    width={STOCK_BAR_W}
                    height={STOCK_BAR_H}
                    rx={3}
                    fill={COLORS.nodeBorder}
                    opacity={0.5}
                  />
                  <rect
                    x={node.x - STOCK_BAR_W / 2}
                    y={node.y + NODE_RADIUS - 16}
                    width={STOCK_BAR_W * stockFrac}
                    height={STOCK_BAR_H}
                    rx={3}
                    fill={
                      stockFrac > 0.7
                        ? COLORS.accent
                        : stockFrac > 0.3
                        ? COLORS.accentWarm
                        : COLORS.accentDanger
                    }
                    style={{ transition: "width 0.3s ease" }}
                  />
                  {/* Labels */}
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={node.x}
                      y={node.y - 4 + (li - (lines.length - 1) / 2) * 14}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? COLORS.accent : COLORS.textPrimary}
                      fontSize={11}
                      fontWeight={500}
                      fontFamily="'DM Sans', sans-serif"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {mode === "connect" && connectFrom && (
              <text x={10} y={20} fill={COLORS.accent} fontSize={11} fontFamily="'JetBrains Mono', monospace" opacity={0.7}>
                Click target node to connect...
              </text>
            )}
          </svg>

          {/* Node edit overlay */}
          {editingNode &&
            (() => {
              const node = nodes.find((n) => n.id === editingNode);
              if (!node) return null;
              return (
                <div style={{ position: "absolute", left: node.x - 70, top: node.y - 16, zIndex: 100 }}>
                  <input
                    ref={inputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={finishEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishEdit();
                    }}
                    style={{
                      width: 140,
                      padding: "6px 10px",
                      background: COLORS.panel,
                      border: `2px solid ${COLORS.accent}`,
                      borderRadius: 6,
                      color: COLORS.textPrimary,
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                </div>
              );
            })()}

          {/* Tutorial overlay */}
          {showTutorial && nodes.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                maxWidth: 420,
                background: `${COLORS.panel}ee`,
                border: `1px solid ${COLORS.panelBorder}`,
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{"\u2B21"}</div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: COLORS.accent,
                  marginBottom: 6,
                }}
              >
                {TUTORIAL_STEPS[tutorialStep].title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "pre-line",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                {TUTORIAL_STEPS[tutorialStep].body}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {tutorialStep > 0 && (
                  <button
                    onClick={() => setTutorialStep(tutorialStep - 1)}
                    style={{
                      padding: "6px 16px",
                      background: "transparent",
                      border: `1px solid ${COLORS.panelBorder}`,
                      color: COLORS.textSecondary,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "inherit",
                    }}
                  >
                    Back
                  </button>
                )}
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                  <button
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    style={{
                      padding: "6px 16px",
                      background: `${COLORS.accent}22`,
                      border: `1px solid ${COLORS.accent}55`,
                      color: COLORS.accent,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowTutorial(false)}
                    style={{
                      padding: "6px 16px",
                      background: `${COLORS.accent}22`,
                      border: `1px solid ${COLORS.accent}55`,
                      color: COLORS.accent,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    Start Building
                  </button>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: i === tutorialStep ? COLORS.accent : COLORS.panelBorder,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Simulation ticker */}
          {simRunning && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                background: `${COLORS.panel}dd`,
                border: `1px solid ${COLORS.accent}44`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 10,
                color: COLORS.accent,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SIMULATING · t={simTick}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: 260,
            background: COLORS.panel,
            borderLeft: `1px solid ${COLORS.panelBorder}`,
            padding: 16,
            overflowY: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* System Health */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              System Health
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <div
                style={{
                  background: `${COLORS.accent}10`,
                  border: `1px solid ${COLORS.accent}28`,
                  borderRadius: 8,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{nodes.length}</div>
                <div style={{ fontSize: 7, color: COLORS.textMuted, letterSpacing: "0.08em" }}>VARIABLES</div>
              </div>
              <div
                style={{
                  background: `${COLORS.reinforcing}10`,
                  border: `1px solid ${COLORS.reinforcing}28`,
                  borderRadius: 8,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.reinforcing }}>
                  {reinforcingCount}
                </div>
                <div style={{ fontSize: 7, color: COLORS.textMuted, letterSpacing: "0.08em" }}>REINFORCING</div>
              </div>
              <div
                style={{
                  background: `${COLORS.balancing}10`,
                  border: `1px solid ${COLORS.balancing}28`,
                  borderRadius: 8,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.balancing }}>
                  {balancingCount}
                </div>
                <div style={{ fontSize: 7, color: COLORS.textMuted, letterSpacing: "0.08em" }}>BALANCING</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: `${COLORS.textMuted}10`,
                  border: `1px solid ${COLORS.textMuted}28`,
                  borderRadius: 8,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textSecondary }}>
                  {edges.length}
                </div>
                <div style={{ fontSize: 7, color: COLORS.textMuted, letterSpacing: "0.08em" }}>LINKS</div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: `${COLORS.delay}10`,
                  border: `1px solid ${COLORS.delay}28`,
                  borderRadius: 8,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.delay }}>
                  {delayCount}
                </div>
                <div style={{ fontSize: 7, color: COLORS.textMuted, letterSpacing: "0.08em" }}>DELAYS</div>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          {nodes.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Stock Levels
              </div>
              {nodes.map((node) => (
                <div key={node.id} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: COLORS.textSecondary }}>{node.label.replace("\n", " ")}</span>
                    <span style={{ color: COLORS.textMuted }}>{Math.round(node.stock || 50)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={node.stock || 50}
                    onChange={(e) => handleStockChange(node.id, Number(e.target.value))}
                    style={{
                      width: "100%",
                      height: 4,
                      appearance: "none",
                      background: COLORS.nodeBorder,
                      borderRadius: 2,
                      outline: "none",
                      accentColor: COLORS.accent,
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Detected Loops */}
          {detectedLoops.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Identified Loops
              </div>
              {detectedLoops.map((loop, i) => (
                <div
                  key={i}
                  style={{
                    background: `${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}08`,
                    border: `1px solid ${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}22`,
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color:
                          loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing,
                        background: `${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}22`,
                        padding: "2px 6px",
                        borderRadius: 3,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {loop.type === "reinforcing" ? "R" : "B"}
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 9, color: COLORS.textSecondary }}>
                      {loop.type === "reinforcing" ? "Amplifying" : "Stabilizing"} · {loop.nodes.length - 1} vars
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    {loop.nodes.slice(0, -1).map((nId, ni) => {
                      const nd = nodes.find((n) => n.id === nId);
                      return (
                        <span key={ni}>
                          <span style={{ color: COLORS.textPrimary }}>
                            {nd?.label.replace("\n", " ") || nId}
                          </span>
                          {ni < loop.nodes.length - 2 && (
                            <span style={{ color: COLORS.textMuted }}> {"\u2192"} </span>
                          )}
                        </span>
                      );
                    })}
                    <span style={{ color: COLORS.textMuted }}> {"\u2192"} {"\u21BB"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detectedLoops.length === 0 && nodes.length > 0 && (
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontStyle: "italic", padding: "4px 0" }}>
              No loops detected yet. Close a circuit to find reinforcing or balancing loops.
            </div>
          )}

          {/* Practice Checklist */}
          <div
            style={{
              background: `${practiceComplete ? COLORS.accent : COLORS.accentWarm}08`,
              border: `1px solid ${practiceComplete ? COLORS.accent : COLORS.accentWarm}22`,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: practiceComplete ? COLORS.accent : COLORS.accentWarm,
                marginBottom: 8,
              }}
            >
              {practiceComplete ? "PRACTICE COMPLETE" : "PRACTICE TARGET"}
            </div>
            {[
              { label: "6+ variables", done: nodes.length >= 6 },
              { label: "1+ reinforcing loop", done: reinforcingCount >= 1 },
              { label: "1+ balancing loop", done: balancingCount >= 1 },
              { label: "1+ delay", done: delayCount >= 1 },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  color: item.done ? COLORS.accent : COLORS.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 3,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span style={{ fontSize: 12 }}>{item.done ? "\u2713" : "\u2610"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Common Failures */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Common Failures
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: COLORS.accentDanger }}>{"\u2022"}</span> Treating symptoms instead of structure
              <br />
              <span style={{ color: COLORS.accentDanger }}>{"\u2022"}</span> Ignoring delays in the system
              <br />
              <span style={{ color: COLORS.accentDanger }}>{"\u2022"}</span> Drawing boundaries too wide or too narrow
            </div>
          </div>

          {/* Quick Reference */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.panelBorder}`,
              paddingTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Quick Reference
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.8 }}>
              <span style={{ color: COLORS.edgePlus }}>+ link</span> · Same direction change
              <br />
              <span style={{ color: COLORS.edgeMinus }}>{"\u2212"} link</span> · Opposite direction change
              <br />
              <span style={{ color: COLORS.delay }}>|| delay</span> · Effect is not immediate
              <br />
              <span style={{ color: COLORS.textMuted }}>Double-click</span> · Rename node
              <br />
              <span style={{ color: COLORS.textMuted }}>Click edge label</span> · Toggle polarity
              <br />
              <span style={{ color: COLORS.textMuted }}>Right-click edge</span> · Toggle delay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
