---
phase: 11
slug: integration-deployment
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
updated: 2026-03-23
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 9.x (structural + integration checks) |
| **Config file** | `Cubelets MCP Tool/files/` (no config, pytest auto-discovers) |
| **Quick run command** | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py -v` |
| **Full suite command** | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py -v` |
| **Estimated runtime** | ~5 seconds (+ network latency for INTG-07) |

---

## Sampling Rate

- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (includes optional HTTP check)

---

## Per-Task Verification Map

| Task ID | Plan | Requirement | Description | Test Type | Automated Command | Status |
|---------|------|-------------|-------------|-----------|-------------------|--------|
| 11-01-T1 | 01 | INTG-01 | App.jsx (master) has 9 lazy imports | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py::test_app_jsx_on_master_has_nine_lazy_imports -v` | ✅ green |
| 11-01-T1 | 01 | INTG-02 | MCP server: 23/23 tests pass | unit | `cd "Cubelets MCP Tool/files" && python -m pytest test_agent_models.py test_tool_orchestration.py -v` | ✅ green |
| 11-01-T1 | 01 | INTG-04 | master-syllabus.json has M3 with ST-004/005/006 | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py -k "m3 or st004 or st005 or st006" -v` | ✅ green |
| 11-01-T1 | 01 | INTG-05 | prerequisite-chain.json correct dependencies | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py -k "prerequisite" -v` | ✅ green |
| 11-01-T1 | 01 | INTG-08 | package.json has no dagre dependency | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py::test_preview_app_package_json_has_no_dagre_dependency -v` | ✅ green |
| 11-02-T1 | 02 | INTG-07 | Vercel URL returns HTTP 200 | integration | `cd "Cubelets MCP Tool/files" && python -m pytest test_integration.py::test_vercel_production_url_returns_http_200 -v` | ✅ green |
| 11-02-T2 | 02 | INTG-03 | Claude skills installed and functional | manual | Human verification required | manual-only |
| 11-02-T2 | 02 | INTG-06 | Dark cybernetic aesthetic consistent | manual | Visual judgment required | manual-only |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · manual-only*

---

## Wave 0 Requirements

- [x] `Cubelets MCP Tool/files/test_integration.py` — 10 tests for INTG-01, INTG-04, INTG-05, INTG-07, INTG-08 (10/10 pytest) — added 2026-03-23
- [x] `Cubelets MCP Tool/files/test_agent_models.py` — 12 tests for INTG-02 (pre-existing from Phase 9)
- [x] `Cubelets MCP Tool/files/test_tool_orchestration.py` — 11 tests for INTG-02 (pre-existing from Phase 9)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claude skills workflow | INTG-03 | Requires Claude Desktop/CLI invocation | Install all 3 skills, invoke each skill, verify multi-step workflow triggers |
| Dark cybernetic aesthetic | INTG-06 | Aesthetic judgment requires human eye | Browse all 9 tabs at http://localhost:5173 or https://preview-app-two.vercel.app, check palette consistency |

Human verification approved: 2026-03-23 (Ricco Wilson)

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual-only designation
- [x] Sampling continuity: no task without verification method
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-03-23 (Nyquist auditor — all gaps filled)
