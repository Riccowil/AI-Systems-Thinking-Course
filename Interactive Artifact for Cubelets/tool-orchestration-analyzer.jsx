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

// Meadows level mapping
const MEADOWS_MAP = {
  'Add tool': { level: 1, name: 'L1: Constants/Parameters' },
  'Remove tool': { level: 2, name: 'L2: Buffer/Stock Sizes' },
  'Add cache/fallback': { level: 5, name: 'L5: Feedback Delays' },
  'Refactor dependency': { level: 6, name: 'L6: Feedback Structure' },
  'Change system goals': { level: 10, name: 'L10: System Goals' },
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
  const [cascadeStatus, setCascadeStatus] = useState(new Map());
  const [blastRadius, setBlastRadius] = useState(new Map());
  const [redundantPairs, setRedundantPairs] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [showInterventionForm, setShowInterventionForm] = useState(false);

  const svgRef = useRef(null);

  // Load worked example on mount
  useEffect(() => {
    setNodes(WORKED_EXAMPLE.tools);
    setEdges(WORKED_EXAMPLE.edges);
    setFailedTools(new Set(['create_causal_loop']));
    setIsExample(true);
    setMode('analyze');
  }, []);

  // Compute cascade when failures change
  useEffect(() => {
    if (failedTools.size === 0) {
      setCascadeStatus(new Map());
      return;
    }

    const cascade = new Map();
    const queue = Array.from(failedTools).map(id => ({ id, status: 'broken' }));
    const visited = new Set(failedTools);

    while (queue.length > 0) {
      const { id, status } = queue.shift();
      if (!cascade.has(id)) cascade.set(id, status);

      const outgoing = edges.filter(e => e.from === id);
      outgoing.forEach(e => {
        if (!visited.has(e.to)) {
          visited.add(e.to);
          let newStatus = 'unaffected';
          if (e.type === 'required' && (status === 'broken' || status === 'degraded')) newStatus = 'broken';
          else if (e.type === 'optional' && status === 'broken') newStatus = 'degraded';
          else if (e.type === 'enhances') newStatus = 'unaffected';
          if (newStatus !== 'unaffected') {
            cascade.set(e.to, newStatus);
            queue.push({ id: e.to, status: newStatus });
          }
        }
      });
    }

    setCascadeStatus(cascade);
  }, [failedTools, edges]);

  // Calculate health scores
  useEffect(() => {
    if (nodes.length === 0) {
      setHealthScores({ complexity: 0, redundancy: 0, brittleness: 0, aggregate: 0 });
      return;
    }

    const cycles = findCycles();
    setDetectedCycles(cycles);

    const complexity = Math.min(100, edges.length + cycles.length * 10);

    const redundant = detectRedundancy();
    setRedundantPairs(redundant);
    const redundancy = Math.min(100, redundant.length * 20);

    let maxDepth = 0;
    nodes.forEach(n => {
      const depth = computeBlastRadiusDepth(n.id);
      if (depth > maxDepth) maxDepth = depth;
    });
    const brittleness = Math.min(100, maxDepth * 20);

    const aggregate = Math.round((complexity + redundancy + brittleness) / 3);

    setHealthScores({ complexity, redundancy, brittleness, aggregate });
  }, [nodes, edges]);

  // Compute blast radius when tool selected
  useEffect(() => {
    if (!selectedTool || mode !== 'analyze') {
      setBlastRadius(new Map());
      return;
    }

    const radiusMap = new Map();
    const queue = [{ id: selectedTool, depth: 0 }];
    const visited = new Set([selectedTool]);

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (id !== selectedTool) radiusMap.set(id, depth);

      const outgoing = edges.filter(e => e.from === id);
      outgoing.forEach(e => {
        if (!visited.has(e.to)) {
          visited.add(e.to);
          queue.push({ id: e.to, depth: depth + 1 });
        }
      });
    }

    setBlastRadius(radiusMap);
  }, [selectedTool, mode, edges]);

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

  function computeBlastRadiusDepth(toolId) {
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

  function detectRedundancy() {
    const pairs = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i], n2 = nodes[j];
        const inIntersect = (n1.inputs || []).filter(x => (n2.inputs || []).includes(x));
        const outIntersect = (n1.outputs || []).filter(x => (n2.outputs || []).includes(x));
        if (inIntersect.length > 0 && outIntersect.length > 0) {
          pairs.push([n1.id, n2.id]);
        }
      }
    }
    return pairs;
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

  function handleToggleFailure(nodeId, e) {
    e.stopPropagation();
    setFailedTools(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function handleResetFailures() {
    setFailedTools(new Set());
  }

  function handleStartFresh() {
    setNodes([]);
    setEdges([]);
    setFailedTools(new Set());
    setIsExample(false);
    setMode('build');
    setShowAnnotations(false);
    setInterventions([]);
  }

  function handleAddIntervention(data) {
    const newInt = {
      id: Date.now(),
      target: selectedTool,
      actionType: data.actionType,
      description: data.description,
      actualLevel: MEADOWS_MAP[data.actionType],
      prediction: null,
      revealed: false,
    };
    setInterventions(prev => [...prev, newInt]);
    setShowInterventionForm(false);
  }

  function handlePredictLevel(intId, level) {
    setInterventions(prev => prev.map(int => int.id === intId ? { ...int, prediction: level } : int));
  }

  function handleReveal(intId) {
    setInterventions(prev => prev.map(int => int.id === intId ? { ...int, revealed: true } : int));
  }

  function computeProjectedHealth(intervention) {
    let projected = { ...healthScores };
    if (intervention.actionType === 'Remove tool') {
      projected.complexity = Math.max(0, projected.complexity - 10);
      projected.brittleness = Math.max(0, projected.brittleness - 15);
    } else if (intervention.actionType === 'Add cache/fallback') {
      projected.brittleness = Math.max(0, projected.brittleness - 20);
    } else if (intervention.actionType === 'Refactor dependency') {
      projected.complexity = Math.max(0, projected.complexity - 15);
    }
    projected.aggregate = Math.round((projected.complexity + projected.redundancy + projected.brittleness) / 3);
    return projected;
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
    const cascadeState = cascadeStatus.get(n.id);
    const blastDepth = blastRadius.get(n.id);
    const isIsolated = !edges.some(e => e.from === n.id || e.to === n.id);
    const critColor = n.criticality === 'high' ? C.accentDanger : n.criticality === 'medium' ? C.accentWarm : C.accent;

    let fillColor = C.canvas;
    let strokeColor = C.panelBorder;
    let nodeOpacity = 1;

    if (isFailed) {
      fillColor = `${C.accentDanger}33`;
      strokeColor = C.accentDanger;
    } else if (cascadeState === 'broken') {
      fillColor = `${C.accentDanger}33`;
      strokeColor = C.accentDanger;
    } else if (cascadeState === 'degraded') {
      fillColor = `${C.accentWarm}33`;
      strokeColor = C.accentWarm;
    } else if (cascadeState === 'unaffected') {
      fillColor = `${C.accent}11`;
      strokeColor = C.accent;
    }

    if (blastDepth !== undefined) {
      const intensity = Math.max(0.3, 1 / blastDepth);
      strokeColor = C.accentDanger;
      nodeOpacity = blastDepth === 1 ? 1 : intensity;
    } else if (selectedTool && blastRadius.size > 0 && !blastRadius.has(n.id) && n.id !== selectedTool) {
      nodeOpacity = 0.4;
    }

    if (isSelected) strokeColor = C.accent;

    return (
      <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onMouseDown={(e) => handleNodeMouseDown(n, e)} onClick={() => handleNodeClick(n)} style={{ cursor: 'pointer' }} opacity={isIsolated ? 0.5 : nodeOpacity}>
        <rect x={-60} y={-20} width={120} height={40} rx={8} fill={fillColor} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1} strokeDasharray={n.planned ? '4 2' : ''} />
        <text x={0} y={0} textAnchor="middle" fill={C.textPrimary} fontSize={11} fontWeight="500" dominantBaseline="middle">{n.name.length > 18 ? n.name.slice(0, 16) + '...' : n.name}</text>
        <circle cx={50} cy={-10} r={3} fill={critColor} />
        {n.planned && <text x={0} y={15} textAnchor="middle" fill={C.textMuted} fontSize={8}>planned</text>}
        {isIsolated && <text x={0} y={15} textAnchor="middle" fill={C.textMuted} fontSize={8}>isolated</text>}
        {mode === 'analyze' && (
          <g onClick={(e) => handleToggleFailure(n.id, e)}>
            <circle cx={-50} cy={-10} r={6} fill={isFailed ? C.accentDanger : C.panel} stroke={C.textMuted} strokeWidth={1} />
            <text x={-50} y={-9} textAnchor="middle" fill={C.textPrimary} fontSize={9}>×</text>
          </g>
        )}
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

  function renderIntervention(int) {
    const projected = computeProjectedHealth(int);
    const isClose = int.prediction && Math.abs(int.prediction - int.actualLevel.level) <= 2;
    const delta = projected.brittleness - healthScores.brittleness;
    return (
      <div key={int.id} style={{ ...S.cardBase, marginBottom: '8px', borderColor: C.accent }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: C.accent }}>{int.actionType}</div>
        <div style={{ fontSize: '12px', color: C.textPrimary, marginTop: '4px' }}>{int.description}</div>
        <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>Target: {nodes.find(n => n.id === int.target)?.name}</div>
        {!int.revealed && !int.prediction && <div style={{ marginTop: '8px' }}><div style={S.labelSm}>Predict Meadows Level</div><select onChange={(e) => handlePredictLevel(int.id, parseInt(e.target.value))} style={S.selectInput}><option value="">Select L1-L12...</option>{[1,2,3,4,5,6,7,8,9,10,11,12].map(l => <option key={l} value={l}>L{l}</option>)}</select></div>}
        {int.prediction && !int.revealed && <button onClick={() => handleReveal(int.id)} style={{ ...S.toolbarBtn(false), marginTop: '8px', width: '100%' }}>Reveal</button>}
        {int.revealed && <div style={{ marginTop: '8px', padding: '8px', background: C.canvas, borderRadius: '4px' }}><div style={{ ...S.flexRow, justifyContent: 'space-between' }}><div><div style={{ fontSize: '10px', color: C.textMuted }}>Your Prediction</div><div style={{ fontSize: '12px', color: C.textPrimary }}>L{int.prediction}</div></div><div style={{ fontSize: '18px', color: isClose ? C.accent : C.accentDanger }}>{isClose ? '✓' : '✗'}</div><div><div style={{ fontSize: '10px', color: C.textMuted }}>Actual</div><div style={{ fontSize: '12px', color: C.accent }}>{int.actualLevel.name}</div></div></div><div style={{ marginTop: '8px' }}><div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>Health Impact</div><div style={{ fontSize: '11px', color: C.textSecondary }}>Brittleness: {healthScores.brittleness} → {projected.brittleness} <span style={{ color: delta < 0 ? C.accent : C.accentDanger }}>({delta > 0 ? '+' : ''}{delta})</span></div></div></div>}
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
        {mode === 'build' && <><button onClick={() => setShowAddForm(!showAddForm)} style={S.toolbarBtn(showAddForm)} title="Add Tool">+ Tool</button><button onClick={() => setEdgeType('required')} style={S.toolbarBtn(edgeType === 'required')} title="Required Dependency">Req</button><button onClick={() => setEdgeType('optional')} style={S.toolbarBtn(edgeType === 'optional')} title="Optional Dependency">Opt</button><button onClick={() => setEdgeType('enhances')} style={S.toolbarBtn(edgeType === 'enhances')} title="Enhances Dependency">Enh</button></>}
        {mode === 'analyze' && <button onClick={handleResetFailures} style={{ ...S.toolbarBtn(false), fontSize: '10px' }} title="Reset Failures">Reset</button>}
        <div style={S.divider} />
        <button onClick={handleAutoLayout} style={{ ...S.toolbarBtn(false), fontSize: '10px' }} title="Auto Layout">Layout</button>
        <button onClick={handleStartFresh} style={{ ...S.toolbarBtn(false), fontSize: '10px' }} title="Start Fresh">Fresh</button>
      </div>

      {/* Central SVG canvas */}
      <div style={{ flex: 1, background: C.canvas, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" onMouseMove={handleSvgMouseMove} onMouseUp={handleSvgMouseUp}>
          {Object.entries(serverGroups).map(([server, tools]) => { const xs = tools.map(t => t.x), ys = tools.map(t => t.y), minX = Math.min(...xs) - 80, maxX = Math.max(...xs) + 80, minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 40; return <rect key={server} x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="#1e2230" opacity={0.4} rx={8} />; })}
          {redundantPairs.map((pair, idx) => { const n1 = nodes.find(n => n.id === pair[0]), n2 = nodes.find(n => n.id === pair[1]); if (!n1 || !n2) return null; const minX = Math.min(n1.x, n2.x) - 70, minY = Math.min(n1.y, n2.y) - 30, w = Math.abs(n1.x - n2.x) + 140, h = Math.abs(n1.y - n2.y) + 60; return <g key={idx}><rect x={minX} y={minY} width={w} height={h} fill="none" stroke={C.accentDanger} strokeWidth={1} strokeDasharray="4 2" rx={8} opacity={0.5} /><text x={minX + w / 2} y={minY - 5} textAnchor="middle" fill={C.accentDanger} fontSize={9}>redundant</text></g>; })}
          {edges.map(renderEdge)}
          {nodes.map(renderNode)}
          {showAnnotations && isExample && <g><circle cx={200} cy={50} r={12} fill={C.accentDanger} opacity={0.8} /><text x={200} y={55} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">1</text></g>}
        </svg>
        {showAnnotations && isExample && <div style={{ position: 'absolute', top: '10px', right: '300px', background: C.panel, border: `1px solid ${C.accentDanger}`, borderRadius: '6px', padding: '8px 12px', fontSize: '11px', maxWidth: '200px' }}><button onClick={() => setShowAnnotations(false)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>×</button><strong style={{ color: C.accentDanger }}>Annotation 1:</strong> create_causal_loop pre-failed. Click break icons to simulate more failures.</div>}
      </div>

      {/* Right panel */}
      <div style={{ ...S.flexCol, width: '280px', background: C.panel, borderLeft: `1px solid ${C.panelBorder}`, overflowY: 'auto' }}>
        <div style={{ ...S.cardBase, margin: '12px', borderColor: C.accent }}>
          <div onClick={() => setPrimerCollapsed(!primerCollapsed)} style={{ ...S.flexRow, justifyContent: 'space-between', cursor: 'pointer' }}><span style={{ fontSize: '12px', fontWeight: '600', color: C.accent }}>PREREQUISITE: LEVERAGE POINTS</span><span style={{ color: C.textMuted }}>{primerCollapsed ? '▼' : '▲'}</span></div>
          {!primerCollapsed && <div style={{ fontSize: '10px', color: C.textSecondary, marginTop: '8px', lineHeight: '1.6' }}>
            <p>Meadows leverage points rank where interventions in a system produce the most change. Tool orchestration maps directly onto this hierarchy — the same action can be low or high leverage depending on <em>where</em> in the dependency graph it lands.</p>
            <p style={{ marginTop: '6px' }}><strong style={{ color: C.textSecondary }}>5 levels used in this artifact:</strong><br />
              <span style={{ color: C.textMuted }}>▸ <strong>L1: Constants/Parameters</strong></span> — e.g., Add tool (low leverage)<br />
              <span style={{ color: C.textMuted }}>▸ <strong>L2: Buffer/Stock Sizes</strong></span> — e.g., Remove tool (low leverage)<br />
              <span style={{ color: C.accentWarm }}>▸ <strong>L5: Feedback Delays</strong></span> — e.g., Add cache/fallback (medium)<br />
              <span style={{ color: C.accentWarm }}>▸ <strong>L6: Feedback Structure</strong></span> — e.g., Refactor dependency (medium)<br />
              <span style={{ color: C.accent }}>▸ <strong>L10: System Goals</strong></span> — e.g., Change system purpose (high leverage)
            </p>
            <p style={{ marginTop: '6px' }}>Health scores measure systemic fragility: <strong>Complexity</strong> (edge density + cycles), <strong>Redundancy</strong> (overlapping outputs), <strong>Brittleness</strong> (cascade depth on failure). Tiers: <span style={{ color: C.accent }}>Healthy 0–33</span> / <span style={{ color: C.accentWarm }}>At Risk 34–66</span> / <span style={{ color: C.accentDanger }}>Critical 67–100</span>.</p>
            <p style={{ marginTop: '6px', color: C.textMuted }}>Review <strong style={{ color: C.textSecondary }}>ST-002: Leverage Points</strong> for the full 12-level hierarchy.</p>
          </div>}
        </div>

        {/* Tab bar */}
        <div style={{ ...S.flexRow, gap: '4px', padding: '0 12px', borderBottom: `1px solid ${C.panelBorder}` }}>
          <button onClick={() => setActiveTab('topology')} style={S.tabBtn(activeTab === 'topology')}>Topology</button>
          <button onClick={() => setActiveTab('health')} style={S.tabBtn(activeTab === 'health')}>Health</button>
          <button onClick={() => setActiveTab('interventions')} style={S.tabBtn(activeTab === 'interventions')}>Interventions</button>
        </div>

        {/* Tab content */}
        <div style={{ padding: '12px' }}>
          {activeTab === 'topology' && <div><div style={S.labelSm}>Graph Stats</div><div style={{ fontSize: '13px', color: C.textPrimary, marginBottom: '8px' }}><div>Tools: {nodes.length}</div><div>Edges: {edges.length}</div><div>Cycles: {detectedCycles.length}</div><div>Isolated: {isolatedCount}</div><div>Redundant Pairs: {redundantPairs.length}</div></div><div style={S.divider} /><div style={S.labelSm}>Server Breakdown</div>{Object.entries(serverGroups).map(([server, tools]) => <div key={server} style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '4px' }}>{server}: {tools.length} tools</div>)}</div>}

          {activeTab === 'health' && <div><div style={S.labelSm}>Health Scores (0-100)</div>{renderHealthBar('Complexity', healthScores.complexity)}{renderHealthBar('Redundancy', healthScores.redundancy)}{renderHealthBar('Brittleness', healthScores.brittleness)}<div style={S.divider} />{renderHealthBar('Aggregate Health', healthScores.aggregate)}{selectedTool && blastRadius.size > 0 && <><div style={S.divider} /><div style={S.labelSm}>Blast Radius: {nodes.find(n => n.id === selectedTool)?.name}</div><div style={{ fontSize: '12px', color: C.textSecondary }}>Downstream tools affected: {blastRadius.size}</div><div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>{Array.from(blastRadius.entries()).map(([id, depth]) => <div key={id}>• {nodes.find(n => n.id === id)?.name} (depth {depth})</div>)}</div></>}</div>}

          {activeTab === 'interventions' && <div><div style={S.labelSm}>Interventions</div>{selectedTool && !showInterventionForm && <button onClick={() => setShowInterventionForm(true)} style={{ ...S.toolbarBtn(false), width: '100%', marginBottom: '8px' }}>Add Intervention</button>}{showInterventionForm && <div style={{ ...S.cardBase, marginBottom: '12px' }}><div style={S.labelSm}>New Intervention</div><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleAddIntervention({ actionType: fd.get('actionType'), description: fd.get('description') }); }}><select name="actionType" required style={{ ...S.selectInput, width: '100%', marginBottom: '8px' }}><option value="">Select action...</option><option value="Add tool">Add tool</option><option value="Remove tool">Remove tool</option><option value="Add cache/fallback">Add cache/fallback</option><option value="Refactor dependency">Refactor dependency</option><option value="Change system goals">Change system goals</option></select><input name="description" placeholder="Description..." required style={{ ...S.selectInput, width: '100%', marginBottom: '8px' }} /><div style={{ ...S.flexRow, gap: '8px' }}><button type="submit" style={{ ...S.toolbarBtn(true), flex: 1 }}>Add</button><button type="button" onClick={() => setShowInterventionForm(false)} style={{ ...S.toolbarBtn(false), flex: 1 }}>Cancel</button></div></form></div>}{interventions.map(renderIntervention)}{interventions.length === 0 && !showInterventionForm && <div style={{ fontSize: '12px', color: C.textMuted }}>No interventions yet. Select a tool and click Add Intervention.</div>}</div>}
        </div>
      </div>
    </div>
  );
}
