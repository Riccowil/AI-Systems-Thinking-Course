# Phase 10: ST-006 Automation Debt — Research

**Researched:** 2026-03-22
**Confidence:** HIGH
**Approach:** Port-and-verify (deliverables exist in main branch)

## Key Finding: Deliverables Already Exist

All four Phase 10 deliverables exist in the **main branch** as complete implementations:

| Deliverable | Path | Lines | Status |
|-------------|------|-------|--------|
| Interactive artifact | `Interactive Artifact for Cubelets/automation-debt-simulator.jsx` | 516 | Complete — purple accent `#7c5cfc` |
| MCP tool | `Cubelets MCP Tool/files/cubelets_mcp_server.py` (lines 1481-1662) | ~180 | Complete — `detect_automation_debt` + `AutomationLayer` model |
| Cubelet markdown | `ST-006-automation-debt.md` | — | Complete — 54/60 (PASS) |
| Claude skill | `Claude skills build for Cubelets/files/automation-debt-detector.skill` | ZIP | Complete — binary archive |

**Worktree gaps:** The worktree (`claude/admiring-lovelace`) has `automation-debt-simulator.jsx` and `App.jsx` tab already present. The MCP server in the worktree does NOT have `detect_automation_debt` or `AutomationLayer` — these need to be added.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fork from ST-003 burden-shift-simulator.jsx (629 lines)
- NEW accent color: purple `#7c5cfc` (distinct from ST-003 orange `#ff8c42`, ST-005 teal `#00d4aa`)
- 3 pre-loaded scenarios: (1) LLM low-confidence, (2) Agent edge-case failures, (3) Tool call latency
- Fixed 12 rounds, untimed
- 4 core metrics: Severity, Capacity, Dependency, Willingness (0-100 each)
- 4 choices per round: quick fix, fundamental, transition, do nothing
- Cards with trade-off preview showing immediate effect
- 2x2 dashboard grid with sparklines during gameplay
- B1/B2/R1 loop diagram POST-GAME ONLY (progressive disclosure)
- A-F grading based on composite metric state
- Named erosion channels: Knowledge Drain, Complexity Creep, Normalization
- Try Again button; optimal path shown ONLY on 2nd attempt
- Archetype boundaries tab with 3 counter-patterns + 3-question mini-quiz
- `detect_automation_debt` wraps `detect_burden_shift` via composition
- AutomationLayer with `to_fix_record()` method
- Stateless MCP tool input (current state only, no round history)

### Deferred
- Custom scenario builder (DEFER-04)
- Round history analysis in MCP tool
- Side-by-side comparison of two students' results

## Architecture Patterns

### Artifact (automation-debt-simulator.jsx)
- Same dark cybernetic palette object (C) with purple accent `#7c5cfc`
- `SimEngine()` — creates initial state for a scenario
- `stepSim(state, choice)` — steps simulation forward one round
- `DebtGauge` — SVG circular gauge (green to red)
- `LoopDiagram` — SVG B1/B2/R1 archetype visualization
- `Spark` — mini sparkline charts for metric dashboard
- `AutomationDebtSimulator` — main export component
- Phases: scenario selection → gameplay (12 rounds) → results/diagnosis
- SCENARIOS object with `llm_confidence`, `agent_edge_cases`, and a third scenario
- QUIZ array (3 questions), COUNTER_PATTERNS, EROSION_CHANNELS, OPTIMAL_PATHS constants

### MCP Tool Composition
```
AutomationLayer (layer_name, layer_type, side_effects, duration_active)
    → to_fix_record() → FixRecord (label, is_symptomatic, side_effects, duration_active)
        → detect_burden_shift() → B1/B2/R1 analysis
            → detect_automation_debt adds: debt_score, erosion_channels, recommendations
```

**Debt score formula:** `quick_fix_ratio × 60 + erosion_factor × 40`
**Debt levels:** "Critical" (≥67), "At Risk" (≥34), "Healthy" (<34)

### Existing detect_burden_shift API
- Input: `DetectBurdenShiftInput` — recurring_symptom, fixes_applied (List[FixRecord]), fundamental_solution, viability ratings
- Classification: `_classify_fix()` uses keyword heuristics
- Scoring: `_compute_erosion_risk()` returns 0-100 score
- Output: B1/B2/R1 loop analysis, archetype confirmation, transition strategy

## Sandbox Constraints (from Phase 8/9)

- Artifact must stay under Claude.ai sandbox token limit (~500 lines is safe)
- Use array-based React state (not Set) for compatibility
- Toolbar/panels need explicit z-index to avoid overlap
- Export functions for testability (SimEngine, stepSim, getGrade, etc.)

## Pitfalls

1. **Worktree/main divergence:** MCP server in worktree is behind main — must add AutomationLayer model and detect_automation_debt tool to worktree's cubelets_mcp_server.py
2. **Sandbox size:** Artifact at 516 lines is near the limit — avoid adding complexity
3. **Skill binary integrity:** `.skill` ZIP archives may not copy cleanly between branches — verify file size > 2KB after copy
4. **Dual-copy requirement:** Artifact must exist in BOTH `Interactive Artifact for Cubelets/` AND `preview-app/src/` for Phase 11 integration
5. **Test exports:** JSX artifact needs `module.exports` or named exports for Vitest to import SimEngine/stepSim
6. **MCP server section placement:** New tool must go AFTER existing tools in cubelets_mcp_server.py to avoid breaking line number references

## Requirement Coverage

| Req ID | Description | Deliverable |
|--------|-------------|-------------|
| AB-01 | Cubelet markdown (6 faces, archetype boundaries) | Cubelet markdown |
| AB-02 | 12-round decision game JSX artifact | Interactive artifact |
| AB-03 | 3 pre-loaded AI automation scenarios | Interactive artifact |
| AB-04 | 4 choices per round, 4 metrics tracked | Interactive artifact |
| AB-05 | Post-simulation grade (A-F) + visualization | Interactive artifact |
| AB-06 | detect_automation_debt MCP tool | MCP tool |
| AB-07 | MCP tool reuses detect_burden_shift via composition | MCP tool |
| AB-08 | Claude skill automation-debt-detector.skill | Claude skill |
| AB-09 | Quality gate >= 42/60 | Cubelet markdown (already 54/60) |
| AB-10 | Archetype boundaries with counter-examples | Interactive artifact + cubelet |

## Validation Architecture

### Test Framework
- **Artifact tests:** Vitest (`preview-app/src/__tests__/automation-debt-simulator.test.jsx`)
- **MCP tool tests:** pytest (`Cubelets MCP Tool/files/test_automation_debt.py`)

### Wave 0 Test Stubs Required

**File 1:** `preview-app/src/__tests__/automation-debt-simulator.test.jsx`
- AB-02: 12-round game completes (3 tests: game starts, rounds advance, game ends at 12)
- AB-03: All 3 scenarios selectable (1 test)
- AB-04: Metrics tracked correctly (1 test)
- AB-05: Grade calculated correctly (2 tests: grade A for optimal, grade F for all-quick-fix)
- AB-10: Counter-patterns and quiz present (2 tests)

**File 2:** `Cubelets MCP Tool/files/test_automation_debt.py`
- AB-06: Tool accepts AutomationLayer input and returns analysis (2 tests)
- AB-07: Tool internally calls detect_burden_shift (1 test)

### Sampling Rate
- Every task with `type="auto"` must have an automated verify command
- No 3 consecutive tasks without automated verify
- Test commands must filter to relevant tests only (not full suite)

---
*Research completed: 2026-03-22*
