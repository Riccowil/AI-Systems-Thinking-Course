# Requirements: AI for Systems Thinking — v1.1 Agentic Systems Design

**Defined:** 2026-03-21
**Core Value:** Every cubelet ships three usable deliverables — an interactive artifact students can touch, an MCP tool they can call, and a Claude skill they can invoke — so learning is always hands-on, never passive.

## v1.1 Requirements

Requirements for this milestone. Each maps to roadmap phases (7-11).

### Content Foundations (CFND)

- [ ] **CFND-01**: Prerequisite chain updated with ST-004/005/006 dependencies (ST-004 requires ST-001, ST-005 requires ST-002 + ST-004, ST-006 requires ST-003)
- [ ] **CFND-02**: Agent experience checkpoint defined — students know what hands-on agent experience is expected before ST-004
- [ ] **CFND-03**: Pydantic data models specified for AgentComponent, AgentLink, MCPTool, ToolDependency, AutomationLayer
- [ ] **CFND-04**: Agent visual vocabulary documented — node types (agent, tool, memory, evaluator, constraint) with dark cybernetic theme styling
- [ ] **CFND-05**: Course syllabus updated with Week 3: Agentic Systems Design section (ST-004/005/006 learning objectives, deliverables, practice exercises)

### ST-004: Agent Feedback Loops (AF)

- [ ] **AF-01**: Cubelet markdown with all 6 faces (WHAT/WHY/HOW/WHERE/WHEN/APPLY) covering agent feedback loop identification
- [ ] **AF-02**: Interactive JSX artifact where student maps agent architecture as CLD with agent-specific node vocabulary, auto-detects reinforcing/balancing loops, and scores loop severity
- [ ] **AF-03**: Artifact includes worked example (retry storm scenario) pre-loaded on canvas with annotated feedback loops
- [ ] **AF-04**: Progressive disclosure — student predicts loop behavior before artifact reveals algorithmic analysis
- [ ] **AF-05**: Right-panel instrumentation showing loop classification (R1, R2, B1, B2), severity score, and intervention recommendations
- [ ] **AF-06**: MCP tool `analyze_agent_feedback_loops` accepts agent components + links, returns reinforcing loops with severity scores
- [ ] **AF-07**: MCP tool reuses existing `score_reinforcing_loops` via composition (transforms AgentComponent/AgentLink to CausalLink format)
- [ ] **AF-08**: Claude skill `agent-feedback-analyzer.skill` guides multi-step workflow for analyzing agent architectures
- [ ] **AF-09**: Quality gate score >= 42/60 (7/10 per face minimum)
- [ ] **AF-10**: Prerequisite refresher panel referencing ST-001 concepts (loop polarity, reinforcing vs balancing)

### ST-005: Tool Orchestration as System Design (TO)

- [ ] **TO-01**: Cubelet markdown with all 6 faces covering tool stack analysis through leverage point lens
- [ ] **TO-02**: Interactive JSX artifact where student inputs MCP tools + dependencies, artifact builds dependency graph and identifies redundancy, coupling, and blast radius
- [ ] **TO-03**: Artifact scores each tool intervention using Meadows hierarchy (parameter tweak L1 through paradigm shift L10)
- [ ] **TO-04**: Worked example using a realistic MCP tool stack with annotated leverage points
- [ ] **TO-05**: Right-panel instrumentation showing tool stack health score (complexity, redundancy, brittleness) and leverage point rankings
- [ ] **TO-06**: MCP tool `analyze_tool_orchestration` accepts tool list + dependencies + interventions, returns health scores and refactor recommendations
- [ ] **TO-07**: MCP tool reuses existing `compare_interventions` via composition (transforms MCPTool/ToolDependency to intervention format)
- [ ] **TO-08**: Claude skill `tool-stack-analyzer.skill` guides multi-step workflow for auditing tool stacks
- [ ] **TO-09**: Quality gate score >= 42/60
- [ ] **TO-10**: Prerequisite refresher panel referencing ST-002 concepts (Meadows hierarchy, leverage scoring)

### ST-006: Shifting the Burden in Automation (AB)

- [ ] **AB-01**: Cubelet markdown with all 6 faces covering automation debt detection using shifting-the-burden archetype
- [ ] **AB-02**: Interactive JSX artifact with scenario-based simulation (12-round decision game) using AI automation contexts
- [ ] **AB-03**: Three pre-loaded scenarios: (1) LLM low-confidence outputs, (2) Agent edge-case failures, (3) Tool call latency issues
- [ ] **AB-04**: Each round: student chooses quick fix, fundamental investment, transition strategy, or nothing — system tracks severity, capacity, dependency, willingness
- [ ] **AB-05**: Post-simulation grade (A-F) with erosion channel diagnosis and debt accumulation visualization
- [ ] **AB-06**: MCP tool `detect_automation_debt` accepts automation layers + fundamental solution, identifies burden shift patterns with B1/B2/R1 loop analysis
- [ ] **AB-07**: MCP tool reuses existing `detect_burden_shift` via composition (transforms AutomationLayer to FixRecord format)
- [ ] **AB-08**: Claude skill `automation-debt-detector.skill` guides multi-step workflow for detecting automation debt
- [ ] **AB-09**: Quality gate score >= 42/60
- [ ] **AB-10**: Archetype boundaries section — explicitly defines when shifting-the-burden applies and when it doesn't, with counter-examples

