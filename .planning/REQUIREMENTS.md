# Requirements: AI for Systems Thinking — Course Factory

**Defined:** 2026-03-23
**Core Value:** Every cubelet ships three usable deliverables — artifact, MCP tool, skill — so learning is hands-on.

## v1.2 Requirements

Requirements for Polish & Deferred Features milestone. Enhances existing cubelets, no new concepts.

### ST-004 Enhancements (Agent Feedback Loops)

- [x] **ST004-01**: Student can import a JSON agent execution trace (schema: agent name, steps with tool calls, timestamps, token counts) and see it auto-mapped as a CLD with feedback loops detected
- [x] **ST004-02**: Student can toggle a cost/latency overlay on agent feedback loop nodes showing token usage and time per step
- [ ] **ST004-03**: ST-004 primer panel expanded to match ST-005's depth (Meadows levels, worked examples, progressive disclosure)

### ST-005 Enhancements (Tool Orchestration)

- [ ] **ST005-01**: Student can compare two tool stack configurations side-by-side with diff highlighting on dependencies, health scores, and intervention recommendations
- [ ] **ST005-02**: All 9 vitest Wave 0 stubs replaced with real assertions testing actual component logic

### ST-006 Enhancements (Automation Debt)

- [ ] **ST006-01**: Student can build custom automation debt scenarios with editable fix parameters (label, side effects, erosion rate) and run simulations against them

### Cross-Cubelet

- [ ] **XCUBE-01**: Student can browse a pattern library of 5-8 common system archetypes (reinforcing loops, balancing loops, shifting the burden, fixes that fail, limits to growth, success to the successful, eroding goals, escalation) with one-paragraph descriptions and pre-built CLD examples loadable into relevant cubelets
- [ ] **XCUBE-02**: master-syllabus.json quality_gate field updated to COMPLETE for all 9 cubelets
- [ ] **XCUBE-03**: ST-003 prerequisite inconsistency resolved between cubelet markdown and syllabus reference files

### Deployment

- [ ] **DEPLOY-01**: All modified artifacts redeployed to Vercel with updated preview app

## Future Requirements

Deferred beyond v1.2. Tracked but not in current roadmap.

- **FUTURE-01**: Guided learning path with progress tracking and prerequisite gating across all cubelets
- **FUTURE-02**: Student completion indicators and self-assessment checkpoints
- **FUTURE-03**: Multi-agent system modeling (Week 4 candidate)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New cubelets / Week 4 | v1.2 is polish, not new content |
| Student auth/accounts | No login system; open access artifacts |
| LMS integration | Standalone delivery via Vercel + Claude |
| Real-time collaboration | Auth/sync complexity with zero pedagogical benefit |
| Framework-specific agent traces | Generic JSON schema only; no LangSmith/CrewAI-specific parsers |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ST004-01 | Phase 13 | Complete |
| ST004-02 | Phase 13 | Complete |
| ST004-03 | Phase 13 | Pending |
| ST005-01 | Phase 14 | Pending |
| ST005-02 | Phase 14 | Pending |
| ST006-01 | Phase 15 | Pending |
| XCUBE-01 | Phase 15 | Pending |
| XCUBE-02 | Phase 16 | Pending |
| XCUBE-03 | Phase 16 | Pending |
| DEPLOY-01 | Phase 17 | Pending |

**Coverage:**
- v1.2 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 — traceability filled after roadmap creation*
