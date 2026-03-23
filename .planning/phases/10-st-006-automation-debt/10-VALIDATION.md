---
phase: 10
slug: st-006-automation-debt
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
updated: 2026-03-23
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (artifact) + pytest 7.x (MCP tool) |
| **Config file** | `preview-app/vitest.config.js` + `Cubelets MCP Tool/files/` (no config, pytest auto-discovers) |
| **Quick run command** | `cd preview-app && npm test -- --run automation-debt` |
| **Full suite command** | `cd preview-app && npm test -- --run automation-debt && cd "../Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py test_st006_structural.py -x -v` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd preview-app && npm test -- --run automation-debt`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-00 | 01 | 1 | AB-02,03,04,05,10 | stub | `cd preview-app && npx vitest run src/__tests__/automation-debt-simulator.test.jsx` | ✅ | ✅ green |
| 10-01-01 | 01 | 1 | AB-02,03,04 | unit | `cd preview-app && npm test -- --run automation-debt` | ✅ | ✅ green |
| 10-01-02 | 01 | 1 | AB-05,10 | unit | `cd preview-app && npm test -- --run automation-debt` | ✅ | ✅ green |
| 10-02-01 | 02 | 1 | AB-06,07 | unit (TDD) | `cd "Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py -x -v` | ✅ | ✅ green |
| 10-02-02 | 02 | 1 | AB-01,09 | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_st006_structural.py -v` | ✅ | ✅ green |
| 10-03-01 | 03 | 2 | AB-08 | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_st006_structural.py -v` | ✅ | ✅ green |
| 10-03-02 | 03 | 2 | AB-02 (sandbox) | manual | Sandbox drop test | N/A | manual-only |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `preview-app/src/__tests__/automation-debt-simulator.test.jsx` — 9 tests for AB-02, AB-03, AB-04, AB-05, AB-10 (9/9 vitest)
- [x] `Cubelets MCP Tool/files/test_automation_debt.py` — 10 tests for AB-06, AB-07 (10/10 pytest)
- [x] `Cubelets MCP Tool/files/test_st006_structural.py` — 5 tests for AB-01, AB-08, AB-09 (5/5 pytest) — added 2026-03-23

*Vitest and pytest frameworks already installed from Phases 8-9.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sandbox rendering | AB-02 | Claude.ai sandbox environment cannot be automated | Drop JSX into Claude.ai artifact panel, verify renders |
| Visual consistency | AB-02 | Aesthetic judgment requires human eye | Check purple accent, dark theme, sparklines render |
| Skill workflow | AB-08 | Requires Claude Desktop/CLI invocation | Invoke `/automation-debt-detector` and verify multi-step flow |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-03-23 (Nyquist auditor — all gaps filled)
