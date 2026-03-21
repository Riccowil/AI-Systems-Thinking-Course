import React, { useState, useEffect, useRef } from 'react';

// Dark cybernetic palette
const C = {
  bg: '#0f1117',
  canvas: '#161922',
  accent: '#00d4aa',
  accentDanger: '#ff6b6b',
  accentWarm: '#ffb347',
  textPrimary: '#e8ecf4',
  textSecondary: '#7a839e',
  textMuted: '#4a5270',
  panel: '#181c28',
  panelBorder: '#242940',
};

// Shared styles for compression
const S = {
  flexCol: { display: 'flex', flexDirection: 'column' },
  flexRow: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  labelSm: { fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  cardBase: { background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: '6px', padding: '12px' },
  tabBtn: (active) => ({
    padding: '8px 12px',
    background: active ? C.accent : 'transparent',
    color: active ? C.bg : C.textSecondary,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
  }),
  toolbarBtn: (active) => ({
    padding: '10px',
    background: active ? C.accent : C.panel,
    color: active ? C.bg : C.textPrimary,
    border: `1px solid ${active ? C.accent : C.panelBorder}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  }),
  divider: { height: '1px', background: C.panelBorder, margin: '12px 0' },
  selectInput: { background: C.canvas, color: C.textPrimary, border: `1px solid ${C.panelBorder}`, borderRadius: '4px', padding: '6px 8px', fontSize: '13px' },
  btnLabel: { fontSize: '12px', fontWeight: '500' },
};

// Worked example: 9-tool course stack with create_causal_loop pre-failed
const WORKED_EXAMPLE = {
  tools: [
    { id: 'create_causal_loop', name: 'Create Causal Loop', server: 'week1-foundations', criticality: 'high', inputs: ['variables', 'causal_links'], outputs: ['cld_graph'], x: 200, y: 50, failed: true },
    { id: 'find_leverage_points', name: 'Find Leverage Points', server: 'week1-foundations', criticality: 'medium', inputs: ['variables', 'causal_links'], outputs: ['leverage_scores'], x: 450, y: 50 },
    { id: 'analyze_system', name: 'Analyze System', server: 'week1-foundations', criticality: 'low', inputs: ['system_description'], outputs: ['analysis'], x: 50, y: 150 },
    { id: 'score_reinforcing_loops', name: 'Score Reinforcing Loops', server: 'systems-thinking-cubelets', criticality: 'high', inputs: ['variables', 'causal_links'], outputs: ['loops', 'severity'], x: 200, y: 180 },
    { id: 'compare_interventions', name: 'Compare Interventions', server: 'systems-thinking-cubelets', criticality: 'medium', inputs: ['interventions', 'leverage_scores'], outputs: ['ranked_comparison'], x: 450, y: 250 },
    { id: 'detect_burden_shift', name: 'Detect Burden Shift', server: 'systems-thinking-cubelets', criticality: 'medium', inputs: ['fix_records'], outputs: ['burden_analysis'], x: 120, y: 320 },
    { id: 'analyze_agent_feedback_loops', name: 'Analyze Agent Feedback Loops', server: 'systems-thinking-cubelets', criticality: 'high', inputs: ['components', 'links'], outputs: ['loops', 'severity'], x: 320, y: 320, planned: true },
    { id: 'analyze_tool_orchestration', name: 'Analyze Tool Orchestration', server: 'systems-thinking-cubelets', criticality: 'high', inputs: ['tools', 'dependencies'], outputs: ['health_scores'], x: 500, y: 400, planned: true },
    { id: 'detect_automation_debt', name: 'Detect Automation Debt', server: 'systems-thinking-cubelets', criticality: 'medium', inputs: ['automation_layers'], outputs: ['debt_analysis'], x: 150, y: 450, planned: true },
  ],
  edges: [
    { from: 'create_causal_loop', to: 'score_reinforcing_loops', type: 'required', data: ['variables', 'causal_links'] },
    { from: 'create_causal_loop', to: 'find_leverage_points', type: 'required', data: ['variables', 'causal_links'] },
    { from: 'create_causal_loop', to: 'analyze_agent_feedback_loops', type: 'required', data: ['cld_graph'] },
    { from: 'find_leverage_points', to: 'compare_interventions', type: 'required', data: ['leverage_scores'] },
    { from: 'score_reinforcing_loops', to: 'compare_interventions', type: 'optional', data: ['loops'] },
    { from: 'score_reinforcing_loops', to: 'analyze_agent_feedback_loops', type: 'enhances', data: ['scoring_patterns'] },
    { from: 'compare_interventions', to: 'analyze_tool_orchestration', type: 'enhances', data: ['intervention_format'] },
    { from: 'detect_burden_shift', to: 'detect_automation_debt', type: 'required', data: ['burden_patterns'] },
    { from: 'analyze_agent_feedback_loops', to: 'analyze_tool_orchestration', type: 'optional', data: ['feedback_analysis'] },
    { from: 'analyze_system', to: 'find_leverage_points', type: 'optional', data: ['system_context'] },
    { from: 'analyze_system', to: 'detect_burden_shift', type: 'optional', data: ['system_context'] },
    { from: 'score_reinforcing_loops', to: 'detect_burden_shift', type: 'enhances', data: ['loop_data'] },
  ],
  interventions: [
    { level: 'L1', action: 'Increase timeout on create_causal_loop', type: 'parameter' },
    { level: 'L6', action: 'Add caching layer between CLD creation and consumers', type: 'feedback' },
    { level: 'L10', action: 'Redesign so each tool is self-contained', type: 'goals' },
  ],
};

export default function ToolOrchestrationAnalyzer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mode, setMode] = useState('analyze');
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('topology');
  const [primerCollapsed, setPrimerCollapsed] = useState(true);
  const [healthScores, setHealthScores] = useState({ complexity: 0, redundancy: 0, brittleness: 0, aggregate: 0 });
  const [detectedCycles, setDetectedCycles] = useState([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [edgeType, setEdgeType] = useState('required');
  const [edgeSource, setEdgeSource] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [failedTools, setFailedTools] = useState(new Set());
  const [isExample, setIsExample] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // Load worked example on mount
  useEffect(() => {
    setNodes(WORKED_EXAMPLE.tools);
    setEdges(WORKED_EXAMPLE.edges);
    setFailedTools(new Set(['create_causal_loop']));
    setIsExample(true);
    setMode('analyze');
  }, []);

  // Calculate health scores
  useEffect(() => {
    if (nodes.length === 0) {
      setHealthScores({ complexity: 0, redundancy: 0, brittleness: 0, aggregate: 0 });
      return;
    }

    const cycles = findCycles();
    setDetectedCycles(cycles);

    const complexity = Math.min(100, edges.length + cycles.length * 10);

    let redundancyCount = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i], n2 = nodes[j];
        const inIntersect = n1.inputs?.filter(x => n2.inputs?.includes(x)) || [];
        const outIntersect = n1.outputs?.filter(x => n2.outputs?.includes(x)) || [];
        if (inIntersect.length > 0 && outIntersect.length > 0) redundancyCount++;
      }
    }
    const redundancy = Math.min(100, redundancyCount * 20);

    let maxDepth = 0;
    nodes.forEach(n => {
      const depth = computeBlastRadius(n.id);
      if (depth > maxDepth) maxDepth = depth;
    });
    const brittleness = Math.min(100, maxDepth * 20);

    const aggregate = Math.round((complexity + redundancy + brittleness) / 3);

    setHealthScores({ complexity, redundancy, brittleness, aggregate });
  }, [nodes, edges]);

  function findCycles() {
    const cycles = [];
    const visited = new Set();
    const recStack = new Set();

    function dfs(nodeId, path) {
      if (recStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
        return;
      }
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recStack.add(nodeId);

      const outgoing = edges.filter(e => e.from === nodeId);
      outgoing.forEach(e => dfs(e.to, [...path, nodeId]));

      recStack.delete(nodeId);
    }

    nodes.forEach(n => {
      if (!visited.has(n.id)) dfs(n.id, []);
    });

    return cycles;
  }

  function computeBlastRadius(toolId) {
    const queue = [{ id: toolId, depth: 0 }];
    const visited = new Set([toolId]);
    let maxDepth = 0;

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      maxDepth = Math.max(maxDepth, depth);

      const requiredEdges = edges.filter(e => e.from === id && e.type === 'required');
      requiredEdges.forEach(e => {
        if (!visited.has(e.to)) {
          visited.add(e.to);
          queue.push({ id: e.to, depth: depth + 1 });
        }
      });
    }

    return maxDepth;
  }

  function getTier(score) {
    if (score <= 33) return { label: 'Healthy', color: C.accent };
    if (score <= 66) return { label: 'At Risk', color: C.accentWarm };
    return { label: 'Critical', color: C.accentDanger };
  }

  function handleAutoLayout() {
    const adjList = {};
    const inDegree = {};

    nodes.forEach(n => {
      adjList[n.id] = [];
      inDegree[n.id] = 0;
    });

    edges.forEach(e => {
      if (adjList[e.from]) adjList[e.from].push(e.to);
      if (inDegree[e.to] !== undefined) inDegree[e.to]++;
    });

    const layers = [];
    const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const processed = new Set();

    while (queue.length > 0) {
      const layer = [...queue];
      layers.push(layer);
      queue.length = 0;

      layer.forEach(id => {
        processed.add(id);
        adjList[id].forEach(childId => {
          inDegree[childId]--;
          if (inDegree[childId] === 0 && !processed.has(childId)) {
            queue.push(childId);
          }
        });
      });
    }

    const unprocessed = nodes.filter(n => !processed.has(n.id)).map(n => n.id);
    if (unprocessed.length > 0) layers.push(unprocessed);

    const updated = nodes.map(n => {
      const layerIndex = layers.findIndex(l => l.includes(n.id));
      const posInLayer = layers[layerIndex].indexOf(n.id);
      const layerSize = layers[layerIndex].length;
      return { ...n, y: layerIndex * 120 + 50, x: (posInLayer + 1) * (600 / (layerSize + 1)) };
    });

    setNodes(updated);
  }

  function handleNodeMouseDown(node, e) {
    if (mode === 'build') {
      const rect = svgRef.current.getBoundingClientRect();
      setDraggedNode(node.id);
      setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    } else {
      setSelectedTool(node.id);
    }
  }

  function handleSvgMouseMove(e) {
    if (draggedNode) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x: newX, y: newY } : n));
    }
  }

  function handleSvgMouseUp() {
    setDraggedNode(null);
  }

  function handleNodeClick(node) {
    if (mode === 'build' && edgeSource) {
      if (edgeSource !== node.id) {
        setEdges(prev => [...prev, { from: edgeSource, to: node.id, type: edgeType }]);
      }
      setEdgeSource(null);
    } else if (mode === 'build' && edgeSource === null) {
      setEdgeSource(node.id);
    } else {
      setSelectedTool(node.id);
    }
  }

  function handleStartFresh() {
    setNodes([]);
    setEdges([]);
    setFailedTools(new Set());
    setIsExample(false);
    setMode('build');
    setShowAnnotations(false);
  }

  function getEdgePath(from, to) {
    const curve = 30;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const midX = (from.x + to.x) / 2 + (dy > 0 ? curve : -curve);
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  }

  function renderNode(n) {
    const isSelected = selectedTool === n.id;
    const isFailed = failedTools.has(n.id);
    const isIsolated = !edges.some(e => e.from === n.id || e.to === n.id);
    const critColor = n.criticality === 'high' ? C.accentDanger : n.criticality === 'medium' ? C.accentWarm : C.accent;

    return (
      <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onMouseDown={(e) => handleNodeMouseDown(n, e)} onClick={() => handleNodeClick(n)} style={{ cursor: 'pointer' }}>
        <rect x={-60} y={-20} width={120} height={40} rx={8} fill={isFailed ? `${C.accentDanger}33` : C.canvas} stroke={isSelected ? C.accent : isFailed ? C.accentDanger : C.panelBorder} strokeWidth={isSelected ? 2 : 1} strokeDasharray={n.planned ? '4 2' : ''} opacity={isIsolated ? 0.5 : 1} />
        <text x={0} y={0} textAnchor="middle" fill={C.textPrimary} fontSize={11} fontWeight="500" dominantBaseline="middle">{n.name.length > 18 ? n.name.slice(0, 16) + '...' : n.name}</text>
        <circle cx={50} cy={-10} r={3} fill={critColor} />
        {n.planned && <text x={0} y={15} textAnchor="middle" fill={C.textMuted} fontSize={8}>planned</text>}
        {isIsolated && <text x={0} y={15} textAnchor="middle" fill={C.textMuted} fontSize={8}>isolated</text>}
      </g>
    );
  }

  function renderEdge(e) {
    const fromNode = nodes.find(n => n.id === e.from);
    const toNode = nodes.find(n => n.id === e.to);
    if (!fromNode || !toNode) return null;

    const path = getEdgePath(fromNode, toNode);
    const dashArray = e.type === 'optional' ? '8 4' : e.type === 'enhances' ? '3 3' : '';

    return (
      <g key={`${e.from}-${e.to}`}>
        <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={C.accent} /></marker></defs>
        <path d={path} stroke={C.accent} strokeWidth={1.5} fill="none" strokeDasharray={dashArray} markerEnd="url(#arrow)" opacity={0.7} />
      </g>
    );
  }

  function renderHealthBar(label, score) {
    const tier = getTier(score);
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ ...S.flexRow, justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: C.textSecondary }}>{label}</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: tier.color }}>{score} - {tier.label}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: C.canvas, borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: tier.color }} />
        </div>
      </div>
    );
  }

  const serverGroups = {};
  nodes.forEach(n => {
    if (!serverGroups[n.server]) serverGroups[n.server] = [];
    serverGroups[n.server].push(n);
  });

  const isolatedCount = nodes.filter(n => !edges.some(e => e.from === n.id || e.to === n.id)).length;

  return (
    <div style={{ ...S.flexRow, width: '100%', height: '100vh', background: C.bg, color: C.textPrimary, fontFamily: 'system-ui, sans-serif' }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>

      {/* Left toolbar */}
      <div style={{ ...S.flexCol, width: '72px', background: C.panel, borderRight: `1px solid ${C.panelBorder}`, padding: '12px 8px', gap: '8px' }}>
        <button onClick={() => setMode('build')} style={S.toolbarBtn(mode === 'build')} title="Build Mode">Build</button>
        <button onClick={() => setMode('analyze')} style={S.toolbarBtn(mode === 'analyze')} title="Analyze Mode">Analyze</button>
        <div style={S.divider} />
        {mode === 'build' && (
          <>
            <button onClick={() => setShowAddForm(!showAddForm)} style={S.toolbarBtn(showAddForm)} title="Add Tool">+ Tool</button>
            <button onClick={() => setEdgeType('required')} style={S.toolbarBtn(edgeType === 'required')} title="Required Dependency">Req</button>
            <button onClick={() => setEdgeType('optional')} style={S.toolbarBtn(edgeType === 'optional')} title="Optional Dependency">Opt</button>
            <button onClick={() => setEdgeType('enhances')} style={S.toolbarBtn(edgeType === 'enhances')} title="Enhances Dependency">Enh</button>
          </>
        )}
        <div style={S.divider} />
        <button onClick={handleAutoLayout} style={{ ...S.toolbarBtn(false), fontSize: '10px' }} title="Auto Layout">Layout</button>
        <button onClick={handleStartFresh} style={{ ...S.toolbarBtn(false), fontSize: '10px' }} title="Start Fresh">Fresh</button>
      </div>

      {/* Central SVG canvas */}
      <div style={{ flex: 1, background: C.canvas, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" onMouseMove={handleSvgMouseMove} onMouseUp={handleSvgMouseUp}>
          {Object.entries(serverGroups).map(([server, tools]) => {
            const xs = tools.map(t => t.x);
            const ys = tools.map(t => t.y);
            const minX = Math.min(...xs) - 80, maxX = Math.max(...xs) + 80;
            const minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 40;
            return <rect key={server} x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="#1e2230" opacity={0.4} rx={8} />;
          })}
          {edges.map(renderEdge)}
          {nodes.map(renderNode)}
          {showAnnotations && isExample && (
            <g>
              <circle cx={200} cy={50} r={12} fill={C.accentDanger} opacity={0.8} />
              <text x={200} y={55} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">1</text>
            </g>
          )}
        </svg>
        {showAnnotations && isExample && (
          <div style={{ position: 'absolute', top: '10px', right: '300px', background: C.panel, border: `1px solid ${C.accentDanger}`, borderRadius: '6px', padding: '8px 12px', fontSize: '11px', maxWidth: '200px' }}>
            <button onClick={() => setShowAnnotations(false)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>×</button>
            <strong style={{ color: C.accentDanger }}>Annotation 1:</strong> create_causal_loop pre-failed. See cascade in Health tab.
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ ...S.flexCol, width: '280px', background: C.panel, borderLeft: `1px solid ${C.panelBorder}`, overflowY: 'auto' }}>
        {/* Primer panel */}
        <div style={{ ...S.cardBase, margin: '12px', borderColor: C.accent }}>
          <div onClick={() => setPrimerCollapsed(!primerCollapsed)} style={{ ...S.flexRow, justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: C.accent }}>Primer: Tool Orchestration</span>
            <span style={{ color: C.textMuted }}>{primerCollapsed ? '▼' : '▲'}</span>
          </div>
          {!primerCollapsed && (
            <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '8px', lineHeight: '1.4' }}>
              <p>Tool dependencies create feedback loops. <strong>Required</strong> edges (solid) are critical paths. <strong>Optional</strong> (dashed) add resilience. <strong>Enhances</strong> (dotted) improve quality.</p>
              <p style={{ marginTop: '6px' }}>Health metrics reveal systemic fragility. High brittleness = deep cascades. See <strong>ST-002</strong> for Meadows leverage hierarchy (L1-L12).</p>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ ...S.flexRow, gap: '4px', padding: '0 12px', borderBottom: `1px solid ${C.panelBorder}` }}>
          <button onClick={() => setActiveTab('topology')} style={S.tabBtn(activeTab === 'topology')}>Topology</button>
          <button onClick={() => setActiveTab('health')} style={S.tabBtn(activeTab === 'health')}>Health</button>
          <button onClick={() => setActiveTab('interventions')} style={S.tabBtn(activeTab === 'interventions')}>Interventions</button>
        </div>

        {/* Tab content */}
        <div style={{ padding: '12px' }}>
          {activeTab === 'topology' && (
            <div>
              <div style={S.labelSm}>Graph Stats</div>
              <div style={{ fontSize: '13px', color: C.textPrimary, marginBottom: '8px' }}>
                <div>Tools: {nodes.length}</div>
                <div>Edges: {edges.length}</div>
                <div>Cycles: {detectedCycles.length}</div>
                <div>Isolated: {isolatedCount}</div>
              </div>
              <div style={S.divider} />
              <div style={S.labelSm}>Server Breakdown</div>
              {Object.entries(serverGroups).map(([server, tools]) => (
                <div key={server} style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '4px' }}>
                  {server}: {tools.length} tools
                </div>
              ))}
            </div>
          )}

          {activeTab === 'health' && (
            <div>
              <div style={S.labelSm}>Health Scores (0-100)</div>
              {renderHealthBar('Complexity', healthScores.complexity)}
              {renderHealthBar('Redundancy', healthScores.redundancy)}
              {renderHealthBar('Brittleness', healthScores.brittleness)}
              <div style={S.divider} />
              {renderHealthBar('Aggregate Health', healthScores.aggregate)}
            </div>
          )}

          {activeTab === 'interventions' && (
            <div>
              <div style={S.labelSm}>Pre-Annotated Interventions</div>
              {isExample && WORKED_EXAMPLE.interventions.map((int, idx) => (
                <div key={idx} style={{ ...S.cardBase, marginBottom: '8px', borderColor: C.accent }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: C.accent }}>{int.level}</div>
                  <div style={{ fontSize: '12px', color: C.textPrimary, marginTop: '4px' }}>{int.action}</div>
                  <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>Type: {int.type}</div>
                </div>
              ))}
              {!isExample && <div style={{ fontSize: '12px', color: C.textMuted }}>Load worked example to see interventions.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
