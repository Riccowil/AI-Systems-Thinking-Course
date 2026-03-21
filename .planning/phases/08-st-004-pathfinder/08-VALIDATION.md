---
phase: 8
slug: st-004-pathfinder
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
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
| 08-01-01 | 01 | 1 | AF-06, AF-07 | unit | `python -m pytest tests/test_analyze_agent_loops.py -x` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | AF-02 | manual | Load artifact, build graph, verify loop detection + severity | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | AF-03 | manual | Load artifact, click "Load Example," verify nodes/loops | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | AF-04 | manual | Build graph, predict loop type, click reveal, verify comparison | ❌ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | AF-05 | manual | Verify tab switching, data display in each tab | ❌ W0 | ⬜ pending |
| 08-01-06 | 01 | 1 | AF-10 | manual | Verify primer panel renders, collapses, links work | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | AF-01, AF-09 | manual | Score each face, aggregate | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | AF-08 | manual | Invoke skill in Claude, verify step-by-step guidance | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_analyze_agent_loops.py` — stubs for AF-06, AF-07 (MCP tool unit tests)
- [ ] `tests/conftest.py` — shared fixtures (if not existing)
- [ ] pytest install — `pip install pytest` if not already installed
- [ ] Manual test checklist document for artifact validation (AF-02, AF-03, AF-04, AF-05, AF-10)

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s (automated)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
