# Phase 9: ST-005 Tool Orchestration - Research

**Researched:** 2026-03-21
**Domain:** Tool dependency graph analysis, MCP tool orchestration, systems thinking intervention scoring
**Confidence:** HIGH

## Summary

ST-005 Tool Orchestration implements a complete three-layer learning stack: an interactive React/SVG artifact for dependency graph visualization, an MCP tool for programmatic analysis, and a Claude skill for guided workflow. This phase requires integrating dependency graph algorithms (topological sort, cycle detection via DFS), health scoring metrics (complexity, redundancy, brittliness), and Meadows hierarchy intervention ranking. The artifact reuses established patterns from ST-004 (SVG rendering, progressive disclosure, worked examples) while introducing novel scoring algorithms for tool stack health.

The worked example uses the actual course tool stack (9 tools across 2 servers including 3 planned tools), creating a meta-learning moment where students analyze the tools they're learning with. The dependency graph supports three dependency types (required/optional/enhances), graduated failure cascades, and blast radius visualization. Progressive disclosure patterns let students predict intervention Meadows levels before reveal, with before/after health score deltas showing concrete impact.

**Primary recommendation:** Build on proven ST-004 patterns (custom SVG over heavy frameworks, inline styles, tabbed right panel, DFS cycle detection, topological sort layout, worked example auto-starts in analyze mode). Use Vitest for artifact testing, pytest for MCP tool validation. Compose with existing `compare_interventions` tool via transformation of MCPTool/ToolDependency to intervention format. Target artifact compression similar to ST-004 (546 lines).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dependency Graph Visualization:**
- Top-down hierarchy layout — upstream tools at top, downstream at bottom (topological sort)
- Line style differentiation for dependency types: solid = required, dashed = optional, dotted = enhances — all teal color, line style does the heavy lifting
- Blast radius: click a tool in analyze mode to highlight downstream cascade — direct dependents glow bright coral, transitive dependents dimmer with fading intensity
- Circular dependencies detected and flagged as anti-pattern — coral/red highlighted edges with warning badge, right panel shows refactoring suggestion
- Redundancy: group highlight with overlap badge around tool pairs with matching input/output overlap, "redundant" label
- Edge labels: dependency type label always visible (required/optional/enhances), data fields shown on hover tooltip only
- Node info on canvas: tool name + criticality dot (green=low, amber=medium, red=high) — server, inputs/outputs, latency in right panel on selection
- Edge creation: select dependency type first via 3 toolbar buttons, then click source → target (matches ST-004 pattern)
- Subtle animated dot pulse along edges on selected tool's connections to show data flow direction
- No server grouping — flat graph, server is metadata in right panel
- Isolated tools (no dependencies): rendered at 50% opacity with 'isolated' label, noted in health metrics
- Auto-layout button (topological sort positioning) + manual drag adjustment
- Fixed viewport with fit-to-canvas scaling (no zoom/pan)

**Failure Simulation Mode:**
- Toggle tool failure: click 'break' icon on any tool — tool turns red
- Graduated cascade based on dependency type: required = red (broken), optional = amber (degraded), enhances = green (unaffected)
- Single 'Reset' button in toolbar clears all failure states
- Students can break and reset repeatedly to explore different failure scenarios

**Build vs Analyze Modes:**
- Two modes with toolbar toggle: Build mode (add tools, draw dependency edges, set types) and Analyze mode (blast radius, failure sim, health scores)
- Worked example auto-starts in analyze mode — students explore analysis FIRST
- 'Start Fresh' button clears canvas and switches to build mode for practice
- 'Keep Example + Add' option lets students extend the worked example

**Tool Input Form:**
- Adding a custom tool requires: name + criticality dropdown (low/medium/high) only
- Advanced fields (server, inputs, outputs, latency, description) hidden behind 'Advanced' toggle
- Minimum viable tool node in 2 clicks

**Health Scoring Algorithm:**
- Three independent sub-scores + one aggregate, all 0-100:
  - **Complexity**: edge count + (cycle count × penalty multiplier)
  - **Redundancy**: count of tool pairs with matching input AND output overlap
  - **Brittleness**: max blast radius depth (longest cascade chain via 'required' dependencies only)
  - **Aggregate**: equal-weight average (33/33/33)
- Higher = unhealthier (risk score) — matches ST-004 severity convention
- Three tiers: Healthy 0-33 (green), At Risk 34-66 (amber), Critical 67-100 (red)
- Display: numbers + horizontal color-coded bars for each sub-score and aggregate
- Live update — health scores recalculate automatically whenever graph changes
- Per-tool breakdown on selection: click any tool to see its individual contribution to each health metric
- MCP tool returns identical scores + textual refactor recommendations

