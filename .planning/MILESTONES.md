# Milestones
## v1.1 — Agentic Systems Design (Shipped: 2026-03-23)

**Phases:** 7-12 (6 phases, 17 plans, 67 commits)
**Timeline:** 3 days (2026-03-21 to 2026-03-23)
**Lines added:** 20,553 across 94 files

### What Shipped

**Module 3: Agentic Systems Design (Week 3)**
- ST-004: Agent Feedback Loops (50/60) — map agent architectures as CLDs, auto-detect reinforcing/balancing loops with severity scoring
- ST-005: Tool Orchestration as System Design (48/60) — dependency graph analysis, Meadows hierarchy intervention scoring, health metrics
- ST-006: Shifting the Burden in Automation (54/60) — 12-round scenario simulation, post-game erosion diagnosis, archetype boundaries

### Deliverables
- 3 Interactive JSX Artifacts (agent-feedback-loop-builder, tool-orchestration-analyzer, automation-debt-simulator)
- 3 MCP Tools added to systems-thinking-cubelets server (6 total)
- 3 Claude Skills (agent-feedback-analyzer, tool-stack-analyzer, automation-debt-detector)
- Preview app updated to 9 tabs, redeployed to Vercel
- Course syllabus updated with Week 3 module (30 min, 3 lessons)
- Prerequisite chain updated to 9 cubelets

### Architecture Decisions
- Composition over duplication: AgentLink wraps CausalLink, AutomationLayer wraps FixRecord
- Custom SVG layouts over heavy visualization frameworks (ReactFlow, D3 rejected)
- Agent experience checkpoint is conceptual-only (no framework-specific knowledge required)
- Named ES exports for testability (vitest ESM mode)
- Single MCP server extended (no new server created)

### Quality
- All 43 requirements satisfied (3-source cross-reference verified)
- All 6 phases passed verification
- 23 MCP tests, 18 vitest tests, 76 Nyquist validation tests — all green
- UAT: 13/13 (ST-005), 5/5 (ST-006), human-verified (ST-004, skills, aesthetic)
- Nyquist compliant: all 6 phases

### Tech Debt (Tracked)
- 9 vitest Wave 0 stubs for ST-005 (MCP tests cover functionality)
- master-syllabus.json quality_gate not updated to COMPLETE
- REQUIREMENTS.md checkboxes stale (archived with all marked complete)
- ST-004 primer panel thinner than ST-005's expanded version
- ST-003 prerequisite inconsistency between two reference files (transitively satisfied)

**Last phase number:** 12

---


## v1.0 — Foundations of Systems Thinking + AI (COMPLETE)

**Completed:** 2026-03-17
**Phases:** 1-6 (pre-GSD, estimated)

### What Shipped

**Module 1: Foundations (Week 1)**
- W1-C1: Systems Thinking Fundamentals (53/60)
- W1-C2: AI as a System Lever (53/60)
- W1-C3: SMB AI Mindset Shift (52/60)

**Module 2: Intermediate (Week 2+)**
- ST-001: Reinforcing Feedback Loops (53/60)
- ST-002: Leverage Points in Complex Systems (53/60)
- ST-003: Shifting the Burden Archetype (53/60)

### Deliverables
- 6 Interactive JSX Artifacts
- 6 MCP Tools (across 3 Python servers)
- 6 Claude Skills (.skill packages)
- Preview app deployed to Vercel
- Course syllabus and prerequisite chain

### Infrastructure
- MCP servers: week1-foundations, systems-thinking-cubelets, systems-thinking (base)
- Deployment: https://preview-app-two.vercel.app
- Quality gate: All 6 PASS

**Last phase number:** 6
