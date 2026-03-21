# Phase 8: ST-004 Pathfinder (Agent Feedback Loops) - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete three-layer stack for ST-004 Agent Feedback Loops: interactive JSX artifact (agent CLD builder), MCP tool (analyze_agent_feedback_loops), Claude skill (agent-feedback-analyzer.skill), and cubelet markdown (6 faces). This is the pathfinder cubelet — validates the dual-domain cubelet format before ST-005 and ST-006 proceed.

</domain>

<decisions>
## Implementation Decisions

### Severity Scoring Model
- Severity based on loop gain only (product of coupling strengths around the cycle) — reuses existing score_reinforcing_loops calculation
- No node-type weighting or cycle-length adjustment — keep it simple and proven
- Display: numeric score 0-100 with severity label (Low 0-33, Medium 34-66, High 67-100)
- Auto-generated intervention suggestions for high-severity loops: identify highest-gain link and suggest weakening it (e.g. "Add rate limiting between Agent and Tool to reduce coupling")
- MCP tool returns identical severity scores and loop classifications as the artifact — no extra depth, consistency between visual and programmatic

### Worked Example Design
- Retry storm scenario with 5-6 nodes: Agent, Tool, Rate Limiter, Timeout, Error Handler, optional Memory
- Two loops: one reinforcing (retry storm escalation) + one balancing (rate limiting dampening)
- Pre-loaded with full annotation: loops highlighted with pulse animation, severity scores visible in right panel, polarity labels on all edges
- Fits within ~8 minute cubelet time target
- Student sees the complete analysis on the worked example before building their own

### Progressive Disclosure UX
- Student predicts loop type (reinforcing vs balancing) AND behavior (grows, stabilizes, oscillates) via simple dropdown per detected loop
- Prediction required before algorithmic analysis is revealed — artifact does NOT show analysis until student commits
- Reveal: right panel animates in the algorithmic analysis next to student's prediction with comparison (green check / red X per loop, "You predicted: X, Actual: Y")
- Two modes: worked example (pre-analyzed, student studies it) vs practice mode (student builds, predicts, then reveals)

### Right Panel Instrumentation
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `feedback-loop-builder.jsx` — Full SVG canvas with DFS cycle detection, node drag, edge rendering, pulse animations. ST-004 extends this with shape-coded nodes instead of circles.
- `score_reinforcing_loops` MCP tool — DFS graph traversal, loop gain calculation, variable participation. ST-004's `analyze_agent_feedback_loops` wraps this via AgentLink.to_causal_link() composition.
- `CausalLink`, `Polarity`, `ResponseFormat` models — reused directly
- ST-001 cubelet markdown — template for 6-face structure, scored 53/60
- Existing .skill ZIP format — SKILL.md + references/ subfolder

### Established Patterns
- 3-panel SVG layout: left toolbar (72px) + central canvas (flex) + right panel (260-280px)
- DFS cycle finding with deduplication by sorted node set
- Polarity rule: even negatives = reinforcing, odd = balancing
- Quadratic Bezier curves with auto-routing for bidirectional edges
- Pulse animation on detected loop edges (3x repeat, 1.5s duration)
- Interaction modes: add, connect, move, delete (toolbar-based)
- FastMCP + Pydantic models with ConfigDict(str_strip_whitespace=True)
- Inline styles only in React artifacts (no external CSS)

### Integration Points
- `cubelets-mcp/server.py` — add `analyze_agent_feedback_loops` tool alongside existing 3 tools
- Phase 7 specs: `data-model-specs.md` (AgentComponent, AgentLink models), `agent-visual-vocabulary.md` (SVG shapes/colors), `agent-experience-checkpoint.md` (primer content)
- `preview-app/App.jsx` — will add ST-004 tab in Phase 11

</code_context>

<specifics>
## Specific Ideas

- The worked example should tell a story: "An agent tries to call a tool, fails, retries, hits rate limits, which increases timeouts, which triggers more retries" — students should feel the escalation
- Progressive disclosure creates a "moment of truth" — students commit their prediction then see if they were right. This is the pedagogical core of the artifact.
- The primer panel being collapsible at the top of the right panel means students who need it can access it without it being in the way of students who don't
- This is the pathfinder: if the artifact feels too complex for 8 minutes, that signal should feed back into ST-005 and ST-006 design

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-st-004-pathfinder*
*Context gathered: 2026-03-21*
