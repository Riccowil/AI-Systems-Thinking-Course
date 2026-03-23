# Phase 13: ST-004 Enhancements - Research

**Researched:** 2026-03-23
**Domain:** React JSX interactive artifact enhancement — trace import, cost/latency overlay, primer expansion
**Confidence:** HIGH

## Summary

Phase 13 enhances a single existing file: `agent-feedback-loop-builder.jsx` (546 lines). All three features — JSON trace import with auto-CLD mapping, cost/latency overlay, and primer panel expansion — are additive changes to this artifact. No new files, no new dependencies. The artifact runs in the Claude.ai sandbox where inline styles are mandatory and no npm packages can be imported beyond React hooks.

The existing code is well-structured and exposes clear integration points. The import modal is the largest new UI surface (needs inline modal component), the overlay is a rendering pass on existing node/edge SVG elements plus a summary bar between canvas and panel, and the primer expansion extends an existing 10-line JSX block. The main constraint is the 900-line soft target (~350 lines of headroom for three features).

**Primary recommendation:** Build the import modal first (largest surface, blocks the Import+Explore learning path), then the overlay (visual enrichment with no structural changes), then the primer (pure content expansion). This order lets each wave be independently testable.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Trace Import — Input Method**
- Both paste JSON (textarea in modal) AND file upload (.json picker) available in the same import modal
- "Import Trace" button placed as header action above the canvas (not in the drawing toolbar) — signals a different workflow than building
- 2-3 built-in sample traces shipped with the artifact: Retry Storm, RAG Pipeline, Multi-tool Agent
- Sample traces accessible via dropdown/buttons inside the import modal — one-click to load

**Trace Import — Schema & Validation**
- Generic JSON schema only: `{agent, steps: [{tool_call, timestamp, tokens}]}`
- No framework-specific parsers (LangSmith, CrewAI, etc.) — per REQUIREMENTS.md out-of-scope ruling
- Strict validation with helpful error messages: rejection shows exactly what's missing with a valid JSON snippet example
- Validation errors are educational — turns failures into schema documentation

**Trace Import — Canvas Behavior**
- Import replaces the current canvas (nodes and edges cleared, trace CLD loaded)
- "Undo Import" button appears in toolbar after import — caches previous state for one-action restore
- "Load Example" button continues to work as before — reloads the original worked example
- Auto-detect feedback loops immediately on import — loops tab populates, severity scores visible
- Predictions tab available but NOT required for imported traces (optional progressive disclosure)

**Trace Import — Two Learning Paths**
- **Build + Predict** (existing flow): Student constructs CLD, makes predictions, reveals analysis. Progressive disclosure gated on predictions.
- **Import + Explore** (new flow): Student imports trace, sees analysis immediately. Predictions optional. Learning goal is understanding real systems, not practicing loop identification.

**Cost/Latency Overlay — Data Sources**
- **Worked example**: pre-filled with sample cost/latency values (demonstrates overlay immediately)
- **Imported traces**: real data extracted from JSON (timestamps → latency, token fields → cost)
- **Hand-built CLDs**: no cost/latency data — overlay toggle disabled/hidden

**Cost/Latency Overlay — Aggregate Summary**
- Summary bar at top or bottom of canvas showing total tokens, total time, and cost estimate
- Visible only when overlay is active

**Cost/Latency Overlay — Visual Design**
- Claude's discretion: badge placement, color gradient, toggle style (single vs separate)
- Must fit within the dark cybernetic aesthetic (teal/coral/amber accents)

**Primer Panel Expansion**
- Claude decides content structure and UX (sub-sections with expand/collapse vs single block)
- Content should include: Meadows hierarchy quick reference with agent-specific examples, loop pattern mini-examples, intervention strategy guidance
- Cross-references to both ST-001 (loop polarity basics) and ST-002 (Meadows hierarchy)
- ST-004 primer expansion ONLY — ST-005 primer changes belong in Phase 14
- Primer remains collapsible accordion at top of right panel (existing pattern)