**Worked Example Design:**
- Uses the ACTUAL course tool stack — all 9 tools (6 existing + 3 planned ST-004/005/006)
- Two servers represented: week1-foundations (3 tools) and systems-thinking-cubelets (6 existing + 3 planned)
- Subtle background region per server (faint lighter panel) with server name label — visual grouping hint, not collapsing
- 3 planned tools (analyze_agent_feedback_loops, analyze_tool_orchestration, detect_automation_debt) rendered with dashed border + 'planned' badge
- Problem focus: coupling + blast radius — create_causal_loop as single point of failure with 3+ required downstream dependents
- Pre-failed state: create_causal_loop starts in 'failed' state on first load — cascade visible immediately as the first thing students see
- 3 pre-annotated interventions at different Meadows levels:
  - L1 (parameter): increase timeout on create_causal_loop
  - L6 (feedback structure): add caching layer between CLD creation and downstream consumers
  - L10 (system goals): redesign so each tool is self-contained
- Inline annotation callouts on canvas: numbered bubbles (1, 2, 3) pointing to key features, dismissible

**Intervention Scoring UX:**
- Click tool in analyze mode → right panel shows 'Add Intervention' → select action type: Add tool, Remove tool, Refactor dependency, Add cache/fallback
- System assigns Meadows level based on action type
- Progressive disclosure: student predicts Meadows level (L1-L12 slider/dropdown) BEFORE system reveals actual level — comparison shown (green check if close, red X if far)
- Before/after health score comparison: when intervention is added, scores show current value AND projected value side by side with delta (e.g., "Brittleness: 78 → 45 (↓33)")

**Right Panel Organization:**
- Three tabs: Topology / Health / Interventions
  - **Topology**: dependency graph stats (tool count, edge count, cycle count, isolated tools)
  - **Health**: 3 sub-scores + aggregate with color bars, per-tool breakdown on selection
  - **Interventions**: student-created interventions with Meadows levels, predictions vs actual comparisons, impact on health scores
- Primer panel: collapsible accordion at TOP of right panel (tool orchestration basics: dependencies, redundancy, blast radius) — cross-references ST-002 tab
- Right panel width: ~280px (consistent with ST-004)

### Claude's Discretion

- Exact Meadows level assignments for each action type (e.g., is "Add cache/fallback" L5 or L6?)
- Cycle penalty multiplier value for complexity scoring
- Exact annotation callout positions and wording for worked example
- Auto-layout algorithm parameters (node spacing, level gaps)
- Toolbar icon design for build/analyze mode toggle
- Primer panel content and wording (tool orchestration basics)
- Cubelet markdown wording for all 6 faces (follow ST-004 structure)
- Skill workflow step count and step names (follow existing patterns)
- Exact input/output field definitions for the 9 tools in the worked example

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TO-01 | Cubelet markdown with all 6 faces covering tool stack analysis through leverage point lens | Meadows hierarchy research, educational progressive disclosure patterns |
| TO-02 | Interactive JSX artifact where student inputs MCP tools + dependencies, artifact builds dependency graph and identifies redundancy, coupling, and blast radius | React SVG graph visualization patterns, topological sort algorithms, DFS cycle detection |
| TO-03 | Artifact scores each tool intervention using Meadows hierarchy (parameter tweak L1 through paradigm shift L10) | Meadows leverage points hierarchy 1-12, intervention ranking patterns |
| TO-04 | Worked example using a realistic MCP tool stack with annotated leverage points | Existing course tool stack from cubelets_mcp_server.py, progressive disclosure UX patterns |
| TO-05 | Right-panel instrumentation showing tool stack health score (complexity, redundancy, brittleness) and leverage point rankings | Software architecture health metrics, complexity and brittleness scoring patterns |
| TO-06 | MCP tool `analyze_tool_orchestration` accepts tool list + dependencies + interventions, returns health scores and refactor recommendations | FastMCP + Pydantic patterns, MCP tool validation testing with pytest |
| TO-07 | MCP tool reuses existing `compare_interventions` via composition (transforms MCPTool/ToolDependency to intervention format) | Data model composition patterns from Phase 7, existing compare_interventions implementation |
| TO-08 | Claude skill `tool-stack-analyzer.skill` guides multi-step workflow for auditing tool stacks | Claude skill workflow patterns, MCP tool composition patterns from 2026 research |
| TO-09 | Quality gate score >= 42/60 | ST-004 cubelet scoring pattern established as reference |
| TO-10 | Prerequisite refresher panel referencing ST-002 concepts (Meadows hierarchy, leverage scoring) | Progressive disclosure, accordion UI patterns |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | JSX artifact UI framework | Component composition, state management, virtual DOM reconciliation for SVG graphs |
| FastMCP | 2.1.0 | MCP server tool framework | Pythonic decorator-based tool creation, automatic schema generation from type hints, official MCP SDK integration |
| Pydantic | 2.x | Data validation for MCP tools | Type-safe model validation, automatic JSON schema generation, ConfigDict patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | Latest | JavaScript testing for React artifacts | Fast ESM-native testing with HMR, browser component testing, 10-20x faster than Jest on large codebases |
| pytest | Latest | Python testing for MCP tools | MCP tool validation, Pydantic model constraint testing, in-memory client-server binding |
| React Testing Library | Latest | Component testing | User-focused component tests following "test how software is used" principle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom SVG | ReactFlow, D3 | Custom SVG is self-contained (no external deps), proven in ST-004 at 546 lines — heavy frameworks add bundle size and learning curve with no pedagogical benefit |
| Vitest | Jest | Jest is mature and battle-tested, but Vitest offers native ESM, faster watch mode (<200ms vs 3-5sec), and Vite integration — ST-004 precedent suggests Vitest |
| Topological sort (custom) | dagre library | Phase 8 decision: artifact sandbox may not support external graph libraries — custom implementation proven at <50 lines |

