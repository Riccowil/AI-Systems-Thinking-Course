"""
Phase 10 structural tests — gaps AB-01, AB-08, AB-09.

AB-01: ST-006-automation-debt.md has all 6 faces
AB-08: automation-debt-detector.skill is a valid ZIP containing SKILL.md
       that references detect_automation_debt
AB-09: score_aggregate >= 42 in ST-006 frontmatter
"""

import zipfile
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Path setup — everything relative to this file's location
# ---------------------------------------------------------------------------
FILES_DIR = Path(__file__).parent
REPO_ROOT = FILES_DIR.parent.parent  # "Cubelets MCP Tool/files" -> repo root

CUBELET_MD = REPO_ROOT / "Cubelets" / "CubeletsMarkdown" / "ST-006-automation-debt.md"
SKILL_ZIP = (
    REPO_ROOT
    / "Claude skills build for Cubelets"
    / "files"
    / "automation-debt-detector.skill"
)


# ---------------------------------------------------------------------------
# AB-01: Cubelet markdown has all 6 required faces
# ---------------------------------------------------------------------------

def test_st006_cubelet_has_all_six_faces():
    """AB-01: ST-006-automation-debt.md must contain all six face headings."""
    assert CUBELET_MD.exists(), f"Cubelet file not found: {CUBELET_MD}"
    text = CUBELET_MD.read_text(encoding="utf-8")

    expected_faces = [
        "## Face 1",
        "## Face 2",
        "## Face 3",
        "## Face 4",
        "## Face 5",
        "## Face 6",
    ]
    missing = [face for face in expected_faces if face not in text]
    assert not missing, f"Missing faces in ST-006-automation-debt.md: {missing}"


# ---------------------------------------------------------------------------
# AB-09: score_aggregate in frontmatter is >= 42
# ---------------------------------------------------------------------------

def test_st006_cubelet_score_aggregate_meets_quality_gate():
    """AB-09: ST-006 frontmatter score_aggregate must be >= 42 (quality gate)."""
    assert CUBELET_MD.exists(), f"Cubelet file not found: {CUBELET_MD}"
    text = CUBELET_MD.read_text(encoding="utf-8")

    # Find the frontmatter block (between first two "---" lines)
    lines = text.splitlines()
    in_frontmatter = False
    score_line = None
    for line in lines:
        stripped = line.strip()
        if stripped == "---":
            if not in_frontmatter:
                in_frontmatter = True
                continue
            else:
                break  # end of frontmatter
        if in_frontmatter and stripped.startswith("score_aggregate:"):
            score_line = stripped
            break

    assert score_line is not None, (
        "score_aggregate key not found in ST-006-automation-debt.md frontmatter"
    )

    # Value can be "54/60" or just "54"
    raw_value = score_line.split(":", 1)[1].strip()
    # Take only the numerator if slash-notation
    numerator_str = raw_value.split("/")[0].strip()
    score = int(numerator_str)
    assert score >= 42, (
        f"score_aggregate {score} is below the quality gate of 42"
    )


# ---------------------------------------------------------------------------
# AB-08: Skill ZIP is valid and SKILL.md references detect_automation_debt
# ---------------------------------------------------------------------------

def test_automation_debt_skill_zip_is_valid():
    """AB-08: automation-debt-detector.skill must be a valid ZIP file."""
    assert SKILL_ZIP.exists(), f"Skill ZIP not found: {SKILL_ZIP}"
    assert zipfile.is_zipfile(SKILL_ZIP), (
        f"{SKILL_ZIP.name} is not a valid ZIP archive"
    )


def test_automation_debt_skill_zip_contains_skill_md():
    """AB-08: Skill ZIP must contain a SKILL.md entry."""
    assert SKILL_ZIP.exists(), f"Skill ZIP not found: {SKILL_ZIP}"
    with zipfile.ZipFile(SKILL_ZIP, "r") as zf:
        names = zf.namelist()
    skill_md_entries = [n for n in names if n.endswith("SKILL.md")]
    assert skill_md_entries, (
        f"No SKILL.md found inside {SKILL_ZIP.name}. Found: {names}"
    )


def test_automation_debt_skill_md_references_detect_automation_debt_tool():
    """AB-08: SKILL.md inside the ZIP must reference the detect_automation_debt MCP tool."""
    assert SKILL_ZIP.exists(), f"Skill ZIP not found: {SKILL_ZIP}"
    with zipfile.ZipFile(SKILL_ZIP, "r") as zf:
        names = zf.namelist()
        skill_md_entries = [n for n in names if n.endswith("SKILL.md")]
        assert skill_md_entries, f"No SKILL.md in ZIP. Found: {names}"
        content = zf.read(skill_md_entries[0]).decode("utf-8")

    assert "detect_automation_debt" in content, (
        "SKILL.md does not reference detect_automation_debt MCP tool"
    )
