# Phase 10: ST-006 Automation Debt - Research

**Researched:** 2026-03-22 (updated with worktree state audit)
**Domain:** Shifting-the-Burden archetype applied to AI automation debt -- interactive simulation, MCP tool composition, cubelet pedagogy
**Confidence:** HIGH

## Summary

Phase 10 builds the complete three-layer stack for ST-006: a 12-round scenario-based decision game (JSX artifact), an MCP tool (`detect_automation_debt`) that wraps the existing `detect_burden_shift`, a Claude skill (`automation-debt-detector.skill`), and cubelet markdown. **Critical finding from worktree audit: all four deliverables already exist in the `main` branch but are absent from the current worktree branch (`claude/admiring-lovelace`).** The planning must account for this: tasks should treat the main-branch versions as reference implementations to copy/adapt rather than building greenfield.

Deliverables in `main` (reference implementations):
- `Interactive Artifact for Cubelets/automation-debt-simulator.jsx` -- ~500 lines, purple accent (#7c5cfc), full simulation with 2x2 dashboard, gauge, B1/B2/R1 diagram, boundaries tab, quiz
- `Cubelets/CubeletsMarkdown/ST-006-automation-debt.md` -- all 6 faces, score_aggregate 54/60, PASS status
- `Claude skills build for Cubelets/files/automation-debt-detector.skill` -- compressed archive format (ZIP/PK), SKILL.md + references/
- `detect_automation_debt` in `Cubelets MCP Tool/files/cubelets_mcp_server.py` -- fully implemented at lines 1478-1662

The MCP composition is already implemented: `AutomationLayer.to_fix_record()` converts to `FixRecord`, and `detect_automation_debt` computes debt_score, active erosion channels, automation_coverage_estimate, and recommendations layered on top of `detect_burden_shift` results. The artifact uses purple (#7c5cfc) as the accent, distinct from ST-003 orange and ST-005 teal.

**Primary recommendation:** Copy deliverables from main-branch reference implementations into the worktree, verify sandbox compatibility using established Phase 9 patterns (array-based state, z-index layering, token limit), write Wave 0 test stubs, and confirm quality gate score >= 42/60 for the cubelet.

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
| AB-01 | Cubelet markdown with all 6 faces covering automation debt detection | ST-006-automation-debt.md exists in main (54/60, PASS) -- copy to worktree; all 6 faces confirmed complete |
| AB-02 | Interactive JSX artifact with 12-round decision game | automation-debt-simulator.jsx exists in main (~500 lines) -- copy to worktree; all game mechanics confirmed present |
| AB-03 | Three pre-loaded scenarios: LLM outputs, Agent failures, Tool latency | All 3 scenarios confirmed in main artifact with calibrated parameters and difficulty ratings |
| AB-04 | Round mechanics: 4 choices, 4 metrics tracking | stepSim() with 4-choice branches and 4 tracked metrics confirmed in main artifact |
| AB-05 | Post-simulation grade (A-F) with erosion diagnosis and debt visualization | Grading logic (4-metric composite), DebtGauge SVG, LoopDiagram SVG all confirmed in main artifact |
| AB-06 | MCP tool `detect_automation_debt` with B1/B2/R1 analysis | detect_automation_debt fully implemented in cubelets_mcp_server.py (main) at lines 1478-1662 |
| AB-07 | MCP tool reuses `detect_burden_shift` via composition | AutomationLayer.to_fix_record() confirmed; composition via _classify_fix() and _compute_erosion_risk() confirmed |
| AB-08 | Claude skill `automation-debt-detector.skill` | automation-debt-detector.skill exists in main (compressed archive format) |
| AB-09 | Quality gate score >= 42/60 | ST-006-automation-debt.md shows score_aggregate: 54/60, PASS -- exceeds gate |
| AB-10 | Archetype boundaries with counter-examples | COUNTER_PATTERNS array (3 items) + QUIZ array (3 questions) confirmed in main artifact; Boundaries tab in results phase |

</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (Claude.ai sandbox) | UI framework | Artifact runs in Claude.ai sandbox; React is the only option |
| Pydantic | v2.x | MCP tool models | Existing server.py uses Pydantic BaseModel throughout |
| FastMCP | Current | MCP server framework | Existing server uses `from mcp.server.fastmcp import FastMCP` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVG (inline) | N/A | Sparklines, gauges, loop diagrams | All visualizations -- no charting libraries allowed in sandbox |
| JSON | stdlib | Structured output | MCP tool JSON response format |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG sparklines | recharts/d3 | Cannot use external libs in Claude.ai sandbox |
| Pure React state | Zustand/Redux | Sandbox constraint: single-file, no imports beyond React |
| Pydantic models | dataclasses | Pydantic already used in server.py; validators needed for input |

**Installation:** No new packages needed. All work copies/extends existing files.

---

## Architecture Patterns

### Recommended Project Structure

The worktree branch needs these files added (all exist in main as reference):

```
[worktree] Interactive Artifact for Cubelets/
  automation-debt-simulator.jsx      # COPY from main: ~500 lines, purple accent

[worktree] Cubelets/CubeletsMarkdown/
  ST-006-automation-debt.md          # COPY from main: 6 faces, 54/60 score

[worktree] Claude skills build for Cubelets/files/
  automation-debt-detector.skill     # COPY from main: ZIP archive format

[worktree] Cubelets MCP Tool/files/cubelets_mcp_server.py
  (EXTEND: add detect_automation_debt section from main, after tool_orchestration)

[worktree] preview-app/src/
  automation-debt-simulator.jsx      # COPY alongside artifact file
  App.jsx                           # UPDATE: already has st006 tab in main
```

### Pattern 1: Simulation Engine (Forked from ST-003, Confirmed in Main)
**What:** Pure-function state machine. `SimEngine()` creates initial state object, `stepSim(state, choice, scenario)` returns new state immutably. No mutation.
**Confirmed implementation in main:**

```javascript
// From automation-debt-simulator.jsx (main branch) lines 113-116
function SimEngine() {
  return { symptomSeverity: 70, fundamentalCapacity: 100, orgWill: 100, fixDependency: 0,
    cumulativeCost: 0, round: 0, history: [], choices: [], attemptNumber: 1 };
}

// stepSim returns new state with spread: { ...state }
// History uses array spread: s.history = [...state.history, { ... }]
// Choices uses array spread: s.choices = [...state.choices, choice]
```

### Pattern 2: SVG Sparkline (Spark Component)
**What:** Pure SVG polyline, no external dependencies.
**Confirmed implementation:**

```javascript
// From automation-debt-simulator.jsx (main branch) lines 166-177
function Spark({ data, dataKey, color, h = 50 }) {
  if (!data.length) return null;
  const w = 120;
  const pts = data.map((d, i) => {
    const x = 4 + (i / Math.max(data.length - 1, 1)) * (w - 8);
    const y = h - 4 - ((d[dataKey] / 100) * (h - 8));
    return `${x},${y}`;
  }).join(" ");
  return (<svg width={w} height={h} style={{ display: "block" }}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </svg>);
}
```

### Pattern 3: Circular Debt Gauge (DebtGauge)
**What:** Half-circle arc gauge using strokeDasharray/strokeDashoffset, color transitions green to red.
**Confirmed in main (lines 179-190):** Uses path-based arc `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`, not the full-circle approach. Color thresholds: <30 teal, <60 gold, <80 pink, else danger.

### Pattern 4: MCP Tool Composition (detect_automation_debt)
**What:** New tool wraps detect_burden_shift by converting AutomationLayer inputs to FixRecord format via to_fix_record() method.
**Confirmed in main (lines 1481-1662):**

```python
# AutomationLayer.to_fix_record() -- confirmed pattern
def to_fix_record(self) -> FixRecord:
    return FixRecord(
        label=self.layer_name,
        description=f"Automation layer: {self.layer_type}",
        is_symptomatic=self.layer_type == "quick_fix",
        side_effects=self.side_effects,
        duration_active=self.duration_active,
    )

# Debt score formula (confirmed)
quick_fix_ratio = len(symptomatic) / max(len(classified), 1)
erosion_factor = erosion["risk_score"] / 100
debt_score = int(min(100, (quick_fix_ratio * 60 + erosion_factor * 40)))
```

### Pattern 5: Grading Logic (4-Metric Composite)
**What:** Composite score from 4 normalized metrics, not choice-count heuristics.
**Confirmed in main (lines 153-164):**

```javascript
function getGrade(sim) {
  const sev = (100 - sim.symptomSeverity) / 100, cap = sim.fundamentalCapacity / 100;
  const dep = (100 - sim.fixDependency) / 100, wil = sim.orgWill / 100;
  const composite = sev * 0.3 + cap * 0.3 + dep * 0.2 + wil * 0.2;
  if (composite >= 0.80) return { grade: "A", ... };
  if (composite >= 0.70) return { grade: "B+", ... };
  if (composite >= 0.60) return { grade: "B", ... };
  if (composite >= 0.45) return { grade: "C", ... };
  if (composite >= 0.30) return { grade: "D", ... };
  return { grade: "F", ... };
}
```

### Anti-Patterns to Avoid
- **Building from scratch:** All deliverables exist in main. Copy, verify, adjust — do not rewrite.
- **External charting libraries in sandbox:** Claude.ai sandbox only supports React core.
- **Set-based React state:** Causes serialization issues. Use arrays (confirmed pattern in main).
- **Missing z-index on overlapping panels:** Required for sandbox rendering (Phase 9 fix, confirmed in main: top bar has `zIndex: 2`).
- **Forgetting preview-app/src copy:** The artifact must be copied to BOTH `Interactive Artifact for Cubelets/` AND `preview-app/src/`. Both directories exist in main.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Simulation engine | New state machine | Copy SimEngine/stepSim from main artifact | Proven, sandbox-compatible, calibrated parameters |
| Erosion scoring | Custom risk formula | Existing `_compute_erosion_risk()` in server.py | Already handles application count, distinct fixes, viability |
| Fix classification | Manual labeling logic | `_classify_fix()` in server.py | 20+ symptomatic signals already encoded |
| SVG sparklines | Canvas/D3 charts | `Spark` component from main artifact | Proven sandbox-compatible, 12 lines |
| SVG gauge | Third-party gauge | `DebtGauge` from main artifact | Proven, color-transitions, 11 lines |
| Loop diagram | Complex D3 force graph | `LoopDiagram` SVG from main artifact | Custom SVG, 23 lines, pedagogically sufficient |
| Cubelet markdown | Write from scratch | ST-006-automation-debt.md from main | 54/60, all 6 faces, already passes quality gate |

**Key insight:** This phase is a port-and-verify, not greenfield. The planner should structure tasks as: copy from main → verify in worktree → run tests → confirm sandbox.

---

## Common Pitfalls

### Pitfall 1: Missing the Dual-Copy Requirement
**What goes wrong:** Artifact copied to `Interactive Artifact for Cubelets/` but not to `preview-app/src/`. Preview app tab breaks.
**Why it happens:** The project has two artifact locations -- the source file and the preview-app copy.
**How to avoid:** Every artifact copy task must include both paths. App.jsx already imports from `./automation-debt-simulator.jsx`.
**Warning signs:** Preview app shows "Loading artifact..." indefinitely for ST-006 tab.

### Pitfall 2: MCP Server Section Placement
**What goes wrong:** detect_automation_debt is added to the worktree server.py in the wrong location, breaking the entry point.
**Why it happens:** The entry point `if __name__ == "__main__": mcp.run(...)` must be the LAST section.
**How to avoid:** Insert ST-006 section between the ST-005 tool_orchestration section and the Entry Point section. In the worktree, the server ends at line 1474 with the entry point.
**Warning signs:** Server fails to start, `mcp.run` not reached.

### Pitfall 3: Skill Archive Format
**What goes wrong:** automation-debt-detector.skill is treated as a text file to be written; the compressed archive format is not reproduced.
**Why it happens:** .skill files are ZIP archives with internal structure (SKILL.md + references/).
**How to avoid:** Copy the binary archive from main directly. Do not attempt to reconstruct the ZIP format by hand. The skill already exists and works.
**Warning signs:** skill file is plain text, not binary ZIP.

### Pitfall 4: Test File Coverage Gap
**What goes wrong:** No test stubs created for AB-02 through AB-05 (the JSX artifact), leaving Nyquist validation incomplete.
**Why it happens:** JSX artifacts in Claude.ai sandbox are harder to test than pure logic functions.
**How to avoid:** Create Wave 0 test stubs in `preview-app/src/__tests__/automation-debt-simulator.test.jsx` following the TO-02-05 stub pattern from `tool-orchestration-analyzer.test.jsx`.
**Warning signs:** No test file exists for ST-006 before Task 1 begins.

### Pitfall 5: Quality Gate Score Not Confirmed
**What goes wrong:** Cubelet markdown copied from main but score not verified against 42/60 gate.
**Why it happens:** The main branch score (54/60) assumed to transfer without verification.
**How to avoid:** After copying, confirm the 6-face structure, check archetype boundaries section is present (AB-10), and spot-check content quality.
**Warning signs:** Cubelet markdown missing Face 6 APPLY section or boundaries section.

### Pitfall 6: Sandbox Token Limit
**What goes wrong:** Artifact exceeds Claude.ai sandbox token limit and fails to render.
**Why it happens:** Main artifact is already ~500 lines; any additions could push past the limit.
**How to avoid:** Do not add features beyond what is in the main branch artifact. Target 500-700 lines maximum.
**Warning signs:** File exceeds 900 lines or 30KB.

---

## Code Examples

### Confirmed Scenario Data Structure (from main artifact)

```javascript
// Lines 13-78 of automation-debt-simulator.jsx (main)
const SCENARIOS = {
  llm_confidence: {
    title: "LLM Output Reliability Pipeline",
    subtitle: "Validation layer accumulation",
    difficulty: "Medium",
    symptom: "LLM produces unreliable outputs that fail downstream checks",
    symptomatic: {
      label: "Add Validation Layers",
      desc: "Stack retry logic, regex checks, and human review. Catches bad outputs fast.",
      quickEffect: 28, erosionRate: 10,
      erosionChannel: "Complexity blocks prompt improvements. Cost grows. Team normalizes workarounds.",
    },
    fundamental: {
      label: "Restructure Prompt Architecture",
      desc: "Redesign input pipeline, improve context engineering, fix upstream data quality.",
      delay: 4, buildRate: 14, longEffect: 50,
    },
    transition: { ... },
    erosionChannels: ["Knowledge Drain", "Complexity Creep"],
  },
  agent_edge_cases: { difficulty: "Hard", erosionRate: 12, delay: 5, ... },
  tool_latency: { difficulty: "Easy", erosionRate: 8, delay: 3, ... },
};
```

### Confirmed Optimal Path Data (for replay comparison)

```javascript
// Lines 81-85 of automation-debt-simulator.jsx (main)
const OPTIMAL_PATHS = {
  llm_confidence: { seq: "SSTTFFFFFFFFFFF".slice(0,12).split(""),
    finalMetrics: { severity: 12, capacity: 82, dependency: 8, will: 62 }},
  agent_edge_cases: { seq: "SSSTFFFFFFFFFF".slice(0,12).split(""),
    finalMetrics: { severity: 18, capacity: 75, dependency: 12, will: 55 }},
  tool_latency: { seq: "STFFFFFFFFFFFF".slice(0,12).split(""),
    finalMetrics: { severity: 8, capacity: 88, dependency: 5, will: 68 }},
};
```

### Confirmed MCP Tool (from main server.py lines 1526-1662)

Key output fields returned by detect_automation_debt:
```python
result = {
    "recurring_symptom": params.recurring_symptom,
    "debt_score": debt_score,              # 0-100
    "debt_level": "Critical|At Risk|Healthy",
    "automation_coverage_estimate": f"{coverage}%",
    "erosion_channels": {ch: description for ch in active_channels},
    "b1_loop": {"fixes": [symptomatic fix labels]},
    "b2_loop": {"fixes": [fundamental fix labels]},
    "erosion_risk_score": erosion["risk_score"],
    "recommendations": [list of strings],
}
```

### Confirmed Palette (from main artifact)

```javascript
// Lines 3-8 of automation-debt-simulator.jsx (main)
const C = {
  bg: "#0d0f16", canvas: "#121420", panel: "#161928", panelBorder: "#1f2440",
  node: "#1a1e32", nodeBorder: "#283050", text: "#e2e6f0", textSec: "#7580a0",
  textMuted: "#404a68", accent: "#7c5cfc", accentGlow: "#7c5cfc44",   // PURPLE accent
  teal: "#00d4aa", blue: "#6b8aff", pink: "#ff6b8a", danger: "#ff5555", gold: "#ffd700",
};
```

### Wave 0 Test Stub Pattern (follow TO-05 precedent)

```javascript
// preview-app/src/__tests__/automation-debt-simulator.test.jsx
import { describe, test, expect } from 'vitest';

describe('AB-02: 12-Round Decision Game', () => {
  test('test_simulation_engine_initializes: SimEngine returns correct starting state', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
  test('test_stepSim_symptomatic: symptomatic choice increases fixDependency', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
  test('test_stepSim_nothing: doing nothing increases symptomSeverity', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
});

describe('AB-03: Three Scenarios', () => {
  test('test_scenarios_complete: all 3 scenarios have required fields', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
});

describe('AB-05: Grading and Gauge', () => {
  test('test_grade_A_threshold: composite >= 0.80 returns grade A', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
  test('test_debt_score_derivation: debtScore = (1 - composite) * 100', () => {
    throw new Error('Wave 0 stub -- not yet implemented');
  });
});
```

---

## Naming and Accent Color

**Confirmed accent:** `#7c5cfc` (electric violet/indigo)
- ST-003: orange `#ff8c42`
- ST-005: teal `#00d4aa`
- ST-006: violet `#7c5cfc` -- confirmed in main artifact

**File naming conventions (confirmed):**
- Artifact: `automation-debt-simulator.jsx`
- Cubelet: `ST-006-automation-debt.md`
- Skill: `automation-debt-detector.skill`
- MCP tool function: `detect_automation_debt`
- MCP tool section header: `# ST-006: Automation Debt Detector`

---

## Simulation Parameter Reference

| Parameter | LLM Confidence | Agent Edge-Cases | Tool Latency | Notes |
|-----------|---------------|------------------|--------------|-------|
| quickEffect | 28 | 25 | 22 | Severity reduction per symptomatic fix |
| erosionRate | 10 | 12 | 8 | Capacity erosion per symptomatic fix |
| buildRate | 14 | 12 | 16 | Severity reduction per fundamental (after delay) |
| delay | 4 | 5 | 3 | Rounds before fundamental fix starts working |
| longEffect | 50 | 55 | 45 | Max severity reduction from fundamental |
| difficulty | Medium | Hard | Easy | Student-visible difficulty label |

Difficulty ordering: Tool Latency (easiest) < LLM Confidence (medium) < Agent Edge-Cases (hardest).

---

## Erosion Channels Reference

| Channel | Active When | AI Example | Icon |
|---------|-------------|------------|------|
| Knowledge Drain | symptomatic choices >= 6 AND fundamental <= 2 | Validation layers catch bad outputs so no one investigates prompt failures | 🧠 |
| Complexity Creep | fixDependency > 60 | Exception handlers + fallback paths + retry logic = 3 new failure modes | 🕸 |
| Normalization | orgWill < 40 AND last 3 severity readings within 10 points | "200ms latency is just how our tools work" | 😐 |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Build all deliverables greenfield | Port from main-branch reference implementations | Phase 10 state audit | Reduces implementation time; focus is on verify, not build |
| Choice-count grading (ST-003) | Composite metric grading (ST-006) | ST-006 design | More nuanced assessment rewards diverse strategies |
| Loop diagram always visible (ST-003) | Post-game progressive disclosure (ST-006) | ST-006 design | Archetype reveal becomes pedagogical payoff |
| Single play-through | Replay with optimal path comparison | ST-006 addition | Scaffolded learning: explore first, then compare |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vite) |
| Config file | `preview-app/vite.config.js` (inferred from Phase 9 pattern) |
| Quick run command | `cd preview-app && npm test -- --run automation-debt` |
| Full suite command | `cd preview-app && npm test -- --run` |

MCP tests run via pytest:
| Property | Value |
|----------|-------|
| Framework | pytest |
| Config file | None detected (run from directory) |
| Quick run command | `cd "Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py -x` |
| Full suite command | `cd "Cubelets MCP Tool/files" && python -m pytest -x` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| AB-02 | SimEngine initializes correct starting state | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-02 | stepSim: symptomatic choice increases fixDependency | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-02 | stepSim: nothing choice increases symptomSeverity | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-03 | All 3 scenarios have required data fields | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-04 | 4 metrics tracked (symptom, capacity, dependency, will) | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-05 | Grade A at composite >= 0.80 | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-05 | debtScore = (1 - composite) * 100 | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-06 | detect_automation_debt returns debt_score 0-100 | unit | `pytest test_automation_debt.py -x` | Wave 0 |
| AB-07 | AutomationLayer.to_fix_record() converts to FixRecord | unit | `pytest test_automation_debt.py -x` | Wave 0 |
| AB-10 | 3 counter-patterns present in COUNTER_PATTERNS | unit | `npm test -- --run automation-debt` | Wave 0 |
| AB-08 | Skill installs and responds in Claude Desktop | manual | Manual smoke test | manual-only |
| AB-01 | Cubelet markdown has 6 faces | manual | File structure inspection | manual-only |
| AB-09 | Quality gate score >= 42/60 | manual | Cubelet quality review | manual-only |

### Sampling Rate
- **Per task commit:** `cd preview-app && npm test -- --run automation-debt`
- **Per wave merge:** `cd preview-app && npm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `preview-app/src/__tests__/automation-debt-simulator.test.jsx` -- covers AB-02, AB-03, AB-04, AB-05, AB-10
- [ ] `Cubelets MCP Tool/files/test_automation_debt.py` -- covers AB-06, AB-07
- [ ] Framework install: already installed (Phase 9 established vitest + pytest)

---

## Open Questions

1. **Wave 0 Test Stub Granularity**
   - What we know: TO-05 test stubs used a simple `throw new Error('Wave 0 stub')` pattern. Vitest runs them as failing stubs.
   - What's unclear: Whether the simulation engine functions (SimEngine, stepSim) can be imported from the JSX file in a Node.js test context.
   - Recommendation: Export SimEngine and stepSim as named exports in the artifact if they are to be unit-tested. Otherwise, test only the pure data constants (SCENARIOS, QUIZ, COUNTER_PATTERNS) by importing them directly.

2. **Skill File Binary Copy**
   - What we know: .skill files are ZIP/PK binary archives. The automation-debt-detector.skill exists in main as a binary.
   - What's unclear: Whether git operations (checkout, copy) will preserve the binary correctly when moving between worktree branches.
   - Recommendation: Verify binary integrity after copy (file size should be > 2KB, not ASCII text).

3. **Preview App App.jsx in Worktree**
   - What we know: App.jsx in main already has the st006 tab entry. The worktree preview-app/src only has `__tests__/`.
   - What's unclear: Whether the full App.jsx (with st006 tab) needs to be explicitly added to the worktree or will arrive via merge.
   - Recommendation: Explicitly copy App.jsx from main to worktree as part of the integration task. Do not rely on implicit merge.

---

## Sources

### Primary (HIGH confidence)
- `Interactive Artifact for Cubelets/automation-debt-simulator.jsx` (main branch) -- full code analysis, all components confirmed
- `Cubelets MCP Tool/files/cubelets_mcp_server.py` (main branch, lines 1478-1662) -- detect_automation_debt fully implemented
- `Cubelets/CubeletsMarkdown/ST-006-automation-debt.md` (main branch) -- all 6 faces, score_aggregate 54/60
- `Claude skills build for Cubelets/files/automation-debt-detector.skill` (main branch) -- binary archive confirmed
- `10-CONTEXT.md` -- locked decisions and constraints
- `REQUIREMENTS.md` -- AB-01 through AB-10 requirement definitions
- `STATE.md` -- Phase 9 UAT passed, Phase 10 not started

### Secondary (MEDIUM confidence)
- Phase 9 PLAN files -- Wave 0 test stub patterns (tool-orchestration-analyzer.test.jsx as reference)
- ST-003 burden-shift-simulator.jsx -- simulation engine ancestry confirmed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- sandbox constraints well-understood from Phases 8-9; MCP server pattern proven
- Architecture: HIGH -- all deliverables in main analyzed in full; port tasks are defined
- Pitfalls: HIGH -- sandbox constraints documented from Phase 9; worktree-specific risks identified
- Test stubs: MEDIUM -- vitest pattern confirmed from Phase 9; import strategy for JSX simulation engine TBD
- Skill binary: MEDIUM -- binary format confirmed, copy integrity needs verification

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable domain, no fast-moving dependencies)