**Artifact Size Budget**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ST004-01 | Student can import a JSON agent execution trace (schema: agent name, steps with tool calls, timestamps, token counts) and see it auto-mapped as a CLD with feedback loops detected | Sample trace format documented below; existing `findCycles` + `autoArrangeNodes` functions handle CLD mapping and loop detection after import |
| ST004-02 | Student can toggle a cost/latency overlay on agent feedback loop nodes showing token usage and time per step | Node shape extension pattern documented; overlay as SVG overlay on existing nodes; summary bar as new `<div>` between canvas area and right panel |
| ST004-03 | ST-004 primer panel expanded to match ST-005's depth (Meadows levels, worked examples, progressive disclosure) | ST-005 primer pattern analysed; existing primer block at lines 426–437 identified as extension point; Meadows hierarchy + agent-specific examples mapped |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (useState, useRef, useCallback, useEffect) | Already imported | All state management, DOM refs, memoised handlers | Already the artifact's runtime — no change |
| Inline JSX styles | N/A | All visual styling | Claude.ai sandbox constraint — no CSS files, no Tailwind |
| SVG | Native browser | Canvas, node shapes, edge paths | Already the rendering engine |

### No New Dependencies
This phase adds zero new imports. The artifact is a single `.jsx` file deployed by copy-paste into Claude.ai. All additions must be self-contained JavaScript/JSX.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline modal via JSX | React Portal / dialog element | Portal would require ReactDOM import; dialog element may not be supported in Claude sandbox — inline div-based modal is correct |
| SVG badges for overlay | Canvas 2D API | Canvas would require a second rendering layer; SVG badges are consistent with existing rendering |
| Single primer block | Nested accordion sub-sections | Sub-sections add ~30 lines but improve scannability; judgment call per Claude's discretion |

---

## Architecture Patterns

### File Structure (Single File)
```
agent-feedback-loop-builder.jsx (546 → ~900 lines)
├── SAMPLE_TRACES constant (new) — 3 built-in import traces
├── PRELOADED_EXAMPLE constant (existing, unchanged)
├── COLORS constant (existing, add overlay color tokens)
├── SHAPE_SPECS constant (existing, unchanged)
├── findCycles() (existing, reused by import flow)
├── classifyLoop() (existing, reused)
├── scoreLoopSeverity() (existing, reused)
├── getEdgePath() (existing, unchanged)
├── autoArrangeNodes() (existing, reused by import flow)
├── parseTrace(json) (new) — validates JSON, maps to nodes/edges
├── AgentFeedbackLoopBuilder() component
│   ├── state: existing state vars (unchanged)
│   ├── state: showImportModal, importText, importError (new)
│   ├── state: importMode (new — "build" | "import")
│   ├── state: previousCanvas (new — {nodes, edges} for undo)
│   ├── state: showOverlay, overlayEnabled (new)
│   ├── Header (existing, + "Import Trace" button)
│   ├── Left toolbar (existing, + "Undo Import" button when importMode)
│   ├── Canvas SVG (existing, + overlay badges on nodes)
│   ├── Summary bar (new — visible when overlay active)
│   ├── Right panel
│   │   ├── Primer accordion (existing lines 426–437, expanded)
│   │   ├── Tab bar (existing)
│   │   └── Tab content (existing, loops tab opens immediately in import mode)
│   └── Import modal (new — rendered at z-index 200 over everything)
```

### Pattern 1: Trace-to-CLD Mapping
**What:** Parse the generic JSON trace schema and convert steps into typed nodes + edges, then run existing `autoArrangeNodes` and `findCycles` on the result.
**When to use:** Fired on modal submit — single pass, synchronous.
**Example:**
```typescript
// Source: Derived from existing PRELOADED_EXAMPLE pattern in agent-feedback-loop-builder.jsx
function parseTrace(jsonString) {
  let data;
  try { data = JSON.parse(jsonString); } catch (e) {
    return { error: "Invalid JSON. Expected: { \"agent\": \"...\", \"steps\": [{...}] }" };
  }
  if (!data.agent || !Array.isArray(data.steps)) {
    return { error: "Missing required fields. Need: agent (string), steps (array)" };
  }
  const validStep = data.steps[0];
  if (!validStep?.tool_call || validStep?.timestamp === undefined || validStep?.tokens === undefined) {
    return { error: "Each step needs: tool_call (string), timestamp (number), tokens (number)" };
  }
  // Map unique tool_calls to Tool nodes; add Agent node for data.agent
  const toolsSeen = new Set();
  const nodes = [{ id: "agent", label: data.agent, component_type: "agent", x: 0, y: 0, tokens: 0, latency: 0 }];
  data.steps.forEach((step, i) => {
    if (!toolsSeen.has(step.tool_call)) {
      toolsSeen.add(step.tool_call);
      nodes.push({ id: `t_${step.tool_call}`, label: step.tool_call, component_type: "tool", x: 0, y: 0,
        tokens: step.tokens, latency: step.timestamp });
    }
  });
  const edges = data.steps.map((step, i) => ({
    from: "agent", to: `t_${step.tool_call}`, polarity: "+", strength: 0.8
  }));
  // Deduplicate edges
  const edgesSeen = new Set();
  const uniqueEdges = edges.filter(e => { const key = `${e.from}-${e.to}`; if (edgesSeen.has(key)) return false; edgesSeen.add(key); return true; });
  return { nodes, edges: uniqueEdges };
}
```

