# Phase 10: ST-006 Automation Debt - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete three-layer stack for ST-006 Shifting the Burden in Automation: interactive JSX artifact (12-round scenario-based decision game), MCP tool (detect_automation_debt), Claude skill (automation-debt-detector.skill), and cubelet markdown (6 faces). Students play through AI automation scenarios, making choices between quick fixes and fundamental solutions, then receive post-game diagnosis with B1/B2/R1 archetype mapping and grading.

</domain>

<decisions>
## Implementation Decisions

### Relationship to ST-003
- Fork and specialize from ST-003's burden-shift-simulator.jsx (629 lines)
- Same dark cybernetic base palette but NEW accent color (distinct from ST-003's orange)
- Claude determines what code is reusable vs needs rewriting based on fit
- ST-006 must feel distinctly different through: metrics dashboard, team/budget pressure, timeline visualization

### Scenario Design & Round Mechanics
- 3 pre-loaded scenarios per requirements: (1) LLM low-confidence outputs, (2) Agent edge-case failures, (3) Tool call latency issues
- Difficulty levels: Claude decides naturally based on domain (some will be harder)
- Fixed 12 rounds — every student plays the full arc
- Untimed rounds — focus on thinking through trade-offs, not speed
- 4 core metrics tracked: Severity (0-100), Capacity (0-100), Dependency (0-100), Willingness (0-100)
- Choice presentation: cards with trade-off preview — each card shows action name, description, and immediate effect preview (e.g., "Severity -30, Dependency +10")
- 4 choices per round: quick fix, fundamental investment, transition strategy, or do nothing
- "Do nothing" has consequences — severity grows, capacity may erode. Inaction IS a choice.
- During gameplay: 2x2 dashboard grid — each metric panel shows current value, trend arrow, and mini sparkline
- B1/B2/R1 loop diagram is POST-GAME ONLY — progressive disclosure, the archetype reveal is the payoff

### Post-Game Diagnosis & Grading
- A-F grading based on final metric state: low severity + high capacity + low dependency + high willingness = A
- Post-game screen shows: B1/B2/R1 archetype diagram + erosion timeline
- B1/B2/R1 diagram design: Claude decides most pedagogically effective visualization (student's choices mapped to loops)
- Debt accumulation visualization: circular gauge/speedometer that moves from green to red
- Named erosion channel diagnosis with explanations: 'Knowledge Drain' (fixes prevent learning), 'Complexity Creep' (workarounds add layers), 'Normalization' (team accepts degraded state) — each with 1-line explanation and AI-specific example
- 'Try Again' button — students can replay same scenario to try better strategy
- Optimal path comparison: shown ONLY after second attempt (progressive disclosure — first play has no optimal, replay shows optimal for comparison)

### Archetype Boundaries (AB-10)
- Post-game tab alongside diagnosis — "Boundaries" tab appears after seeing results
- 3 named counter-patterns when burden-shift does NOT apply:
  - (1) Novel problem — no known fundamental solution yet
  - (2) Legitimate triage — quick fix IS the right call under true emergency
  - (3) Acceptable trade-off — cost of fundamental fix exceeds benefit
  - Each with AI-specific example
- Interactive: content first (3 counter-patterns explained), then 3-question mini-quiz to test understanding
- Also in cubelet markdown Face 6 (APPLY) — written "When to Apply / When Not To" section reinforcing artifact content

### MCP Tool Composition
- `detect_automation_debt` wraps existing `detect_burden_shift` via composition
- AutomationLayer model: layer_name, layer_type (quick_fix/fundamental/transition), side_effects, duration_active
- AutomationLayer.to_fix_record() method converts to FixRecord format for detect_burden_shift
- Input: current state only (list of AutomationLayers + fundamental_solution description) — stateless, no round history
- Output beyond detect_burden_shift: debt_score (0-100), erosion_channels (named patterns), automation_coverage_estimate, and automation-specific recommendations (e.g., "Convert manual review to training pipeline")

### Claude's Discretion
- Exact accent color for ST-006 (must differ from ST-003 orange and ST-005 teal)
- How much ST-003 simulation engine code to reuse vs rewrite
- Scenario difficulty calibration
- B1/B2/R1 archetype diagram visualization design
- 2x2 dashboard grid layout and sparkline implementation
- Gauge/speedometer component design
- Scenario selection screen design (cards, carousel, etc.)
- Cubelet markdown wording for all 6 faces
- Skill workflow step count and step names
- Mini-quiz question design for archetype boundaries

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `burden-shift-simulator.jsx` (629 lines) — ST-003 artifact with scenario selection, round-based simulation, B1/B2/R1 loop tracking, symptomatic/fundamental/transition choices. Fork as starting point.
- `detect_burden_shift` MCP tool — existing tool with FixRecord model, erosion scoring (0-100), transition strategy generation. ST-006's detect_automation_debt wraps this.
- Dark cybernetic palette constants (C object) — shared across all cubelets
- Array-based React state pattern — proven sandbox-compatible (Phase 9 fix)
- z-index layering on toolbar/panels — required for sandbox rendering (Phase 9 fix)
- viewBox-based SVG scaling — if any SVG visualization needed

### Sandbox Constraints (from Phase 9)
- Artifact must stay under Claude.ai sandbox token limit
- Use array-based state (not Set) for React state
- Toolbar/panels need explicit z-index to avoid overlap
- Test via file drop into Claude.ai for sandbox verification

### Integration Points
- systems-thinking-cubelets MCP server (server.py) — add detect_automation_debt tool here
- AutomationLayer Pydantic model — defined in Phase 7 CFND-03
- prerequisite-chain.json — ST-006 requires ST-003
- master-syllabus.json — Week 3 lesson entry
- Preview app App.jsx — lazy-loaded tab for ST-006

</code_context>

<deferred>
## Deferred Ideas
- Custom scenario builder (DEFER-04 in REQUIREMENTS.md) — students define own automation debt scenario
- Round history analysis in MCP tool — could accept array of choices for pattern detection (decided: current state only for v1.1)
- Side-by-side comparison of two students' game results — collaborative learning feature
</deferred>
