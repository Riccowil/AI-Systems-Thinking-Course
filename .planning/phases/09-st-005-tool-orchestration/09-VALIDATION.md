---
phase: 9
slug: st-005-tool-orchestration
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + React Testing Library (artifact), pytest 7.x (MCP tool) |
| **Config file** | vitest.config.js (created in preview-app/ — Wave 0 Task 0 of Plan 03), pytest.ini (exists in Cubelets MCP Tool/) |
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
| 09-01-00 | 01 | 1 | TO-06, TO-07 | stub | `cd "Cubelets MCP Tool/files" && python -c "import ast; ..."` (see Plan 01 Task 0 verify) | W0 creates | ⬜ pending |
| 09-01-01 | 01 | 1 | TO-06 | unit | `cd "Cubelets MCP Tool/files" && python -m pytest test_tool_orchestration.py::TestMCPTool -x` | ✅ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | TO-07 | integration | `cd "Cubelets MCP Tool/files" && python -m pytest test_tool_orchestration.py::test_intervention_composition -x` | ✅ W0 | ⬜ pending |
| 09-03-00 | 03 | 1 | TO-02, TO-03, TO-04, TO-05 | stub | `cd preview-app && node -e "..."` (see Plan 03 Task 0 verify) | W0 creates | ⬜ pending |
| 09-03-01 | 03 | 1 | TO-02 | unit | `cd preview-app && npx vitest run src/__tests__/tool-orchestration-analyzer.test.jsx -x` | ✅ W0 | ⬜ pending |
| 09-03-02 | 03 | 1 | TO-05 | unit | `cd preview-app && npx vitest run src/__tests__/tool-orchestration-analyzer.test.jsx -x` | ✅ W0 | ⬜ pending |
| 09-04-01 | 04 | 2 | TO-02, TO-03 | integration | `cd preview-app && npx vitest run src/__tests__/tool-orchestration-analyzer.test.jsx -x` | ✅ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | TO-01 | manual-only | Human scoring via quality rubric | N/A | ⬜ pending |
| 09-02-02 | 02 | 1 | TO-08 | smoke | Manual verification (extract ZIP, check structure) | N/A | ⬜ pending |
| 09-02-03 | 02 | 1 | TO-09 | manual-only | Human scoring via quality rubric | N/A | ⬜ pending |
| 09-02-04 | 02 | 1 | TO-10 | manual-only | Human verification of content accuracy | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `preview-app/src/__tests__/tool-orchestration-analyzer.test.jsx` — stubs for TO-02, TO-03, TO-04, TO-05 (Plan 03, Task 0)
- [x] `Cubelets MCP Tool/files/test_tool_orchestration.py` — stubs for TO-06, TO-07 (Plan 01, Task 0)
- [x] `preview-app/vitest.config.js` — created with jsdom environment (Plan 03, Task 0)
- [x] Test fixtures: `preview-app/src/__tests__/fixtures/worked-example-tool-stack.json` — 9 tools, 12 dependencies (Plan 03, Task 0)

*Wave 0 tasks added to Plan 01 (Task 0) and Plan 03 (Task 0) to create all test infrastructure before implementation begins.*

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated (revision pass — Wave 0 tasks added to Plans 01 and 03)
