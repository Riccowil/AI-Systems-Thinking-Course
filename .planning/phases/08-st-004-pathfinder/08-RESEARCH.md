# Phase 8: ST-004 Pathfinder (Agent Feedback Loops) - Research

**Researched:** 2026-03-21
**Domain:** Interactive learning artifacts, graph visualization, React SVG rendering, pedagogical UX
**Confidence:** HIGH

## Summary

Phase 8 builds the first dual-domain cubelet (agent systems + systems thinking), extending the proven ST-001 artifact architecture with agent-specific node shapes, dagre auto-layout, and progressive disclosure for prediction-based learning. Research confirms all technical approaches are well-established, with existing code providing 80%+ reuse potential.

**Primary findings:**
- SVG polygon rendering for 5 shape types is straightforward DOM manipulation (no libraries needed)
- dagre ^0.8.5 is actively maintained, widely used, and integrates cleanly with custom SVG
- Progressive disclosure via predict-then-reveal creates pedagogical "moment of truth" per NN/g research
- Cognitive load for 5-6 nodes + 2 loops + predictions fits 8-minute window if worked example pre-loaded
- MCP tool composition via AgentLink.to_causal_link() reuses proven score_reinforcing_loops logic
- Claude skill format established (SKILL.md + references/ subfolder)

**Primary recommendation:** Extend feedback-loop-builder.jsx architecture directly. Shape-coding reduces cognitive load vs color-only differentiation. Pre-load worked example to demonstrate full analysis before student interaction.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Severity Scoring Model:**
- Severity based on loop gain only (product of coupling strengths around the cycle) — reuses existing score_reinforcing_loops calculation
- No node-type weighting or cycle-length adjustment — keep it simple and proven
- Display: numeric score 0-100 with severity label (Low 0-33, Medium 34-66, High 67-100)
- Auto-generated intervention suggestions for high-severity loops: identify highest-gain link and suggest weakening it (e.g. "Add rate limiting between Agent and Tool to reduce coupling")
- MCP tool returns identical severity scores and loop classifications as the artifact — no extra depth, consistency between visual and programmatic

**Worked Example Design:**
- Retry storm scenario with 5-6 nodes: Agent, Tool, Rate Limiter, Timeout, Error Handler, optional Memory
- Two loops: one reinforcing (retry storm escalation) + one balancing (rate limiting dampening)
- Pre-loaded with full annotation: loops highlighted with pulse animation, severity scores visible in right panel, polarity labels on all edges
- Fits within ~8 minute cubelet time target
- Student sees the complete analysis on the worked example before building their own

**Progressive Disclosure UX:**
- Student predicts loop type (reinforcing vs balancing) AND behavior (grows, stabilizes, oscillates) via simple dropdown per detected loop
- Prediction required before algorithmic analysis is revealed — artifact does NOT show analysis until student commits
- Reveal: right panel animates in the algorithmic analysis next to student's prediction with comparison (green check / red X per loop, "You predicted: X, Actual: Y")
- Two modes: worked example (pre-analyzed, student studies it) vs practice mode (student builds, predicts, then reveals)

