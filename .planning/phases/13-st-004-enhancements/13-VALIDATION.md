---
phase: 13
slug: st-004-enhancements
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual artifact inspection (no automated test framework for JSX artifacts) |
| **Config file** | None |
| **Quick run command** | Manual: paste JSX into Claude.ai artifact sandbox, exercise feature |
| **Full suite command** | Manual: load artifact, exercise all 8 test cases below |
| **Estimated runtime** | ~3-5 minutes per full manual pass |

---

## Sampling Rate

- **After every task commit:** Manual artifact load and feature spot-check in Claude.ai
- **After every plan wave:** Full manual run of all 8 test cases
- **Before `/gsd:verify-work`:** All 8 manual checks must pass
- **Max feedback latency:** ~60 seconds (paste artifact, observe behavior)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | ST004-01 | Manual smoke | Paste valid JSON trace → nodes appear, loops detected | N/A | ⬜ pending |
| 13-01-02 | 01 | 1 | ST004-01 | Manual smoke | Paste invalid JSON → error with example shown | N/A | ⬜ pending |
| 13-01-03 | 01 | 1 | ST004-01 | Manual smoke | Load sample trace (Retry Storm) from modal → CLD loads | N/A | ⬜ pending |
| 13-02-01 | 02 | 1 | ST004-02 | Manual smoke | Overlay toggle visible on worked example | N/A | ⬜ pending |
| 13-02-02 | 02 | 1 | ST004-02 | Manual smoke | Overlay toggle hidden/disabled for hand-built CLD | N/A | ⬜ pending |
| 13-02-03 | 02 | 1 | ST004-02 | Manual smoke | Summary bar shows total tokens + time when overlay active | N/A | ⬜ pending |
| 13-03-01 | 03 | 1 | ST004-03 | Manual smoke | Primer expands to show Meadows quick reference | N/A | ⬜ pending |
| 13-03-02 | 03 | 1 | ST004-03 | Manual smoke | Primer cross-references ST-001 and ST-002 | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test framework exists for JSX artifacts deployed via Claude.ai copy-paste — all validation is manual artifact inspection.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Trace import modal renders | ST004-01 | JSX artifact, no automated DOM testing | Paste artifact in Claude.ai, click Import Trace button |
| JSON validation shows helpful errors | ST004-01 | Requires human judgment on error message quality | Paste malformed JSON, verify error includes valid snippet |
| Cost/latency badges appear on nodes | ST004-02 | Visual rendering in sandbox | Toggle overlay on worked example, verify badges visible |
| Summary bar shows aggregates | ST004-02 | Visual rendering in sandbox | With overlay active, verify total tokens and time displayed |
| Primer has Meadows hierarchy levels | ST004-03 | Content quality assessment | Expand primer, verify Meadows L1-L12 reference present |
| Primer has progressive disclosure | ST004-03 | UX assessment | Verify sub-sections expand/collapse independently |
| Cross-references to ST-001 and ST-002 | ST004-03 | Content presence check | Expand primer, verify both cross-references present |
| Artifact stays under ~900 lines | All | Code size check | `wc -l agent-feedback-loop-builder.jsx` |

---

## Validation Sign-Off

- [ ] All tasks have manual verification instructions
- [ ] Sampling continuity: every task has at least one verification step
- [ ] No automated test gaps (all manual by design for JSX artifacts)
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
