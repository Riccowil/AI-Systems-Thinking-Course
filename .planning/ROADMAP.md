# Roadmap: AI for Systems Thinking

## Milestones

- [x] **v1.0 Foundations + Intermediate** - Phases 1-6 (shipped 2026-03-17)
- [ ] **v1.1 Agentic Systems Design** - Phases 7-11 (in progress)

## Phases

<details>
<summary>v1.0 Foundations + Intermediate (Phases 1-6) - SHIPPED 2026-03-17</summary>

Phases 1-6 were completed pre-GSD. See .planning/MILESTONES.md for details.

Delivered: 6 cubelets (W1-C1, W1-C2, W1-C3, ST-001, ST-002, ST-003), 18 deliverables, all quality gates passed (52-53/60), deployed to Vercel.

</details>

### v1.1 Agentic Systems Design

**Milestone Goal:** Add 3 new cubelets (ST-004, ST-005, ST-006) that apply systems thinking frameworks to agentic AI design, teaching students to see agents, tool stacks, and automation as systems. Each cubelet delivers a full three-layer stack: interactive JSX artifact, MCP tool, and Claude skill.

**Phase Numbering:**
- Integer phases (7, 8, 9, 10, 11): Planned milestone work
- Decimal phases (e.g. 8.1): Urgent insertions if needed (marked INSERTED)

- [x] **Phase 7: Content Foundations** - Prerequisite chain, data models, agent visual vocabulary, and syllabus update
- [ ] **Phase 8: ST-004 Pathfinder (Agent Feedback Loops)** - Full three-layer stack for ST-004, validating cognitive load hypothesis
- [ ] **Phase 9: ST-005 Tool Orchestration** - Full three-layer stack for ST-005, highest-complexity cubelet
- [ ] **Phase 10: ST-006 Automation Debt** - Full three-layer stack for ST-006, scenario-based simulation
- [ ] **Phase 11: Integration + Deployment** - Wire all 3 cubelets into preview app, extend MCP server, deploy to Vercel

## Phase Details

### Phase 7: Content Foundations
**Goal**: All design decisions, data models, and prerequisite mappings are locked so cubelet building proceeds without rework
**Depends on**: v1.0 complete (Phase 6)
**Requirements**: CFND-01, CFND-02, CFND-03, CFND-04, CFND-05
**Research flag**: No -- extends established course patterns
**Estimated complexity**: LOW -- design and documentation work following existing conventions
**Success Criteria** (what must be TRUE):
  1. Prerequisite chain document includes ST-004, ST-005, and ST-006 with correct dependency ordering (ST-004 requires ST-001; ST-005 requires ST-002 + ST-004; ST-006 requires ST-003)
  2. Pydantic data models (AgentComponent, AgentLink, MCPTool, ToolDependency, AutomationLayer) are specified with field types, validation rules, and example payloads
  3. Agent visual vocabulary defines node types (agent, tool, memory, evaluator, constraint) with dark cybernetic styling that matches existing CLD builder aesthetic
  4. Course syllabus includes Week 3: Agentic Systems Design with learning objectives, deliverables, and practice exercises for all three cubelets
  5. Agent experience checkpoint defines what hands-on agent knowledge students need before entering ST-004
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md -- Prerequisite chain, agent experience checkpoint, and data model specifications
- [x] 07-02-PLAN.md -- Agent visual vocabulary and course syllabus update

### Phase 8: ST-004 Pathfinder (Agent Feedback Loops)
**Goal**: Students can map agent architectures as causal loop diagrams with agent-specific vocabulary, see auto-detected feedback loops with severity scores, and receive intervention recommendations -- delivered as a complete three-layer stack that validates the dual-domain cubelet format before ST-005 and ST-006 proceed
**Depends on**: Phase 7 (data models, visual vocabulary, prerequisite chain)
**Requirements**: AF-01, AF-02, AF-03, AF-04, AF-05, AF-06, AF-07, AF-08, AF-09, AF-10
**Research flag**: YES -- agent control flow coverage scope needs definition; cognitive load hypothesis must be validated with actual usage before proceeding to Phase 9
**Estimated complexity**: MEDIUM -- reuses ST-001 CLD canvas patterns but adds agent-specific node vocabulary and dagre layout
**Success Criteria** (what must be TRUE):
  1. Student opens the ST-004 artifact and sees a worked retry storm example pre-loaded on canvas with annotated feedback loops (reinforcing and balancing)
  2. Student can place agent-specific nodes (agent, tool, memory, evaluator, constraint) on the CLD canvas, draw causal links between them, and the artifact auto-detects reinforcing/balancing loops with severity scores in the right panel
  3. Progressive disclosure works: student predicts loop behavior first, then reveals algorithmic analysis -- the artifact does not show analysis until the student commits a prediction
  4. MCP tool `analyze_agent_feedback_loops` accepts AgentComponent + AgentLink inputs, internally transforms to CausalLink format, reuses existing `score_reinforcing_loops`, and returns loop classifications (R1, R2, B1, B2) with severity scores
  5. Claude skill `agent-feedback-analyzer.skill` guides a multi-step analysis workflow and is functional in Claude Desktop/CLI
  6. Cubelet markdown has all 6 faces (WHAT/WHY/HOW/WHERE/WHEN/APPLY) and scores >= 42/60 on quality gate
