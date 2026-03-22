import { useState, useRef, useCallback, useEffect } from "react";

const C = {
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
  accentPink: "#ff6bcc",
  danger: "#ff6b6b",
  panel: "#181c28",
  panelBorder: "#242940",
  prediction: "#6b8aff",
  automation: "#00d4aa",
  decision: "#ffb347",
};

const AI_TYPES = [
  { id: "prediction", label: "Prediction", color: C.prediction, icon: "◈", desc: "Forecast outcomes, classify inputs, detect patterns" },
  { id: "automation", label: "Automation", color: C.automation, icon: "⚙", desc: "Execute repeatable tasks without human intervention" },
  { id: "decision", label: "Decision Support", color: C.decision, icon: "◎", desc: "Surface insights, draft responses, recommend actions" },
];

const DEFAULT_SYSTEM = {
  nodes: [
    { id: "acquire", label: "Acquire", x: 120, y: 200, throughput: 82, latency: 1.2, errorRate: 3, isConstraint: false, desc: "Lead gen, sales, onboarding" },
    { id: "deliver", label: "Deliver", x: 320, y: 100, throughput: 74, latency: 2.8, errorRate: 5, isConstraint: false, desc: "Core service/product delivery" },
    { id: "support", label: "Support", x: 520, y: 200, throughput: 61, latency: 4.1, errorRate: 12, isConstraint: true, desc: "Customer service, exception handling" },
    { id: "finance", label: "Finance", x: 320, y: 320, throughput: 88, latency: 0.9, errorRate: 2, isConstraint: false, desc: "Billing, invoicing, collections" },
  ],
  edges: [
    { from: "acquire", to: "deliver" },
    { from: "deliver", to: "support" },
    { from: "support", to: "finance" },
    { from: "finance", to: "acquire" },
  ],
};

const LOGISTICS_EXAMPLE = {
  nodes: [
    { id: "orders", label: "Order Intake", x: 100, y: 120, throughput: 90, latency: 0.5, errorRate: 2, isConstraint: false, desc: "12-person team receives orders via EDI, email, phone" },
    { id: "routing", label: "Route Planning", x: 310, y: 60, throughput: 85, latency: 1.0, errorRate: 3, isConstraint: false, desc: "Assign shipments to carriers and routes" },
    { id: "exceptions", label: "Exception\nHandling", x: 520, y: 120, throughput: 38, latency: 6.2, errorRate: 28, isConstraint: true, desc: "Address changes, damaged goods, carrier delays, customs flags" },
    { id: "tracking", label: "Tracking &\nComms", x: 520, y: 280, throughput: 65, latency: 2.5, errorRate: 8, isConstraint: false, desc: "Status updates, customer notifications, ETA management" },
    { id: "invoicing", label: "Invoicing &\nReconciliation", x: 310, y: 340, throughput: 78, latency: 1.8, errorRate: 5, isConstraint: false, desc: "Match POs, generate invoices, handle disputes" },
    { id: "feedback", label: "Performance\nReview", x: 100, y: 280, throughput: 72, latency: 3.0, errorRate: 4, isConstraint: false, desc: "Carrier scorecards, route optimization data, cost analysis" },
  ],
  edges: [
    { from: "orders", to: "routing" },
    { from: "routing", to: "exceptions" },
    { from: "exceptions", to: "tracking" },
    { from: "tracking", to: "invoicing" },
    { from: "invoicing", to: "feedback" },
    { from: "feedback", to: "orders" },
    { from: "routing", to: "tracking" },
    { from: "exceptions", to: "invoicing" },
  ],
  optimalPlacements: {
    exceptions: "decision",
  },
};

