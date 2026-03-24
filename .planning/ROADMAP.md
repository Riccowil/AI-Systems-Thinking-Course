# Roadmap: AI for Systems Thinking

## Milestones

- [x] **v1.0 Foundations + Intermediate** — Phases 1-6 (shipped 2026-03-17)
- [x] **v1.1 Agentic Systems Design** — Phases 7-12 (shipped 2026-03-23)
- [ ] **v1.2 Polish & Deferred Features** — Phases 13-17 (in progress)

## Phases

<details>
<summary>v1.0 Foundations + Intermediate (Phases 1-6) — SHIPPED 2026-03-17</summary>

Phases 1-6 were completed pre-GSD. See .planning/MILESTONES.md for details.

Delivered: 6 cubelets (W1-C1, W1-C2, W1-C3, ST-001, ST-002, ST-003), 18 deliverables, all quality gates passed (52-53/60), deployed to Vercel.

</details>

<details>
<summary>v1.1 Agentic Systems Design (Phases 7-12) — SHIPPED 2026-03-23</summary>

See .planning/milestones/v1.1-ROADMAP.md for full details.

- [x] Phase 7: Content Foundations (2/2 plans) — completed 2026-03-21
- [x] Phase 8: ST-004 Pathfinder (5/5 plans) — completed 2026-03-21
- [x] Phase 9: ST-005 Tool Orchestration (3/3 plans) — completed 2026-03-22
- [x] Phase 10: ST-006 Automation Debt (3/3 plans) — completed 2026-03-23
- [x] Phase 11: Integration + Deployment (2/2 plans) — completed 2026-03-23
- [x] Phase 12: Audit Gap Closure (2/2 plans) — completed 2026-03-23

Delivered: 3 cubelets (ST-004, ST-005, ST-006), 9 deliverables, quality gates passed (48-54/60), Vercel updated to 9 tabs, MCP server extended to 6 tools.

</details>

### v1.2 Polish & Deferred Features (In Progress)

**Milestone Goal:** Ship 5 deferred enhancements from v1.1 and resolve tracked tech debt, making existing cubelets richer without adding new concepts.

## Phase Checklist

- [x] **Phase 13: ST-004 Enhancements** — Trace import, cost/latency overlay, expanded primer panel
- [ ] **Phase 14: ST-005 Enhancements** — Side-by-side stack comparison, vitest stub replacement
- [ ] **Phase 15: ST-006 + Pattern Library** — Custom scenario builder, cross-cubelet archetype pattern library
- [ ] **Phase 16: Tech Debt Cleanup** — Syllabus quality_gate update, ST-003 prerequisite fix
- [ ] **Phase 17: Deployment** — Redeploy all modified artifacts to Vercel

## Phase Details

### Phase 13: ST-004 Enhancements
**Goal**: Students can import real agent traces and see live cost/latency data overlaid on their CLD, with a primer panel as rich as ST-005's
**Depends on**: Phase 12 (v1.1 complete)
**Requirements**: ST004-01, ST004-02, ST004-03
**Success Criteria** (what must be TRUE):
  1. Student can paste or upload a JSON agent execution trace and see it auto-mapped as a CLD with feedback loops detected
  2. Student can toggle a cost/latency overlay on individual nodes showing token counts and time per step
  3. ST-004 primer panel contains Meadows hierarchy levels, worked examples, and progressive disclosure matching ST-005's depth
**Plans**: 3 plans

Plans:
- [x] 13-01: JSON trace import + CLD auto-mapping (ST004-01)
- [x] 13-02: Cost/latency overlay toggle (ST004-02)
- [x] 13-03: Primer panel expansion to ST-005 depth (ST004-03)

### Phase 14: ST-005 Enhancements
**Goal**: Students can compare two tool stacks side-by-side, and the test suite has real assertions covering actual component logic
**Depends on**: Phase 13
**Requirements**: ST005-01, ST005-02
**Success Criteria** (what must be TRUE):
  1. Student can load two tool stack configurations and view them side-by-side with diff highlighting on dependencies, health scores, and intervention recommendations
  2. All 9 previously-stubbed vitest tests run real assertions against actual component logic and pass