### Pattern 2: Import Modal (Inline)
**What:** A full-screen overlay div with z-index 200. No React portal needed — just absolute positioning in the component's root div. Contains textarea for paste, file input for upload, sample trace buttons, validation error display, and submit/cancel.
**When to use:** Activated by "Import Trace" header button; closed on cancel or successful import.
**Key considerations:**
- File reader must use `FileReader.readAsText()` — no `fs` in browser
- Validation runs on textarea content and file content identically through `parseTrace()`
- Sample traces are constants defined at top of file, loaded into textarea on button click

### Pattern 3: Canvas State Cache for Undo Import
**What:** Before replacing canvas on import, save `{nodes, edges}` to `previousCanvas` state. Render an "Undo Import" button in the header area (same row as "Import Trace") that restores the cached state. Cache is cleared on manual node edits after import.
**When to use:** Immediately before calling `setNodes` / `setEdges` with imported data.

### Pattern 4: Cost/Latency Overlay
**What:** Two layers: (1) per-node SVG badges rendered inside the node `<g>` group, visible only when `showOverlay` is true and node has `tokens` or `latency` fields. (2) A `<div>` summary bar injected between the canvas `<div>` and the right panel, visible only when overlay is active and `overlayEnabled` is true.
**When to use:** Overlay toggle button in the header (or a floating toggle above the canvas) activates both layers simultaneously. `overlayEnabled` is false for hand-built CLDs (no data), true for worked example and imported traces.

**Badge approach:**
```jsx
// Source: Derived from existing node rendering pattern (lines 396-408)
// Inside the nodes.map() in SVG render, after renderShape():
{showOverlay && node.tokens != null && (
  <g transform={`translate(${node.x + spec.width/2 - 4}, ${node.y - spec.height/2 - 16})`}>
    <rect x={-28} y={-10} width={56} height={14} rx={3}
          fill={COLORS.bg} stroke={COLORS.accentWarm} strokeWidth={1} opacity={0.9} />
    <text x={0} y={0} textAnchor="middle" dominantBaseline="central"
          fill={COLORS.accentWarm} fontSize={8} fontFamily="'JetBrains Mono', monospace">
      {node.tokens}t · {node.latency}ms
    </text>
  </g>
)}
```

### Pattern 5: Expanded Primer Panel
**What:** Replace the existing 10-line primer content block (lines 430–436) with a richer block. Target structure: intro paragraph → Meadows quick-reference table (agent-specific, 5 key levels like ST-005 uses) → loop pattern mini-examples → intervention strategy guidance → cross-references. All wrapped in the existing collapsible accordion.
**When to use:** Always visible when primerCollapsed is false.

**ST-005 primer pattern to match:** ST-005's primer contains:
- 1 explanatory paragraph contextualising Meadows for the artifact's domain
- 5-level Meadows reference table with color-coded levels (L1, L2, L5, L6, L10)
- Health score formula explanation
- Cross-reference to prerequisite cubelet
Total: ~11 rendered lines of content, ~35 JSX lines

ST-004 should match this depth with:
- 1 paragraph on agent feedback loops in systems thinking context
- 5-level Meadows quick reference with agent-specific examples (retry storms map to which level?)
- Loop pattern mini-examples (what does a reinforcing loop look like in a real agent trace?)
- Intervention guidance (what breaks a reinforcing retry loop at each Meadows level?)
- Cross-references to ST-001 (loop polarity) and ST-002 (Meadows hierarchy)