**Installation:**
```bash
# Artifact dependencies (none — React in artifact sandbox)
# MCP server
pip install fastmcp pydantic pytest

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Architecture Patterns

### Recommended Project Structure
```
.planning/phases/09-st-005-tool-orchestration/
├── 09-CONTEXT.md                    # User decisions
├── 09-RESEARCH.md                   # This file
├── 09-01-PLAN.md                    # Wave 1: Artifact + MCP tool
├── 09-02-PLAN.md                    # Wave 2: Cubelet markdown + skill
└── 09-VERIFICATION.md               # Quality gate

Interactive Artifact for Cubelets/
└── tool-orchestration-analyzer.jsx  # Self-contained React artifact

Cubelets MCP Tool/files/
└── cubelets_mcp_server.py          # Add analyze_tool_orchestration tool

Cubelets/CubeletsMarkdown/
└── ST-005-tool-orchestration.md    # 6-face cubelet

Claude skills build for Cubelets/files/
└── tool-stack-analyzer.skill       # ZIP: SKILL.md + references/
```

### Pattern 1: Custom SVG Graph Rendering
**What:** Direct SVG element rendering with inline styles, no external graph libraries
**When to use:** Interactive graph visualizations with <100 nodes, educational artifacts requiring self-contained code
**Example:**
```jsx
// Source: ST-004 agent-feedback-loop-builder.jsx (lines 84-99)
function getEdgePath(fromNode, toNode, allEdges, idx) {
  const dx = toNode.x - fromNode.x, dy = toNode.y - fromNode.y, dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const hasReverse = allEdges.some((e, i) => i !== idx && e.from === allEdges[idx]?.to && e.to === allEdges[idx]?.from);
  const curve = hasReverse ? dist * 0.25 : dist * 0.12;
  const mx = (fromNode.x + toNode.x) / 2, my = (fromNode.y + toNode.y) / 2;
  const nx = -dy / dist, ny = dx / dist, cx = mx + nx * curve, cy = my + ny * curve;
  return `M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`;
}
```

### Pattern 2: DFS Cycle Detection
**What:** Depth-first search with recursion stack to detect circular dependencies
**When to use:** Directed graph cycle detection, dependency validation
**Example:**
```jsx
// Source: ST-004 agent-feedback-loop-builder.jsx (lines 46-64)
function findCycles(nodes, edges) {
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => { if (adj[e.from]) adj[e.from].push({ to: e.to, polarity: e.polarity }); });
  const cycles = [];
  const visited = new Set();
  function dfs(start, current, path, pathSet) {
    const neighbors = adj[current] || [];
    for (const { to, polarity } of neighbors) {
      if (to === start && path.length >= 2) { cycles.push([...path, { node: to, polarity }]); continue; }
      if (pathSet.has(to) || visited.has(to)) continue;
      pathSet.add(to); path.push({ node: to, polarity });
      dfs(start, to, path, pathSet);
      path.pop(); pathSet.delete(to);
    }
  }
  nodes.forEach((n) => { const pathSet = new Set([n.id]); dfs(n.id, n.id, [{ node: n.id, polarity: null }], pathSet); visited.add(n.id); });
  return cycles;
}
```

### Pattern 3: Topological Sort Layout
**What:** Kahn's algorithm for DAG node ordering with layer-based vertical positioning
**When to use:** Dependency graph visualization, build order determination
**Example:**
```javascript
// Kahn's algorithm pattern (adapted from web search findings)
function topologicalSort(nodes, edges) {
  const inDegree = {};
  const adj = {};
  nodes.forEach(n => { inDegree[n.id] = 0; adj[n.id] = []; });
  edges.forEach(e => { adj[e.from].push(e.to); inDegree[e.to]++; });

  const queue = nodes.filter(n => inDegree[n.id] === 0);
  const layers = [];

  while (queue.length > 0) {
    const layer = [...queue];
    layers.push(layer);
    queue.length = 0;
    layer.forEach(node => {
      adj[node.id].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(nodes.find(n => n.id === neighbor));
        }
      });
    });
  }
  return layers; // Each layer rendered at increasing y-coordinate
}
```

### Pattern 4: FastMCP Tool with Pydantic Models
**What:** Decorator-based MCP tool with Pydantic validation and composition with existing tools
**When to use:** Creating new MCP tools that transform domain-specific inputs to reuse existing analysis logic
**Example:**
```python
# Source: cubelets_mcp_server.py (lines 629-758) compare_interventions pattern
from fastmcp import FastMCP
from pydantic import BaseModel, Field, ConfigDict

