"""
Structural tests for ST-004 deliverables (AF-01, AF-08, AF-09).

AF-01: ST-004-agent-feedback-loops.md has all 6 faces (## Face 1 through ## Face 6)
AF-08: agent-feedback-analyzer.skill is a valid ZIP containing SKILL.md referencing analyze_agent_feedback_loops
AF-09: frontmatter score_aggregate >= 42
"""

import zipfile
import os
import re
import pytest

# Paths relative to the repo root (two dirs up from this file)
_REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CUBELET_PATH = os.path.join(_REPO, "Cubelets", "CubeletsMarkdown", "ST-004-agent-feedback-loops.md")
SKILL_PATH = os.path.join(_REPO, "Claude skills build for Cubelets", "files", "agent-feedback-analyzer.skill")


class TestCubeletHasSixFaces:
    """AF-01: Cubelet markdown must have all 6 faces."""

    def test_cubelet_file_exists(self):
        assert os.path.isfile(CUBELET_PATH), f"Cubelet file not found: {CUBELET_PATH}"

    def test_cubelet_has_six_face_headers(self):
        """AF-01: ST-004 cubelet markdown has ## Face 1 through ## Face 6."""
        with open(CUBELET_PATH, encoding="utf-8") as f:
            content = f.read()

        for face_num in range(1, 7):
            pattern = rf"^## Face {face_num}[:\s]"
            found = re.search(pattern, content, re.MULTILINE)
            assert found is not None, (
                f"AF-01 FAIL: '## Face {face_num}' header not found in cubelet markdown"
            )


class TestCubeletQualityGate:
    """AF-09: Frontmatter score_aggregate must be >= 42/60."""

    def test_score_aggregate_meets_quality_gate(self):
        """AF-09: score_aggregate in frontmatter is >= 42."""
        with open(CUBELET_PATH, encoding="utf-8") as f:
            content = f.read()

        # Extract score_aggregate from YAML frontmatter (first --- block)
        match = re.search(r"score_aggregate:\s*(\d+)/\d+", content)
        assert match is not None, (
            "AF-09 FAIL: 'score_aggregate' not found in frontmatter"
        )

        score = int(match.group(1))
        assert score >= 42, (
            f"AF-09 FAIL: score_aggregate is {score}/60, must be >= 42"
        )


class TestSkillZipIsValid:
    """AF-08: Skill ZIP is valid and contains SKILL.md referencing analyze_agent_feedback_loops."""

    def test_skill_file_exists(self):
        assert os.path.isfile(SKILL_PATH), f"Skill file not found: {SKILL_PATH}"

    def test_skill_zip_is_valid(self):
        """AF-08: agent-feedback-analyzer.skill is a valid ZIP archive."""
        assert zipfile.is_zipfile(SKILL_PATH), (
            f"AF-08 FAIL: {SKILL_PATH} is not a valid ZIP file"
        )

    def test_skill_zip_contains_skill_md(self):
        """AF-08: ZIP contains a SKILL.md file."""
        with zipfile.ZipFile(SKILL_PATH, "r") as zf:
            names = zf.namelist()
        skill_md_files = [n for n in names if n.endswith("SKILL.md")]
        assert len(skill_md_files) >= 1, (
            f"AF-08 FAIL: SKILL.md not found in ZIP. Contents: {names}"
        )

    def test_skill_md_references_analyze_agent_feedback_loops(self):
        """AF-08: SKILL.md references the analyze_agent_feedback_loops MCP tool."""
        with zipfile.ZipFile(SKILL_PATH, "r") as zf:
            names = zf.namelist()
            skill_md_files = [n for n in names if n.endswith("SKILL.md")]
            assert skill_md_files, "SKILL.md not found in ZIP"
            skill_content = zf.read(skill_md_files[0]).decode("utf-8", errors="replace")

        assert "analyze_agent_feedback_loops" in skill_content, (
            "AF-08 FAIL: SKILL.md does not reference 'analyze_agent_feedback_loops' MCP tool"
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
