---
phase: 9
slug: st-005-tool-orchestration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + React Testing Library (artifact), pytest 7.x (MCP tool) |
| **Config file** | vitest.config.js (create in preview-app/ — Wave 0), pytest.ini (exists in Cubelets MCP Tool/) |
| **Quick run command** | `npm test -- tool-orchestration-analyzer.test.jsx -x` (artifact), `pytest tests/test_analyze_tool_orchestration.py -x` (MCP tool) |
| **Full suite command** | `npm test` (artifact), `pytest tests/` (MCP server) |
| **Estimated runtime** | ~15 seconds (artifact), ~5 seconds (MCP tool) |

---

## Sampling Rate

- **After every task commit:** Run quick command for the affected component (artifact or MCP tool)
- **After every plan wave:** Run full suite for changed component
- **Before `/gsd:verify-work`:** Full suite must be green (both artifact and MCP tool)
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | TO-06 | unit | `pytest tests/test_analyze_tool_orchestration.py::test_basic_health_scoring -x` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | TO-07 | integration | `pytest tests/test_analyze_tool_orchestration.py::test_intervention_composition -x` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | TO-02 | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_graph_rendering -x` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | TO-02 | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_redundancy_detection -x` | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | TO-02 | integration | `npm test -- tool-orchestration-analyzer.test.jsx::test_blast_radius_cascade -x` | ❌ W0 | ⬜ pending |
| 09-02-04 | 02 | 1 | TO-03 | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_intervention_meadows_assignment -x` | ❌ W0 | ⬜ pending |
| 09-02-05 | 02 | 1 | TO-04 | smoke | `npm test -- tool-orchestration-analyzer.test.jsx::test_worked_example_loads -x` | ❌ W0 | ⬜ pending |
| 09-02-06 | 02 | 1 | TO-05 | unit | `npm test -- tool-orchestration-analyzer.test.jsx::test_health_score_calculation -x` | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 2 | TO-01 | manual-only | Human scoring via quality rubric | N/A | ⬜ pending |
| 09-03-02 | 03 | 2 | TO-08 | smoke | Manual verification (extract ZIP, check structure) | N/A | ⬜ pending |
| 09-03-03 | 03 | 2 | TO-09 | manual-only | Human scoring via quality rubric | N/A | ⬜ pending |
| 09-03-04 | 03 | 2 | TO-10 | manual-only | Human verification of content accuracy | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `preview-app/src/__tests__/tool-orchestration-analyzer.test.jsx` — stubs for TO-02, TO-03, TO-04, TO-05
- [ ] `Cubelets MCP Tool/tests/test_analyze_tool_orchestration.py` — stubs for TO-06, TO-07
- [ ] `vitest.config.js` in preview-app/ — if not exists, install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Test fixtures: worked-example-tool-stack.json (9 tools, 12 dependencies) for both artifact and MCP tests

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cubelet markdown quality gate | TO-01, TO-09 | Requires human judgment on content quality per 6-face rubric | Score each face 1-10, aggregate must be >= 42/60 |
| Claude skill workflow | TO-08 | Requires Claude Desktop/CLI to verify skill invocation | Extract ZIP, install skill, invoke workflow, verify 5 steps complete |
| Primer panel content accuracy | TO-10 | Requires human judgment on ST-002 concept cross-references | Open artifact, expand primer panel, verify ST-002 references are correct |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