### Anti-Patterns to Avoid
- **Importing a modal library:** No external dependencies. The inline modal div approach with z-index is 20 lines max.
- **Framework-specific trace parsing:** Only the generic schema `{agent, steps: [{tool_call, timestamp, tokens}]}`. No LangSmith or CrewAI path shapes.
- **Adding predictions gate to import mode:** The Import+Explore path shows analysis immediately — do NOT reuse the `allPredicted` gate. Use `importMode === 'import'` to bypass it.
- **Removing the existing Build+Predict flow:** Import mode is additive. `exampleMode` continues to mean "worked example loaded." A new `importMode` flag tracks "imported trace loaded." Both can coexist.
- **Overlay on hand-built CLDs:** When `importMode === false && !exampleMode`, overlay toggle must be hidden or disabled. Nodes have no `tokens`/`latency` fields.
- **Exceeding 1000 lines without compression:** If approaching limit, compress node/edge rendering closures, merge similar style objects, or collapse rarely-changed constant structures.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loop detection on imported trace | Custom cycle finder | Existing `findCycles(nodes, edges)` | Already handles DFS with deduplication |
| Auto-layout after import | Manual position calc | Existing `autoArrangeNodes(nodes, edges)` | Already implements topological sort |
| JSON validation UI | Custom form validation pattern | `parseTrace()` + state-based error display | One function, one `importError` state var |
| File reading | Custom File API wrapper | Native `FileReader.readAsText()` browser API | Already available, two lines |
| Cost-per-token estimate | Token pricing engine | Simple `tokens * 0.000002` constant for display | Educational approximation is sufficient |

**Key insight:** This phase adds roughly 3 new "business logic" concepts (parse trace, overlay rendering, primer content) but almost no new infrastructure. Every interaction pattern — modal dismiss, button active states, tab switching — already exists in the artifact.

---

## Common Pitfalls

### Pitfall 1: Import Mode vs Example Mode Confusion
**What goes wrong:** The existing codebase uses `exampleMode` as a boolean for "is this the worked example." Adding "imported trace" as a third state is non-obvious — using `exampleMode = true` for both worked example AND imported traces will break the progressive disclosure logic.
**Why it happens:** The worked example and imported traces both skip the prediction gate, tempting a developer to reuse the same flag.
**How to avoid:** Add `importMode` as a separate boolean state. `exampleMode` = worked example specifically. `importMode` = JSON trace imported. The prediction gate reads: `const skipPredictions = exampleMode || importMode;`
**Warning signs:** If predictions tab shows "Switch to practice to test yourself" for both example and import, the flags are conflated.

### Pitfall 2: Overlay Toggle State When No Data Exists
**What goes wrong:** If overlay toggle is visible for hand-built CLDs and student clicks it, nodes have no `tokens`/`latency` fields — overlay renders nothing but toggle appears "active," confusing students.
**Why it happens:** Toggle rendered unconditionally.
**How to avoid:** Compute `overlayEnabled = exampleMode || importMode;` — derive from data state, don't store separately. The toggle button renders only when `overlayEnabled` is true.

### Pitfall 3: Trace Steps Mapping to Redundant Nodes
**What goes wrong:** If a trace has 20 steps but only 4 distinct tool calls, naively creating one node per step produces a cluttered 20-node CLD with no meaningful loops.
**Why it happens:** Not deduplicating on `tool_call` field during import.
**How to avoid:** Use a `Set` on `tool_call` values; accumulate `tokens` and `latency` across all steps sharing the same tool call. Aggregate by tool, not by step.

### Pitfall 4: File Upload in Claude.ai Sandbox
**What goes wrong:** `<input type="file">` may behave unexpectedly in Claude.ai's iframe sandbox depending on permissions.
**Why it happens:** Sandbox content security policies can block file input.
**How to avoid:** Make paste-JSON the primary path, file upload the secondary path. Both feed the same `parseTrace()` function. If file upload fails silently, the textarea fallback covers the requirement.

### Pitfall 5: Line Budget Overflow
**What goes wrong:** Three features at ~120 lines each = 360 lines over the 546 baseline = 906 lines. If any feature is verbose, the artifact exceeds 1000 lines, which the CONTEXT.md flags as requiring compression investigation.
**Why it happens:** JSX with inline styles is verbose — a simple modal can easily run 80–120 lines if styled carelessly.
**How to avoid:** Pre-budget each feature before writing: trace import (modal + parseTrace + state) ~150 lines, overlay (badges + summary bar + toggle) ~80 lines, primer expansion ~60 lines = ~290 additional = ~836 total. Leave compression as a wave-end task, not an up-front concern.

### Pitfall 6: Edge Deduplication in Parsed Traces
**What goes wrong:** Agent calls the same tool multiple times in a trace. Without deduplication, multiple identical edges appear, creating false loop severity scores.
**Why it happens:** `data.steps.map(...)` creates one edge per step.
**How to avoid:** Collect edges into a Map keyed by `${from}-${to}`, accumulating strength or keeping the first occurrence.

