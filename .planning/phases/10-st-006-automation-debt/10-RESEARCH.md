# Phase 10: ST-006 Automation Debt - Research

**Researched:** 2026-03-22
**Domain:** Shifting-the-Burden archetype applied to AI automation debt -- interactive simulation, MCP tool composition, cubelet pedagogy
**Confidence:** HIGH

## Summary

Phase 10 builds the complete three-layer stack for ST-006: a 12-round scenario-based decision game (JSX artifact), an MCP tool (`detect_automation_debt`) that wraps the existing `detect_burden_shift`, a Claude skill, and cubelet markdown. The core simulation engine from ST-003's `burden-shift-simulator.jsx` (629 lines) is directly forkable -- the `stepSim()` function, `SimEngine()` initializer, `MiniChart` SVG sparkline component, and scenario data structure are all proven patterns that need specialization, not rewriting.

The MCP composition is straightforward: the existing `detect_burden_shift` tool accepts a `DetectBurdenShiftInput` with `recurring_symptom`, `fixes_applied` (list of `FixRecord`), optional `fundamental_solution`, and optional viability ratings. The new `detect_automation_debt` tool creates an `AutomationLayer` model with a `to_fix_record()` method that converts to `FixRecord` format, then delegates to the existing erosion scoring. Additional output fields (`debt_score`, named `erosion_channels`, `automation_coverage_estimate`) layer on top of `detect_burden_shift` results.

The pedagogical innovation in ST-006 versus ST-003 is the archetype boundaries section (AB-10): teaching students when the shifting-the-burden pattern does NOT apply through three counter-patterns (Novel Problem, Legitimate Triage, Acceptable Trade-off), each with AI-specific examples and a 3-question mini-quiz.