class MCPTool(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    tool_id: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    server: str = Field(..., min_length=1, max_length=100)
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)
    criticality: Optional[Literal["low", "medium", "high", "critical"]] = None

@mcp.tool(name="analyze_tool_orchestration")
async def analyze_tool_orchestration(params: AnalyzeToolsInput) -> str:
    # Transform MCPTool/ToolDependency to intervention format
    # Compose with existing compare_interventions tool
    # Return health scores + recommendations
    pass
```

### Pattern 5: Progressive Disclosure with Prediction Feedback
**What:** Student predicts outcome before reveal, system shows comparison with visual feedback
**When to use:** Educational artifacts where prediction strengthens learning
**Example:**
```jsx
// Progressive disclosure pattern (conceptual from research)
const [prediction, setPrediction] = useState(null);
const [revealed, setRevealed] = useState(false);

const handlePredict = (level) => {
  setPrediction(level);
};

const handleReveal = () => {
  setRevealed(true);
  const actual = calculateActualLevel();
  const close = Math.abs(prediction - actual) <= 2;
  return { match: close, actual, prediction };
};

// UI shows green checkmark if close (within 2 levels), red X if far
```

### Pattern 6: Health Score Composition
**What:** Multiple sub-metrics combined into aggregate with tier-based thresholds
**When to use:** Complex system health assessment requiring multiple dimensions
**Example:**
```javascript
// Health scoring pattern (based on requirements and research)
function calculateHealthScores(graph) {
  const complexity = graph.edges.length + (graph.cycles.length * cyclePenaltyMultiplier);
  const redundancy = countRedundantPairs(graph.tools); // Matching input/output overlap
  const brittleness = maxBlastRadiusDepth(graph, 'required'); // Longest required-dependency chain

  const aggregate = (complexity + redundancy + brittleness) / 3;

  return {
    complexity: { score: Math.min(100, complexity), tier: getTier(complexity) },
    redundancy: { score: Math.min(100, redundancy), tier: getTier(redundancy) },
    brittleness: { score: Math.min(100, brittleness), tier: getTier(brittleness) },
    aggregate: { score: Math.min(100, aggregate), tier: getTier(aggregate) }
  };
}