---

## Code Examples

Verified patterns from the existing artifact source:

### Existing Primer Block (lines 426–437) — Extension Point
```jsx
// Source: agent-feedback-loop-builder.jsx lines 425–437
<div style={{ background: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}22`, borderRadius: 8, overflow: "hidden" }}>
  <div onClick={() => setPrimerCollapsed(!primerCollapsed)} style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
    <div style={S.heading}>AGENT BASICS</div>
    <span style={{ fontSize: 12, color: COLORS.accent, transition: "transform 0.2s", transform: primerCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}>▼</span>
  </div>
  {!primerCollapsed && (
    <div style={{ padding: "0 12px 12px 12px", fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Expand this block — add Meadows quick reference, loop mini-examples, intervention guidance */}
    </div>
  )}
</div>
```

### ST-005 Primer — Reference Level of Depth
```jsx
// Source: tool-orchestration-analyzer.jsx lines 597–609
<div style={{ ...S.cardBase, margin: '12px', borderColor: C.accent }}>
  <div onClick={() => setPrimerCollapsed(!primerCollapsed)} ...>
    <span>PREREQUISITE: LEVERAGE POINTS</span>
  </div>
  {!primerCollapsed && <div style={{ fontSize: '10px', color: C.textSecondary, marginTop: '8px', lineHeight: '1.6' }}>
    <p>Meadows leverage points rank where interventions in a system produce the most change...</p>
    <p><strong>5 levels used in this artifact:</strong>
      L1: Constants/Parameters — e.g., Add tool
      L2: Buffer/Stock Sizes — e.g., Remove tool
      L5: Feedback Delays — e.g., Add cache/fallback
      L6: Feedback Structure — e.g., Refactor dependency
      L10: System Goals — e.g., Change system purpose
    </p>
    <p>Health scores measure systemic fragility: Complexity / Redundancy / Brittleness...</p>
    <p>Review ST-002: Leverage Points for the full 12-level hierarchy.</p>
  </div>}
</div>
```

### Existing loadExample() — Analogous Import Flow
```jsx
// Source: agent-feedback-loop-builder.jsx lines 238–241
const loadExample = () => {
  setNodes([...PRELOADED_EXAMPLE.nodes]);
  setEdges([...PRELOADED_EXAMPLE.edges]);
  setNodeCounter(6); setShowTutorial(false); setExampleMode(true);
};
// Import trace handler follows same pattern + importMode=true, previousCanvas cache, nodeCounter = importedNodes.length
```

### Worked Example Node Shape — Add tokens/latency Fields
```jsx
// Source: agent-feedback-loop-builder.jsx lines 4–12 (PRELOADED_EXAMPLE.nodes)
// Current shape: { id: "n1", label: "Agent", component_type: "agent", x: 400, y: 100 }
// Extended shape: { id: "n1", label: "Agent", component_type: "agent", x: 400, y: 100, tokens: 840, latency: 230 }
// PRELOADED_EXAMPLE nodes need tokens/latency added for worked example overlay
```

### Sample Trace Schema (Claude's Discretion — Recommended Form)
```json
{
  "agent": "RAG Pipeline Agent",
  "steps": [
    { "tool_call": "retrieve_documents", "timestamp": 0,   "tokens": 128 },
    { "tool_call": "rerank_results",     "timestamp": 340,  "tokens": 64  },
    { "tool_call": "generate_answer",    "timestamp": 890,  "tokens": 512 },
    { "tool_call": "retrieve_documents", "timestamp": 1200, "tokens": 128 },
    { "tool_call": "generate_answer",    "timestamp": 1650, "tokens": 480 }
  ]
}
```
This produces 4 unique tool nodes + 1 agent node, with loops where `retrieve_documents → generate_answer → retrieve_documents`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static primer (10 lines) | Expanded primer with Meadows hierarchy and examples | Phase 13 | ST-004 primer matches ST-005 depth |
| Build-only workflow | Two paths: Build+Predict and Import+Explore | Phase 13 | Students with real agent traces can engage immediately |
| No cost visibility | Optional cost/latency overlay per node + aggregate summary | Phase 13 | Makes abstract token costs concrete and spatial |

**Nothing deprecated** — all existing functionality (Build+Predict flow, worked example, DFS cycle detection) is preserved and unchanged.

---

## Open Questions

1. **File upload in Claude.ai sandbox**
   - What we know: `<input type="file">` is standard HTML; Claude.ai renders artifacts in an iframe
   - What's unclear: Whether the sandbox CSP allows file input reads
   - Recommendation: Implement both paths; make textarea paste primary, file upload progressive enhancement. The requirement says "paste or upload" — textarea alone satisfies the spirit.

2. **Token cost formula to show in summary bar**
   - What we know: OpenAI GPT-4o charges ~$2.50/1M input tokens as of early 2026
   - What's unclear: Which model the sample traces represent; actual pricing varies
   - Recommendation: Show cost as a rough approximation with a tilde: "~$0.0021". Use a simple constant multiplier. This is for educational impact, not billing accuracy.

3. **Meadows level mapping for agent feedback loops**
   - What we know: ST-005 maps tool orchestration interventions to L1, L2, L5, L6, L10
   - What's unclear: Exact agent-specific analogues for ST-004 (what is the L1 equivalent for a retry storm?)
   - Recommendation: Map retry/rate-limit interventions as follows: adding a timeout = L1 (parameters), adding a circuit breaker = L5 (feedback delays), restructuring retry logic = L6 (feedback structure), changing agent goal/stopping condition = L10 (system goals). These are defensible pedagogically.

---

## Validation Architecture

> `workflow.nyquist_validation` not set to false — validation section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test files in project |
| Config file | None |
| Quick run command | Manual: paste JSX into Claude.ai artifact sandbox |
| Full suite command | Manual: load artifact, exercise all three features |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ST004-01 | Paste valid JSON trace → nodes appear, loops detected | Manual smoke | N/A | ❌ No test infrastructure |
| ST004-01 | Paste invalid JSON → error with example shown | Manual smoke | N/A | ❌ |
| ST004-01 | Load sample trace (Retry Storm) from modal → CLD loads | Manual smoke | N/A | ❌ |
| ST004-02 | Overlay toggle visible on worked example | Manual smoke | N/A | ❌ |
| ST004-02 | Overlay toggle hidden/disabled for hand-built CLD | Manual smoke | N/A | ❌ |
| ST004-02 | Summary bar shows total tokens + time when overlay active | Manual smoke | N/A | ❌ |
| ST004-03 | Primer expands to show Meadows quick reference | Manual smoke | N/A | ❌ |
| ST004-03 | Primer cross-references ST-001 and ST-002 | Manual smoke | N/A | ❌ |

### Sampling Rate
- **Per task commit:** Manual artifact load and feature spot-check in Claude.ai
- **Per wave merge:** Full manual run of all 8 test cases above
- **Phase gate:** All 8 manual checks pass before `/gsd:verify-work`

### Wave 0 Gaps
- No automated test infrastructure exists for this project. All validation is manual artifact inspection.

*(Automated tests are out of scope for JSX artifacts deployed via Claude.ai copy-paste.)*

---

## Sources

### Primary (HIGH confidence)
- `Interactive Artifact for Cubelets/agent-feedback-loop-builder.jsx` (direct file read, all 546 lines) — state structure, existing patterns, integration points
- `Interactive Artifact for Cubelets/tool-orchestration-analyzer.jsx` (direct file read, lines 40–55 and 595–631) — primer panel depth reference, Meadows mapping pattern
- `.planning/phases/13-st-004-enhancements/13-CONTEXT.md` — all locked decisions and discretion areas
- `.planning/REQUIREMENTS.md` — ST004-01, ST004-02, ST004-03 requirement text

### Secondary (MEDIUM confidence)
- Knowledge of Claude.ai artifact sandbox constraints (inline styles, no external imports) — consistent with project's established coding pattern across all 9 existing artifacts

### Tertiary (LOW confidence)
- Token cost approximation ($2.50/1M tokens) — market pricing as of early 2026, varies by model

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — single file, no new dependencies, all patterns verified by reading source
- Architecture: HIGH — integration points verified by reading artifact line-by-line; patterns derived from existing code
- Pitfalls: HIGH — import mode vs example mode conflict, edge deduplication, and overlay toggle are all direct code-inspection findings
- Primer content (Meadows mapping for agent loops): MEDIUM — pedagogically reasoned, not externally verified

**Research date:** 2026-03-23
**Valid until:** 2026-05-23 (stable domain — single self-contained JSX file, no external APIs)
