import { useState, useRef, useCallback, useEffect } from "react";

const C = {
  bg: "#0f1117",
  canvas: "#161922",
  panel: "#181c28",
  panelBorder: "#242940",
  node: "#1c2033",
  nodeBorder: "#2a3050",
  nodeHover: "#242b45",
  nodeActive: "#00d4aa",
  text: "#e8ecf4",
  textSec: "#7a839e",
  textMuted: "#4a5270",
  teal: "#00d4aa",
  tealGlow: "#00d4aa33",
  amber: "#ffb347",
  amberGlow: "#ffb34733",
  danger: "#ff6b6b",
  dangerGlow: "#ff6b6b33",
  pink: "#ff6bcc",
  blue: "#6b8aff",
  gridDot: "#1e2230",
};

const TOOL_FIRST_STEPS = [
  { id: "t1", label: "Request Received", type: "input", duration: 1, capacity: 99 },
  { id: "t2", label: "Human Drafts Content", type: "task", duration: 5, capacity: 3 },
  { id: "t3", label: "Manager Review", type: "approval", duration: 3, capacity: 2 },
  { id: "t4", label: "Director Approval", type: "approval", duration: 4, capacity: 1 },
  { id: "t5", label: "Compliance Check", type: "approval", duration: 2, capacity: 2 },
  { id: "t6", label: "Published", type: "output", duration: 1, capacity: 99 },
];

const AI_FIRST_PRESET = [
  { id: "a1", label: "Request Received", type: "input", duration: 1, capacity: 99 },
  { id: "a2", label: "AI Drafts Content", type: "ai", duration: 0.5, capacity: 20 },
  { id: "a3", label: "Checklist QA", type: "checkpoint", duration: 1, capacity: 10 },
  { id: "a4", label: "Exception-Only Review", type: "approval", duration: 1, capacity: 5 },
  { id: "a5", label: "Published", type: "output", duration: 1, capacity: 99 },
];

const AVAILABLE_STEPS = [
  { label: "AI Drafts Content", type: "ai", duration: 0.5, capacity: 20 },
  { label: "AI Summarizes", type: "ai", duration: 0.3, capacity: 25 },
  { label: "AI Classifies/Routes", type: "ai", duration: 0.2, capacity: 30 },
  { label: "Checklist QA", type: "checkpoint", duration: 1, capacity: 10 },
  { label: "Automated QA Gate", type: "checkpoint", duration: 0.3, capacity: 20 },
  { label: "Exception-Only Review", type: "approval", duration: 1, capacity: 5 },
  { label: "Manager Review", type: "approval", duration: 3, capacity: 2 },
  { label: "Human Drafts Content", type: "task", duration: 5, capacity: 3 },
  { label: "Human Edit/Polish", type: "task", duration: 2, capacity: 4 },
];

const TYPE_COLORS = {
  input: C.blue,
  output: C.teal,
  task: C.amber,
  approval: C.danger,
  ai: C.teal,
  checkpoint: C.pink,
};

const TYPE_ICONS = {
  input: "\u25B6",
  output: "\u2713",
  task: "\u270E",
  approval: "\u2717",
  ai: "\u2699",
  checkpoint: "\u2611",
};

function simulate(steps, inputRate, cycles) {
  const history = [];
  const queues = steps.map(() => 0);
  let totalOut = 0;
  let totalCycleTime = 0;
  let totalItems = 0;

  for (let c = 0; c < cycles; c++) {
    queues[0] += inputRate;
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      const canProcess = Math.min(queues[i], step.capacity);
      if (i < steps.length - 1) {
        queues[i + 1] += canProcess;
      } else {
        totalOut += canProcess;
      }
      queues[i] -= canProcess;
    }
    const bottleneckIdx = queues.reduce((maxI, q, i, arr) => (q > arr[maxI] ? i : maxI), 0);
    const cycleTime = steps.reduce((sum, s) => sum + s.duration, 0) + queues.reduce((s, q) => s + q * 0.5, 0);
    totalItems += inputRate;
    totalCycleTime += cycleTime;

    history.push({
      cycle: c + 1,
      queues: [...queues],
      throughput: totalOut,
      bottleneck: bottleneckIdx,
      cycleTime: Math.round(cycleTime * 10) / 10,
    });
  }

  const avgCycleTime = totalItems > 0 ? Math.round((totalCycleTime / cycles) * 10) / 10 : 0;
  const qualityScore = computeQuality(steps);
  return { history, totalOut, avgCycleTime, qualityScore, finalQueues: queues };
}