function getTier(score) {
  if (score <= 33) return 'healthy'; // green
  if (score <= 66) return 'at-risk'; // amber
  return 'critical'; // red
}
```

### Anti-Patterns to Avoid
- **External graph library dependency**: ST-004 precedent shows custom SVG is sufficient and avoids sandbox restrictions
- **Zoom/pan on fixed canvas**: Fixed viewport with fit-to-canvas scaling is simpler and matches educational context
- **Server grouping/collapsing**: Adds complexity without pedagogical value — flat graph with metadata in panel
- **Separate graph layout library (dagre)**: Phase 8 decision shows custom topological sort is sufficient (<50 lines)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MCP tool schema generation | Manual JSON schema writing | FastMCP @mcp.tool() decorator with type hints | Auto-generates schemas from function signatures, handles validation, reduces 100+ lines to <10 |
| Data validation for MCP inputs | Manual if/else validation | Pydantic BaseModel with Field constraints | Type-safe validation, automatic error messages, proven ConfigDict patterns |
| React state management for simple artifact | Redux, Zustand | useState + useCallback hooks | Local state is sufficient for single-artifact scope, proven in ST-004 at 546 lines |
| Graph cycle detection | Custom naive algorithm | DFS with recursion stack (ST-004 proven pattern) | O(V+E) time complexity, handles all cycle types, <30 lines, tested in production |
| Test infrastructure setup | Manual test file organization | Vitest with React Testing Library | Automatic test discovery, fast HMR-based watch mode, standard patterns from 2026 research |
| Topological sort | Manual BFS with manual level tracking | Kahn's algorithm (zero in-degree queue) | Standard DAG ordering algorithm, handles disconnected components, proven O(V+E) |

**Key insight:** ST-004 precedent shows that proven patterns (DFS cycle detection, custom SVG, inline styles, useState) compress to ~546 lines while maintaining full functionality. The "don't hand-roll" rule applies to algorithmic complexity (use proven patterns), not framework choice (proven that custom beats heavy libraries for this use case).

## Common Pitfalls

### Pitfall 1: Circular Dependency Underdetection
**What goes wrong:** Simple parent-tracking misses cycles in directed graphs, only catches immediate back-edges
**Why it happens:** Undirected graph cycle detection patterns (parent tracking) incorrectly applied to directed graphs
**How to avoid:** Use recursion stack pattern (separate from visited set) — if node in recursion stack is reached, cycle exists
**Warning signs:** Tests with A→B→C→A return no cycles, only A→B→A patterns detected

### Pitfall 2: Transitive Blast Radius Miscalculation
**What goes wrong:** Blast radius calculation counts only direct dependents, missing cascading failures through required dependencies
**Why it happens:** Not following dependency type (required/optional/enhances) through transitive closure
**How to avoid:** Recursive descent from failed node following only 'required' edges with depth tracking, use memoization to avoid recomputation
**Warning signs:** Health metrics don't change when middle-tier tools are removed, only leaf tools affect brittleness score

### Pitfall 3: Meadows Level Assignment Inconsistency
**What goes wrong:** Same intervention type gets different Meadows levels in different contexts, confusing students
**Why it happens:** Not establishing clear action-type-to-level mapping early in implementation
**How to avoid:** Create explicit mapping table (Add tool = L1, Remove tool = L2, Refactor dependency = L6, Add cache = L5, Change goals = L10) and document in code
**Warning signs:** Student predictions are "wrong" but their reasoning is sound, no clear rule for level assignment

### Pitfall 4: React State Staleness in Loop Detection
**What goes wrong:** Detected loops count doesn't update when graph changes, or updates show stale data
**Why it happens:** Including state in useEffect dependency array creates stale closures, previous loop count persists
**How to avoid:** Use ref pattern (prevLoopCountRef.current) instead of state in dependencies, or compute derived state in render
**Warning signs:** Loop count jumps by 2 when adding 1 cycle, notifications show old loop data after graph update

### Pitfall 5: SVG Edge Overlap Without Curve Adjustment
**What goes wrong:** Bidirectional edges render on top of each other, appearing as single edge
**Why it happens:** Not checking for reverse edges when calculating curve offset
**How to avoid:** Before rendering edge A→B, check if B→A exists in edge list; if yes, apply larger curve offset (proven: dist * 0.25 vs 0.12)
**Warning signs:** Students report "missing edges" that are actually hidden under reverse edges

### Pitfall 6: Health Score Normalization Edge Cases
**What goes wrong:** Health scores exceed 100 or go negative with certain graph configurations
**Why it happens:** Not clamping sub-scores before aggregation, cycle penalty multiplier too high
**How to avoid:** Apply Math.min(100, Math.max(0, score)) to each sub-score and aggregate, test with extreme graphs (100 cycles, 0 cycles, 1000 edges)
**Warning signs:** UI breaks with NaN or Infinity values, color bars render beyond panel bounds

### Pitfall 7: Pydantic Validation Error Opacity in MCP Tools
**What goes wrong:** MCP tool calls fail with cryptic "validation error" messages, students can't fix their input
**Why it happens:** Default Pydantic error messages reference field names without context, FastMCP serialization can pass JSON strings instead of objects
**How to avoid:** Add clear Field(description="...") on all fields, wrap tool logic in try/except to provide human-readable error context
**Warning signs:** User bug reports include "field required" without explaining which field or why, validation passes locally but fails in Claude Desktop

## Code Examples

Verified patterns from official sources and ST-004 precedent:

### Meadows Hierarchy Data Structure
```javascript
// Source: leverage-point-scorer.jsx (lines 2-15)
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
```

### Dark Cybernetic Color Palette
```javascript
// Source: agent-feedback-loop-builder.jsx (lines 27-36)
const COLORS = {
  bg: "#0f1117", canvas: "#161922", gridLine: "#1e2230", node: "#1c2033", nodeBorder: "#2a3050",
  nodeHover: "#242b45", nodeSelected: "#00d4aa", edgePlus: "#00d4aa", edgeMinus: "#ff6b6b",
  textPrimary: "#e8ecf4", textSecondary: "#7a839e", textMuted: "#4a5270", accent: "#00d4aa",
  accentWarm: "#ffb347", accentDanger: "#ff6b6b", panel: "#181c28", panelBorder: "#242940",
  reinforcing: "#00d4aa", balancing: "#6b8aff", pulse: "#00d4aa",
};
```

### Composite Score Calculation (MCP Tool Pattern)
```python
# Source: cubelets_mcp_server.py (lines 673-677)
# Composite score: Meadows level normalized + leverage score if available
meadows_score = level_num / 12.0
composite = meadows_score
if leverage is not None:
    composite = (meadows_score * 0.6) + (leverage * 0.4)