function calcSystemMetrics(nodes, placements) {
  let totalThroughput = 0, totalLatency = 0, totalError = 0;
  const updatedNodes = nodes.map((n) => {
    let tp = n.throughput, lat = n.latency, err = n.errorRate;
    const placement = placements[n.id];
    if (placement) {
      if (placement === "prediction") { tp += 8; lat *= 0.82; err *= 0.7; }
      if (placement === "automation") { tp += 15; lat *= 0.6; err *= (n.isConstraint ? 1.1 : 0.85); }
      if (placement === "decision") {
        tp += n.isConstraint ? 20 : 6;
        lat *= n.isConstraint ? 0.55 : 0.88;
        err *= n.isConstraint ? 0.45 : 0.8;
      }
    }
    totalThroughput += tp;
    totalLatency += lat;
    totalError += err;
    return { ...n, adjThroughput: tp, adjLatency: lat, adjError: err };
  });
  const count = nodes.length || 1;
  const constraintNode = nodes.find((n) => n.isConstraint);
  const placedOnConstraint = constraintNode && placements[constraintNode.id];
  const placementCount = Object.keys(placements).length;
  let aiScore = 0;
  if (placementCount > 0) {
    const baseTP = nodes.reduce((s, n) => s + n.throughput, 0) / count;
    const newTP = totalThroughput / count;
    aiScore = Math.round(((newTP - baseTP) / baseTP) * 100);
    if (placedOnConstraint) aiScore = Math.round(aiScore * 1.6);
  }
  return {
    avgThroughput: Math.round(totalThroughput / count),
    avgLatency: +(totalLatency / count).toFixed(1),
    avgError: +(totalError / count).toFixed(1),
    aiScore,
    placedOnConstraint: !!placedOnConstraint,
    updatedNodes,
  };
}