### Integration and Deployment (INTG)

- [ ] **INTG-01**: Preview app App.jsx updated with 3 new lazy-loaded tabs for ST-004/005/006
- [ ] **INTG-02**: systems-thinking-cubelets MCP server extended from 3 to 6 tools (no new server created)
- [ ] **INTG-03**: All 3 new Claude skills installed and functional in Claude Desktop/CLI
- [ ] **INTG-04**: master-syllabus.json updated with Week 3 module and 3 new lessons
- [ ] **INTG-05**: prerequisite-chain.json updated with ST-004/005/006 entries
- [ ] **INTG-06**: Dark cybernetic aesthetic consistency verified across all 9 artifacts
- [ ] **INTG-07**: Vercel deployment updated with all 9 artifacts functional
- [ ] **INTG-08**: dagre dependency installed in preview-app (^0.8.5)

## v1.2 Requirements (Deferred)

Acknowledged features to add after v1.1 core is validated in classroom.

- **DEFER-01**: Live agent execution trace import for ST-004 (paste LangGraph JSON, auto-generate CLD)
- **DEFER-02**: Cost calculator overlay for ST-004 (estimate $/month at scale when loop detected)
- **DEFER-03**: Comparison mode for ST-005 (load two tool stacks, diff dependency graphs and scores)
- **DEFER-04**: Custom scenario builder for ST-006 (students define own automation debt scenario)
- **DEFER-05**: Archetype pattern library (pre-built CLD templates for common agent anti-patterns)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auto-generate CLD from codebase | Eliminates the learning — drawing the CLD IS the pedagogy |
| Real-time multi-user collaboration | Auth/sync complexity with zero pedagogical benefit |
| LLM chat interface for analysis | Moves analysis from student brain to AI |
| Gamification (points, badges) | Extrinsic motivation crowds out systems thinking insight |
| LMS integration (SCORM, gradebook) | Out of scope per PROJECT.md — standalone delivery |
| Video walkthroughs in artifacts | Bloats artifact, competes with interaction, goes stale |
| Multi-agent system modeling | Adds significant complexity, unclear if students build multi-agent yet |
| Continuous monitoring integration | Requires production infrastructure, out of scope for classroom |
| New MCP server for agentic cubelets | Extend existing systems-thinking-cubelets server instead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CFND-01 | Phase 7 | Pending |
| CFND-02 | Phase 7 | Pending |
| CFND-03 | Phase 7 | Pending |
| CFND-04 | Phase 7 | Pending |
| CFND-05 | Phase 7 | Pending |
| AF-01 | Phase 8 | Pending |
| AF-02 | Phase 8 | Pending |
| AF-03 | Phase 8 | Pending |
| AF-04 | Phase 8 | Pending |
| AF-05 | Phase 8 | Pending |
| AF-06 | Phase 8 | Pending |
| AF-07 | Phase 8 | Pending |
| AF-08 | Phase 8 | Pending |
| AF-09 | Phase 8 | Pending |
| AF-10 | Phase 8 | Pending |
| TO-01 | Phase 9 | Pending |
| TO-02 | Phase 9 | Pending |
| TO-03 | Phase 9 | Pending |
| TO-04 | Phase 9 | Pending |
| TO-05 | Phase 9 | Pending |
| TO-06 | Phase 9 | Pending |
| TO-07 | Phase 9 | Pending |
| TO-08 | Phase 9 | Pending |
| TO-09 | Phase 9 | Pending |
| TO-10 | Phase 9 | Pending |
| AB-01 | Phase 10 | Pending |
| AB-02 | Phase 10 | Pending |
| AB-03 | Phase 10 | Pending |
| AB-04 | Phase 10 | Pending |
| AB-05 | Phase 10 | Pending |
| AB-06 | Phase 10 | Pending |
| AB-07 | Phase 10 | Pending |
| AB-08 | Phase 10 | Pending |
| AB-09 | Phase 10 | Pending |
| AB-10 | Phase 10 | Pending |
| INTG-01 | Phase 11 | Pending |
| INTG-02 | Phase 11 | Pending |
| INTG-03 | Phase 11 | Pending |
| INTG-04 | Phase 11 | Pending |
| INTG-05 | Phase 11 | Pending |
| INTG-06 | Phase 11 | Pending |
| INTG-07 | Phase 11 | Pending |
| INTG-08 | Phase 11 | Pending |

**Coverage:**
- v1.1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after research synthesis*