**Primary recommendation:** Fork ST-003's simulation engine wholesale, specialize the scenario data for automation contexts, add the 2x2 dashboard grid with sparklines (reuse `MiniChart`), move B1/B2/R1 diagram to post-game only, add circular debt gauge as pure SVG, and implement the boundaries tab as a post-game companion.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fork and specialize from ST-003's burden-shift-simulator.jsx (629 lines)
- Same dark cybernetic base palette but NEW accent color (distinct from ST-003's orange)
- 3 pre-loaded scenarios: (1) LLM low-confidence outputs, (2) Agent edge-case failures, (3) Tool call latency issues
- Fixed 12 rounds, untimed, 4 choices per round (quick fix, fundamental investment, transition strategy, do nothing)
- 4 core metrics: Severity (0-100), Capacity (0-100), Dependency (0-100), Willingness (0-100)
- Choice presentation: cards with trade-off preview showing immediate effect
- During gameplay: 2x2 dashboard grid with current value, trend arrow, and mini sparkline
- B1/B2/R1 loop diagram is POST-GAME ONLY (progressive disclosure)
- A-F grading based on final metric state
- Post-game: B1/B2/R1 archetype diagram + erosion timeline + debt accumulation gauge (green-to-red)
- Named erosion channels: Knowledge Drain, Complexity Creep, Normalization
- Try Again button; optimal path comparison shown ONLY after second attempt
- Archetype boundaries tab with 3 counter-patterns + 3-question mini-quiz
- `detect_automation_debt` wraps `detect_burden_shift` via composition
- AutomationLayer model with `to_fix_record()` method
- MCP tool input is current state only (stateless)
- MCP tool output adds: debt_score, erosion_channels, automation_coverage_estimate, automation-specific recommendations

### Claude's Discretion
- Exact accent color for ST-006 (must differ from ST-003 orange #ff8c42 and ST-005 teal #00d4aa)
- How much ST-003 simulation engine code to reuse vs rewrite
- Scenario difficulty calibration
- B1/B2/R1 archetype diagram visualization design
- 2x2 dashboard grid layout and sparkline implementation
- Gauge/speedometer component design
- Scenario selection screen design
- Cubelet markdown wording for all 6 faces
- Skill workflow step count and step names
- Mini-quiz question design for archetype boundaries

### Deferred Ideas (OUT OF SCOPE)
- Custom scenario builder (DEFER-04)
- Round history analysis in MCP tool (v1.1)
- Side-by-side comparison of two students' game results

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AB-01 | Cubelet markdown with all 6 faces covering automation debt detection | ST-003 cubelet structure analyzed (6 faces, quality gate scoring), ST-006 specialization for automation contexts identified |
| AB-02 | Interactive JSX artifact with 12-round decision game | ST-003 `burden-shift-simulator.jsx` analyzed in full -- simulation engine, UI components, state management documented |
| AB-03 | Three pre-loaded scenarios: LLM outputs, Agent failures, Tool latency | Real-world case studies researched for realistic parameters; scenario data structure from ST-003 documented |
| AB-04 | Round mechanics: 4 choices, 4 metrics tracking | `stepSim()` function analyzed with exact formulas; metric interaction model documented |
| AB-05 | Post-simulation grade (A-F) with erosion diagnosis and debt visualization | Grading logic from ST-003 analyzed; SVG gauge pattern researched for debt visualization |
| AB-06 | MCP tool `detect_automation_debt` with B1/B2/R1 analysis | `detect_burden_shift` tool fully analyzed (input/output contract, erosion scoring, classification logic) |
| AB-07 | MCP tool reuses `detect_burden_shift` via composition | `FixRecord` model, `_classify_fix()`, `_compute_erosion_risk()` documented; composition pattern clear |
| AB-08 | Claude skill `automation-debt-detector.skill` | Existing skill patterns identified (burden-shift-detector.skill exists as reference, compressed format) |
| AB-09 | Quality gate score >= 42/60 | ST-003 scored 53/60 and ST-005 scored 48/60; quality gate rubric understood |
| AB-10 | Archetype boundaries with counter-examples | Three counter-patterns researched; mini-quiz pedagogy patterns documented |

</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (Claude.ai sandbox) | UI framework | Artifact runs in Claude.ai sandbox; React is the only option |
| Pydantic | v2.x | MCP tool models | Existing `server.py` uses Pydantic BaseModel throughout |
| FastMCP | Current | MCP server framework | Existing server uses `from mcp.server.fastmcp import FastMCP` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVG (inline) | N/A | Sparklines, gauges, diagrams | All visualizations -- no charting libraries allowed in sandbox |
| JSON | stdlib | Structured output | MCP tool JSON response format |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG sparklines | recharts/d3 | Cannot use external libs in Claude.ai sandbox |
| Pure React state | Zustand/Redux | Sandbox constraint: single-file, no imports beyond React |
| Pydantic models | dataclasses | Pydantic already used in server.py; validators needed for input |

**Installation:** No new packages needed. All work extends existing files or creates new single-file artifacts.

---

## Architecture Patterns

### Recommended Project Structure
```
Interactive Artifact for Cubelets/
  automation-debt-simulator.jsx      # NEW: ST-006 artifact (fork of burden-shift-simulator.jsx)

Cubelets/CubeletsMarkdown/
  ST-006-automation-debt.md          # NEW: 6-face cubelet markdown

Claude skills build for Cubelets/files/
  automation-debt-detector.skill     # NEW: Claude skill

packages/cubelets-mcp/server.py     # EXTEND: add detect_automation_debt tool
```

### Pattern 1: Simulation Engine (Reuse from ST-003)
**What:** Pure-function state machine. `SimEngine()` creates initial state object, `stepSim(state, choice, scenario)` returns new state. No mutation.
**When to use:** Every round of the game
**Reuse assessment:**

The ST-003 `SimEngine` and `stepSim` functions are directly reusable with parameter changes:

```javascript
// ST-003 SimEngine -- REUSE with minor tweaks
function SimEngine(scenario) {
  return {
    symptomSeverity: 70,
    fundamentalCapacity: 100,
    orgWill: 100,           // rename to "willingness" in UI only
    fixDependency: 0,
    cumulativeCost: 0,
    round: 0,
    history: [],
    choices: [],
    attemptNumber: 1,       // NEW: track replay for optimal path
  };
}

// ST-003 stepSim -- REUSE core formula, adjust parameters per scenario
function stepSim(state, choice, scenario) {
  // Same structure: switch on choice, clamp metrics, push history
  // Parameter changes: quickEffect, erosionRate, buildRate, delay per scenario
}
```

**What needs rewriting:**
- Scenario data objects (new AI automation scenarios)
- Post-game screen (add B1/B2/R1 diagram, gauge, boundaries tab)
- Dashboard layout (2x2 grid instead of right-panel charts)
- Grading logic (use 4-metric composite instead of choice-count heuristics)
- Add attempt tracking for optimal path comparison on replay

### Pattern 2: MiniChart SVG Sparkline (Reuse from ST-003)
**What:** Pure SVG polyline component that takes data array, dataKey, color, and renders sparkline with dots.
**Reuse assessment:** Directly reusable. The `MiniChart` component (lines 161-194 in ST-003) uses only inline SVG, no external dependencies. Fits perfectly in the 2x2 dashboard grid.

```javascript
// ST-003 MiniChart -- REUSE VERBATIM, just adjust width/height for 2x2 grid
function MiniChart({ data, dataKey, color, label, height = 80, maxVal = 100 }) {
  // ... polyline-based sparkline, fully self-contained
}
```

### Pattern 3: MCP Tool Composition
**What:** New tool wraps existing tool by converting domain-specific input to existing input format.
**Example:**

```python
class AutomationLayer(BaseModel):
    layer_name: str = Field(..., min_length=1, max_length=200)
    layer_type: Literal["quick_fix", "fundamental", "transition"] = Field(...)
    side_effects: Optional[str] = Field(default=None)
    duration_active: Optional[str] = Field(default=None)
    times_applied: int = Field(default=1, ge=1)

    def to_fix_record(self) -> FixRecord:
        """Convert AutomationLayer to FixRecord for detect_burden_shift."""
        return FixRecord(
            label=self.layer_name,
            description=f"Automation layer ({self.layer_type})",
            times_applied=self.times_applied,
            is_symptomatic=self.layer_type == "quick_fix",
            side_effects=self.side_effects,
            duration_active=self.duration_active,
        )
```

### Pattern 4: Circular Debt Gauge (Pure SVG)
**What:** Arc-based SVG gauge using `strokeDasharray` and `strokeDashoffset` to show debt level 0-100.
**Design recommendation:**

```javascript
function DebtGauge({ value, size = 160 }) {
  const radius = 60;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (value / 100) * circumference;
  const color = value < 30 ? '#00d4aa' : value < 60 ? '#ffd700' : value < 80 ? '#ff8c42' : '#ff5555';

  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 160 100">
      {/* Background arc */}
      <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none"
        stroke="#1f2440" strokeWidth={10} strokeLinecap="round" />
      {/* Value arc */}
      <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none"
        stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }} />
      {/* Center value */}
      <text x="80" y="80" textAnchor="middle" fill={color}
        fontSize="24" fontWeight="700">{Math.round(value)}</text>
      <text x="80" y="95" textAnchor="middle" fill="#7580a0"
        fontSize="9">DEBT SCORE</text>
    </svg>
  );
}
```

### Pattern 5: Post-Game Tab Navigation
**What:** Simple array-state tab switcher for diagnosis/boundaries tabs.
**Implementation:** Use array-based state (not Set) per Phase 9 sandbox fix.

```javascript
const [activeTab, setActiveTab] = useState('diagnosis'); // 'diagnosis' | 'boundaries'
```

### Anti-Patterns to Avoid
- **External charting libraries in sandbox:** Claude.ai sandbox only supports React core. No recharts, d3, chart.js.
- **Set-based React state:** Causes serialization issues in Claude.ai sandbox. Use arrays.
- **Missing z-index on overlapping panels:** Phase 9 discovered toolbar/panel overlap without explicit z-index.
- **Mutating simulation state:** `stepSim` must return new object, never mutate the input state.
- **Choice-count grading:** ST-003 grades primarily on choice counts (sympCount >= 8 = C). ST-006 should use 4-metric composite for more nuanced grading.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Burden shift detection | Custom erosion scoring | Existing `detect_burden_shift` via composition | 170+ lines of classification, erosion scoring, transition strategy already built and tested |
| Fix classification | Manual symptomatic/fundamental labeling | `_classify_fix()` heuristic in server.py | 20+ symptomatic signals and 15+ fundamental signals already encoded |
| Erosion risk scoring | Custom risk formula | `_compute_erosion_risk()` in server.py | Handles application count, distinct fixes, viability decline, erosion channels |
| SVG sparklines | Canvas-based charting | ST-003's `MiniChart` component | Proven in sandbox, pure SVG, 33 lines |
| Scenario selection UI | Complex carousel | ST-003's card-grid pattern | Button cards with hover effects, proven sandbox compatible |

**Key insight:** The entire MCP tool backend exists. The simulation engine exists. This phase is about composition and specialization, not greenfield development.

---

## Common Pitfalls

### Pitfall 1: Overcomplicating Scenario Parameters
**What goes wrong:** Simulation parameters (erosionRate, quickEffect, buildRate, delay) don't produce meaningful gameplay -- either too easy or impossible.
**Why it happens:** Parameters copied from one domain don't transfer to another without calibration.
**How to avoid:** Use ST-003's proven parameter ranges as baseline, then playtest each scenario. ST-003 ranges: quickEffect 20-30, erosionRate 8-12, buildRate 10-15, delay 3-5. The three ST-006 scenarios should vary within these ranges.
**Warning signs:** All scenarios produce same grade regardless of strategy. Or: fundamental solution never becomes viable.

### Pitfall 2: Post-Game Information Overload
**What goes wrong:** Showing B1/B2/R1 diagram, erosion timeline, debt gauge, archetype breakdown, grade, AND boundaries all at once overwhelms the student.
**Why it happens:** Progressive disclosure is hard to implement when everything feels important.
**How to avoid:** Tab-based post-game: Tab 1 (diagnosis) shows grade + B1/B2/R1 + gauge. Tab 2 (boundaries) appears as separate tab. Optimal path appears only on replay.
**Warning signs:** Post-game screen requires scrolling to see all information.

### Pitfall 3: Grading That Punishes Learning
**What goes wrong:** Students who experiment with different strategies get worse grades than students who play "optimally."
**Why it happens:** Grading based on final state penalizes early experimentation.
**How to avoid:** Grade on trajectory (did capacity stabilize or recover?) and final state together. Allow a "warm-up" effect where early bad choices matter less.
**Warning signs:** Students who play quick-fix for 3 rounds then transition get worse grades than students who play transition from round 1.

### Pitfall 4: MCP Composition Losing Information
**What goes wrong:** `AutomationLayer.to_fix_record()` drops domain-specific information that should appear in the output.
**Why it happens:** FixRecord model has fewer fields than AutomationLayer needs.
**How to avoid:** Pass extra automation-specific data alongside the detect_burden_shift call, then merge results. Don't try to encode everything into FixRecord fields.
**Warning signs:** MCP tool output has less useful information than calling detect_burden_shift directly.

### Pitfall 5: Sandbox Token Limit
**What goes wrong:** Artifact exceeds Claude.ai sandbox token limit and fails to render.
**Why it happens:** Adding post-game features, boundaries tab, gauge, diagram, and scenario data pushes file size past limit.
**How to avoid:** Keep scenario descriptions terse. Share component styles. Minimize inline string content. ST-003 is 629 lines -- ST-006 should target 700-850 lines maximum.
**Warning signs:** File exceeds 900 lines or 30KB.

---

## Code Examples

### ST-003 Scenario Data Structure (Template for ST-006)
```javascript
// Source: burden-shift-simulator.jsx, lines 27-96
const SCENARIOS = {
  scenario_key: {
    title: "Scenario Title",
    subtitle: "Context note",
    symptom: "Recurring problem description",
    symptomatic: {
      label: "Quick Fix Name",
      desc: "What this fix does and why it works short-term.",
      quickEffect: 30,      // Severity reduction per round
      erosionRate: 8,        // Capacity erosion per round
      erosionChannel: "How the fix undermines the fundamental solution",
    },
    fundamental: {
      label: "Root Cause Fix Name",
      desc: "What the fundamental solution does.",
      delay: 3,              // Rounds before benefit kicks in
      buildRate: 15,         // Severity reduction after delay
      longEffect: 45,        // Maximum severity reduction
    },
    transition: {
      label: "Maintain fix AND build fundamental",
      target: "Measurable transition goal",
    },
  },
};
```

### Recommended ST-006 Scenarios

**Scenario 1: LLM Low-Confidence Outputs**
```javascript
llm_confidence: {
  title: "LLM Output Reliability Pipeline",
  subtitle: "Validation layers vs prompt architecture",
  symptom: "LLM produces low-confidence outputs that fail downstream validation",
  symptomatic: {
    label: "Stack Validation Layers",
    desc: "Add retry logic, output validators, and human review queue. Catches bad outputs.",
    quickEffect: 28,
    erosionRate: 10,
    erosionChannel: "Validation complexity blocks prompt architecture improvement. Team normalizes workarounds. Cost grows 15% per quarter.",
  },
  fundamental: {
    label: "Restructure Prompt Architecture",
    desc: "Redesign input pipeline, improve context engineering, fix upstream data quality.",
    delay: 4,
    buildRate: 14,
    longEffect: 50,
  },
  transition: {
    label: "Keep validators while rebuilding prompt pipeline in parallel",
    target: "Eliminate 80% of validation layers within 2 quarters",
  },
  erosionChannels: ["Knowledge Drain", "Complexity Creep"],
},
```

**Scenario 2: Agent Edge-Case Failures**
```javascript
agent_edge_cases: {
  title: "AI Agent Error Handling",
  subtitle: "Exception handlers vs architecture redesign",
  symptom: "Agent fails on edge cases, triggering exception handlers and manual intervention",
  symptomatic: {
    label: "Add Exception Handlers",
    desc: "Catch-all error handlers, fallback paths, manual escalation queue.",
    quickEffect: 25,
    erosionRate: 12,
    erosionChannel: "Exception handlers mask root failures. Architecture debt accumulates. New edge cases appear faster than handlers.",
  },
  fundamental: {
    label: "Redesign Agent Architecture",
    desc: "Decompose monolithic agent into specialized sub-agents with clear contracts.",
    delay: 5,
    buildRate: 12,
    longEffect: 55,
  },
  transition: {
    label: "Maintain handlers while decomposing agent into sub-agents",
    target: "Sub-agent architecture handles 60% of edge cases natively",
  },
  erosionChannels: ["Complexity Creep", "Normalization"],
},
```

**Scenario 3: Tool Call Latency**
```javascript
tool_latency: {
  title: "MCP Tool Call Performance",
  subtitle: "Caching and retries vs root cause optimization",
  symptom: "Tool calls exceed latency thresholds, causing timeouts and user frustration",
  symptomatic: {
    label: "Add Caching & Retry Logic",
    desc: "Cache frequent responses, add retry with backoff, increase timeout thresholds.",
    quickEffect: 22,
    erosionRate: 8,
    erosionChannel: "Cache invalidation complexity grows. Stale data risk increases. Original performance bottleneck remains unaddressed.",
  },
  fundamental: {
    label: "Optimize Tool Pipeline",
    desc: "Profile bottlenecks, parallelize independent calls, optimize data serialization.",
    delay: 3,
    buildRate: 16,
    longEffect: 45,
  },
  transition: {
    label: "Keep cache while optimizing critical path tools in parallel",
    target: "Remove caching from 70% of tool calls within 1 quarter",
  },
  erosionChannels: ["Knowledge Drain", "Normalization"],
},
```

### Grading Logic (Improved from ST-003)
```javascript
// ST-006: 4-metric composite grading (replaces ST-003's choice-count approach)
function getGrade(sim) {
  // Normalize: low severity good, high capacity good, low dependency good, high willingness good
  const severityScore = (100 - sim.symptomSeverity) / 100;
  const capacityScore = sim.fundamentalCapacity / 100;
  const dependencyScore = (100 - sim.fixDependency) / 100;
  const willingnessScore = sim.orgWill / 100;

  const composite = (severityScore * 0.3) + (capacityScore * 0.3)
                   + (dependencyScore * 0.2) + (willingnessScore * 0.2);

  if (composite >= 0.80) return { grade: "A", color: "#00d4aa", msg: "..." };
  if (composite >= 0.70) return { grade: "B+", color: "#6b8aff", msg: "..." };
  if (composite >= 0.60) return { grade: "B", color: "#6b8aff", msg: "..." };
  if (composite >= 0.45) return { grade: "C", color: "#ffd700", msg: "..." };
  if (composite >= 0.30) return { grade: "D", color: "#ff8c42", msg: "..." };
  return { grade: "F", color: "#ff5555", msg: "..." };
}
```

### MCP Tool Composition Pattern
```python
# Source: server.py analysis of detect_burden_shift + new composition layer

class DetectAutomationDebtInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    system_description: str = Field(..., min_length=5, max_length=500)
    automation_layers: List[AutomationLayer] = Field(..., min_length=1, max_length=20)
    fundamental_solution: Optional[str] = Field(default=None)
    fundamental_viability_now: Optional[int] = Field(default=None, ge=1, le=10)
    fundamental_viability_original: Optional[int] = Field(default=None, ge=1, le=10)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

@mcp.tool(name="detect_automation_debt")
async def detect_automation_debt(params: DetectAutomationDebtInput) -> str:
    # 1. Convert AutomationLayers to FixRecords
    fix_records = [layer.to_fix_record() for layer in params.automation_layers]

    # 2. Build detect_burden_shift input
    burden_input = DetectBurdenShiftInput(
        recurring_symptom=params.system_description,
        fixes_applied=fix_records,
        fundamental_solution=params.fundamental_solution,
        fundamental_viability_now=params.fundamental_viability_now,
        fundamental_viability_original=params.fundamental_viability_original,
        response_format=ResponseFormat.JSON,  # always get structured data
    )

    # 3. Call existing tool's internal logic
    burden_result = json.loads(await detect_burden_shift(burden_input))

    # 4. Layer on automation-specific analysis
    debt_score = _compute_debt_score(burden_result, params.automation_layers)
    erosion_channels = _identify_erosion_channels(params.automation_layers)
    coverage = _estimate_automation_coverage(params.automation_layers)
    recommendations = _generate_recommendations(burden_result, params.automation_layers)

    # 5. Merge and return
    result = {
        **burden_result,
        "debt_score": debt_score,
        "erosion_channels": erosion_channels,
        "automation_coverage_estimate": coverage,
        "recommendations": recommendations,
    }
    # Format per response_format...
```

### Archetype Boundaries Counter-Patterns
```javascript
const COUNTER_PATTERNS = [
  {
    name: "Novel Problem",
    principle: "No known fundamental solution exists yet",
    aiExample: "First time deploying a multimodal agent -- no architecture pattern exists. Quick experimental fixes ARE the learning process.",
    test: "Could an expert name the fundamental solution? If no, this is exploration, not burden shifting.",
  },
  {
    name: "Legitimate Triage",
    principle: "Quick fix IS the right call under true emergency",
    aiExample: "Production LLM starts hallucinating during peak traffic. Adding a validation gate is correct triage, not burden shifting.",
    test: "Is this a genuine emergency with a planned return to root cause? If yes, this is triage.",
  },
  {
    name: "Acceptable Trade-off",
    principle: "Cost of fundamental fix exceeds the benefit",
    aiExample: "Tool call latency is 200ms above target but affects only 2% of requests. Full pipeline refactor costs 3 sprints. The quick fix is rational.",
    test: "Does the fundamental solution cost more than the total lifetime cost of the symptomatic fix? If yes, this is a valid trade-off.",
  },
];
```

---

## Accent Color Recommendation

ST-003 uses orange (#ff8c42), ST-005 uses teal (#00d4aa). For ST-006, recommend **electric violet/indigo (#7c5cfc)** -- visually distinct from both, conveys the "hidden debt" theme, works well on dark backgrounds, and provides good contrast for both text and UI elements.

Palette extension:
```javascript
// ST-006 accent additions to C object
accentST006: "#7c5cfc",       // electric violet -- primary accent
accentST006Glow: "#7c5cfc44", // glow variant
```

---

## Simulation Parameter Calibration

Based on analysis of ST-003's proven parameters and the three new AI automation scenarios:

| Parameter | LLM Confidence | Agent Edge-Cases | Tool Latency | Notes |
|-----------|---------------|------------------|--------------|-------|
| quickEffect | 28 | 25 | 22 | How much severity drops per symptomatic fix |
| erosionRate | 10 | 12 | 8 | How much capacity erodes per symptomatic fix |
| buildRate | 14 | 12 | 16 | How much severity drops per fundamental fix (after delay) |
| delay | 4 | 5 | 3 | Rounds before fundamental fix starts working |
| longEffect | 50 | 55 | 45 | Maximum severity reduction from fundamental |

**Difficulty ordering:** Tool Latency (easiest -- shortest delay, highest buildRate) < LLM Confidence (medium) < Agent Edge-Cases (hardest -- longest delay, highest erosion).

---

## Named Erosion Channels

Three named erosion patterns for post-game diagnosis:

| Channel | Description | AI Example | Detection Signal |
|---------|-------------|------------|-----------------|
| **Knowledge Drain** | Fixes prevent the team from learning the root cause | Validation layers catch bad outputs so no one investigates prompt failures | High symptomatic fix count + low fundamental investment |
| **Complexity Creep** | Each workaround adds architectural layers | Exception handlers + fallback paths + retry logic = 3 new failure modes | Fix dependency > 60 |
| **Normalization** | Team accepts degraded performance as normal | "200ms latency is just how our tools work" | Willingness < 40 + severity stable (not rising) |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Choice-count grading | Composite metric grading | ST-006 improvement | More nuanced assessment that rewards diverse strategies |
| Loop diagram always visible | Post-game progressive disclosure | ST-006 design decision | Archetype reveal becomes pedagogical payoff |
| Single play-through | Replay with optimal path comparison | ST-006 addition | Scaffolded learning: explore first, then compare |

---

## Open Questions

1. **Optimal Path Calculation**
   - What we know: Optimal path should be shown only on second attempt. Need to compute "best possible" sequence for each scenario.
   - What's unclear: Should optimal path be pre-computed (static) or computed by brute-force simulation of all 4^12 combinations (too many)?
   - Recommendation: Pre-compute a static "expert path" per scenario (e.g., 2 rounds symptomatic, 1 transition, 9 fundamental) and store the resulting metrics. Display as comparison line on sparklines.

2. **Skill File Format**
   - What we know: Existing skills are compressed `.skill` archives (ZIP/PK format) containing SKILL.md and references/.
   - What's unclear: Exact internal structure beyond SKILL.md + references/ directory.
   - Recommendation: Follow the same archive pattern. Create the SKILL.md and reference files, then package.

3. **Debt Score vs Erosion Risk Score**
   - What we know: `_compute_erosion_risk` returns a risk_score (0-100). The new tool needs a `debt_score` (0-100).
   - What's unclear: Should debt_score be the same as erosion risk_score, or a separate calculation?
   - Recommendation: debt_score = weighted combination of erosion risk_score (60%) + automation-specific factors like layer count and quick_fix ratio (40%). This adds value beyond just forwarding the existing score.

---

## Sources

### Primary (HIGH confidence)
- `burden-shift-simulator.jsx` (629 lines) -- full code analysis of simulation engine, UI, state management
- `server.py` (cubelets-mcp) -- full analysis of `detect_burden_shift`, `FixRecord`, `_classify_fix()`, `_compute_erosion_risk()`
- `ST-003-shifting-the-burden.md` -- cubelet structure, 6-face format, quality gate scoring
- `ST-005-tool-orchestration.md` -- recent cubelet for pattern reference
- `10-CONTEXT.md` -- locked decisions and constraints

### Secondary (MEDIUM confidence)
- [Beyond Prompt Engineering: What Engineers Are Actually Using](https://fullstackaiengineer.substack.com/p/008-beyond-prompt-engineering-what) -- validation layers vs prompt architecture tradeoffs
- [AI-Generated Code Creates New Technical Debt](https://www.infoq.com/news/2025/11/ai-code-technical-debt/) -- real-world automation debt patterns
- [Why AI Systems Create New Forms of Technical Debt](https://altersquare.medium.com/why-ai-systems-create-new-forms-of-technical-debt-e3b5c0a7f6a1) -- data-centric debt, prompt debt
- [Building a Dynamic SVG Gauge Component](https://www.fullstack.com/labs/resources/blog/creating-an-svg-gauge-component-from-scratch) -- pure SVG gauge pattern
- [Shifting the Burden - isee systems](https://blog.iseesystems.com/systems-thinking/shifting-the-burden/) -- archetype boundaries and when symptomatic fixes are appropriate

### Tertiary (LOW confidence)
- [HFS/Publicis Sapient AI Tech Debt Report](https://www.publicissapient.com/content/dam/ps-reinvent/us/en/2025/05/insights-lp/hfs-ai-tech-debt-report/docs/HFS-PS-Report-SmashTechDebt-2025.pdf) -- $1.5-2T tech debt estimate (unverified specific number)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- sandbox constraints well-understood from Phases 8-9; MCP server pattern proven
- Architecture: HIGH -- forking from analyzed ST-003 code; MCP composition pattern clear from server.py
- Pitfalls: HIGH -- sandbox constraints documented from Phase 9; grading issues identified from ST-003 analysis
- Scenarios: MEDIUM -- parameter calibration needs playtesting; real-world case studies inform but don't guarantee good gameplay
- Archetype boundaries: MEDIUM -- counter-pattern pedagogy based on systems thinking literature, but mini-quiz design is discretionary

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable domain, no fast-moving dependencies)
