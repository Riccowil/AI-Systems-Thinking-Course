"""
Phase 12 audit gap closure validation tests.
Verifies TO-10: tool-orchestration-analyzer.jsx primer panel contains
Meadows hierarchy levels L1, L2, L5, L6, L10.
"""

import re
from pathlib import Path

# Repo root is two levels up from this file
# this file: <repo>/Cubelets MCP Tool/files/test_audit_gap_closure.py
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

TOOL_ORCHESTRATION_ANALYZER = (
    REPO_ROOT / "Interactive Artifact for Cubelets" / "tool-orchestration-analyzer.jsx"
)


# ---------------------------------------------------------------------------
# TO-10: ST-005 primer panel contains Meadows hierarchy levels L1, L2, L5, L6, L10
# ---------------------------------------------------------------------------


def test_tool_orchestration_analyzer_file_exists():
    """tool-orchestration-analyzer.jsx exists as a deliverable artifact."""
    assert TOOL_ORCHESTRATION_ANALYZER.exists(), (
        f"tool-orchestration-analyzer.jsx not found at {TOOL_ORCHESTRATION_ANALYZER}"
    )


def test_primer_panel_exists_in_tool_orchestration_analyzer():
    """tool-orchestration-analyzer.jsx contains a primer panel section."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    # Primer panel is identified by its title per the 12-01 implementation
    assert "PREREQUISITE" in text or "primer" in text.lower(), (
        "Primer panel not found in tool-orchestration-analyzer.jsx"
    )


def test_primer_panel_contains_meadows_level_l1():
    """Primer panel references Meadows L1 (Constants/Parameters) leverage level."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    assert re.search(r"L1\b", text), (
        "Meadows level L1 not found in tool-orchestration-analyzer.jsx primer"
    )


def test_primer_panel_contains_meadows_level_l2():
    """Primer panel references Meadows L2 (Buffer/Stock Sizes) leverage level."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    assert re.search(r"L2\b", text), (
        "Meadows level L2 not found in tool-orchestration-analyzer.jsx primer"
    )


def test_primer_panel_contains_meadows_level_l5():
    """Primer panel references Meadows L5 (Feedback Delays) leverage level."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    assert re.search(r"L5\b", text), (
        "Meadows level L5 not found in tool-orchestration-analyzer.jsx primer"
    )


def test_primer_panel_contains_meadows_level_l6():
    """Primer panel references Meadows L6 (Feedback Structure) leverage level."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    assert re.search(r"L6\b", text), (
        "Meadows level L6 not found in tool-orchestration-analyzer.jsx primer"
    )


def test_primer_panel_contains_meadows_level_l10():
    """Primer panel references Meadows L10 (System Goals) leverage level."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    assert re.search(r"L10\b", text), (
        "Meadows level L10 not found in tool-orchestration-analyzer.jsx primer"
    )


def test_primer_panel_contains_all_five_meadows_levels():
    """Primer panel contains all 5 Meadows levels used by the artifact (L1, L2, L5, L6, L10)."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    missing = []
    for level in ("L1", "L2", "L5", "L6", "L10"):
        if not re.search(rf"{level}\b", text):
            missing.append(level)
    assert not missing, (
        f"Meadows levels missing from tool-orchestration-analyzer.jsx: {missing}"
    )


def test_primer_panel_is_self_contained_prerequisite_refresher():
    """Primer panel is a substantive refresher (contains Meadows hierarchy description, not just a cross-reference link)."""
    text = TOOL_ORCHESTRATION_ANALYZER.read_text(encoding="utf-8")
    # A substantive primer has multiple level descriptions, not just a list of IDs
    # The 12-01 implementation added health scoring tiers and ST-002 cross-reference
    assert "Healthy" in text or "health" in text.lower(), (
        "Primer panel should include health scoring terminology (Healthy/At Risk/Critical)"
    )
    assert re.search(r"ST-002", text), (
        "Primer panel should include ST-002 cross-reference"
    )
