import { useState, useRef, useCallback, useEffect } from "react";

// Retry storm worked example with 5-6 agent nodes and 2 loops
const PRELOADED_EXAMPLE = {
  nodes: [
    { id: "n1", label: "Agent", component_type: "agent", x: 400, y: 100 },
    { id: "n2", label: "Tool Call", component_type: "tool", x: 650, y: 150 },
    { id: "n3", label: "Error Handler", component_type: "evaluator", x: 650, y: 320 },
    { id: "n4", label: "Rate Limiter", component_type: "constraint", x: 400, y: 420 },
    { id: "n5", label: "Timeout", component_type: "constraint", x: 150, y: 320 },
    { id: "n6", label: "Context Memory", component_type: "memory", x: 150, y: 150 },
  ],
  edges: [
    // Reinforcing loop (retry escalation): Agent -> Tool -> Error -> Agent
    { from: "n1", to: "n2", polarity: "+", strength: 0.9, label: "calls" },
    { from: "n2", to: "n3", polarity: "+", strength: 0.8, label: "fails" },
    { from: "n3", to: "n1", polarity: "+", strength: 0.85, label: "retries" },

    // Balancing loop (rate limiting dampening): Agent -> Tool -> Rate Limiter -> Agent
    { from: "n2", to: "n4", polarity: "+", strength: 0.7, label: "triggers" },
    { from: "n4", to: "n5", polarity: "+", strength: 0.6, label: "increases" },
    { from: "n5", to: "n1", polarity: "-", strength: 0.75, label: "delays" },

    // Supporting edges
    { from: "n6", to: "n1", polarity: "+", strength: 0.5, label: "informs" },
    { from: "n3", to: "n6", polarity: "+", strength: 0.4, label: "logs" },
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
  // Agent-specific node colors
  agentFill: "#1a2744",
  agentStroke: "#6b8aff",
  toolFill: "#1a3a2e",
  toolStroke: "#00d4aa",
  memoryFill: "#2a1a3a",
  memoryStroke: "#9b6bff",
  evaluatorFill: "#3a2a1a",
  evaluatorStroke: "#ffb86b",
  constraintFill: "#3a1a1a",
  constraintStroke: "#ff6b6b",
};

const SHAPE_SPECS = {
  agent: {
    width: 80,
    height: 70,
    label: "Agent",
    fill: COLORS.agentFill,
    stroke: COLORS.agentStroke,
    render: (x, y, w, h) => ({
      type: "polygon",
      points: `${x + w / 2},${y} ${x + w},${y + h * 0.25} ${x + w},${y + h * 0.75} ${x + w / 2},${y + h} ${x},${y + h * 0.75} ${x},${y + h * 0.25}`,
    }),
  },
  tool: {
    width: 90,
    height: 50,
    label: "Tool",
    fill: COLORS.toolFill,
    stroke: COLORS.toolStroke,
    render: (x, y, w, h) => ({
      type: "rect",
      x,
      y,
      width: w,
      height: h,
      rx: 6,
      ry: 6,
    }),
  },
  memory: {
    width: 60,
    height: 70,
    label: "Memory",
    fill: COLORS.memoryFill,
    stroke: COLORS.memoryStroke,
    render: (x, y, w, h) => ({
      type: "memory",
      x,
      y,
      width: w,
      height: h,
    }),
  },
  evaluator: {
    width: 70,
    height: 70,
    label: "Evaluator",
    fill: COLORS.evaluatorFill,
    stroke: COLORS.evaluatorStroke,
    render: (x, y, w, h) => ({
      type: "polygon",
      points: `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`,
    }),
  },
  constraint: {
    width: 70,
    height: 70,
    label: "Constraint",
    fill: COLORS.constraintFill,
    stroke: COLORS.constraintStroke,
    render: (x, y, w, h) => ({
      type: "polygon",
      points: `${x + w * 0.29},${y} ${x + w * 0.71},${y} ${x + w},${y + h * 0.29} ${x + w},${y + h * 0.71} ${x + w * 0.71},${y + h} ${x + w * 0.29},${y + h} ${x},${y + h * 0.71} ${x},${y + h * 0.29}`,
    }),
  },
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

function scoreLoopSeverity(cycle, edges) {
  let gain = 1.0;
  for (let i = 0; i < cycle.length - 1; i++) {
    const edge = edges.find(
      (e) => e.from === cycle[i].node && e.to === cycle[i + 1].node
    );
    gain *= edge?.strength || 1.0;
  }
  const score = Math.round(gain * 100);
  const clamped = Math.min(100, Math.max(0, score));
  const label = clamped <= 33 ? "Low" : clamped <= 66 ? "Medium" : "High";
  return { score: clamped, label };
}

function getEdgePath(fromNode, toNode, allEdges, idx) {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const hasReverse = allEdges.some(
    (e, i) =>
      i !== idx &&
      e.from === allEdges[idx]?.to &&
      e.to === allEdges[idx]?.from
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
  return {
    x0: nums[0],
    y0: nums[1],
    cx: nums[2],
    cy: nums[3],
    x1: nums[4],
    y1: nums[5],
  };
}

// Simple force-directed layout approximation (fallback for dagre)
function autoArrangeNodes(nodes, edges) {
  if (nodes.length === 0) return nodes;

  // Build adjacency for topological layers
  const inDegree = {};
  const outEdges = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    outEdges[n.id] = [];
  });
  edges.forEach((e) => {
    if (inDegree[e.to] !== undefined) inDegree[e.to]++;
    if (outEdges[e.from]) outEdges[e.from].push(e.to);
  });

  // Assign layers by topological sort
  const layers = [];
  const assigned = new Set();
  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);

  while (queue.length > 0) {
    const layer = [...queue];
    layers.push(layer);
    queue.length = 0;
    layer.forEach((id) => {
      assigned.add(id);
      outEdges[id]?.forEach((toId) => {
        inDegree[toId]--;
        if (inDegree[toId] === 0 && !assigned.has(toId)) {
          queue.push(toId);
        }
      });
    });
  }

  // Add unassigned nodes (cycles) to final layer
  const unassigned = nodes.filter((n) => !assigned.has(n.id));
  if (unassigned.length > 0) {
    layers.push(unassigned.map((n) => n.id));
  }

  // Position nodes: vertical layers, horizontal spread
  const LAYER_HEIGHT = 120;
  const NODE_SPACING = 150;
  const START_Y = 100;
  const START_X = 200;

  const positioned = {};
  layers.forEach((layer, li) => {
    const y = START_Y + li * LAYER_HEIGHT;
    const totalWidth = (layer.length - 1) * NODE_SPACING;
    const startX = START_X + (800 - totalWidth) / 2; // center at ~600px canvas width
    layer.forEach((id, ni) => {
      positioned[id] = { x: startX + ni * NODE_SPACING, y };
    });
  });

  return nodes.map((n) => ({
    ...n,
    x: positioned[n.id]?.x ?? n.x,
    y: positioned[n.id]?.y ?? n.y,
  }));
}