```

### Three-Panel Layout (React Artifact Pattern)
```jsx
// Source: agent-feedback-loop-builder.jsx (conceptual structure)
<div style={{ display: "flex", height: "100vh", background: COLORS.bg }}>
  {/* Left toolbar ~72px */}
  <div style={{ width: 72, background: COLORS.panel, borderRight: `1px solid ${COLORS.panelBorder}` }}>
    {/* Tool buttons */}
  </div>

  {/* Central SVG canvas (flex) */}
  <div style={{ flex: 1, position: "relative" }}>
    <svg width="100%" height="100%">
      {/* Nodes and edges */}
    </svg>
  </div>

  {/* Right panel ~280px */}
  <div style={{ width: 280, background: COLORS.panel, borderLeft: `1px solid ${COLORS.panelBorder}` }}>
    {/* Tabbed content: Topology / Health / Interventions */}
  </div>
</div>
```

### Pytest MCP Tool Testing Pattern
```python
# Source: MCP testing guide research (mcpcat.io)
import pytest
from fastmcp import FastMCP

@pytest.mark.asyncio
async def test_analyze_tool_orchestration_basic():
    # Create server instance
    mcp = FastMCP("test-server")

    # In-memory client-server binding (no network)
    async with mcp.run() as client:
        tools = [
            {"tool_id": "tool1", "name": "Tool 1", "server": "test-server"},
            {"tool_id": "tool2", "name": "Tool 2", "server": "test-server"}
        ]
        dependencies = [
            {"from_tool": "tool1", "to_tool": "tool2", "dependency_type": "required"}
        ]

        result = await client.call_tool("analyze_tool_orchestration", {
            "tools": tools,
            "dependencies": dependencies
        })

        assert "health_scores" in result
        assert result["health_scores"]["complexity"]["score"] >= 0
```

### Vitest Component Testing Setup
```javascript
// Source: Vitest React Testing Library research
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ToolOrchestrationAnalyzer from './tool-orchestration-analyzer.jsx';