export default function AISystemLever() {
  const [nodes, setNodes] = useState(DEFAULT_SYSTEM.nodes);
  const [edges, setEdges] = useState(DEFAULT_SYSTEM.edges);
  const [placements, setPlacements] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingType, setDraggingType] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showConstraint, setShowConstraint] = useState(false);
  const [showCallout, setShowCallout] = useState(null);
  const [isLogistics, setIsLogistics] = useState(false);
  const svgRef = useRef(null);

  const metrics = calcSystemMetrics(nodes, placements);
  const baseMetrics = calcSystemMetrics(nodes, {});

  const loadLogistics = () => {
    setNodes(LOGISTICS_EXAMPLE.nodes.map((n) => ({ ...n })));
    setEdges(LOGISTICS_EXAMPLE.edges.map((e) => ({ ...e })));
    setPlacements({});
    setSelectedNode(null);
    setShowConstraint(false);
    setShowCallout(null);
    setIsLogistics(true);
  };

  const loadDefault = () => {
    setNodes(DEFAULT_SYSTEM.nodes.map((n) => ({ ...n })));
    setEdges(DEFAULT_SYSTEM.edges.map((e) => ({ ...e })));
    setPlacements({});
    setSelectedNode(null);
    setShowConstraint(false);
    setShowCallout(null);
    setIsLogistics(false);
  };

  const clearPlacements = () => {
    setPlacements({});
    setShowConstraint(false);
    setShowCallout(null);
  };

  const handlePlaceAI = (nodeId, aiType) => {
    setPlacements((prev) => {
      const next = { ...prev };
      if (next[nodeId] === aiType) { delete next[nodeId]; }
      else { next[nodeId] = aiType; }
      return next;
    });
  };

  const revealConstraint = () => {
    setShowConstraint(true);
    const constraint = nodes.find((n) => n.isConstraint);
    const placedOnConstraint = constraint && placements[constraint.id];
    if (!placedOnConstraint && Object.keys(placements).length > 0) {
      setShowCallout("missed");
    } else if (placedOnConstraint) {
      setShowCallout("found");
    } else {
      setShowCallout("noplacements");
    }
  };

  const getEdgePath = (fromNode, toNode) => {
    const dx = toNode.x - fromNode.x, dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return "";
    const curve = dist * 0.15;
    const mx = (fromNode.x + toNode.x) / 2, my = (fromNode.y + toNode.y) / 2;
    const nx = -dy / dist, ny = dx / dist;
    return `M ${fromNode.x} ${fromNode.y} Q ${mx + nx * curve} ${my + ny * curve} ${toNode.x} ${toNode.y}`;
  };

  const NODE_RX = 62, NODE_RY = 32;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: C.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        color: C.textPrimary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
          borderBottom: `1px solid ${C.panelBorder}`,
          background: C.panel,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.accent}33, ${C.accent}11)`,
              border: `2px solid ${C.accent}55`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
              AI Placement Workbench
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              W1-C2 · AI as a System Lever
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadLogistics} style={{
            background: `${C.accentWarm}18`, border: `1px solid ${C.accentWarm}44`,
            color: C.accentWarm, padding: "6px 14px", borderRadius: 6,
            cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 500,
          }}>
            Logistics Example
          </button>
          <button onClick={loadDefault} style={{
            background: `${C.prediction}14`, border: `1px solid ${C.prediction}33`,
            color: C.prediction, padding: "6px 14px", borderRadius: 6,
            cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 500,
          }}>
            Default System
          </button>
          <button onClick={clearPlacements} style={{
            background: `${C.danger}12`, border: `1px solid ${C.danger}33`,
            color: C.danger, padding: "6px 14px", borderRadius: 6,
            cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 500,
          }}>
            Clear AI
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: AI Badge Palette */}
        <div
          style={{
            width: 88,
            background: C.panel,
            borderRight: `1px solid ${C.panelBorder}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 16,
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
            AI Types
          </div>
          {AI_TYPES.map((ai) => (
            <div
              key={ai.id}
              draggable
              onDragStart={() => setDraggingType(ai.id)}
              onDragEnd={() => setDraggingType(null)}
              title={ai.desc}
              style={{
                width: 72, padding: "10px 4px", borderRadius: 8,
                border: `1px solid ${ai.color}44`,
                background: `${ai.color}12`,
                color: ai.color, cursor: "grab",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                fontSize: 18, transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              <span>{ai.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.04em", textAlign: "center" }}>
                {ai.label.toUpperCase()}
              </span>
            </div>
          ))}

          <div style={{ width: 56, height: 1, background: C.panelBorder, margin: "8px 0" }} />

          <button
            onClick={revealConstraint}
            title="Reveal the actual system constraint"
            style={{
              width: 72, padding: "10px 4px", borderRadius: 8,
              border: `1px solid ${C.accentPink}44`,
              background: showConstraint ? `${C.accentPink}22` : `${C.accentPink}08`,
              color: C.accentPink, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              fontSize: 14, fontFamily: "inherit",
            }}
          >
            <span>🎯</span>
            <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: "0.04em" }}>
              FIND{"\n"}CONSTRAINT
            </span>
          </button>

          <div style={{ fontSize: 8, color: C.textMuted, textAlign: "center", padding: "8px 6px", lineHeight: 1.6, marginTop: "auto", marginBottom: 12 }}>
            Drag an AI type onto a process node
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ background: C.canvas }}
          >
            <defs>
              <pattern id="asgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="0.8" fill={C.gridLine} />
              </pattern>
              <marker id="flowArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 10 6 L 0 11 Z" fill={C.textMuted} />
              </marker>
              <filter id="constraintGlow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="nodeShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="url(#asgrid)" />

            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const d = getEdgePath(fromNode, toNode);
              return (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  stroke={C.textMuted}
                  strokeWidth={1.5}
                  markerEnd="url(#flowArrow)"
                  opacity={0.5}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const placement = placements[node.id];
              const aiType = placement ? AI_TYPES.find((a) => a.id === placement) : null;
              const isConstraint = node.isConstraint && showConstraint;
              const lines = node.label.split("\n");
              const updated = metrics.updatedNodes.find((n) => n.id === node.id);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingType) handlePlaceAI(node.id, draggingType);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Constraint glow */}
                  {isConstraint && (
                    <ellipse
                      cx={node.x} cy={node.y} rx={NODE_RX + 10} ry={NODE_RY + 10}
                      fill="none" stroke={C.accentPink} strokeWidth={2.5}
                      filter="url(#constraintGlow)" opacity={0.7}
                    >
                      <animate attributeName="opacity" values="0.7;0.25;0.7" dur="2s" repeatCount="indefinite" />
                    </ellipse>
                  )}

                  {/* AI placement ring */}
                  {aiType && (
                    <ellipse
                      cx={node.x} cy={node.y} rx={NODE_RX + 5} ry={NODE_RY + 5}
                      fill="none" stroke={aiType.color} strokeWidth={2}
                      strokeDasharray="6 3" opacity={0.7}
                    />
                  )}

                  {/* Node body */}
                  <ellipse
                    cx={node.x} cy={node.y} rx={NODE_RX} ry={NODE_RY}
                    fill={isSelected ? `${C.accent}15` : isHovered ? C.nodeHover : C.node}
                    stroke={isConstraint ? C.accentPink : aiType ? aiType.color : isSelected ? C.nodeSelected : C.nodeBorder}
                    strokeWidth={isSelected || isConstraint ? 2.5 : 1.5}
                    filter="url(#nodeShadow)"
                    style={{ transition: "all 0.2s" }}
                  />

                  {/* Node label */}
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={node.x}
                      y={node.y - 4 + (li - (lines.length - 1) / 2) * 13}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? C.accent : C.textPrimary}
                      fontSize={11}
                      fontWeight={600}
                      fontFamily="'DM Sans', sans-serif"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {line}
                    </text>
                  ))}

                  {/* Throughput bar */}
                  <rect x={node.x - 28} y={node.y + NODE_RY - 14} width={56} height={4} rx={2} fill={C.panelBorder} />
                  <rect
                    x={node.x - 28}
                    y={node.y + NODE_RY - 14}
                    width={Math.max(0, (updated?.adjThroughput || node.throughput) / 100 * 56)}
                    height={4}
                    rx={2}
                    fill={placement ? (aiType?.color || C.accent) : node.throughput < 50 ? C.danger : C.textMuted}
                    style={{ transition: "width 0.4s ease" }}
                  />

                  {/* AI badge */}
                  {aiType && (
                    <g>
                      <circle cx={node.x + NODE_RX - 8} cy={node.y - NODE_RY + 8} r={10} fill={C.panel} stroke={aiType.color} strokeWidth={1.5} />
                      <text
                        x={node.x + NODE_RX - 8}
                        y={node.y - NODE_RY + 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={aiType.color}
                        fontSize={11}
                        style={{ pointerEvents: "none" }}
                      >
                        {aiType.icon}
                      </text>
                    </g>
                  )}

                  {/* Constraint label */}
                  {isConstraint && (
                    <text
                      x={node.x}
                      y={node.y + NODE_RY + 18}
                      textAnchor="middle"
                      fill={C.accentPink}
                      fontSize={9}
                      fontWeight={700}
                      letterSpacing="0.08em"
                      style={{ pointerEvents: "none" }}
                    >
                      CONSTRAINT
                    </text>
                  )}
                </g>
              );
            })}

            {/* Empty state */}
            {Object.keys(placements).length === 0 && !showConstraint && (
              <text x="50%" y="94%" textAnchor="middle" fill={C.textMuted} fontSize={11} fontFamily="'DM Sans', sans-serif">
                Click nodes to inspect. Drag AI badges onto nodes to place interventions.
              </text>
            )}
          </svg>
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: 280,
            background: C.panel,
            borderLeft: `1px solid ${C.panelBorder}`,
            padding: 16,
            overflowY: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* System Metrics */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 10 }}>
              System Metrics
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              {[
                { label: "THROUGHPUT", value: metrics.avgThroughput, base: baseMetrics.avgThroughput, unit: "%", color: C.accent, higher: true },
                { label: "LATENCY", value: metrics.avgLatency, base: baseMetrics.avgLatency, unit: "d", color: C.prediction, higher: false },
                { label: "ERROR RATE", value: metrics.avgError, base: baseMetrics.avgError, unit: "%", color: C.danger, higher: false },
                { label: "AI IMPACT", value: metrics.aiScore, base: 0, unit: "pts", color: C.accentWarm, higher: true },
              ].map((m) => {
                const delta = m.value - m.base;
                const improved = m.higher ? delta > 0 : delta < 0;
                return (
                  <div key={m.label} style={{
                    background: `${m.color}08`, border: `1px solid ${m.color}22`,
                    borderRadius: 8, padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}<span style={{ fontSize: 10 }}>{m.unit}</span></div>
                    <div style={{ fontSize: 7, color: m.color, letterSpacing: "0.08em", opacity: 0.8, marginBottom: 2 }}>{m.label}</div>
                    {delta !== 0 && (
                      <div style={{ fontSize: 9, color: improved ? C.accent : C.danger, fontWeight: 600 }}>
                        {improved ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Constraint indicator */}
            <div style={{
              background: metrics.placedOnConstraint ? `${C.accent}12` : `${C.textMuted}08`,
              border: `1px solid ${metrics.placedOnConstraint ? C.accent : C.panelBorder}`,
              borderRadius: 6, padding: "8px 10px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{metrics.placedOnConstraint ? "✓" : "?"}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: metrics.placedOnConstraint ? C.accent : C.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                  {metrics.placedOnConstraint ? "AI placed at constraint" : "AI not at system constraint"}
                </div>
                <div style={{ fontSize: 8, color: C.textMuted }}>
                  {metrics.placedOnConstraint ? "Maximum system impact achieved" : "Click constraint finder to reveal"}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Node Detail */}
          {selectedNode && (() => {
            const node = nodes.find((n) => n.id === selectedNode);
            const updated = metrics.updatedNodes.find((n) => n.id === selectedNode);
            if (!node) return null;
            const placement = placements[node.id];
            return (
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                  Node Detail
                </div>
                <div style={{
                  background: `${C.textMuted}08`, border: `1px solid ${C.panelBorder}`,
                  borderRadius: 8, padding: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    {node.label.replace("\n", " ")}
                  </div>
                  <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.6, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
                    {node.desc}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.textMuted }}>Throughput</span>
                      <span style={{ color: placement ? C.accent : C.textPrimary, fontWeight: 600 }}>
                        {updated?.adjThroughput || node.throughput}%
                        {placement && <span style={{ color: C.textMuted, fontWeight: 400 }}> (was {node.throughput}%)</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.textMuted }}>Latency</span>
                      <span style={{ color: placement ? C.accent : C.textPrimary, fontWeight: 600 }}>
                        {(updated?.adjLatency || node.latency).toFixed(1)}d
                        {placement && <span style={{ color: C.textMuted, fontWeight: 400 }}> (was {node.latency}d)</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.textMuted }}>Error Rate</span>
                      <span style={{ color: placement ? C.accent : C.textPrimary, fontWeight: 600 }}>
                        {(updated?.adjError || node.errorRate).toFixed(1)}%
                        {placement && <span style={{ color: C.textMuted, fontWeight: 400 }}> (was {node.errorRate}%)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Place AI buttons */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 6 }}>PLACE AI</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {AI_TYPES.map((ai) => (
                        <button
                          key={ai.id}
                          onClick={(e) => { e.stopPropagation(); handlePlaceAI(node.id, ai.id); }}
                          style={{
                            flex: 1, padding: "6px 2px", borderRadius: 4,
                            border: `1px solid ${placement === ai.id ? ai.color : ai.color + "33"}`,
                            background: placement === ai.id ? `${ai.color}22` : "transparent",
                            color: ai.color, cursor: "pointer",
                            fontSize: 8, fontWeight: 600, fontFamily: "inherit",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {ai.icon} {ai.label.split(" ")[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {node.isConstraint && showConstraint && (
                    <div style={{
                      marginTop: 8, padding: "6px 8px", borderRadius: 4,
                      background: `${C.accentPink}12`, border: `1px solid ${C.accentPink}33`,
                      fontSize: 9, color: C.accentPink, lineHeight: 1.5,
                    }}>
                      This is the system constraint. AI placed here has the highest leverage.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Callout Messages */}
          {showCallout === "missed" && (
            <div style={{
              background: `${C.accentWarm}10`, border: `1px solid ${C.accentWarm}33`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>⚠</div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <b style={{ color: C.accentWarm }}>You placed AI, but missed the constraint.</b> Like putting a turbocharger on an engine with a clogged fuel line — more power, but the bottleneck is upstream. The system is only as fast as its slowest node.
              </div>
            </div>
          )}

          {showCallout === "found" && (
            <div style={{
              background: `${C.accent}10`, border: `1px solid ${C.accent}33`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <b style={{ color: C.accent }}>You found the bottleneck.</b> AI at the constraint point unlocks throughput for the entire system. This is the turbocharger on a healthy engine — it amplifies what the system can already do.
              </div>
            </div>
          )}

          {showCallout === "noplacements" && (
            <div style={{
              background: `${C.prediction}10`, border: `1px solid ${C.prediction}33`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>◈</div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <b style={{ color: C.prediction }}>Constraint revealed.</b> Now drag AI interventions onto nodes and compare the impact of placing AI at the constraint vs. elsewhere.
              </div>
            </div>
          )}

          {/* Turbocharger Insight */}
          <div style={{
            background: `linear-gradient(135deg, ${C.accent}08, ${C.accentWarm}06)`,
            border: `1px solid ${C.accent}22`, borderRadius: 8, padding: 12,
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: C.accent, marginBottom: 8 }}>
              THE TURBOCHARGER RULE
            </div>
            <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              A turbocharger only works if the engine can handle the airflow. AI amplifies the node it's placed on — but if that node isn't the bottleneck, system throughput stays flat.
              <br /><br />
              <span style={{ color: C.accentWarm }}>Placement matters more than capability.</span>
            </div>
          </div>

          {/* Leverage Types Reference */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
              AI Leverage Types
            </div>
            {AI_TYPES.map((ai) => (
              <div key={ai.id} style={{
                display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8,
                padding: "6px 8px", borderRadius: 4, background: `${ai.color}06`,
              }}>
                <span style={{ color: ai.color, fontSize: 14, flexShrink: 0 }}>{ai.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: ai.color }}>{ai.label}</div>
                  <div style={{ fontSize: 9, color: C.textMuted, lineHeight: 1.5 }}>{ai.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* System Loops */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
              System Dynamics
            </div>
            <div style={{
              background: `${C.accent}08`, border: `1px solid ${C.accent}22`,
              borderRadius: 6, padding: 10, marginBottom: 6,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.accent, marginBottom: 4 }}>R: DATA FLYWHEEL</div>
              <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.6 }}>
                Better data → better model → better decisions → better outcomes → more data
              </div>
            </div>
            <div style={{
              background: `${C.danger}08`, border: `1px solid ${C.danger}22`,
              borderRadius: 6, padding: 10,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.danger, marginBottom: 4 }}>B: CONTROL LOOP</div>
              <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.6 }}>
                More automation → fewer human checks → rising error risk → reintroduce controls
              </div>
            </div>
          </div>

          {/* Common Failures */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
              Common Failures
            </div>
            <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.8 }}>
              <span style={{ color: C.danger }}>×</span> Adding AI without changing workflow<br />
              <span style={{ color: C.danger }}>×</span> Automating the wrong node<br />
              <span style={{ color: C.danger }}>×</span> Ignoring balancing controls<br />
              <span style={{ color: C.danger }}>×</span> Optimizing a non-constraint<br />
            </div>
          </div>

          {/* Logistics callout */}
          {isLogistics && (
            <div style={{
              background: `${C.accentWarm}08`, border: `1px solid ${C.accentWarm}22`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: C.accentWarm, marginBottom: 6 }}>
                LOGISTICS WORKED EXAMPLE
              </div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                A 12-person logistics company mapped order fulfillment and found the constraint was <b style={{ color: C.accentWarm }}>exception handling</b> — not routing. AI classifies exceptions, drafts responses, and escalates edge cases. The constraint was never speed; it was judgment under ambiguity.
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{
            borderTop: `1px solid ${C.panelBorder}`,
            paddingTop: 10,
            fontSize: 10,
            color: C.textMuted,
          }}>
            {nodes.length} nodes · {edges.length} flows · {Object.keys(placements).length} AI placements
          </div>
        </div>
      </div>
    </div>
  );
}