export default function AgentFeedbackLoopBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mode, setMode] = useState("add");
  const [selectedNodeType, setSelectedNodeType] = useState("agent");
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
  const [exampleMode, setExampleMode] = useState(false);
  const [primerCollapsed, setPrimerCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('loops');
  const [predictions, setPredictions] = useState({});
  const [allPredicted, setAllPredicted] = useState(false);
  const svgRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const cycles = findCycles(nodes, edges);
    const classified = cycles.map((c) => ({
      nodes: c.map((n) => n.node),
      type: classifyLoop(c),
      cycle: c,
      severity: scoreLoopSeverity(c, edges),
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

    // Reset predictions when graph structure changes
    const prevLoopCount = detectedLoops.length;
    if (unique.length !== prevLoopCount) {
      setPredictions({});
      setAllPredicted(false);
    }

    setDetectedLoops(unique);
    if (unique.length > 0) {
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 4500);
      return () => clearTimeout(t);
    }
  }, [nodes, edges]);

  useEffect(() => {
    if (editingNode && inputRef.current) inputRef.current.focus();
  }, [editingNode]);

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
        if (nodes.length >= 20) {
          alert("Maximum 20 nodes allowed");
          return;
        }
        const pt = getSVGPoint(e);
        const id = `n${nodeCounter + 1}`;
        setNodeCounter((c) => c + 1);
        const spec = SHAPE_SPECS[selectedNodeType];
        setNodes((prev) => [
          ...prev,
          {
            id,
            label: `${spec.label} ${prev.filter((n) => n.component_type === selectedNodeType).length + 1}`,
            component_type: selectedNodeType,
            x: pt.x,
            y: pt.y,
          },
        ]);
        setEditingNode(id);
        setEditText(
          `${spec.label} ${nodes.filter((n) => n.component_type === selectedNodeType).length + 1}`
        );
      }
      if (mode === "connect") {
        setConnectFrom(null);
        setSelectedNode(null);
      }
    },
    [mode, getSVGPoint, nodeCounter, nodes, selectedNodeType]
  );

  const handleNodeClick = useCallback(
    (nodeId, e) => {
      e.stopPropagation();
      if (mode === "connect") {
        if (!connectFrom) {
          setConnectFrom(nodeId);
          setSelectedNode(nodeId);
        } else if (connectFrom !== nodeId) {
          const exists = edges.some(
            (ed) => ed.from === connectFrom && ed.to === nodeId
          );
          if (!exists) {
            setEdges((prev) => [
              ...prev,
              { from: connectFrom, to: nodeId, polarity, strength: 1.0 },
            ]);
          }
          setConnectFrom(null);
          setSelectedNode(null);
        }
      } else if (mode === "delete") {
        if (exampleMode) return; // Can't delete in example mode
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) =>
          prev.filter((ed) => ed.from !== nodeId && ed.to !== nodeId)
        );
      }
    },
    [mode, connectFrom, edges, polarity, exampleMode]
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
            n.id === dragging
              ? { ...n, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y }
              : n
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
          prev.map((ed, i) =>
            i === idx ? { ...ed, polarity: ed.polarity === "+" ? "-" : "+" } : ed
          )
        );
      }
    },
    [mode]
  );

  const finishEdit = useCallback(() => {
    if (editingNode && editText.trim()) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === editingNode ? { ...n, label: editText.trim() } : n
        )
      );
    }
    setEditingNode(null);
    setEditText("");
  }, [editingNode, editText]);

  const loadExample = () => {
    setNodes([...PRELOADED_EXAMPLE.nodes]);
    setEdges([...PRELOADED_EXAMPLE.edges]);
    setNodeCounter(6);
    setShowTutorial(false);
    setExampleMode(true);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setDetectedLoops([]);
    setConnectFrom(null);
    setSelectedNode(null);
    setNodeCounter(0);
    setExampleMode(false);
    setPredictions({});
    setAllPredicted(false);
  };

  const autoArrange = () => {
    const arranged = autoArrangeNodes(nodes, edges);
    setNodes(arranged);
  };

  const loopEdgeKeys = new Set();
  detectedLoops.forEach((loop) => {
    for (let i = 0; i < loop.nodes.length - 1; i++) {
      loopEdgeKeys.add(`${loop.nodes[i]}-${loop.nodes[i + 1]}`);
    }
  });

  const reinforcingCount = detectedLoops.filter(
    (l) => l.type === "reinforcing"
  ).length;
  const balancingCount = detectedLoops.filter(
    (l) => l.type === "balancing"
  ).length;

  // Helper to get loop ID
  const getLoopId = (loop, i) => {
    return loop.type === "reinforcing"
      ? `R${detectedLoops.slice(0, i + 1).filter((l) => l.type === "reinforcing").length}`
      : `B${detectedLoops.slice(0, i + 1).filter((l) => l.type === "balancing").length}`;
  };

  // Check if all predictions are filled
  const allPredictionsFilled = detectedLoops.every((loop, i) => {
    const loopId = getLoopId(loop, i);
    const pred = predictions[loopId];
    return pred && pred.type && pred.behavior;
  });

  // Submit predictions handler
  const handleSubmitPredictions = () => {
    if (allPredictionsFilled) {
      setAllPredicted(true);
      setActiveTab('predictions');
    }
  };

  // Reset predictions handler
  const handleResetPredictions = () => {
    setPredictions({});
    setAllPredicted(false);
  };

  // Update prediction
  const updatePrediction = (loopId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [loopId]: { ...prev[loopId], [field]: value }
    }));
  };

  const nodeTypeButtons = [
    { key: "agent", icon: "⬡", label: "Agent" },
    { key: "tool", icon: "▭", label: "Tool" },
    { key: "memory", icon: "⬬", label: "Memory" },
    { key: "evaluator", icon: "◆", label: "Evaluator" },
    { key: "constraint", icon: "⬢", label: "Constraint" },
  ];

  const modeButtons = [
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
            ⬡
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
              Agent Feedback Loop Builder
            </div>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ST-004 · Agent Systems Cubelet
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
            Load Retry Storm Example
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
          {/* Node type buttons */}
          <div
            style={{
              fontSize: 8,
              color: COLORS.textMuted,
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            ADD NODE
          </div>
          {nodeTypeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setMode("add");
                setSelectedNodeType(btn.key);
                setConnectFrom(null);
                setSelectedNode(null);
              }}
              title={btn.label}
              style={{
                width: 52,
                height: 48,
                borderRadius: 8,
                border:
                  mode === "add" && selectedNodeType === btn.key
                    ? `2px solid ${SHAPE_SPECS[btn.key].stroke}`
                    : `1px solid transparent`,
                background:
                  mode === "add" && selectedNodeType === btn.key
                    ? `${SHAPE_SPECS[btn.key].stroke}18`
                    : "transparent",
                color:
                  mode === "add" && selectedNodeType === btn.key
                    ? SHAPE_SPECS[btn.key].stroke
                    : COLORS.textSecondary,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                fontSize: 18,
                transition: "all 0.15s ease",
              }}
            >
              <span>{btn.icon}</span>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {btn.label.toUpperCase()}
              </span>
            </button>
          ))}

          <div
            style={{
              width: 40,
              height: 1,
              background: COLORS.panelBorder,
              margin: "8px 0",
            }}
          />

          {/* Mode buttons */}
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
                height: 48,
                borderRadius: 8,
                border:
                  mode === btn.key
                    ? `2px solid ${COLORS.accent}`
                    : `1px solid transparent`,
                background:
                  mode === btn.key ? `${COLORS.accent}18` : "transparent",
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
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {btn.label.toUpperCase()}
              </span>
            </button>
          ))}

          <div
            style={{
              width: 40,
              height: 1,
              background: COLORS.panelBorder,
              margin: "8px 0",
            }}
          />

          {/* Auto-arrange button */}
          <button
            onClick={autoArrange}
            disabled={nodes.length === 0}
            title="Auto-arrange layout"
            style={{
              width: 52,
              height: 48,
              borderRadius: 8,
              border: `1px solid transparent`,
              background: "transparent",
              color: nodes.length === 0 ? COLORS.textMuted : COLORS.textSecondary,
              cursor: nodes.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontSize: 18,
              transition: "all 0.15s ease",
              opacity: nodes.length === 0 ? 0.3 : 1,
            }}
          >
            <span>⚙</span>
            <span
              style={{
                fontSize: 7,
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              ARRANGE
            </span>
          </button>

          <div
            style={{
              width: 40,
              height: 1,
              background: COLORS.panelBorder,
              margin: "8px 0",
            }}
          />

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
            <span
              style={{
                fontSize: 8,
                color: COLORS.textMuted,
                letterSpacing: "0.08em",
              }}
            >
              POLARITY
            </span>
            <button
              onClick={() => setPolarity(polarity === "+" ? "-" : "+")}
              disabled={mode !== "connect"}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: `2px solid ${
                  polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus
                }`,
                background: `${
                  polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus
                }18`,
                color: polarity === "+" ? COLORS.edgePlus : COLORS.edgeMinus,
                cursor: mode === "connect" ? "pointer" : "not-allowed",
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
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="0.8" fill={COLORS.gridLine} />
              </pattern>
              <marker
                id="arrowPlus"
                viewBox="0 0 12 12"
                refX="10"
                refY="6"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={COLORS.edgePlus} />
              </marker>
              <marker
                id="arrowMinus"
                viewBox="0 0 12 12"
                refX="10"
                refY="6"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={COLORS.edgeMinus} />
              </marker>
              <marker
                id="arrowLoop"
                viewBox="0 0 12 12"
                refX="10"
                refY="6"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
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
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="6"
                  floodColor="#000"
                  floodOpacity="0.4"
                />
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
              const color = inLoop
                ? COLORS.accent
                : edge.polarity === "+"
                ? COLORS.edgePlus
                : COLORS.edgeMinus;

              const parsed = parsePath(d);
              const midPt = getPointOnQuadratic(
                parsed.x0,
                parsed.y0,
                parsed.cx,
                parsed.cy,
                parsed.x1,
                parsed.y1,
                0.45
              );

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
                      <animate
                        attributeName="opacity"
                        values="0.3;0.05;0.3"
                        dur="1.5s"
                        repeatCount="3"
                      />
                      <animate
                        attributeName="stroke-width"
                        values="6;14;6"
                        dur="1.5s"
                        repeatCount="3"
                      />
                    </path>
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={inLoop ? 2.5 : 1.8}
                    strokeDasharray={edge.polarity === "-" ? "8 4" : "none"}
                    markerEnd={
                      inLoop
                        ? "url(#arrowLoop)"
                        : edge.polarity === "+"
                        ? "url(#arrowPlus)"
                        : "url(#arrowMinus)"
                    }
                    style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                    onClick={(e) => handleEdgeClick(idx, e)}
                    opacity={0.85}
                  />
                  {/* Polarity label */}
                  <g
                    onClick={(e) => handleEdgeClick(idx, e)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={midPt.x}
                      cy={midPt.y}
                      r={11}
                      fill={COLORS.panel}
                      stroke={color}
                      strokeWidth={1.5}
                    />
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
              const spec = SHAPE_SPECS[node.component_type];
              if (!spec) return null;

              const isSelected = selectedNode === node.id;
              const inAnyLoop = detectedLoops.some((l) =>
                l.nodes.includes(node.id)
              );

              const shapeData = spec.render(
                node.x - spec.width / 2,
                node.y - spec.height / 2,
                spec.width,
                spec.height
              );

              return (
                <g
                  key={node.id}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onDoubleClick={(e) => handleNodeDoubleClick(node.id, e)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  style={{ cursor: mode === "move" ? "grab" : "pointer" }}
                >
                  {inAnyLoop && pulseActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={Math.max(spec.width, spec.height) / 2 + 8}
                      fill="none"
                      stroke={COLORS.pulse}
                      strokeWidth={2}
                    >
                      <animate
                        attributeName="r"
                        values={`${Math.max(spec.width, spec.height) / 2 + 4};${
                          Math.max(spec.width, spec.height) / 2 + 18
                        };${Math.max(spec.width, spec.height) / 2 + 4}`}
                        dur="1.5s"
                        repeatCount="3"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="1.5s"
                        repeatCount="3"
                      />
                    </circle>
                  )}

                  {/* Render shape based on type */}
                  {shapeData.type === "polygon" && (
                    <polygon
                      points={shapeData.points}
                      fill={
                        isSelected ? `${spec.stroke}22` : spec.fill
                      }
                      stroke={
                        isSelected
                          ? COLORS.nodeSelected
                          : inAnyLoop
                          ? COLORS.accent
                          : spec.stroke
                      }
                      strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 2}
                      filter="url(#nodeShadow)"
                      style={{ transition: "all 0.2s" }}
                    />
                  )}
                  {shapeData.type === "rect" && (
                    <rect
                      x={shapeData.x}
                      y={shapeData.y}
                      width={shapeData.width}
                      height={shapeData.height}
                      rx={shapeData.rx}
                      ry={shapeData.ry}
                      fill={
                        isSelected ? `${spec.stroke}22` : spec.fill
                      }
                      stroke={
                        isSelected
                          ? COLORS.nodeSelected
                          : inAnyLoop
                          ? COLORS.accent
                          : spec.stroke
                      }
                      strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 2}
                      filter="url(#nodeShadow)"
                      style={{ transition: "all 0.2s" }}
                    />
                  )}
                  {shapeData.type === "memory" && (
                    <g>
                      <path
                        d={`M${shapeData.x},${shapeData.y + 10} C${
                          shapeData.x
                        },${shapeData.y} ${shapeData.x + shapeData.width},${
                          shapeData.y
                        } ${shapeData.x + shapeData.width},${
                          shapeData.y + 10
                        } L${shapeData.x + shapeData.width},${
                          shapeData.y + shapeData.height - 10
                        } C${shapeData.x + shapeData.width},${
                          shapeData.y + shapeData.height
                        } ${shapeData.x},${
                          shapeData.y + shapeData.height
                        } ${shapeData.x},${
                          shapeData.y + shapeData.height - 10
                        } Z`}
                        fill={
                          isSelected ? `${spec.stroke}22` : spec.fill
                        }
                        stroke={
                          isSelected
                            ? COLORS.nodeSelected
                            : inAnyLoop
                            ? COLORS.accent
                            : spec.stroke
                        }
                        strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 2}
                        filter="url(#nodeShadow)"
                        style={{ transition: "all 0.2s" }}
                      />
                      <ellipse
                        cx={shapeData.x + shapeData.width / 2}
                        cy={shapeData.y + 10}
                        rx={shapeData.width / 2}
                        ry={10}
                        fill={
                          isSelected ? `${spec.stroke}22` : spec.fill
                        }
                        stroke={
                          isSelected
                            ? COLORS.nodeSelected
                            : inAnyLoop
                            ? COLORS.accent
                            : spec.stroke
                        }
                        strokeWidth={isSelected ? 2.5 : inAnyLoop ? 2 : 2}
                      />
                    </g>
                  )}

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      isSelected ? COLORS.accent : COLORS.textPrimary
                    }
                    fontSize={11}
                    fontWeight={500}
                    fontFamily="'DM Sans', sans-serif"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.label.length > 12
                      ? node.label.slice(0, 12) + "..."
                      : node.label}
                  </text>
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
          {editingNode &&
            (() => {
              const node = nodes.find((n) => n.id === editingNode);
              if (!node) return null;
              return (
                <div
                  style={{
                    position: "absolute",
                    left: node.x - 70,
                    top: node.y - 16,
                    zIndex: 100,
                  }}
                >
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
                ⬡
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
                Map Your Agent Architecture
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 360,
                }}
              >
                Select a node type from the left toolbar
                <br />
                Click canvas to place nodes (agents, tools, memory, etc.)
                <br />
                Switch to Connect mode to draw causal links
                <br />
                Toggle polarity (+/−) to set link direction
                <br />
                Close a loop to see if it's reinforcing or balancing
                <br />
                <span style={{ color: COLORS.accentWarm }}>
                  Or load the Retry Storm worked example →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: 280,
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
          {/* Primer Panel (Collapsible) */}
          <div
            style={{
              background: `${COLORS.accent}08`,
              border: `1px solid ${COLORS.accent}22`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => setPrimerCollapsed(!primerCollapsed)}
              style={{
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: COLORS.accent,
                }}
              >
                AGENT BASICS
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: COLORS.accent,
                  transition: "transform 0.2s",
                  transform: primerCollapsed
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
                }}
              >
                ▼
              </span>
            </div>
            {!primerCollapsed && (
              <div
                style={{
                  padding: "0 12px 12px 12px",
                  fontSize: 10,
                  color: COLORS.textSecondary,
                  lineHeight: 1.7,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong style={{ color: COLORS.textPrimary }}>
                    What is an AI agent?
                  </strong>
                  <br />
                  An autonomous system that perceives its environment, makes
                  decisions, and takes actions to achieve goals. Unlike chatbots
                  (single request/response), agents loop continuously: observe →
                  decide → act → observe.
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong style={{ color: COLORS.textPrimary }}>
                    Component types:
                  </strong>
                  <br />
                  <span style={{ color: COLORS.agentStroke }}>Agent</span> =
                  decision-making orchestrator
                  <br />
                  <span style={{ color: COLORS.toolStroke }}>Tool</span> =
                  functional capability (API, function)
                  <br />
                  <span style={{ color: COLORS.memoryStroke }}>Memory</span> =
                  persistent state storage
                  <br />
                  <span style={{ color: COLORS.evaluatorStroke }}>
                    Evaluator
                  </span>{" "}
                  = quality/safety check logic
                  <br />
                  <span style={{ color: COLORS.constraintStroke }}>
                    Constraint
                  </span>{" "}
                  = limit/boundary enforcer
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ color: COLORS.accent, fontSize: 9 }}>
                    → Review ST-001: Reinforcing Feedback Loops for loop polarity
                    basics
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${COLORS.panelBorder}` }}>
            {['loops', 'predictions', 'interventions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: activeTab === tab ? `${COLORS.accent}12` : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                  color: activeTab === tab ? COLORS.accent : COLORS.textMuted,
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'loops' && (
            <div>
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
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.reinforcing,
                  }}
                >
                  {reinforcingCount}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: COLORS.reinforcing,
                    letterSpacing: "0.08em",
                    opacity: 0.8,
                  }}
                >
                  REINFORCING
                </div>
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
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.balancing,
                  }}
                >
                  {balancingCount}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: COLORS.balancing,
                    letterSpacing: "0.08em",
                    opacity: 0.8,
                  }}
                >
                  BALANCING
                </div>
              </div>
            </div>

            {detectedLoops.map((loop, i) => {
              const loopId = getLoopId(loop, i);
              const severityColor =
                loop.severity.label === "High"
                  ? COLORS.accentDanger
                  : loop.severity.label === "Medium"
                  ? COLORS.accentWarm
                  : COLORS.accent;
              const hideAnalysis = !exampleMode && !allPredicted;

              return (
                <div
                  key={i}
                  style={{
                    background: `${
                      loop.type === "reinforcing"
                        ? COLORS.reinforcing
                        : COLORS.balancing
                    }08`,
                    border: `1px solid ${
                      loop.type === "reinforcing"
                        ? COLORS.reinforcing
                        : COLORS.balancing
                    }22`,
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color:
                          loop.type === "reinforcing"
                            ? COLORS.reinforcing
                            : COLORS.balancing,
                        background: `${
                          loop.type === "reinforcing"
                            ? COLORS.reinforcing
                            : COLORS.balancing
                        }22`,
                        padding: "2px 6px",
                        borderRadius: 3,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {loopId}
                    </span>
                    <span
                      style={{ fontSize: 9, color: COLORS.textSecondary }}
                    >
                      {loop.type === "reinforcing"
                        ? "Amplifying"
                        : "Stabilizing"}{" "}
                      · {loop.nodes.length - 1} nodes
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        fontWeight: 600,
                        color: hideAnalysis ? COLORS.textMuted : severityColor,
                      }}
                    >
                      {hideAnalysis ? "?" : loop.severity.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: COLORS.textSecondary,
                      lineHeight: 1.6,
                      marginBottom: 4,
                    }}
                  >
                    {loop.nodes.slice(0, -1).map((nId, ni) => {
                      const nd = nodes.find((n) => n.id === nId);
                      return (
                        <span key={ni}>
                          <span style={{ color: COLORS.textPrimary }}>
                            {nd?.label.replace("\n", " ") || nId}
                          </span>
                          {ni < loop.nodes.length - 2 && (
                            <span style={{ color: COLORS.textMuted }}>
                              {" "}
                              →{" "}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    <span style={{ color: COLORS.textMuted }}> → ↻</span>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: COLORS.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {hideAnalysis ? "Submit predictions to reveal analysis" : `Severity score: ${loop.severity.score}/100`}
                  </div>
                </div>
              );
            })}

            {detectedLoops.length === 0 && nodes.length > 0 && (
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  fontStyle: "italic",
                  padding: "8px 0",
                }}
              >
                No closed loops detected yet. Connect components in a circuit to
                close a loop.
              </div>
            )}
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div style={{ opacity: allPredicted ? 1 : 1, transition: 'opacity 0.3s' }}>
              {!exampleMode ? (
                <>
                  {!allPredicted ? (
                    <>
                      {detectedLoops.map((loop, i) => {
                        const loopId = getLoopId(loop, i);
                        const pred = predictions[loopId] || {};
                        return (
                          <div key={i} style={{ marginBottom: 16, padding: 12, background: `${COLORS.panel}`, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.accent, marginBottom: 8 }}>{loopId}: {loop.nodes.slice(0, -1).map(nId => nodes.find(n => n.id === nId)?.label || nId).join(' → ')} →  ↻</div>
                            <div style={{ marginBottom: 8 }}>
                              <label style={{ fontSize: 9, color: COLORS.textMuted, display: 'block', marginBottom: 4 }}>Loop Type</label>
                              <select
                                value={pred.type || ''}
                                onChange={(e) => updatePrediction(loopId, 'type', e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', background: COLORS.node, border: `1px solid ${COLORS.nodeBorder}`, borderRadius: 4, color: COLORS.textPrimary, fontSize: 11, fontFamily: 'inherit' }}
                              >
                                <option value="">Select...</option>
                                <option value="reinforcing">Reinforcing</option>
                                <option value="balancing">Balancing</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 9, color: COLORS.textMuted, display: 'block', marginBottom: 4 }}>Behavior</label>
                              <select
                                value={pred.behavior || ''}
                                onChange={(e) => updatePrediction(loopId, 'behavior', e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', background: COLORS.node, border: `1px solid ${COLORS.nodeBorder}`, borderRadius: 4, color: COLORS.textPrimary, fontSize: 11, fontFamily: 'inherit' }}
                              >
                                <option value="">Select...</option>
                                <option value="grows">Grows exponentially</option>
                                <option value="stabilizes">Stabilizes</option>
                                <option value="oscillates">Oscillates</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={handleSubmitPredictions}
                        disabled={!allPredictionsFilled}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: allPredictionsFilled ? COLORS.accent : COLORS.textMuted,
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: allPredictionsFilled ? 'pointer' : 'not-allowed',
                          opacity: allPredictionsFilled ? 1 : 0.5,
                          fontFamily: 'inherit',
                        }}
                      >
                        Submit All Predictions
                      </button>
                    </>
                  ) : (
                    <>
                      {detectedLoops.map((loop, i) => {
                        const loopId = getLoopId(loop, i);
                        const pred = predictions[loopId] || {};
                        const typeCorrect = pred.type === loop.type;
                        const behaviorMapping = { reinforcing: 'grows', balancing: 'stabilizes' };
                        const behaviorCorrect = pred.behavior === behaviorMapping[loop.type];
                        return (
                          <div key={i} style={{ marginBottom: 16, padding: 12, background: `${COLORS.panel}`, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 6, opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.3s, transform 0.3s' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.accent, marginBottom: 10 }}>{loopId}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 10 }}>
                              <span style={{ color: typeCorrect ? COLORS.accent : COLORS.accentDanger, fontSize: 14 }}>{typeCorrect ? '✓' : '✗'}</span>
                              <div>
                                <div style={{ color: COLORS.textSecondary }}>Your prediction: <strong style={{ color: COLORS.textPrimary }}>{pred.type || 'none'}</strong></div>
                                <div style={{ color: COLORS.textSecondary }}>Actual: <strong style={{ color: COLORS.accent }}>{loop.type}</strong></div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                              <span style={{ color: behaviorCorrect ? COLORS.accent : COLORS.accentWarm, fontSize: 14 }}>{behaviorCorrect ? '✓' : '✗'}</span>
                              <div>
                                <div style={{ color: COLORS.textSecondary }}>Your behavior: <strong style={{ color: COLORS.textPrimary }}>{pred.behavior || 'none'}</strong></div>
                                <div style={{ color: COLORS.textSecondary }}>Actual: <strong style={{ color: COLORS.accent }}>{behaviorMapping[loop.type]}</strong></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ marginBottom: 12, padding: 10, background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}33`, borderRadius: 6, fontSize: 10, color: COLORS.textPrimary }}>
                        You got {detectedLoops.filter((loop, i) => predictions[getLoopId(loop, i)]?.type === loop.type).length}/{detectedLoops.length} loop types correct
                      </div>
                      <button
                        onClick={handleResetPredictions}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'transparent',
                          border: `1px solid ${COLORS.accent}`,
                          borderRadius: 6,
                          color: COLORS.accent,
                          fontSize: 10,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Reset Predictions
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ padding: 12, fontSize: 10, color: COLORS.textMuted, fontStyle: 'italic' }}>
                  Predictions are for practice mode. Switch to practice to test yourself.
                </div>
              )}
            </div>
          )}

          {/* Interventions Tab */}
          {activeTab === 'interventions' && (
            <div style={{ opacity: (exampleMode || allPredicted) ? 1 : 0.5, transition: 'opacity 0.3s' }}>
              {(!exampleMode && !allPredicted) ? (
                <div style={{ padding: 12, fontSize: 10, color: COLORS.textMuted, fontStyle: 'italic' }}>
                  Submit predictions to see interventions
                </div>
              ) : detectedLoops.length === 0 ? (
                <div style={{ padding: 12, fontSize: 10, color: COLORS.textMuted, fontStyle: 'italic' }}>
                  Build your agent diagram to detect loops
                </div>
              ) : (
                detectedLoops.map((loop, i) => {
                  const loopId = getLoopId(loop, i);
                  const severityLabel = loop.severity.label;
                  const highestLink = loop.cycle.reduce((max, step, idx) => {
                    if (idx === loop.cycle.length - 1) return max;
                    const edge = edges.find(e => e.from === step.node && e.to === loop.cycle[idx + 1].node);
                    return (edge?.strength || 0) > (max.strength || 0) ? { from: nodes.find(n => n.id === step.node)?.label, to: nodes.find(n => n.id === loop.cycle[idx + 1].node)?.label, strength: edge?.strength || 0 } : max;
                  }, { strength: 0 });

                  return (
                    <div key={i} style={{ marginBottom: 12, padding: 12, background: `${COLORS.panel}`, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.accent, marginBottom: 8 }}>{loopId} - {severityLabel} Severity</div>
                      {severityLabel === 'High' && (
                        <>
                          <div style={{ fontSize: 9, color: COLORS.textSecondary, marginBottom: 4 }}>
                            Highest-gain link: <strong style={{ color: COLORS.accentWarm }}>{highestLink.from} → {highestLink.to}</strong> (strength: {highestLink.strength?.toFixed(2)})
                          </div>
                          <div style={{ fontSize: 9, color: COLORS.accentWarm, fontStyle: 'italic' }}>
                            Consider adding rate limiting between {highestLink.from} and {highestLink.to} to reduce coupling
                          </div>
                        </>
                      )}
                      {severityLabel === 'Medium' && (
                        <div style={{ fontSize: 9, color: COLORS.textSecondary }}>Monitor this loop — it may escalate under load</div>
                      )}
                      {severityLabel === 'Low' && (
                        <div style={{ fontSize: 9, color: COLORS.textSecondary }}>This loop is within acceptable bounds</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Polarity Rule (moved below tabs) */}
          <div>

          {/* Polarity Rule */}
          <div
            style={{
              background: `${COLORS.accent}08`,
              border: `1px solid ${COLORS.accent}22`,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: COLORS.accent,
                marginBottom: 8,
              }}
            >
              POLARITY RULE
            </div>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textSecondary,
                lineHeight: 1.7,
              }}
            >
              Count the{" "}
              <span style={{ color: COLORS.edgeMinus, fontWeight: 600 }}>
                negative (−)
              </span>{" "}
              links.
              <br />
              <span style={{ color: COLORS.reinforcing }}>Even count</span>{" "}
              (incl. zero) = <b>Reinforcing</b>
              <br />
              <span style={{ color: COLORS.balancing }}>Odd count</span> ={" "}
              <b>Balancing</b>
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
            {nodes.length} components · {edges.length} causal links
          </div>

          {/* Retry Storm Alert */}
          {reinforcingCount > 0 && exampleMode && (
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.reinforcing}08, ${COLORS.accentWarm}08)`,
                border: `1px solid ${COLORS.reinforcing}22`,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 6 }}>⚠</div>
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textSecondary,
                  lineHeight: 1.7,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <b style={{ color: COLORS.reinforcing }}>Retry storm detected.</b>{" "}
                This reinforcing loop amplifies retry attempts — without
                intervention, the agent will escalate until rate limits force a
                hard stop. Look for the highest-strength link to break the cycle.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