function computeQuality(steps) {
  let score = 60;
  steps.forEach((s) => {
    if (s.type === "checkpoint") score += 12;
    if (s.type === "approval") score += 5;
    if (s.type === "ai") score += 3;
  });
  return Math.min(98, score);
}

function hasBottleneckWithAI(steps) {
  const hasAI = steps.some((s) => s.type === "ai");
  const hasHeavyApproval = steps.some((s) => s.type === "approval" && s.capacity <= 2);
  return hasAI && hasHeavyApproval;
}

function StepNode({ step, index, total, width, isBottleneck, queueSize, side }) {
  const col = TYPE_COLORS[step.type] || C.textSec;
  const nodeW = width * 0.82;
  const nodeH = 52;
  const x = (width - nodeW) / 2;
  const y = index * 68 + 8;
  const glow = isBottleneck && queueSize > 2;

  return (
    <g>
      {glow && (
        <rect x={x - 3} y={y - 3} width={nodeW + 6} height={nodeH + 6} rx={10}
          fill="none" stroke={C.danger} strokeWidth={2} opacity={0.6}>
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}
      <rect x={x} y={y} width={nodeW} height={nodeH} rx={8}
        fill={C.node} stroke={glow ? C.danger : col + "55"} strokeWidth={1.5} />
      <text x={x + 10} y={y + 18} fill={col} fontSize={11} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
        {TYPE_ICONS[step.type]} {step.label}
      </text>
      <text x={x + 10} y={y + 34} fill={C.textMuted} fontSize={9} fontFamily="'DM Sans', sans-serif">
        {step.duration}h · cap {step.capacity}/cycle
      </text>
      {queueSize > 0 && (
        <g>
          <rect x={x + nodeW - 38} y={y + 6} width={32} height={18} rx={4}
            fill={queueSize > 4 ? C.danger + "33" : C.amber + "22"} />
          <text x={x + nodeW - 22} y={y + 18} fill={queueSize > 4 ? C.danger : C.amber}
            fontSize={9} fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
            Q:{queueSize}
          </text>
        </g>
      )}
      {index < total - 1 && (
        <line x1={width / 2} y1={y + nodeH + 2} x2={width / 2} y2={y + 66}
          stroke={C.gridDot} strokeWidth={1} strokeDasharray="3,3" />
      )}
    </g>
  );
}

function MetricCard({ label, value, unit, color, subtext }) {
  return (
    <div style={{
      background: C.node, border: `1px solid ${C.nodeBorder}`, borderRadius: 8,
      padding: "10px 12px", flex: 1, minWidth: 100,
    }}>
      <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 11, color: C.textMuted, marginLeft: 2 }}>{unit}</span>
      </div>
      {subtext && <div style={{ fontSize: 9, color: C.textSec, marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}

function OvenCallout({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
      background: `linear-gradient(135deg, ${C.amber}18, ${C.danger}12)`,
      border: `1px solid ${C.amber}44`, borderRadius: 10, padding: "12px 20px",
      maxWidth: 480, zIndex: 20, animation: "fadeSlideUp 0.5s ease-out",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
        FASTER OVEN DETECTED
      </div>
      <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
        You added AI capability without fixing the approval bottleneck. Buying a faster oven
        does not help if you still have one cashier — the bottleneck just moves to checkout.
        Try removing or widening the approval step.
      </div>
    </div>
  );
}

export default function SMBMindsetShift() {
  const [aiSteps, setAiSteps] = useState([
    { id: "u1", label: "Request Received", type: "input", duration: 1, capacity: 99 },
    { id: "u2", label: "Human Drafts Content", type: "task", duration: 5, capacity: 3 },
    { id: "u3", label: "Manager Review", type: "approval", duration: 3, capacity: 2 },
    { id: "u4", label: "Director Approval", type: "approval", duration: 4, capacity: 1 },
    { id: "u5", label: "Compliance Check", type: "approval", duration: 2, capacity: 2 },
    { id: "u6", label: "Published", type: "output", duration: 1, capacity: 99 },
  ]);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [toolSim, setToolSim] = useState(null);
  const [aiSim, setAiSim] = useState(null);
  const [showOven, setShowOven] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [idCounter, setIdCounter] = useState(10);
  const timerRef = useRef(null);
  const inputRate = 6;
  const totalCycles = 12;

  const runSimulation = useCallback(() => {
    setRunning(true);
    setCycle(0);
    setShowOven(false);
    const ts = simulate(TOOL_FIRST_STEPS, inputRate, totalCycles);
    const as = simulate(aiSteps, inputRate, totalCycles);
    setToolSim(ts);
    setAiSim(as);

    if (hasBottleneckWithAI(aiSteps)) {
      setTimeout(() => setShowOven(true), 1500);
    }

    let c = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      c++;
      setCycle(c);
      if (c >= totalCycles) {
        clearInterval(timerRef.current);
      }
    }, 400);
  }, [aiSteps]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadPreset = useCallback(() => {
    setAiSteps(AI_FIRST_PRESET.map((s, i) => ({ ...s, id: `p${i}` })));
    setRunning(false);
    setCycle(0);
    setToolSim(null);
    setAiSim(null);
    setShowOven(false);
  }, []);

  const resetAI = useCallback(() => {
    setAiSteps([
      { id: "u1", label: "Request Received", type: "input", duration: 1, capacity: 99 },
      { id: "u2", label: "Human Drafts Content", type: "task", duration: 5, capacity: 3 },
      { id: "u3", label: "Manager Review", type: "approval", duration: 3, capacity: 2 },
      { id: "u4", label: "Director Approval", type: "approval", duration: 4, capacity: 1 },
      { id: "u5", label: "Compliance Check", type: "approval", duration: 2, capacity: 2 },
      { id: "u6", label: "Published", type: "output", duration: 1, capacity: 99 },
    ]);
    setRunning(false);
    setCycle(0);
    setToolSim(null);
    setAiSim(null);
    setShowOven(false);
  }, []);

  const addStep = useCallback((template) => {
    const newId = `s${idCounter}`;
    setIdCounter((c) => c + 1);
    const newStep = { ...template, id: newId };
    setAiSteps((prev) => {
      const insertIdx = Math.max(1, prev.length - 1);
      const next = [...prev];
      next.splice(insertIdx, 0, newStep);
      return next;
    });
    setShowPalette(false);
  }, [idCounter]);

  const removeStep = useCallback((idx) => {
    setAiSteps((prev) => {
      if (prev[idx].type === "input" || prev[idx].type === "output") return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const moveStep = useCallback((fromIdx, toIdx) => {
    setAiSteps((prev) => {
      if (toIdx < 1 || toIdx >= prev.length - 1) return prev;
      if (prev[fromIdx].type === "input" || prev[fromIdx].type === "output") return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }, []);

  const toolFrame = toolSim && cycle > 0 ? toolSim.history[Math.min(cycle - 1, totalCycles - 1)] : null;
  const aiFrame = aiSim && cycle > 0 ? aiSim.history[Math.min(cycle - 1, totalCycles - 1)] : null;

  const colW = 260;
  const svgH = Math.max(TOOL_FIRST_STEPS.length, aiSteps.length) * 68 + 24;

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif",
      padding: 0, position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: C.canvas, borderBottom: `1px solid ${C.panelBorder}`,
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", color: C.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            W1-C3 — SMB AI Mindset Shift
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>
            Workflow Redesign Simulator
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadPreset} style={{
            background: C.teal + "18", border: `1px solid ${C.teal}44`, borderRadius: 6,
            color: C.teal, padding: "6px 14px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
          }}>
            LOAD MARKETING EXAMPLE
          </button>
          <button onClick={resetAI} style={{
            background: C.node, border: `1px solid ${C.nodeBorder}`, borderRadius: 6,
            color: C.textSec, padding: "6px 14px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            RESET
          </button>
          <button onClick={runSimulation} style={{
            background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
            border: "none", borderRadius: 6, color: "#fff", padding: "6px 18px",
            fontSize: 10, fontWeight: 700, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
          }}>
            {running ? "RE-RUN" : "RUN SIMULATION"}
          </button>
        </div>
      </div>

      {/* Concept Banner */}
      <div style={{
        background: `linear-gradient(90deg, ${C.teal}08, ${C.amber}06, ${C.danger}06)`,
        borderBottom: `1px solid ${C.panelBorder}`, padding: "10px 24px",
        display: "flex", gap: 24, alignItems: "center",
      }}>
        <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>
          <b style={{ color: C.amber }}>Tool-First Thinking:</b> "Buy AI, plug it in, same workflow."
        </div>
        <div style={{ color: C.textMuted }}>vs</div>
        <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>
          <b style={{ color: C.teal }}>System-Redesign Thinking:</b> "Restructure the workflow around AI capabilities."
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", padding: 16, gap: 16, height: "calc(100vh - 120px)", overflow: "hidden" }}>

        {/* Left Panel: Tool-First */}
        <div style={{
          flex: 1, background: C.canvas, border: `1px solid ${C.panelBorder}`,
          borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          <div style={{
            padding: "10px 14px", borderBottom: `1px solid ${C.panelBorder}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.danger, textTransform: "uppercase" }}>
                Tool-First Approach
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                Same workflow + AI tools bolted on
              </div>
            </div>
            {toolSim && <div style={{
              background: C.danger + "18", border: `1px solid ${C.danger}33`, borderRadius: 6,
              padding: "3px 8px", fontSize: 9, color: C.danger, fontFamily: "'JetBrains Mono', monospace",
            }}>BOTTLENECK</div>}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            <svg width={colW} height={svgH} viewBox={`0 0 ${colW} ${svgH}`} style={{ display: "block", margin: "0 auto" }}>
              {TOOL_FIRST_STEPS.map((step, i) => (
                <StepNode key={step.id} step={step} index={i} total={TOOL_FIRST_STEPS.length}
                  width={colW} isBottleneck={toolFrame ? toolFrame.bottleneck === i : false}
                  queueSize={toolFrame ? toolFrame.queues[i] : 0} side="tool" />
              ))}
            </svg>
          </div>
        </div>

        {/* Center: Metrics */}
        <div style={{
          width: 280, display: "flex", flexDirection: "column", gap: 12, overflow: "auto",
        }}>
          {/* Cycle indicator */}
          <div style={{
            background: C.canvas, border: `1px solid ${C.panelBorder}`, borderRadius: 10,
            padding: 14, textAlign: "center",
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
              Simulation Cycle
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: cycle > 0 ? C.teal : C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              {cycle}<span style={{ fontSize: 14, color: C.textMuted }}>/{totalCycles}</span>
            </div>
            <div style={{
              height: 3, background: C.nodeBorder, borderRadius: 2, marginTop: 8, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${(cycle / totalCycles) * 100}%`,
                background: `linear-gradient(90deg, ${C.teal}, ${C.blue})`,
                borderRadius: 2, transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Scoreboard */}
          <div style={{
            background: C.canvas, border: `1px solid ${C.panelBorder}`, borderRadius: 10,
            padding: 14,
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 10 }}>
              Scoreboard
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <MetricCard label="Tool-First Output" value={toolFrame ? toolFrame.throughput : "—"} unit="items" color={C.danger} />
              <MetricCard label="AI-First Output" value={aiFrame ? aiFrame.throughput : "—"} unit="items" color={C.teal} />
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <MetricCard label="Tool Cycle Time" value={toolSim ? toolSim.avgCycleTime : "—"} unit="h" color={C.amber} />
              <MetricCard label="AI Cycle Time" value={aiSim ? aiSim.avgCycleTime : "—"} unit="h" color={C.teal} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <MetricCard label="Tool Quality" value={toolSim ? toolSim.qualityScore : "—"} unit="%" color={C.textSec} />
              <MetricCard label="AI Quality" value={aiSim ? aiSim.qualityScore : "—"} unit="%" color={C.teal} />
            </div>
          </div>

          {/* Throughput Chart */}
          {toolSim && aiSim && cycle > 0 && (
            <div style={{
              background: C.canvas, border: `1px solid ${C.panelBorder}`, borderRadius: 10,
              padding: 14,
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
                Cumulative Throughput
              </div>
              <svg width={250} height={100} viewBox="0 0 250 100" style={{ display: "block" }}>
                {/* Grid */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1={0} y1={y} x2={250} y2={y} stroke={C.gridDot} strokeWidth={0.5} />
                ))}
                {/* Tool-first line */}
                <polyline fill="none" stroke={C.danger} strokeWidth={1.5} opacity={0.7}
                  points={toolSim.history.slice(0, cycle).map((h, i) => {
                    const maxT = Math.max(toolSim.totalOut, aiSim.totalOut, 1);
                    return `${(i / (totalCycles - 1)) * 245 + 2},${95 - (h.throughput / maxT) * 85}`;
                  }).join(" ")} />
                {/* AI-first line */}
                <polyline fill="none" stroke={C.teal} strokeWidth={2}
                  points={aiSim.history.slice(0, cycle).map((h, i) => {
                    const maxT = Math.max(toolSim.totalOut, aiSim.totalOut, 1);
                    return `${(i / (totalCycles - 1)) * 245 + 2},${95 - (h.throughput / maxT) * 85}`;
                  }).join(" ")} />
                {/* Legend */}
                <rect x={160} y={2} width={8} height={3} rx={1} fill={C.danger} />
                <text x={172} y={7} fill={C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">Tool</text>
                <rect x={195} y={2} width={8} height={3} rx={1} fill={C.teal} />
                <text x={207} y={7} fill={C.textMuted} fontSize={7} fontFamily="'DM Sans', sans-serif">AI</text>
              </svg>
            </div>
          )}

          {/* Insight */}
          <div style={{
            background: `linear-gradient(135deg, ${C.teal}08, ${C.blue}06)`,
            border: `1px solid ${C.teal}22`, borderRadius: 10, padding: 12,
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: C.teal, textTransform: "uppercase", marginBottom: 6 }}>
              Key Insight
            </div>
            <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7 }}>
              <b style={{ color: C.teal }}>Reinforcing loop:</b> Better automation produces more output, which generates more data and feedback, which improves automation further.
            </div>
            <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7, marginTop: 6 }}>
              <b style={{ color: C.danger }}>Balancing loop:</b> More output creates more review load, which slows approvals, which reduces effective throughput.
            </div>
          </div>
        </div>

        {/* Right Panel: AI-First (editable) */}
        <div style={{
          flex: 1, background: C.canvas, border: `1px solid ${C.panelBorder}`,
          borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          <div style={{
            padding: "10px 14px", borderBottom: `1px solid ${C.panelBorder}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.teal, textTransform: "uppercase" }}>
                AI-First Redesign
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                Drag to reorder · click X to remove · add steps below
              </div>
            </div>
            <button onClick={() => setShowPalette(!showPalette)} style={{
              background: C.teal + "18", border: `1px solid ${C.teal}44`, borderRadius: 6,
              color: C.teal, padding: "3px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              + ADD STEP
            </button>
          </div>

          {/* Step Palette */}
          {showPalette && (
            <div style={{
              borderBottom: `1px solid ${C.panelBorder}`, padding: 10,
              display: "flex", flexWrap: "wrap", gap: 6, background: C.panel,
            }}>
              {AVAILABLE_STEPS.map((tmpl, i) => {
                const col = TYPE_COLORS[tmpl.type];
                return (
                  <button key={i} onClick={() => addStep(tmpl)} style={{
                    background: col + "12", border: `1px solid ${col}33`, borderRadius: 5,
                    color: col, padding: "4px 10px", fontSize: 9, cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                  }}>
                    {TYPE_ICONS[tmpl.type]} {tmpl.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Editable Steps */}
          <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
            {aiSteps.map((step, idx) => {
              const col = TYPE_COLORS[step.type] || C.textSec;
              const isFixed = step.type === "input" || step.type === "output";
              const isBottleneck = aiFrame && aiFrame.bottleneck === idx && aiFrame.queues[idx] > 2;
              const queueSize = aiFrame ? aiFrame.queues[idx] : 0;

              return (
                <div key={step.id} style={{
                  background: isBottleneck ? C.danger + "12" : C.node,
                  border: `1px solid ${isBottleneck ? C.danger + "55" : C.nodeBorder}`,
                  borderRadius: 8, padding: "8px 10px", marginBottom: 6,
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: isFixed ? "default" : "grab",
                  transition: "background 0.2s",
                }}
                  draggable={!isFixed}
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== idx) {
                      moveStep(dragIdx, idx);
                    }
                    setDragIdx(null);
                  }}
                  onDragEnd={() => setDragIdx(null)}
                >
                  {/* Drag handle */}
                  {!isFixed && (
                    <div style={{ color: C.textMuted, fontSize: 12, cursor: "grab", userSelect: "none" }}>
                      &#x2630;
                    </div>
                  )}
                  {/* Move buttons */}
                  {!isFixed && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <button onClick={() => moveStep(idx, idx - 1)} style={{
                        background: "none", border: "none", color: C.textMuted, fontSize: 9,
                        cursor: "pointer", padding: 0, lineHeight: 1,
                      }}>{"\u25B2"}</button>
                      <button onClick={() => moveStep(idx, idx + 1)} style={{
                        background: "none", border: "none", color: C.textMuted, fontSize: 9,
                        cursor: "pointer", padding: 0, lineHeight: 1,
                      }}>{"\u25BC"}</button>
                    </div>
                  )}
                  {/* Icon + info */}
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, background: col + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: col, flexShrink: 0,
                  }}>
                    {TYPE_ICONS[step.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: col, fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>
                      {step.duration}h · cap {step.capacity}/cycle
                    </div>
                  </div>
                  {/* Queue badge */}
                  {queueSize > 0 && (
                    <div style={{
                      background: queueSize > 4 ? C.danger + "33" : C.amber + "22",
                      borderRadius: 4, padding: "2px 6px", fontSize: 9,
                      color: queueSize > 4 ? C.danger : C.amber,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>Q:{queueSize}</div>
                  )}
                  {/* Remove */}
                  {!isFixed && (
                    <button onClick={() => removeStep(idx)} style={{
                      background: "none", border: "none", color: C.textMuted,
                      fontSize: 14, cursor: "pointer", padding: "0 2px", lineHeight: 1,
                    }}>{"\u00D7"}</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Faster Oven Callout */}
      <OvenCallout visible={showOven} />

      {/* Common Failures footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: C.panel, borderTop: `1px solid ${C.panelBorder}`,
        padding: "8px 24px", display: "flex", gap: 24, justifyContent: "center",
      }}>
        {[
          { icon: "\u26A0", text: "Buying tools without removing constraints", color: C.amber },
          { icon: "\u2716", text: "Measuring activity, not outcomes", color: C.danger },
          { icon: "\u2193", text: "No standards — quality drifts", color: C.pink },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: f.color, fontSize: 11 }}>{f.icon}</span>
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
