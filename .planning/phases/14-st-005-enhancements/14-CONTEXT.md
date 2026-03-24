# Phase 14: ST-005 Enhancements - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the existing ST-005 Tool Orchestration Analyzer artifact with side-by-side tool stack comparison (diff highlighting on dependencies, health scores, and intervention recommendations), and replace all 9 vitest Wave 0 stubs with real assertions testing actual component logic. No new cubelets, no new MCP tools.

</domain>

<decisions>
## Implementation Decisions

### Comparison Layout
- Split canvas: left/right halves each showing one stack's graph (Before / After labels)
- "Compare" is a third mode alongside "build" and "analyze" — entering it swaps the canvas for the split view
- Both canvases are read-only during comparison — exit comparison to edit
- Header bar "Snapshot Before" button (consistent with Phase 13's Import Trace placement)

### Comparison Workflow
- Snapshot + modify flow: student builds/loads a stack, clicks "Snapshot Before", modifies the stack, clicks "Compare Now"
- After snapshot, student stays on the same canvas to make modifications (not a fresh canvas)
- Natural loop: edit → snapshot → change → compare → exit → edit more → compare again

### Diff Highlighting
- Full diff: tools added/removed, dependency changes (new/removed/type changed), health score deltas
- Color coding directly on SVG nodes/edges: green border = added, red border = removed, amber border = changed
- Health scores shown as: "Before: 45 → After: 28 (↓17)" with delta for each metric (complexity, redundancy, brittleness, aggregate)

### Comparison Panel Data
- Health score deltas (Before → After with directional change) plus structural summary (tools added/removed count, dependencies changed count)
- Right panel adapts during comparison mode — Claude's discretion on whether to replace tabs or add a Compare tab

### Vitest Stubs (ST005-02)
- Replace all 9 Wave 0 stubs in preview-app/src/__tests__/tool-orchestration-analyzer.test.jsx
- Follow the pattern established in agent-feedback-loop-builder.test.jsx: source file regex inspection, no React/RTL imports needed
- Test suites: TO-02 (Graph Rendering, 3 tests), TO-03 (Intervention Scoring, 1 test), TO-04 (Worked Example, 2 tests), TO-05 (Health Scoring, 3 tests)

### Claude's Discretion
- Right panel adaptation during comparison mode (replace tabs vs add Compare tab)
- Whether to include intervention recommendation diff in comparison
- Whether to highlight property changes on tools that exist in both stacks (criticality, dependency type changes)
- Whether to include a pedagogical verdict in the comparison panel
- Whether to include blast radius comparison
- Whether to include a guided comparison scenario on the worked example
- Exit comparison behavior (return to After state vs Before state)
- Exact SVG rendering for the split canvas (scaling, spacing)
- Line budget management — 630 baseline, target ~900 with comparison feature

</decisions>

<specifics>
## Specific Ideas

- The snapshot + modify workflow mirrors how students naturally think about restructuring: "what if I change this?"
- Before/After labels frame comparison as temporal change, matching the pedagogical goal of understanding restructuring impact
- Color coding on canvases makes spatial differences immediately visible without requiring panel reading
- Health deltas with directional arrows (↓17) make improvement/regression instantly scannable

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tool-orchestration-analyzer.jsx` (630 lines): Full artifact with SVG canvas, health scoring, failure cascade, intervention system, collapsible primer
- Health scoring system (lines 157-183): Modular — can compute per-graph, making Before/After health deltas straightforward
- Failure cascade BFS (lines 124-155): Edge-type-aware propagation, reusable for blast radius comparison
- Existing worked example (lines 57-84): 9-tool MCP stack with pre-failed tool, good base for comparison demo

### Established Patterns
- 3-panel layout: toolbar (72px) + canvas (flex) + right panel (280px)
- Inline styles only (Claude.ai sandbox constraint)
- Dark cybernetic palette: #0f1117 bg, #00d4aa teal, #ff6b6b coral, #ffb347 amber, #e8ecf4 text
- Mode-based rendering: `mode === 'build'` vs `mode === 'analyze'` — adding `mode === 'compare'`
- State management: multiple focused useState hooks (14 core variables currently)
- Collapsible primer accordion with primerCollapsed state

### Integration Points
- Mode state already exists (`const [mode, setMode] = useState("build")`) — extend to include "compare"
- Canvas rendering splits into two SVG areas in compare mode
- Health scoring function can be called independently for Before and After graphs
- Right panel conditionally renders based on mode — add compare-mode panel content

### Test Infrastructure
- vitest.config.js in preview-app/ (jsdom environment, globals enabled)
- Existing real tests in agent-feedback-loop-builder.test.jsx (13 tests) and automation-debt-simulator.test.jsx (10 tests) — both use source file regex inspection pattern
- 9 stubs in tool-orchestration-analyzer.test.jsx all throw "Wave 0 stub" errors

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-st-005-enhancements*
*Context gathered: 2026-03-24*
