---
phase: 10-st-006-automation-debt
plan: "02"
subsystem: mcp-tool
tags: [mcp, pytest, automation-debt, ST-006, composition, TDD]
dependency_graph:
  requires: [detect_burden_shift, FixRecord, _classify_fix, _compute_erosion_risk]
  provides: [AutomationLayer, DetectAutomationDebtInput, detect_automation_debt, ST-006-automation-debt.md]
  affects: [cubelets_mcp_server.py, Cubelets/CubeletsMarkdown/]
tech_stack:
  added: [pytest-asyncio pattern, AutomationLayer Pydantic model]
  patterns: [TDD RED-GREEN, MCP composition, model conversion via to_fix_record()]
key_files:
  created:
    - Cubelets MCP Tool/files/test_automation_debt.py
    - Cubelets/CubeletsMarkdown/ST-006-automation-debt.md
  modified:
    - Cubelets MCP Tool/files/cubelets_mcp_server.py
decisions:
  - "Ported detect_automation_debt from master branch (1670 lines) rather than building greenfield"
  - "AutomationLayer uses pattern= regex validator (not Literal) matching master implementation"
  - "ST-006 cubelet markdown passes 12/13 automated content checks (self_assess wording mismatch, content present at line 238)"
metrics:
  duration: "~12 minutes"
  completed: "2026-03-22"
  tasks_completed: 2
  files_changed: 3
---

# Phase 10 Plan 02: ST-006 MCP Tool and Cubelet Markdown Summary

**One-liner:** Pytest test suite for detect_automation_debt MCP tool with TDD RED-GREEN cycle and ST-006 cubelet markdown ported from master (54/60, 6 faces, archetype boundaries).

## What Was Built

### Task 1: Pytest test suite for detect_automation_debt (TDD)

Created `Cubelets MCP Tool/files/test_automation_debt.py` with 10 tests covering:

**Model validation (5 tests):**
- `test_automation_layer_valid_creation`: AutomationLayer accepts layer_name, layer_type, side_effects, duration_active
- `test_automation_layer_rejects_invalid_type`: ValidationError on layer_type="hotfix"
- `test_to_fix_record_quick_fix`: to_fix_record() maps quick_fix to is_symptomatic=True, label=layer_name
- `test_to_fix_record_fundamental`: to_fix_record() maps fundamental to is_symptomatic=False
- `test_input_requires_recurring_symptom`: ValidationError when recurring_symptom < 5 chars

**Tool behavior (5 tests):**
- `test_detect_debt_returns_debt_score`: debt_score key exists, value is int 0-100
- `test_detect_debt_returns_erosion_channels`: erosion_channels key present in output
- `test_all_quick_fix_higher_debt`: 3 quick_fix layers produce higher debt_score than 1 quick_fix + 2 fundamental
- `test_detect_debt_returns_recommendations`: recommendations key is a list
- `test_detect_debt_with_fundamental_solution`: output contains b1_loop or b2_loop and recommendations include fundamental solution

**Added to cubelets_mcp_server.py (188 lines inserted before Entry Point):**
- `AutomationLayer` Pydantic model with pattern regex validator and `to_fix_record()` method
- `DetectAutomationDebtInput` with recurring_symptom, automation_layers, fundamental_solution
- `AUTOMATION_EROSION_CHANNELS` dict (Knowledge Drain, Complexity Creep, Normalization)
- `detect_automation_debt` async MCP tool with debt_score, erosion_channels, b1/b2 loop analysis, recommendations

### Task 2: ST-006 Cubelet Markdown Verification

Ported `Cubelets/CubeletsMarkdown/ST-006-automation-debt.md` from master branch (253 lines).

Content verification results (12/13 checks passed):
- face_1 through face_6: PASS (all 6 faces present)
- st003_prereq: PASS (prerequisite: ST-003 in frontmatter)
- self_assess: FAIL (wording mismatch — "Self-check rubric" at line 238 is present but doesn't match keywords)
- boundaries: PASS (Novel Problem + Legitimate Triage counter-patterns)
- erosion_channels: PASS (Knowledge Drain, Complexity Creep, Normalization)
- quality_gate: PASS (score_aggregate: 54/60)
- cubelet_id: PASS (ST-006)
- mcp_tool: PASS (detect_automation_debt referenced)

Score: 54/60, gate requirement >= 42/60 — PASS.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Port] MCP tool not present in worktree**
- **Found during:** Task 1 (TDD RED phase setup)
- **Issue:** Plan stated tool "already exists at lines 1481-1662" but worktree file was only 1482 lines (entry point only)
- **Fix:** Ported detect_automation_debt section from master branch (verified identical logic)
- **Files modified:** Cubelets MCP Tool/files/cubelets_mcp_server.py
- **Commit:** 328146f

**2. [Rule 1 - Port] ST-006 cubelet markdown not in worktree**
- **Found during:** Task 2
- **Issue:** Cubelets/CubeletsMarkdown/ only had ST-004 and ST-005 files — ST-006 was in master only
- **Fix:** Copied ST-006-automation-debt.md from master branch via git show
- **Files modified:** Cubelets/CubeletsMarkdown/ST-006-automation-debt.md (new file)
- **Commit:** 4e5c334

**3. [Rule 2 - Adjustment] AutomationLayer uses pattern= not Literal**
- **Found during:** Task 1 test writing
- **Issue:** Plan interface showed `layer_type: Literal["quick_fix", "fundamental", "transition"]` but master uses `pattern="^(quick_fix|fundamental|transition)$"` with no times_applied field
- **Fix:** Tests written to match actual implementation (ValidationError still raised on invalid type)
- **Files modified:** test_automation_debt.py
- **No separate commit:** Handled inline during RED phase

## Verification

- All 10 pytest tests pass: `cd "Cubelets MCP Tool/files" && python -m pytest test_automation_debt.py -x -v`
- 6 MCP tools in cubelets_mcp_server.py confirmed (3 original + ST-004 + ST-005 + ST-006)
- AutomationLayer.to_fix_record() correctly converts to FixRecord (tested via test_to_fix_record_quick_fix/fundamental)
- detect_automation_debt returns debt_score, erosion_channels, recommendations (tested)
- ST-006 cubelet passes 12/13 content checks, score 54/60 >= 42/60 gate

## Self-Check: PASSED

| Item | Status |
|------|--------|
| Cubelets MCP Tool/files/test_automation_debt.py | FOUND |
| Cubelets/CubeletsMarkdown/ST-006-automation-debt.md | FOUND |
| Commit aff1623 (RED: failing tests) | FOUND |
| Commit 328146f (GREEN: MCP tool implementation) | FOUND |
| Commit 4e5c334 (cubelet markdown) | FOUND |
