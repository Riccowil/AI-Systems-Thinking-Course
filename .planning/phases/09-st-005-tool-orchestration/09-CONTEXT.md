# Phase 9: ST-005 Tool Orchestration - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete three-layer stack for ST-005 Tool Orchestration as System Design: interactive JSX artifact (tool dependency graph analyzer), MCP tool (analyze_tool_orchestration), Claude skill (tool-stack-analyzer.skill), and cubelet markdown (6 faces). Students input MCP tools and dependencies, see a dependency graph with redundancy/coupling/blast radius analysis, and score interventions using Meadows hierarchy. This is the highest-complexity cubelet at ~12 minutes.

</domain>

<decisions>
## Implementation Decisions

### Dependency Graph Visualization
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

### Failure Simulation Mode
- Toggle tool failure: click 'break' icon on any tool — tool turns red
- Graduated cascade based on dependency type: required = red (broken), optional = amber (degraded), enhances = green (unaffected)
- Single 'Reset' button in toolbar clears all failure states
- Students can break and reset repeatedly to explore different failure scenarios

### Build vs Analyze Modes
- Two modes with toolbar toggle: Build mode (add tools, draw dependency edges, set types) and Analyze mode (blast radius, failure sim, health scores)
- Worked example auto-starts in analyze mode — students explore analysis FIRST
- 'Start Fresh' button clears canvas and switches to build mode for practice
- 'Keep Example + Add' option lets students extend the worked example

### Tool Input Form
- Adding a custom tool requires: name + criticality dropdown (low/medium/high) only
- Advanced fields (server, inputs, outputs, latency, description) hidden behind 'Advanced' toggle
- Minimum viable tool node in 2 clicks

### Health Scoring Algorithm
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

### Worked Example Design
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

### Intervention Scoring UX
- Click tool in analyze mode → right panel shows 'Add Intervention' → select action type: Add tool, Remove tool, Refactor dependency, Add cache/fallback
- System assigns Meadows level based on action type
- Progressive disclosure: student predicts Meadows level (L1-L12 slider/dropdown) BEFORE system reveals actual level — comparison shown (green check if close, red X if far)
- Before/after health score comparison: when intervention is added, scores show current value AND projected value side by side with delta (e.g., "Brittleness: 78 → 45 (↓33)")

### Right Panel Organization
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `compare_interventions` MCP tool (cubelets_mcp_server.py:629-758): Meadows hierarchy scoring with composite_score = (meadows_score * 0.6) + (leverage * 0.4). ST-005's analyze_tool_orchestration composes with this via TO-07.
- `feedback-loop-builder.jsx`: DFS cycle detection (lines 41-74), quadratic Bezier edge routing (lines 84-99), pulse animation pattern, 3-panel SVG layout
- `agent-feedback-loop-builder.jsx`: Shape-coded nodes (SHAPE_SPECS), severity scoring (gain * 100), tabbed right panel, worked example preloading, progressive disclosure UX
- `leverage-point-scorer.jsx`: MEADOWS_HIERARCHY array (12 levels with labels and tiers) — reuse for intervention ranking display
- `CausalLink`, `Polarity`, `ResponseFormat` Pydantic models — reuse directly
- MCPTool and ToolDependency data model specs from Phase 7 data-model-specs.md (field types, validation rules, examples)

### Established Patterns
- 3-panel layout: left toolbar (~72px) + central SVG canvas (flex) + right panel (~280px)
- DFS cycle finding with deduplication by sorted node set
- Topological sort layout fallback (used in ST-004 instead of dagre)
- Inline styles only in React artifacts (no external CSS)
- Dark cybernetic palette: #0f1117 (bg), #161922 (panel), #00d4aa (teal), #ff6b6b (coral), #6b8aff (blue), #e8ecf4 (text), #4a5270 (muted)
- FastMCP + Pydantic models with ConfigDict(str_strip_whitespace=True)
- Severity scoring: product of coupling strengths, 0-100 scale, Low/Medium/High labels
- ST-004 artifact compressed to 546 lines — ST-005 should target similar size constraint

### Integration Points
- `cubelets-mcp/server.py` — add `analyze_tool_orchestration` tool alongside existing tools + compose with `compare_interventions`
- Phase 7 specs: `data-model-specs.md` (MCPTool, ToolDependency models), `agent-visual-vocabulary.md` (tool rectangle shape with teal stroke)
- `preview-app/App.jsx` — ST-005 tab added in Phase 11

</code_context>

<specifics>
## Specific Ideas

- The worked example uses the ACTUAL course tool stack — meta-learning: "analyze the tools you're learning with." Students recognize every tool in the example because they've been using them.
- create_causal_loop pre-failed on first load creates an immediate dramatic first impression: "this single tool failure breaks 5 other tools." The lesson IS the first thing you see.
- Including all 9 tools (6 existing + 3 planned with dashed borders) shows students the growth trajectory of the tool stack — aspirational and authentic.
- Graduated cascade (required=red, optional=amber, enhances=green) teaches that dependency TYPE determines blast radius severity — not all dependencies are equal.
- The before/after health score delta ("Brittleness: 78 → 45 (↓33)") makes interventions feel concrete and measurable, not abstract. Students see the NUMBERS change.
- Two modes (build vs analyze) prevent accidental tool creation while exploring, and the worked example starting in analyze mode means students see the answer before building their own.
- Intervention prediction (predict Meadows level before reveal) is the core progressive disclosure moment — "Is removing a tool a parameter tweak or a structural change?"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-st-005-tool-orchestration*
*Context gathered: 2026-03-21*
