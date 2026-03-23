# Phase 13: ST-004 Enhancements - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the existing ST-004 Agent Feedback Loops artifact with three features: JSON trace import with auto-CLD mapping, cost/latency overlay on nodes, and expanded primer panel matching ST-005's depth. No new cubelets, no new MCP tools — enriches the existing interactive artifact only.

</domain>

<decisions>
## Implementation Decisions

### Trace Import — Input Method
- Both paste JSON (textarea in modal) AND file upload (.json picker) available in the same import modal
- "Import Trace" button placed as header action above the canvas (not in the drawing toolbar) — signals a different workflow than building
- 2-3 built-in sample traces shipped with the artifact: Retry Storm, RAG Pipeline, Multi-tool Agent
- Sample traces accessible via dropdown/buttons inside the import modal — one-click to load

### Trace Import — Schema & Validation
- Generic JSON schema only: `{agent, steps: [{tool_call, timestamp, tokens}]}`
- No framework-specific parsers (LangSmith, CrewAI, etc.) — per REQUIREMENTS.md out-of-scope ruling
- Strict validation with helpful error messages: rejection shows exactly what's missing with a valid JSON snippet example
- Validation errors are educational — turns failures into schema documentation

### Trace Import — Canvas Behavior
- Import replaces the current canvas (nodes and edges cleared, trace CLD loaded)
- "Undo Import" button appears in toolbar after import — caches previous state for one-action restore
- "Load Example" button continues to work as before — reloads the original worked example
- Auto-detect feedback loops immediately on import — loops tab populates, severity scores visible
- Predictions tab available but NOT required for imported traces (optional progressive disclosure)

### Trace Import — Two Learning Paths
- **Build + Predict** (existing flow): Student constructs CLD, makes predictions, reveals analysis. Progressive disclosure gated on predictions.
- **Import + Explore** (new flow): Student imports trace, sees analysis immediately. Predictions optional. Learning goal is understanding real systems, not practicing loop identification.

### Cost/Latency Overlay — Data Sources
- **Worked example**: pre-filled with sample cost/latency values (demonstrates overlay immediately)
- **Imported traces**: real data extracted from JSON (timestamps → latency, token fields → cost)
- **Hand-built CLDs**: no cost/latency data — overlay toggle disabled/hidden

### Cost/Latency Overlay — Aggregate Summary
- Summary bar at top or bottom of canvas showing total tokens, total time, and cost estimate
- Visible only when overlay is active

### Cost/Latency Overlay — Visual Design
- Claude's discretion: badge placement, color gradient, toggle style (single vs separate)
- Must fit within the dark cybernetic aesthetic (teal/coral/amber accents)

### Primer Panel Expansion
- Claude decides content structure and UX (sub-sections with expand/collapse vs single block)
- Content should include: Meadows hierarchy quick reference with agent-specific examples, loop pattern mini-examples, intervention strategy guidance
- Cross-references to both ST-001 (loop polarity basics) and ST-002 (Meadows hierarchy)
- ST-004 primer expansion ONLY — ST-005 primer changes belong in Phase 14
- Primer remains collapsible accordion at top of right panel (existing pattern)

### Artifact Size Budget
- Soft target of ~900 lines (currently 546)
- ~350 lines of headroom for all three features
- Flex to ~950 if needed; investigate and compress if approaching 1000+

### Claude's Discretion
- Exact trace JSON schema field names and nesting (must include agent name, steps with tool_call, timestamp, tokens)
- Sample trace content for the 2-3 built-in examples
- Cost/latency overlay visual design (badge style, color mapping, toggle UX)
- Primer panel content organization (sub-sections vs single block)
- Primer panel wording and depth of Meadows/loop pattern content
- Summary bar positioning and styling
- How to compress existing code if needed to stay within line budget

</decisions>

<specifics>
## Specific Ideas

- The two learning paths (Build+Predict vs Import+Explore) serve different pedagogical goals: one practices identification, the other practices understanding real systems
- Sample traces lower the barrier to entry — students see import working before needing their own data
- Strict validation with helpful errors turns malformed input into a teaching moment about trace schemas
- The summary bar makes cost/latency feel concrete — "your agent spent 4.2k tokens in 1.3 seconds" is more impactful than per-node numbers alone
- Header-level "Import Trace" button keeps drawing tools focused on canvas manipulation

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agent-feedback-loop-builder.jsx` (546 lines): Full artifact with SVG canvas, DFS cycle detection, worked example, progressive disclosure, tabbed right panel (loops/predictions/interventions), collapsible primer
- Existing primer panel code (line 426-437): Collapsible accordion pattern with primerCollapsed state — extend, don't rewrite
- Existing worked example preload pattern: WORKED_EXAMPLE constant with pre-defined nodes/edges — sample traces follow similar pattern
- DFS loop detection (inherited from feedback-loop-builder.jsx): Already handles auto-detection — reuse for imported traces

### Established Patterns
- 3-panel layout: toolbar (72px) + canvas (flex) + right panel (280px)
- Inline styles only (Claude.ai sandbox constraint)
- Dark cybernetic palette: #0f1117 bg, #00d4aa teal, #ff6b6b coral, #e8ecf4 text
- Progressive disclosure: predictions required before analysis reveal (build mode only)
- Collapsible accordion: primerCollapsed state with toggle arrow
- Topological sort for auto-layout (no dagre dependency)

### Integration Points
- Import modal is new UI — no existing modal pattern in ST-004 (may need lightweight modal component inline)
- Summary bar is new UI layer — sits between canvas and panels
- Primer expansion modifies existing primer section — extend the JSX block at lines 426-437
- Cost/latency data needs new fields on node objects (tokens, latency) — extend existing node shape

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-st-004-enhancements*
*Context gathered: 2026-03-23*