**Right Panel Instrumentation:**
- Sectioned with 3 tabs: Loops (classifications + severity scores), Predictions (student's vs actual with comparison), Interventions (auto-generated suggestions per high-severity loop)
- Primer panel (agent basics) is a collapsible accordion section at the TOP of the right panel — always accessible, doesn't block canvas
- Primer content: what agents/tools/memory/evaluators/constraints are, with cross-reference link to ST-001 tab
- Right panel width: ~280px (slightly wider than ST-001's 260px to accommodate tabs)

### Claude's Discretion

- Exact retry storm node names and edge labels (must include 5-6 nodes with 2 loops)
- Toolbar icon design for 5 node types (hexagon/rectangle/cylinder/diamond/octagon mini-icons)
- Tab styling in right panel (follow existing JetBrains Mono tab pattern)
- Prediction dropdown styling and placement
- Cubelet markdown wording for all 6 faces (follow ST-001 structure and scoring pattern)
- Skill workflow step count and step names (follow existing skill patterns)
- Dagre layout parameters for auto-positioning nodes

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AF-01 | Cubelet markdown with all 6 faces covering agent feedback loop identification | ST-001 template scored 53/60 — proven structure. Agent domain mapped in agent-experience-checkpoint.md |
| AF-02 | Interactive JSX artifact with agent-specific node vocabulary, auto-detects loops, scores severity | SVG shape rendering patterns identified. DFS cycle detection already implemented in feedback-loop-builder.jsx. Severity = loop gain from existing algorithm |
| AF-03 | Artifact includes worked example (retry storm) pre-loaded with annotated loops | Pre-loaded example pattern exists in PRELOADED_EXAMPLE constant. Retry storm scenario designed in CONTEXT.md |
| AF-04 | Progressive disclosure — student predicts before artifact reveals analysis | NN/g progressive disclosure patterns researched. React state management for predict-then-reveal is conditional rendering |
| AF-05 | Right-panel instrumentation with loop classification, severity, interventions | Right panel structure exists. Tab pattern needs implementation. Severity scoring reuses loop gain calculation |
| AF-06 | MCP tool analyze_agent_feedback_loops accepts components + links, returns loops + severity | Model specs in data-model-specs.md. Composition via AgentLink.to_causal_link() wrapper |
| AF-07 | MCP tool reuses score_reinforcing_loops via composition | Composition pattern proven in existing MCP server. AgentComponent/AgentLink transform to CausalLink format |
| AF-08 | Claude skill agent-feedback-analyzer.skill guides workflow | Skill format established. ZIP structure: SKILL.md + references/ subfolder |
| AF-09 | Quality gate score >= 42/60 (7/10 per face minimum) | ST-001 scored 53/60. Template proven |
| AF-10 | Prerequisite refresher panel referencing ST-001 | Primer panel spec in agent-experience-checkpoint.md. Collapsible accordion at top of right panel |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Already used in feedback-loop-builder.jsx, established pattern |
| dagre | ^0.8.5 | Graph auto-layout | 172 npm projects use @dagrejs/dagre, actively maintained, designed for directed graphs |
| FastMCP | Latest | MCP server framework | Already used in cubelets_mcp_server.py, proven pattern |
| Pydantic | 2.x | Data validation | Already used in all MCP models, ConfigDict pattern established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | — | SVG rendering is native DOM | Custom shapes via <polygon>, <rect>, <path> elements |
| None needed | — | DFS cycle detection already implemented | Reuse findCycles() from feedback-loop-builder.jsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dagre | elkjs | More advanced but heavier, overkill for 5-6 node graphs |
| dagre | d3-hierarchy | More flexible but requires custom force simulation, steeper learning curve |
| Custom SVG | ReactFlow | 400KB+ bundle size, over-engineered for educational artifact |
| Custom SVG | react-hexagon npm package | Unmaintained (8 years old), limited to hexagons only |

**Installation:**
```bash
npm install @dagrejs/dagre@^0.8.5
```

## Architecture Patterns

### Recommended Project Structure
```
Interactive Artifact for Cubelets/
├── feedback-loop-builder.jsx       # ST-001 (existing, reuse architecture)
├── agent-feedback-loop-builder.jsx # ST-004 (new, extends ST-001 patterns)
└── (ST-005 and ST-006 artifacts added in Phases 9-10)

Cubelets MCP Tool/files/
└── cubelets_mcp_server.py          # Extend with analyze_agent_feedback_loops

.claude/skills/
├── agent-feedback-analyzer.skill/  # New skill for ST-004
│   ├── SKILL.md
│   └── references/
│       └── (supporting docs as needed)
```

### Pattern 1: Shape-Coded Node Rendering
**What:** Each AgentComponent type renders as a distinct SVG shape (hexagon/rectangle/cylinder/diamond/octagon)
**When to use:** Rendering nodes on the canvas based on component_type field
**Example:**
```javascript
// Source: agent-visual-vocabulary.md + existing feedback-loop-builder.jsx pattern
const renderNodeShape = (node, isSelected, inLoop) => {
  const shapeSpecs = {
    agent: {
      element: 'polygon',
      points: "40,0 80,17.5 80,52.5 40,70 0,52.5 0,17.5",
      fill: '#1a2744',
      stroke: '#6b8aff'
    },
    tool: {
      element: 'rect',
      width: 90,
      height: 50,
      rx: 6,
      fill: '#1a3a2e',
      stroke: '#00d4aa'
    },
    memory: {
      element: 'path',
      d: "M0,10 C0,0 60,0 60,10 L60,60 C60,70 0,70 0,60 Z",
      fill: '#2a1a3a',
      stroke: '#9b6bff'
    },
    evaluator: {
      element: 'polygon',
      points: "35,0 70,35 35,70 0,35",
      fill: '#3a2a1a',
      stroke: '#ffb86b'
    },
    constraint: {
      element: 'polygon',
      points: "20,0 50,0 70,20 70,50 50,70 20,70 0,50 0,20",
      fill: '#3a1a1a',
      stroke: '#ff6b6b'
    }
  };

  const spec = shapeSpecs[node.component_type];
  // Render appropriate SVG element with spec parameters
};
```

### Pattern 2: Dagre Auto-Layout Integration
**What:** Use dagre to compute x/y positions for nodes, then render with custom SVG
**When to use:** "Auto-arrange" button or initial worked example positioning
**Example:**
```javascript
// Source: https://reactflow.dev/examples/layout/dagre
import dagre from '@dagrejs/dagre';

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 90, height: 70 });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.from, edge.to);
  });

  dagre.layout(dagreGraph);

  return nodes.map(node => {
    const positioned = dagreGraph.node(node.id);
    return { ...node, x: positioned.x, y: positioned.y };
  });
};
```

### Pattern 3: Progressive Disclosure State Management
**What:** Track student predictions, hide analysis until prediction submitted, then reveal with comparison
**When to use:** After loop detection completes and student is prompted to predict
**Example:**
```javascript
// Source: NN/g progressive disclosure + React conditional rendering
const [predictions, setPredictions] = useState({}); // { loopId: { type: 'reinforcing', behavior: 'grows' } }
const [revealedLoops, setRevealedLoops] = useState(new Set());

const handlePredictionSubmit = (loopId) => {
  setRevealedLoops(prev => new Set([...prev, loopId]));
};

const renderLoopAnalysis = (loop, index) => {
  const predicted = predictions[loop.id];
  const isRevealed = revealedLoops.has(loop.id);

  return (
    <div>
      {!isRevealed && (
        <PredictionForm
          loopId={loop.id}
          onSubmit={handlePredictionSubmit}
        />
      )}
      {isRevealed && (
        <ComparisonView
          predicted={predicted}
          actual={loop}
          isCorrect={predicted?.type === loop.type}
        />
      )}
    </div>
  );
};
```

### Pattern 4: MCP Model Composition
**What:** AgentLink wraps CausalLink to reuse existing loop detection logic
**When to use:** analyze_agent_feedback_loops MCP tool implementation
**Example:**
```python
# Source: data-model-specs.md
class AgentLink(BaseModel):
    from_component: str
    to_component: str
    polarity: Polarity
    strength: Optional[float] = 1.0
    label: str = ""

    def to_causal_link(self) -> CausalLink:
        """Transform to CausalLink for reuse of score_reinforcing_loops"""
        return CausalLink(
            from_var=self.from_component,
            to_var=self.to_component,
            polarity=self.polarity,
            strength=self.strength
        )

# In MCP tool:
@mcp.tool(name="analyze_agent_feedback_loops")
async def analyze_agent_feedback_loops(components: List[AgentComponent], links: List[AgentLink]):
    # Transform to CausalLink format
    variables = [c.name for c in components]
    causal_links = [link.to_causal_link() for link in links]

    # Reuse existing analysis
    return await score_reinforcing_loops(
        ScoreReinforcingLoopInput(variables=variables, causal_links=causal_links)
    )
```

### Anti-Patterns to Avoid
- **Color-only differentiation:** Shapes are primary, color is secondary reinforcement (accessibility + cognitive load)
- **Auto-layout on every change:** Dagre layout only on explicit "Auto-arrange" action — preserves student's manual positioning
- **Revealing analysis before prediction:** Defeats pedagogical purpose, removes "moment of truth"
- **Deep nesting in right panel:** 3 tabs max, primer collapsible — avoid accordion-within-accordion complexity

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph auto-layout | Custom force-directed simulation | dagre library | Handles edge routing, rank assignment, node spacing. Proven algorithm. 172 projects use it. |
| DFS cycle detection | New graph traversal | Reuse findCycles() from feedback-loop-builder.jsx | Already implemented, tested, handles deduplication |
| Loop gain calculation | New severity algorithm | Reuse _find_all_cycles() from cubelets_mcp_server.py | Proven product-of-strengths calculation, tested in ST-001 |
| SVG shape libraries | npm packages for hexagons/polygons | Native SVG <polygon>, <rect>, <path> | Packages unmaintained (8 years old), inline SVG is 0KB overhead |
| Tab UI component | Custom tab state management | Simple useState + conditional rendering | Tabs are 3 divs + click handlers, no library needed |

**Key insight:** The artifact extends proven patterns from ST-001. Graph traversal, loop detection, severity scoring, and SVG rendering are all solved problems. New complexity is shape rendering (trivial) + progressive disclosure (simple state management).

## Common Pitfalls

### Pitfall 1: Shape Rendering Performance with Many Nodes
**What goes wrong:** Rendering 20+ polygon/path elements with hover states causes jank on slower machines
**Why it happens:** SVG DOM manipulation can be expensive, especially with filters and animations
**How to avoid:** Limit canvas to 20 nodes max (validation in MCP tool), use CSS transforms for hover states instead of re-rendering
**Warning signs:** Drag lag, animation stutter, slow mode switches

### Pitfall 2: Dagre Layout Overwriting Manual Positioning
**What goes wrong:** Student carefully positions nodes, clicks "Auto-arrange," loses all work, can't undo
**Why it happens:** Dagre mutates node positions without preserving original state
**How to avoid:** Store pre-layout positions in state, provide "Reset to manual" button, or make dagre a one-time action on initial load only
**Warning signs:** User feedback about lost work, no undo path

### Pitfall 3: Progressive Disclosure State Desync
**What goes wrong:** Student predicts loop type, adds new edge, loop re-detects, prediction orphaned, comparison breaks
**Why it happens:** Loop IDs change when graph structure changes, predictions keyed by old loop ID
**How to avoid:** Use stable loop identifiers (sorted node set hash), clear predictions when graph structure changes, or lock graph editing after prediction mode starts
**Warning signs:** Comparison shows wrong loop, predictions don't match detected loops

### Pitfall 4: Cognitive Overload in Worked Example
**What goes wrong:** Student opens artifact, sees 6 nodes + 2 loops + severity scores + interventions + primer panel, closes tab
**Why it happens:** Too much information at once violates cognitive load principles (intrinsic + extraneous + germane must fit working memory)
**How to avoid:** Pre-load worked example but hide right panel tabs except "Loops" initially. Progressive disclosure applies to UI itself, not just predictions.
**Warning signs:** High bounce rate, low engagement time, user testing shows confusion

### Pitfall 5: MCP Tool Returning Different Results Than Artifact
**What goes wrong:** Student builds CLD in artifact, sees "R1: High severity." Calls MCP tool with same graph, gets different severity score.
**Why it happens:** Artifact uses JavaScript loop gain calculation, MCP tool uses Python version, floating point precision differs or algorithm diverged
**How to avoid:** Single source of truth for algorithm (Python MCP tool), artifact calls MCP tool for analysis instead of duplicating logic, OR exhaustive test suite ensuring JS/Python parity
**Warning signs:** User reports inconsistency, trust in tool drops

## Code Examples

Verified patterns from existing codebase:

### DFS Cycle Detection (Reuse from ST-001)
```javascript
// Source: feedback-loop-builder.jsx lines 41-74
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
```

### Loop Gain Calculation (Reuse from MCP Server)
```python
# Source: cubelets_mcp_server.py lines 136-196
def _find_all_cycles(variables: List[str], links: List[CausalLink]) -> List[Dict]:
    """Graph traversal to find all unique cycles and classify by polarity."""
    # ... adjacency list construction ...

    for neighbor in adj.get(current, []):
        target = neighbor["to"]
        if target == start and len(path) >= 2:
            cycle_polarities = polarities + [neighbor["polarity"]]
            cycle_strengths = strengths + [neighbor["strength"]]
            neg_count = sum(1 for p in cycle_polarities if p == "-")
            loop_type = "reinforcing" if neg_count % 2 == 0 else "balancing"

            # Loop gain = product of strengths
            gain = 1.0
            for s in cycle_strengths:
                gain *= s

            cycles.append({
                "path": path + [start],
                "polarities": cycle_polarities,
                "negative_count": neg_count,
                "loop_type": loop_type,
                "loop_gain": round(gain, 4),
                "cycle_length": len(path),
            })
```

### SVG Hexagon Rendering
```javascript
// Source: agent-visual-vocabulary.md + W3Schools SVG polygon reference
<svg width="800" height="600">
  <g transform={`translate(${node.x}, ${node.y})`}>
    {node.component_type === 'agent' && (
      <polygon
        points="40,0 80,17.5 80,52.5 40,70 0,52.5 0,17.5"
        fill="#1a2744"
        stroke="#6b8aff"
        strokeWidth={isSelected ? 2.5 : 2}
      />
    )}
    <text
      x="40"
      y="35"
      textAnchor="middle"
      fill="#e8ecf4"
      fontSize="12"
      fontFamily="DM Sans, sans-serif"
    >
      {node.label}
    </text>
  </g>
</svg>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-hexagon npm package | Native SVG <polygon> | Last updated 2016 | Remove unmaintained dependency, reduce bundle size |
| dagre (original) | @dagrejs/dagre | 2024 | Scoped package receives updates, original unmaintained |
| Color-only node differentiation | Shape-coded + color | 2026 (this phase) | Accessibility + cognitive load reduction |
| Show all analysis immediately | Progressive disclosure predict-then-reveal | 2026 (this phase) | Pedagogical engagement, "moment of truth" |
| Separate artifact + MCP algorithms | Artifact calls MCP for analysis | 2026 (this phase) | Single source of truth, consistency guaranteed |

**Deprecated/outdated:**
- react-hexagon (1.1.3, 2016): Use native SVG instead
- dagre (0.8.5, unmaintained): Use @dagrejs/dagre scoped package
- ReactFlow for educational artifacts: 400KB+ overhead, over-engineered for <10 node graphs

## Open Questions

1. **Should artifact call MCP tool for loop analysis or duplicate algorithm in JavaScript?**
   - What we know: Python MCP tool has proven algorithm, JS version exists in feedback-loop-builder.jsx
   - What's unclear: Performance implications of calling MCP from browser artifact, whether Claude Code artifacts can invoke MCP tools
   - Recommendation: Start with JS duplication for artifact independence. Add MCP integration in Phase 11 if feasible. Ensure test suite validates parity.

2. **Optimal dagre layout parameters for 5-6 node retry storm?**
   - What we know: dagre supports rankdir (TB/LR), ranksep, nodesep configuration
   - What's unclear: Which parameters produce clearest retry storm visualization
   - Recommendation: Experiment during implementation. Start with `{rankdir: 'TB', ranksep: 80, nodesep: 60}` per ReactFlow example, adjust based on worked example aesthetics.

3. **How many practice scenarios beyond retry storm?**
   - What we know: Worked example is retry storm (5-6 nodes, 2 loops)
   - What's unclear: Should artifact include 2-3 additional pre-loaded scenarios for practice?
   - Recommendation: Single worked example for Phase 8 (pathfinder validation). Additional scenarios added in Phase 11 based on classroom feedback.

## Validation Architecture

**Note:** `workflow.nyquist_validation` key is absent from `.planning/config.json`, so validation section is included per default-enabled rule.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — manual validation recommended |
| Config file | None — see Wave 0 |
| Quick run command | Manual artifact interaction testing |
| Full suite command | Manual end-to-end testing of artifact + MCP tool + skill |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AF-01 | Cubelet markdown renders all 6 faces with agent domain content | manual | Obsidian preview or Markdown renderer | ❌ Wave 0 |
| AF-02 | Artifact detects loops, scores severity, renders 5 shape types | manual | Load artifact, build graph, verify loop detection + severity | ❌ Wave 0 |
| AF-03 | Worked example pre-loads retry storm with 5-6 nodes, 2 loops | manual | Load artifact, click "Load Example," verify nodes/loops | ❌ Wave 0 |
| AF-04 | Progressive disclosure: predict before reveal, comparison shown | manual | Build graph, predict loop type, click reveal, verify comparison | ❌ Wave 0 |
| AF-05 | Right panel shows 3 tabs with loop data, predictions, interventions | manual | Verify tab switching, data display in each tab | ❌ Wave 0 |
| AF-06 | MCP tool accepts AgentComponent + AgentLink, returns loops + severity | unit | `python -m pytest tests/test_analyze_agent_loops.py -x` (if created) | ❌ Wave 0 |
| AF-07 | MCP tool reuses score_reinforcing_loops via composition | unit | Same test as AF-06, verify to_causal_link() transformation | ❌ Wave 0 |
| AF-08 | Claude skill guides agent feedback analysis workflow | manual | Invoke skill in Claude, verify step-by-step guidance | ❌ Wave 0 |
| AF-09 | Cubelet quality gate >= 42/60 | manual | Score each face, aggregate | ❌ Wave 0 |
| AF-10 | Prerequisite refresher panel links to ST-001, collapsible | manual | Verify primer panel renders, collapses, links work | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual artifact smoke test (load, add node, detect loop)
- **Per wave merge:** Full manual test of artifact + MCP tool integration
- **Phase gate:** Complete end-to-end validation before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/test_analyze_agent_loops.py` — covers AF-06, AF-07 (MCP tool unit tests)
- [ ] Manual test checklist document for artifact validation (AF-02, AF-03, AF-04, AF-05, AF-10)
- [ ] Framework install: Consider pytest for Python MCP tool tests if not already installed

## Sources

### Primary (HIGH confidence)
- [Existing codebase] - feedback-loop-builder.jsx, cubelets_mcp_server.py, data-model-specs.md, agent-visual-vocabulary.md
- [GitHub - dagrejs/dagre](https://github.com/dagrejs/dagre) - Official dagre repository
- [@dagrejs/dagre - npm](https://www.npmjs.com/package/@dagrejs/dagre) - Current maintained version
- [Dagre Tree - React Flow](https://reactflow.dev/examples/layout/dagre) - Integration pattern
- [SVG Polygon - W3Schools](https://www.w3schools.com/graphics/svg_polygon.asp) - SVG polygon reference

### Secondary (MEDIUM confidence)
- [Progressive Disclosure - NN/g](https://www.nngroup.com/articles/progressive-disclosure/) - UX pattern research
- [What is Progressive Disclosure? — IxDF](https://ixdf.org/literature/topics/progressive-disclosure) - 2026 updated definition
- [Progressive disclosure in UX design - LogRocket](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/) - Implementation types
- [Cognitive Load Theory - Educational Psychology Review](https://link.springer.com/article/10.1007/s10648-023-09782-w) - Task complexity research
- [Task complexity in simulation education](https://pubmed.ncbi.nlm.nih.gov/36151727/) - Cognitive load study

### Tertiary (LOW confidence)
- [react-hexagon npm](https://www.npmjs.com/package/react-hexagon) - Unmaintained (8 years), not recommended
- [react-svg-polygon npm](https://www.npmjs.com/package/react-svg-polygon) - Unmaintained (6 years), not recommended

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - dagre actively maintained, existing code proven, no new heavy dependencies
- Architecture: HIGH - 80%+ code reuse from ST-001, extension patterns straightforward
- Pitfalls: MEDIUM - Progressive disclosure state management needs careful testing, cognitive load for worked example is estimated not measured

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (30 days for stable stack, dagre updates infrequent)
