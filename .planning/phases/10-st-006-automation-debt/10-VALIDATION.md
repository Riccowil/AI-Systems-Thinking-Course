---
phase: 10
slug: st-006-automation-debt
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-22
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x (artifact, via preview-app), pytest 7.x (MCP tool) |
| **Config file** | `preview-app/vite.config.js` (exists from Phase 9), pytest (no config needed) |
| **Quick run command** | `cd preview-app && npm test -- --run automation-debt` (artifact), `cd "Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py -x` (MCP tool) |
| **Full suite command** | `cd preview-app && npm test -- --run` (artifact), `cd "Cubelets MCP Tool/files" && python -m pytest -x` (MCP server) |
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
| 10-01-00 | 01 | 1 | AB-02, AB-03, AB-04, AB-05, AB-10 | stub | `cd preview-app && npx vitest run src/__tests__/automation-debt-simulator.test.jsx` | W0 creates | pending |
| 10-01-01 | 01 | 1 | AB-02, AB-03, AB-04, AB-05 | unit | `cd preview-app && npm test -- --run automation-debt` | W0 | pending |
| 10-01-02 | 01 | 1 | AB-05, AB-10 | unit | `cd preview-app && npm test -- --run automation-debt` | W0 | pending |
| 10-02-01 | 02 | 1 | AB-06, AB-07 | unit | `cd "Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py -x -v` | W0 (TDD) | pending |
| 10-02-02 | 02 | 1 | AB-01, AB-09 | manual-only | Human scoring via quality rubric | N/A | pending |
| 10-03-01 | 03 | 2 | AB-08 | smoke | Manual verification (extract ZIP, check structure) | N/A | pending |
| 10-03-02 | 03 | 2 | AB-02 (sandbox) | manual-only | Human sandbox verification via file drop | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `preview-app/src/__tests__/automation-debt-simulator.test.jsx` -- stubs for AB-02, AB-03, AB-04, AB-05, AB-10 (Plan 01, Task 0)
- [ ] `Cubelets MCP Tool/files/test_automation_debt.py` -- stubs for AB-06, AB-07 (Plan 02, Task 1 TDD creates these)
- [ ] Test framework already installed (Phase 9 established vitest + pytest)

*Wave 0 task added to Plan 01 (Task 0) to create artifact test infrastructure before implementation begins. Plan 02 uses TDD pattern so test file is created as part of the red-green cycle.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cubelet markdown quality gate | AB-01, AB-09 | Requires human judgment on content quality per 6-face rubric | Score each face 1-10, aggregate must be >= 42/60 |
| Claude skill workflow | AB-08 | Requires Claude Desktop/CLI to verify skill invocation | Extract ZIP, install skill, invoke workflow, verify 5 steps complete |
| Artifact sandbox rendering | AB-02 | Requires Claude.ai sandbox (no headless option) | Drag-and-drop JSX file into Claude.ai, verify 3 scenarios render and play through 12 rounds |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
