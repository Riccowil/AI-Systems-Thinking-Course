import { useState, useRef, useCallback, useEffect } from "react";

const PRELOADED_EXAMPLE = {
  nodes: [
    { id: "n1", label: "Agent Complexity", x: 380, y: 80 },
    { id: "n2", label: "Token Usage", x: 620, y: 240 },
    { id: "n3", label: "AI Spend", x: 380, y: 400 },
    { id: "n4", label: "Team Scaling\nPressure", x: 140, y: 240 },
  ],
  edges: [
    { from: "n1", to: "n2", polarity: "+" },
    { from: "n2", to: "n3", polarity: "+" },
    { from: "n3", to: "n4", polarity: "+" },
    { from: "n4", to: "n1", polarity: "+" },
  ],
};

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
};

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

const NODE_RADIUS = 56;

export default function FeedbackLoopBuilder() {
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
  const [showTutorial, setShowTutorial] = useState(true);
  const [polarity, setPolarity] = useState("+");
  const [nodeCounter, setNodeCounter] = useState(0);
  const svgRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const cycles = findCycles(nodes, edges);
    const classified = cycles.map((c) => ({
      nodes: c.map((n) => n.node),
      type: classifyLoop(c),
      negativeCount: c.filter((n) => n.polarity === "-").length - (c[0].polarity === "-" ? 1 : 0),
    }));
    const unique = [];
    const seen = new Set();
    classified.forEach((loop) => {
      const key = [...loop.nodes]
        .slice(0, -1)
        .sort()
        .join(",");
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(loop);
      }
    });
    setDetectedLoops(unique);
    if (unique.length > 0) {
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 3000);
      return () => clearTimeout(t);
    }
  }, [nodes, edges]);

  useEffect(() => {
    if (editingNode && inputRef.current) inputRef.current.focus();
  }, [editingNode]);

  const getSVGPoint = useCallback(
    (e) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target !== svgRef.current && e.target.tagName !== "rect") return;
      if (mode === "add") {
        const pt = getSVGPoint(e);
        const id = `n${nodeCounter + 1}`;
        setNodeCounter((c) => c + 1);
        setNodes((prev) => [...prev, { id, label: `Variable ${prev.length + 1}`, x: pt.x, y: pt.y }]);
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
            setEdges((prev) => [...prev, { from: connectFrom, to: nodeId, polarity }]);
          }
          setConnectFrom(null);
          setSelectedNode(null);
        }
      } else if (mode === "delete") {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) => prev.filter((ed) => ed.from !== nodeId && ed.to !== nodeId));
      }
    },
    [mode, connectFrom, edges, polarity]
  );

  const handleNodeDoubleClick = useCallback((nodeId, e) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.label.replace("\n", " "));
    }
  }, [nodes]);

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

  const finishEdit = useCallback(() => {
    if (editingNode && editText.trim()) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNode ? { ...n, label: editText.trim() } : n))
      );
    }
    setEditingNode(null);
    setEditText("");
  }, [editingNode, editText]);

  const loadExample = () => {
    setNodes([...PRELOADED_EXAMPLE.nodes]);
    setEdges([...PRELOADED_EXAMPLE.edges]);
    setNodeCounter(4);
    setShowTutorial(false);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setDetectedLoops([]);
    setConnectFrom(null);
    setSelectedNode(null);
    setNodeCounter(0);
  };

  const loopEdgeKeys = new Set();
  detectedLoops.forEach((loop) => {
    for (let i = 0; i < loop.nodes.length - 1; i++) {
      loopEdgeKeys.add(`${loop.nodes[i]}-${loop.nodes[i + 1]}`);
    }
  });

  const reinforcingCount = detectedLoops.filter((l) => l.type === "reinforcing").length;
  const balancingCount = detectedLoops.filter((l) => l.type === "balancing").length;

  const modeButtons = [
    { key: "add", icon: "＋", label: "Add Node" },
    { key: "connect", icon: "⟶", label: "Connect" },
    { key: "move", icon: "✥", label: "Move" },
    { key: "delete", icon: "✕", label: "Delete" },
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
            ↻
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
              Reinforcing Feedback Loop Builder
            </div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ST-001 · Systems Thinking Cubelet
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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
            Load AI Ops Example
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
              <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.04em" }}>{btn.label.toUpperCase()}</span>
            </button>
          ))}

          <div style={{ width: 40, height: 1, background: COLORS.panelBorder, margin: "8px 0" }} />

          {/* Polarity toggle for connect mode */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: mode === "connect" ? 1 : 0.3,
            }}
          >
            <span style={{ fontSize: 8, color: COLORS.textMuted, letterSpacing: "0.08em" }}>POLARITY</span>
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

            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const d = getEdgePath(fromNode, toNode, edges, idx);
              const edgeKey = `${edge.from}-${edge.to}`;
              const inLoop = loopEdgeKeys.has(edgeKey);
              const color = inLoop ? COLORS.accent : edge.polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus;

              const parsed = parsePath(d);
              const midPt = getPointOnQuadratic(parsed.x0, parsed.y0, parsed.cx, parsed.cy, parsed.x1, parsed.y1, 0.45);

              return (
                <g key={idx}>
                  {inLoop && pulseActive && (
                    <path
                      d={d}
                      fill="none"
                      stroke={COLORS.pulse}
                      strokeWidth={6}
                      opacity={0.3}
                      filter="url(#glow)"
                    >
                      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.5s" repeatCount="3" />
                      <animate attributeName="stroke-width" values="6;14;6" dur="1.5s" repeatCount="3" />
                    </path>
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={inLoop ? 2.5 : 1.8}
                    strokeDasharray={edge.polarity === "-" ? "8 4" : "none"}
                    markerEnd={inLoop ? "url(#arrowLoop)" : edge.polarity === "+" ? "url(#arrowPlus)" : "url(#arrowMinus)"}
                    style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                    onClick={(e) => handleEdgeClick(idx, e)}
                    opacity={0.85}
                  />
                  {/* Polarity label */}
                  <g
                    onClick={(e) => handleEdgeClick(idx, e)}
                    style={{ cursor: "pointer" }}
                  >
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
              const inAnyLoop = detectedLoops.some(
                (l) => l.nodes.includes(node.id)
              );
              const lines = node.label.split("\n");

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
                    stroke={isSelected ? COLORS.nodeSelected : inAnyLoop ? COLORS.accent : COLORS.nodeBorder}
                    strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 1}
                    filter="url(#nodeShadow)"
                    style={{ transition: "all 0.2s" }}
                  />
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={node.x}
                      y={node.y + (li - (lines.length - 1) / 2) * 14}
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

            {/* Connect mode: line from selected node to indicate state */}
            {mode === "connect" && connectFrom && (
              <text
                x={10}
                y={20}
                fill={COLORS.accent}
                fontSize={11}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.7}
              >
                Click target node to connect...
              </text>
            )}
          </svg>

          {/* Node edit overlay */}
          {editingNode && (() => {
            const node = nodes.find((n) => n.id === editingNode);
            if (!node) return null;
            const svgRect = svgRef.current?.getBoundingClientRect();
            return (
              <div
                style={{
                  position: "absolute",
                  left: node.x - 70 + (svgRect ? 0 : 0),
                  top: node.y - 16,
                  zIndex: 100,
                }}
              >
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={finishEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") finishEdit(); }}
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
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 16,
                  opacity: 0.15,
                }}
              >
                ↻
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.textSecondary,
                  marginBottom: 8,
                }}
              >
                Map Your Feedback Loop
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.8, maxWidth: 320 }}>
                Click canvas to add variable nodes<br />
                Switch to Connect mode to draw causal links<br />
                Toggle polarity (+/−) to set link direction<br />
                Close the loop to see if it's reinforcing or balancing<br />
                <span style={{ color: COLORS.accentWarm }}>Or load the AI Ops worked example →</span>
              </div>
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
            gap: 16,
          }}
        >
          {/* Loop Detection */}
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
              Loop Detection
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  flex: 1,
                  background: `${COLORS.reinforcing}12`,
                  border: `1px solid ${COLORS.reinforcing}33`,
                  borderRadius: 8,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.reinforcing }}>{reinforcingCount}</div>
                <div style={{ fontSize: 8, color: COLORS.reinforcing, letterSpacing: "0.08em", opacity: 0.8 }}>REINFORCING</div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: `${COLORS.balancing}12`,
                  border: `1px solid ${COLORS.balancing}33`,
                  borderRadius: 8,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.balancing }}>{balancingCount}</div>
                <div style={{ fontSize: 8, color: COLORS.balancing, letterSpacing: "0.08em", opacity: 0.8 }}>BALANCING</div>
              </div>
            </div>

            {detectedLoops.map((loop, i) => (
              <div
                key={i}
                style={{
                  background: `${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}08`,
                  border: `1px solid ${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}22`,
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing,
                      background: `${loop.type === "reinforcing" ? COLORS.reinforcing : COLORS.balancing}22`,
                      padding: "2px 6px",
                      borderRadius: 3,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {loop.type === "reinforcing" ? "R" : "B"}{i + 1}
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
                        <span style={{ color: COLORS.textPrimary }}>{nd?.label.replace("\n", " ") || nId}</span>
                        {ni < loop.nodes.length - 2 && <span style={{ color: COLORS.textMuted }}> → </span>}
                      </span>
                    );
                  })}
                  <span style={{ color: COLORS.textMuted }}> → ↻</span>
                </div>
              </div>
            ))}

            {detectedLoops.length === 0 && nodes.length > 0 && (
              <div style={{ fontSize: 10, color: COLORS.textMuted, fontStyle: "italic", padding: "8px 0" }}>
                No closed loops detected yet. Connect variables in a circuit to close a loop.
              </div>
            )}
          </div>

          {/* Polarity Rule */}
          <div
            style={{
              background: `${COLORS.accent}08`,
              border: `1px solid ${COLORS.accent}22`,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: COLORS.accent, marginBottom: 8 }}>
              POLARITY RULE
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.7 }}>
              Count the <span style={{ color: COLORS.edgeMinus, fontWeight: 600 }}>negative (−)</span> links.
              <br />
              <span style={{ color: COLORS.reinforcing }}>Even count</span> (incl. zero) = <b>Reinforcing</b>
              <br />
              <span style={{ color: COLORS.balancing }}>Odd count</span> = <b>Balancing</b>
            </div>
          </div>

          {/* Quick Reference */}
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
              Quick Reference
            </div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.8 }}>
              <span style={{ color: COLORS.edgePlus }}>+ link</span> · Same direction change
              <br />
              <span style={{ color: COLORS.edgeMinus }}>− link</span> · Opposite direction change
              <br />
              <span style={{ color: COLORS.textMuted }}>Double-click</span> · Rename node
              <br />
              <span style={{ color: COLORS.textMuted }}>Click edge label</span> · Toggle polarity
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.panelBorder}`,
              paddingTop: 12,
              fontSize: 10,
              color: COLORS.textMuted,
            }}
          >
            {nodes.length} variables · {edges.length} causal links
          </div>

          {/* Snowball Metaphor */}
          {reinforcingCount > 0 && (
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.reinforcing}08, ${COLORS.accentWarm}08)`,
                border: `1px solid ${COLORS.reinforcing}22`,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 6 }}>☃</div>
              <div style={{ fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <b style={{ color: COLORS.reinforcing }}>Snowball detected.</b> This loop amplifies whatever direction it's moving — growth <i>or</i> decline.
                It has no built-in brake. Look for the highest-leverage link to intervene.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