**Plans**: 3 plans

Plans:
- [ ] 14-01: Side-by-side tool stack comparison with diff (ST005-01)
- [ ] 14-02: Replace vitest Wave 0 stubs with real assertions (ST005-02)

### Phase 15: ST-006 + Pattern Library
**Goal**: Students can build custom automation debt scenarios and browse a cross-cubelet archetype reference library
**Depends on**: Phase 14
**Requirements**: ST006-01, XCUBE-01
**Success Criteria** (what must be TRUE):
  1. Student can create a custom automation debt scenario with editable fix parameters (label, side effects, erosion rate) and run a simulation against it
  2. Student can browse 5-8 system archetypes in a pattern library with one-paragraph descriptions and pre-built CLD examples
  3. Pattern library CLD examples are loadable into their relevant cubelets (e.g., reinforcing loop example loads into ST-001)
**Plans**: 3 plans

Plans:
- [ ] 15-01: Custom scenario builder with editable parameters (ST006-01)
- [ ] 15-02: Archetype pattern library with loadable CLD examples (XCUBE-01)

### Phase 16: Tech Debt Cleanup
**Goal**: The syllabus JSON accurately reflects shipped quality gates and the ST-003 prerequisite reference is internally consistent
**Depends on**: Phase 15
**Requirements**: XCUBE-02, XCUBE-03
**Success Criteria** (what must be TRUE):
  1. master-syllabus.json shows quality_gate: "COMPLETE" for all 9 cubelets
  2. ST-003 prerequisite is identical across cubelet markdown and all syllabus reference files — no inconsistency
**Plans**: 3 plans

Plans:
- [ ] 16-01: Syllabus quality_gate update + ST-003 prerequisite fix (XCUBE-02, XCUBE-03)

### Phase 17: Deployment
**Goal**: All v1.2 changes are live on Vercel and the preview app reflects the updated artifacts
**Depends on**: Phase 16
**Requirements**: DEPLOY-01
**Success Criteria** (what must be TRUE):
  1. Vercel preview app loads all 9 tabs with v1.2 enhancements visible (trace import button in ST-004, comparison mode in ST-005, custom scenario builder in ST-006, pattern library accessible)
  2. No regressions in existing cubelet functionality after redeploy
**Plans**: 3 plans

Plans:
- [ ] 17-01: Redeploy all modified artifacts to Vercel (DEPLOY-01)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-6 | v1.0 | pre-GSD | COMPLETE | 2026-03-17 |
| 7. Content Foundations | v1.1 | 2/2 | COMPLETE | 2026-03-21 |
| 8. ST-004 Pathfinder | v1.1 | 5/5 | COMPLETE | 2026-03-21 |
| 9. ST-005 Tool Orchestration | v1.1 | 3/3 | COMPLETE | 2026-03-22 |
| 10. ST-006 Automation Debt | v1.1 | 3/3 | COMPLETE | 2026-03-23 |
| 11. Integration + Deployment | v1.1 | 2/2 | COMPLETE | 2026-03-23 |
| 12. Audit Gap Closure | v1.1 | 2/2 | COMPLETE | 2026-03-23 |
| 13. ST-004 Enhancements | v1.2 | 3/3 | COMPLETE | 2026-03-24 |
| 14. ST-005 Enhancements | v1.2 | 0/2 | Not started | - |
| 15. ST-006 + Pattern Library | v1.2 | 0/2 | Not started | - |
| 16. Tech Debt Cleanup | v1.2 | 0/1 | Not started | - |
| 17. Deployment | v1.2 | 0/1 | Not started | - |

---
*Roadmap created: 2026-03-21*
*Last updated: 2026-03-24 — Phase 13 ST-004 enhancements complete*