**Plans**: 5 plans

Plans:
- [x] 08-01-PLAN.md -- MCP tool: AgentComponent/AgentLink models and analyze_agent_feedback_loops tool
- [x] 08-02-PLAN.md -- Cubelet markdown (6 faces) and Claude skill ZIP
- [x] 08-03-PLAN.md -- Interactive artifact: shape-coded nodes, canvas, DFS loop detection, worked example, primer panel (complete: da81154)
- [x] 08-04-PLAN.md -- Interactive artifact: progressive disclosure, tabbed right panel, prediction comparison, interventions (complete: b9b2090)
- [ ] 08-05-PLAN.md -- Gap closure: compress artifact to sandbox size limit, fix stale closure and alert() bugs

### Phase 9: ST-005 Tool Orchestration
**Goal**: Students can input MCP tools and their dependencies, see a dependency graph with redundancy/coupling/blast radius analysis, and score interventions using Meadows hierarchy -- delivered as a complete three-layer stack
**Depends on**: Phase 8 (agent control flow foundation established, pathfinder lessons applied)
**Requirements**: TO-01, TO-02, TO-03, TO-04, TO-05, TO-06, TO-07, TO-08, TO-09, TO-10
**Research flag**: YES -- MCP tool stack scoring algorithm is novel; Meadows-level mappings for tool orchestration have no established patterns and need prototyping
**Estimated complexity**: HIGH -- novel scoring algorithm, dependency graph analysis, highest implementation complexity of the three cubelets
**Success Criteria** (what must be TRUE):
  1. Student opens the ST-005 artifact and sees a worked example of a realistic MCP tool stack with annotated leverage points
  2. Student can input MCP tools and their dependencies, and the artifact renders a dependency graph showing redundancy, coupling, and blast radius for each tool
  3. Student can score interventions (add tool, remove tool, refactor dependency) using Meadows hierarchy (L1 parameter tweak through L10 paradigm shift), with scores displayed in the right panel alongside tool stack health metrics (complexity, redundancy, brittleness)
  4. MCP tool `analyze_tool_orchestration` accepts tool list + dependencies + interventions, internally reuses existing `compare_interventions` via composition, and returns health scores with refactor recommendations
  5. Claude skill `tool-stack-analyzer.skill` guides a multi-step audit workflow and is functional in Claude Desktop/CLI
  6. Cubelet markdown has all 6 faces and scores >= 42/60 on quality gate
**Plans**: 4 plans

Plans:
- [ ] 09-01-PLAN.md -- MCP tool: MCPTool/ToolDependency models and analyze_tool_orchestration tool with composition
- [ ] 09-02-PLAN.md -- Cubelet markdown (6 faces) and Claude skill ZIP (tool-stack-analyzer)
- [ ] 09-03-PLAN.md -- Interactive artifact core: graph rendering, Build/Analyze modes, worked example, health scoring, tabbed right panel
- [ ] 09-04-PLAN.md -- Interactive artifact enhancement: failure simulation, blast radius, redundancy viz, intervention scoring with progressive disclosure

### Phase 10: ST-006 Automation Debt
**Goal**: Students can play a 12-round scenario-based decision game that reveals automation debt through the shifting-the-burden archetype, with post-game diagnosis and MCP-powered debt detection -- delivered as a complete three-layer stack
**Depends on**: Phase 8 (pathfinder lessons), Phase 9 (accumulated cubelet-building lessons)
**Requirements**: AB-01, AB-02, AB-03, AB-04, AB-05, AB-06, AB-07, AB-08, AB-09, AB-10
**Research flag**: YES -- production automation case studies needed; content quality depends on real-world examples that have not been collected yet; archetype boundary definition (when shifting-the-burden applies vs. when it does not) requires careful pedagogical design
**Estimated complexity**: MEDIUM -- reuses ST-003 simulation engine patterns but needs curated AI-specific scenarios and archetype boundary content
**Success Criteria** (what must be TRUE):
  1. Student can select from three pre-loaded AI automation scenarios (LLM low-confidence outputs, agent edge-case failures, tool call latency issues) and begin a 12-round decision game
  2. Each round presents a choice (quick fix, fundamental investment, transition strategy, or nothing) and the system visibly tracks severity, capacity, dependency, and willingness metrics across rounds
  3. Post-simulation, student receives a grade (A-F) with erosion channel diagnosis and a debt accumulation visualization showing how their choices created or avoided burden-shift patterns
  4. MCP tool `detect_automation_debt` accepts AutomationLayer inputs + fundamental solution description, internally reuses existing `detect_burden_shift` via composition, and returns burden-shift pattern analysis with B1/B2/R1 loop identification
  5. Claude skill `automation-debt-detector.skill` guides a multi-step detection workflow and is functional in Claude Desktop/CLI
  6. Cubelet markdown has all 6 faces, includes archetype boundaries section (when pattern applies and when it does not, with counter-examples), and scores >= 42/60 on quality gate
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD
- [ ] 10-03: TBD