describe('ToolOrchestrationAnalyzer', () => {
  it('renders worked example in analyze mode on load', () => {
    render(<ToolOrchestrationAnalyzer />);

    // Verify analyze mode is active
    expect(screen.getByText(/analyze mode/i)).toBeInTheDocument();

    // Verify worked example tools are present
    expect(screen.getByText(/create_causal_loop/i)).toBeInTheDocument();

    // Verify pre-failed state visible
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest for React testing | Vitest for ESM/Vite projects | 2024-2025 | 10-20x faster test execution, <200ms watch mode reruns, native ESM support without transpilation |
| Redux for all React state | useState for local, Zustand/Jotai for global | 2024-2026 | Simpler artifacts with local state only (proven: ST-004 at 546 lines), Redux still valid for complex apps |
| D3.js for graph viz | Custom SVG for educational artifacts | Phase 8 decision (2026-03) | Self-contained code, no bundle size, no learning curve, 546-line target achievable |
| dagre for graph layout | Custom topological sort | Phase 8 decision (2026-03) | Artifact sandbox compatibility, <50 lines, sufficient for educational use |
| Manual MCP schema | FastMCP decorator auto-gen | FastMCP 1.0 → MCP SDK (2025) | Reduced boilerplate from 100+ lines to <10 per tool, type-safe by default |

**Deprecated/outdated:**
- **create-react-app**: Deprecated in 2023, replaced by Vite for new projects (faster dev server, better ESM support)
- **Jest + ts-jest for TypeScript**: Vitest supports TypeScript out-of-box via esbuild with no configuration
- **Manual Pydantic error handling**: FastMCP 2.x auto-exposes validation errors to MCP client (was manual in 1.x)

## Open Questions

1. **Cycle penalty multiplier value for complexity scoring**
   - What we know: Phase 8 uses loop gain (product of strengths) for severity, but cycle count penalty multiplier not yet established
   - What's unclear: Optimal multiplier value to balance edge count vs cycle count in complexity sub-score
   - Recommendation: Start with multiplier = 10 (1 cycle = 10 edges in complexity impact), iterate based on worked example health scores. Document rationale in code comments.

2. **Exact Meadows level mapping for each intervention action type**
   - What we know: Meadows hierarchy is 1-12, user decisions specify examples (L1 parameter, L6 feedback structure, L10 system goals)
   - What's unclear: Precise mapping for all action types (Add tool, Remove tool, Refactor dependency, Add cache/fallback)
   - Recommendation: Create mapping table: Add tool = L1 (parameter), Remove tool = L2 (buffer size), Refactor dependency = L6 (feedback structure), Add cache/fallback = L5 (delays), Change goals = L10. Validate against worked example interventions.

3. **Blast radius depth calculation for mixed dependency types**
   - What we know: Brittleness metric uses "longest cascade chain via 'required' dependencies only"
   - What's unclear: How to count depth when optional/enhances edges exist in parallel paths
   - Recommendation: Only follow 'required' edges for brittleness calculation, ignore optional/enhances completely. If multiple required paths exist, take max depth (worst case). Document with code example.

4. **Redundancy detection threshold for input/output overlap**
   - What we know: Redundancy counts "tool pairs with matching input AND output overlap"
   - What's unclear: Does "matching" mean 100% overlap, or partial (e.g., 50%+ shared fields)?
   - Recommendation: Start with strict 100% overlap (both inputs AND outputs fully match), which indicates true redundancy. Partial overlap is coupling, not redundancy. Add partial-overlap detection to Topology tab as separate metric if needed.

## Validation Architecture

> Note: nyquist_validation setting not found in .planning/config.json — treating as enabled (default).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + React Testing Library + pytest |
| Config file | vitest.config.js (create in preview-app/), pytest.ini (exists in Cubelets MCP Tool/) |
| Quick run command | `npm test -- tool-orchestration-analyzer.test.jsx -x` (artifact), `pytest tests/test_analyze_tool_orchestration.py -x` (MCP tool) |
| Full suite command | `npm test` (artifact), `pytest tests/` (MCP server) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TO-02 | Artifact renders dependency graph from tool + dependency inputs | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_graph_rendering -x` | ❌ Wave 0 |
| TO-02 | Redundancy detection highlights tool pairs with matching I/O | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_redundancy_detection -x` | ❌ Wave 0 |
| TO-02 | Blast radius highlights downstream cascade on tool selection | integration | `npm test -- tool-orchestration-analyzer.test.jsx::test_blast_radius_cascade -x` | ❌ Wave 0 |
| TO-03 | Intervention scoring assigns correct Meadows level by action type | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_intervention_meadows_assignment -x` | ❌ Wave 0 |
| TO-04 | Worked example loads with 9 tools in pre-failed state | smoke | `npm test -- tool-orchestration-analyzer.test.jsx::test_worked_example_loads -x` | ❌ Wave 0 |
| TO-05 | Health scores calculate correctly (complexity, redundancy, brittleness, aggregate) | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_health_score_calculation -x` | ❌ Wave 0 |
| TO-06 | MCP tool accepts MCPTool + ToolDependency inputs and returns health scores | unit | `pytest tests/test_analyze_tool_orchestration.py::test_basic_health_scoring -x` | ❌ Wave 0 |
| TO-07 | MCP tool composes with compare_interventions via transformation | integration | `pytest tests/test_analyze_tool_orchestration.py::test_intervention_composition -x` | ❌ Wave 0 |
| TO-08 | Claude skill ZIP is valid and contains SKILL.md + references/ | smoke | Manual verification (extract ZIP, check structure) | manual-only |
| TO-09 | Cubelet markdown scores >= 42/60 aggregate | manual-only | Human scoring via quality rubric | manual-only |
| TO-10 | Primer panel cross-references ST-002 concepts | manual-only | Human verification of content accuracy | manual-only |

### Sampling Rate
- **Per task commit:** `npm test -- tool-orchestration-analyzer.test.jsx -x` (artifact tasks), `pytest tests/test_analyze_tool_orchestration.py -x` (MCP tool tasks)
- **Per wave merge:** Full suite for changed component (artifact or MCP)
- **Phase gate:** Full suite green (artifact + MCP) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `preview-app/src/__tests__/tool-orchestration-analyzer.test.jsx` — covers TO-02, TO-03, TO-04, TO-05
- [ ] `Cubelets MCP Tool/tests/test_analyze_tool_orchestration.py` — covers TO-06, TO-07
- [ ] `vitest.config.js` in preview-app/ — if not exists, install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Test fixtures: worked-example-tool-stack.json (9 tools, 12 dependencies) for both artifact and MCP tests

## Sources

### Primary (HIGH confidence)
- [Phase 7 data-model-specs.md](file://C:/Users/ricco/Documents/Wilson%20Consulting/obsidian-vault/Divergence%20Academy/Course%20factory/.planning/phases/07-content-foundations/data-model-specs.md) - MCPTool, ToolDependency model specifications
- [ST-004 agent-feedback-loop-builder.jsx](file://C:/Users/ricco/Documents/Wilson%20Consulting/obsidian-vault/Divergence%20Academy/Course%20factory/Interactive%20Artifact%20for%20Cubelets/agent-feedback-loop-builder.jsx) - DFS cycle detection, SVG rendering patterns, progressive disclosure UX
- [leverage-point-scorer.jsx](file://C:/Users/ricco/Documents/Wilson%20Consulting/obsidian-vault/Divergence%20Academy/Course%20factory/Interactive%20Artifact%20for%20Cubelets/leverage-point-scorer.jsx) - Meadows hierarchy array, intervention ranking
- [cubelets_mcp_server.py](file://C:/Users/ricco/Documents/Wilson%20Consulting/obsidian-vault/Divergence%20Academy/Course%20factory/Cubelets%20MCP%20Tool/files/cubelets_mcp_server.py) - compare_interventions implementation (lines 629-758), FastMCP + Pydantic patterns

### Secondary (MEDIUM confidence)
- [Topological Sorting Explained](https://medium.com/@amit.anjani89/topological-sorting-explained-a-step-by-step-guide-for-dependency-resolution-1a6af382b065) - Kahn's algorithm, dependency resolution patterns
- [Detect Cycle in a Directed Graph - GeeksforGeeks](https://www.geeksforgeeks.org/dsa/detect-cycle-in-a-graph/) - DFS cycle detection with recursion stack
- [Donella Meadows - Leverage Points: Places to Intervene in a System](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/) - Original 12-level hierarchy, tier classification
- [FastMCP Official Docs - Pydantic AI](https://ai.pydantic.dev/mcp/overview/) - FastMCP 2.x patterns, Pydantic model integration
- [Vitest vs Jest 2026 - SitePoint](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/) - Performance benchmarks, migration guidance
- [MCP Tool Input Validation Testing - MCPcat](https://mcpcat.io/guides/validation-tests-tool-inputs/) - Pytest patterns for MCP tools
- [Claude Skills vs MCP: The 2026 Guide - CometAPI](https://www.cometapi.com/claude-skills-vs-mcp-the-2026-guide-to-agentic-architecture/) - Skill workflow patterns, tool composition

### Tertiary (LOW confidence)
- [Agentic Tool-Orchestration - Emergent Mind](https://www.emergentmind.com/topics/agentic-tool-orchestration) - DAG-based workflow decomposition concept
- [Software Architecture Health Metrics - Apiumhub](https://apiumhub.com/tech-blog-barcelona/research-results-key-software-architecture-metrics/) - Complexity, coupling, and brittleness patterns
- [Progressive Disclosure Matters - AI Positive](https://aipositive.substack.com/p/progressive-disclosure-matters) - Applying 90s UX wisdom to 2026 AI agents

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - FastMCP, Pydantic, React proven in existing codebase; Vitest validated via 2026 research
- Architecture: HIGH - ST-004 precedent provides proven patterns (DFS, SVG, topological sort); data models specified in Phase 7
- Pitfalls: MEDIUM - Inferred from ST-004 code comments and 2026 research, not battle-tested in production

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (30 days — stable domain with established patterns, low churn rate)
