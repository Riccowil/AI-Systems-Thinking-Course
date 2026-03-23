---
phase: 8
slug: st-004-pathfinder
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
updated: 2026-03-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x (Python MCP tool tests) + manual (JSX artifact) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `python -m pytest tests/test_analyze_agent_loops.py -x` |
| **Full suite command** | `python -m pytest tests/ -x && manual artifact validation` |
| **Estimated runtime** | ~5 seconds (automated) + ~10 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Run `python -m pytest tests/test_analyze_agent_loops.py -x`
- **After every plan wave:** Run `python -m pytest tests/ -x && manual artifact validation`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds (automated), 10 minutes (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | AF-06, AF-07 | unit | `cd "Cubelets MCP Tool/files" && python -m pytest test_agent_models.py -v` | ✅ | ✅ green |
| 08-01-02 | 01 | 1 | AF-02 | vitest | `cd preview-app && npx vitest run src/__tests__/agent-feedback-loop-builder.test.jsx` | ✅ | ✅ green |
| 08-01-03 | 01 | 1 | AF-03 | vitest | `cd preview-app && npx vitest run src/__tests__/agent-feedback-loop-builder.test.jsx` | ✅ | ✅ green |
| 08-01-04 | 01 | 1 | AF-04 | vitest | `cd preview-app && npx vitest run src/__tests__/agent-feedback-loop-builder.test.jsx` | ✅ | ✅ green |
| 08-01-05 | 01 | 1 | AF-05 | vitest | `cd preview-app && npx vitest run src/__tests__/agent-feedback-loop-builder.test.jsx` | ✅ | ✅ green |
| 08-01-06 | 01 | 1 | AF-10 | vitest | `cd preview-app && npx vitest run src/__tests__/agent-feedback-loop-builder.test.jsx` | ✅ | ✅ green |
| 08-02-01 | 02 | 2 | AF-01, AF-09 | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_st004_structural.py -v` | ✅ | ✅ green |
| 08-02-02 | 02 | 2 | AF-08 | structural | `cd "Cubelets MCP Tool/files" && python -m pytest test_st004_structural.py -v` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `Cubelets MCP Tool/files/test_agent_models.py` — 12 tests for AF-06, AF-07 (MCP tool unit tests)
- [x] `Cubelets MCP Tool/files/test_st004_structural.py` — 7 tests for AF-01, AF-08, AF-09 (structural checks)
- [x] `preview-app/src/__tests__/agent-feedback-loop-builder.test.jsx` — 24 tests for AF-02, AF-03, AF-04, AF-05, AF-10 (vitest)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cubelet markdown renders all 6 faces with agent domain content | AF-01 | Content quality requires human review | Open in Obsidian/Markdown renderer, verify all 6 faces present and scored |
| Artifact renders 5 shape types, detects loops, scores severity | AF-02 | Visual rendering requires browser interaction | Load artifact, add each node type, draw edges, verify loop detection |
| Worked example pre-loads retry storm | AF-03 | Visual verification of pre-loaded state | Load artifact, verify 5-6 nodes and 2 loops visible on canvas |
| Progressive disclosure predict-then-reveal | AF-04 | Interactive UX flow requires manual testing | Build graph, predict loop types, verify reveal animation and comparison |
| Right panel 3 tabs with data | AF-05 | Tab switching and data display requires visual check | Click each tab, verify data displayed correctly |
| Claude skill guides workflow | AF-08 | Requires Claude Desktop/CLI interaction | Invoke skill, follow multi-step workflow |
| Quality gate >= 42/60 | AF-09 | Scoring is human evaluation | Score each face 1-10, verify aggregate >= 42 |
| Primer panel collapsible with ST-001 link | AF-10 | Visual/interactive verification | Click accordion, verify content and link |

---

## Validation Sign-Off

- [x] All tasks have automated verify
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s (automated)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete

---

## Validation Audit 2026-03-23

| Metric | Count |
|--------|-------|
| Gaps found | 7 |
| Resolved | 7 |
| Escalated | 0 |