### Phase 11: Integration + Deployment
**Goal**: All 3 new cubelets are wired into the existing preview app, MCP server, and course infrastructure -- students access 9 cubelets through a single deployed app with consistent aesthetic and working prerequisites
**Depends on**: Phase 8, Phase 9, Phase 10 (all cubelet stacks complete)
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04, INTG-05, INTG-06, INTG-07, INTG-08
**Research flag**: No -- mechanical integration work following established patterns
**Estimated complexity**: LOW-MEDIUM -- integration is straightforward but aesthetic consistency verification across 9 artifacts requires attention
**Success Criteria** (what must be TRUE):
  1. Preview app shows 9 tabs (6 existing + 3 new), each lazy-loaded, with ST-004/005/006 artifacts rendering correctly alongside existing cubelets
  2. systems-thinking-cubelets MCP server exposes 6 tools (3 existing + 3 new) and all 6 respond correctly when called from Claude Desktop/CLI
  3. All 3 new Claude skills are installed and functional -- invoking each skill triggers the expected multi-step workflow
  4. master-syllabus.json includes Week 3 module with 3 new lessons, and prerequisite-chain.json includes ST-004/005/006 entries with correct dependency ordering
  5. Dark cybernetic aesthetic is consistent across all 9 artifacts -- no visual breaks in palette, typography, or component styling when switching tabs
  6. Vercel deployment is live with all 9 artifacts functional at the production URL
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

## Coverage

**v1.1 Requirements: 43 total**
**Mapped to phases: 43**
**Unmapped: 0**

| Category | Count | Phase | Requirement IDs |
|----------|-------|-------|-----------------|
| Content Foundations (CFND) | 5 | Phase 7 | CFND-01, CFND-02, CFND-03, CFND-04, CFND-05 |
| Agent Feedback Loops (AF) | 10 | Phase 8 | AF-01 through AF-10 |
| Tool Orchestration (TO) | 10 | Phase 9 | TO-01 through TO-10 |
| Automation Debt (AB) | 10 | Phase 10 | AB-01 through AB-10 |
| Integration (INTG) | 8 | Phase 11 | INTG-01 through INTG-08 |

## Dependency Chain

```
Phase 7 (Content Foundations)
    |
    v
Phase 8 (ST-004 Pathfinder)  <-- validate cognitive load here
    |
    +-------+
    |       |
    v       v
Phase 9   Phase 10
(ST-005)  (ST-006)
    |       |
    +---+---+
        |
        v
  Phase 11 (Integration)
```

**Notes:**
- Phase 9 and Phase 10 both depend on Phase 8 but are independent of each other
- Phase 8 is the critical gate: if cognitive load hypothesis fails, Phase 9 and 10 designs must adapt
- Phase 11 requires all three cubelet phases (8, 9, 10) complete before integration begins

## Research Flags

| Phase | Research Needed | Topic | Risk if Skipped |
|-------|----------------|-------|-----------------|
| 7 | No | Extends established patterns | Low |
| 8 | YES | Agent control flow scope; cognitive load validation | Build cubelets students cannot complete in time |
| 9 | YES | Novel Meadows-to-tool-orchestration scoring algorithm | Scoring feels arbitrary, students lose trust in framework |
| 10 | YES | Production automation case studies; archetype boundary definition | Scenarios feel hypothetical, archetype gets misapplied |
| 11 | No | Mechanical integration | Low |

## Progress

**Execution Order:** 7 -> 8 -> 9 -> 10 -> 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 7. Content Foundations | v1.1 | 2/2 | COMPLETE | 2026-03-21 |
| 8. ST-004 Pathfinder | v1.1 | 4/5 | In progress | - |
| 9. ST-005 Tool Orchestration | v1.1 | 0/4 | Planned | - |
| 10. ST-006 Automation Debt | v1.1 | 0/TBD | Not started | - |
| 11. Integration + Deployment | v1.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-03-21*
*Last updated: 2026-03-21*
