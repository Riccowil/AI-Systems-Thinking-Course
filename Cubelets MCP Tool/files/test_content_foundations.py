"""
Phase 7 content foundations validation tests.
Verifies structural content requirements for CFND-01 through CFND-05.
All tests are documentation/file-content assertions — no code execution.
"""

import json
import re
from pathlib import Path

# Repo root is two levels up from this file
# this file: <repo>/Cubelets MCP Tool/files/test_content_foundations.py
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

PREREQUISITE_CHAIN = REPO_ROOT / "prerequisite-chain.json"
AGENT_EXPERIENCE_CHECKPOINT = (
    REPO_ROOT
    / ".planning"
    / "phases"
    / "07-content-foundations"
    / "agent-experience-checkpoint.md"
)
DATA_MODEL_SPECS = (
    REPO_ROOT
    / ".planning"
    / "phases"
    / "07-content-foundations"
    / "data-model-specs.md"
)
AGENT_VISUAL_VOCABULARY = (
    REPO_ROOT
    / ".planning"
    / "phases"
    / "07-content-foundations"
    / "agent-visual-vocabulary.md"
)
MASTER_SYLLABUS = REPO_ROOT / "master-syllabus.json"
COURSE_SYLLABUS = REPO_ROOT / "course-syllabus.md"


# ---------------------------------------------------------------------------
# CFND-01: prerequisite-chain.json has ST-004/005/006 entries with correct
#          requires arrays
# ---------------------------------------------------------------------------


def test_prerequisite_chain_has_st004_requiring_st001():
    """ST-004 entry exists in prerequisite-chain.json and requires ST-001."""
    assert PREREQUISITE_CHAIN.exists(), (
        f"prerequisite-chain.json not found at {PREREQUISITE_CHAIN}"
    )
    data = json.loads(PREREQUISITE_CHAIN.read_text(encoding="utf-8"))
    chain = data["prerequisite_chain"]["chain"]
    cubelet_ids = {c["cubelet_id"]: c for c in chain}

    assert "ST-004" in cubelet_ids, "ST-004 entry missing from prerequisite chain"
    st004 = cubelet_ids["ST-004"]
    assert "ST-001" in st004["prerequisites"], (
        f"ST-004 prerequisites should include ST-001, got: {st004['prerequisites']}"
    )


def test_prerequisite_chain_has_st005_requiring_st002_and_st004():
    """ST-005 entry exists and requires both ST-002 and ST-004."""
    data = json.loads(PREREQUISITE_CHAIN.read_text(encoding="utf-8"))
    chain = data["prerequisite_chain"]["chain"]
    cubelet_ids = {c["cubelet_id"]: c for c in chain}

    assert "ST-005" in cubelet_ids, "ST-005 entry missing from prerequisite chain"
    st005 = cubelet_ids["ST-005"]
    assert "ST-002" in st005["prerequisites"], (
        f"ST-005 prerequisites should include ST-002, got: {st005['prerequisites']}"
    )
    assert "ST-004" in st005["prerequisites"], (
        f"ST-005 prerequisites should include ST-004, got: {st005['prerequisites']}"
    )


def test_prerequisite_chain_has_st006_requiring_st003():
    """ST-006 entry exists and requires ST-003."""
    data = json.loads(PREREQUISITE_CHAIN.read_text(encoding="utf-8"))
    chain = data["prerequisite_chain"]["chain"]
    cubelet_ids = {c["cubelet_id"]: c for c in chain}

    assert "ST-006" in cubelet_ids, "ST-006 entry missing from prerequisite chain"
    st006 = cubelet_ids["ST-006"]
    assert "ST-003" in st006["prerequisites"], (
        f"ST-006 prerequisites should include ST-003, got: {st006['prerequisites']}"
    )


def test_prerequisite_chain_cubelet_count_is_nine():
    """cubelet_count field equals 9 (original 6 + 3 new agentic cubelets)."""
    data = json.loads(PREREQUISITE_CHAIN.read_text(encoding="utf-8"))
    count = data["prerequisite_chain"]["cubelet_count"]
    assert count == 9, f"Expected cubelet_count=9, got {count}"


# ---------------------------------------------------------------------------
# CFND-02: agent-experience-checkpoint.md exists and has self-assessment content
# ---------------------------------------------------------------------------


def test_agent_experience_checkpoint_file_exists():
    """agent-experience-checkpoint.md exists in the phase 07 directory."""
    assert AGENT_EXPERIENCE_CHECKPOINT.exists(), (
        f"agent-experience-checkpoint.md not found at {AGENT_EXPERIENCE_CHECKPOINT}"
    )


def test_agent_experience_checkpoint_has_three_question_self_assessment():
    """agent-experience-checkpoint.md contains a 3-question self-assessment checklist."""
    text = AGENT_EXPERIENCE_CHECKPOINT.read_text(encoding="utf-8")
    # Spec: 3-question self-assessment with checkbox items
    checkboxes = re.findall(r"- \[ \]", text)
    assert len(checkboxes) >= 3, (
        f"Expected at least 3 checkbox items in self-assessment, found {len(checkboxes)}"
    )


def test_agent_experience_checkpoint_is_conceptual_not_framework_specific():
    """Checkpoint specifies conceptual-only (no framework-specific) entry requirements."""
    text = AGENT_EXPERIENCE_CHECKPOINT.read_text(encoding="utf-8")
    # Spec: "No framework-specific knowledge required" or equivalent language
    assert re.search(r"[Ff]ramework.{0,30}(agnostic|not required|no .{0,15}framework)", text), (
        "Checkpoint should state framework-agnostic / no framework-specific knowledge requirement"
    )


def test_agent_experience_checkpoint_has_primer_panel_specs_for_all_three_cubelets():
    """Checkpoint specifies primer panel content for ST-004, ST-005, and ST-006."""
    text = AGENT_EXPERIENCE_CHECKPOINT.read_text(encoding="utf-8")
    for cubelet_id in ("ST-004", "ST-005", "ST-006"):
        assert cubelet_id in text, (
            f"Primer panel spec for {cubelet_id} not found in agent-experience-checkpoint.md"
        )


# ---------------------------------------------------------------------------
# CFND-03: data-model-specs.md exists and specifies 5 Pydantic models
# ---------------------------------------------------------------------------


def test_data_model_specs_file_exists():
    """data-model-specs.md exists in the phase 07 directory."""
    assert DATA_MODEL_SPECS.exists(), (
        f"data-model-specs.md not found at {DATA_MODEL_SPECS}"
    )


def test_data_model_specs_contains_all_five_models():
    """data-model-specs.md names all 5 required Pydantic models."""
    text = DATA_MODEL_SPECS.read_text(encoding="utf-8")
    required_models = [
        "AgentComponent",
        "AgentLink",
        "MCPTool",
        "ToolDependency",
        "AutomationLayer",
    ]
    for model in required_models:
        assert model in text, (
            f"Model '{model}' not found in data-model-specs.md"
        )


def test_data_model_specs_documents_composition_pattern():
    """data-model-specs.md documents the composition pattern (AgentLink wraps CausalLink, AutomationLayer wraps FixRecord)."""
    text = DATA_MODEL_SPECS.read_text(encoding="utf-8")
    assert "CausalLink" in text, (
        "Composition pattern: AgentLink -> CausalLink not documented"
    )
    assert "FixRecord" in text, (
        "Composition pattern: AutomationLayer -> FixRecord not documented"
    )


def test_data_model_specs_includes_example_payloads():
    """data-model-specs.md includes at least one JSON example payload."""
    text = DATA_MODEL_SPECS.read_text(encoding="utf-8")
    # JSON code blocks signal example payloads
    json_blocks = re.findall(r"```json", text)
    assert len(json_blocks) >= 1, (
        "data-model-specs.md should include at least one JSON example payload (```json block)"
    )


# ---------------------------------------------------------------------------
# CFND-04: agent-visual-vocabulary.md exists and has 5 node types
# ---------------------------------------------------------------------------


def test_agent_visual_vocabulary_file_exists():
    """agent-visual-vocabulary.md exists in the phase 07 directory."""
    assert AGENT_VISUAL_VOCABULARY.exists(), (
        f"agent-visual-vocabulary.md not found at {AGENT_VISUAL_VOCABULARY}"
    )


def test_agent_visual_vocabulary_defines_five_node_types():
    """agent-visual-vocabulary.md defines all 5 required node types."""
    text = AGENT_VISUAL_VOCABULARY.read_text(encoding="utf-8")
    required_types = ["agent", "tool", "memory", "evaluator", "constraint"]
    for node_type in required_types:
        # match the node type as a standalone word (case-insensitive)
        assert re.search(rf"\b{node_type}\b", text, re.IGNORECASE), (
            f"Node type '{node_type}' not defined in agent-visual-vocabulary.md"
        )


def test_agent_visual_vocabulary_includes_svg_path_data():
    """agent-visual-vocabulary.md includes SVG path/shape data for node rendering."""
    text = AGENT_VISUAL_VOCABULARY.read_text(encoding="utf-8")
    # SVG elements: polygon, rect, ellipse, path — at least one should be present
    svg_elements = re.findall(r"<(polygon|rect|ellipse|path)\b", text)
    assert len(svg_elements) >= 5, (
        f"Expected SVG path data for all 5 node types, found {len(svg_elements)} SVG elements"
    )


def test_agent_visual_vocabulary_includes_color_palette():
    """agent-visual-vocabulary.md includes fill/stroke colors (hex values)."""
    text = AGENT_VISUAL_VOCABULARY.read_text(encoding="utf-8")
    hex_colors = re.findall(r"#[0-9a-fA-F]{6}", text)
    assert len(hex_colors) >= 5, (
        f"Expected at least 5 hex color values in color palette, found {len(hex_colors)}"
    )


# ---------------------------------------------------------------------------
# CFND-05: master-syllabus.json has M3 module with 3 lessons AND
#           course-syllabus.md has Week 3 section
# ---------------------------------------------------------------------------


def test_master_syllabus_has_m3_module():
    """master-syllabus.json contains a module with module_id 'M3'."""
    assert MASTER_SYLLABUS.exists(), f"master-syllabus.json not found at {MASTER_SYLLABUS}"
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    module_ids = [m["module_id"] for m in data.get("modules", [])]
    assert "M3" in module_ids, f"Module M3 not found; present modules: {module_ids}"


def test_master_syllabus_m3_has_three_lessons():
    """M3 module in master-syllabus.json contains exactly 3 lessons (ST-004, ST-005, ST-006)."""
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    m3 = next((m for m in data["modules"] if m["module_id"] == "M3"), None)
    assert m3 is not None, "M3 module not found"
    lessons = m3.get("lessons", [])
    assert len(lessons) == 3, f"M3 should have 3 lessons, found {len(lessons)}"
    lesson_cubelets = [lesson["cubelet_id"] for lesson in lessons]
    for cubelet_id in ("ST-004", "ST-005", "ST-006"):
        assert cubelet_id in lesson_cubelets, (
            f"M3 lessons should include {cubelet_id}; found: {lesson_cubelets}"
        )


def test_master_syllabus_total_time_is_85_minutes():
    """master-syllabus.json total_time_minutes equals 85 (updated for 9 cubelets)."""
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    total = data["course"]["total_time_minutes"]
    assert total == 85, f"Expected total_time_minutes=85, got {total}"


def test_course_syllabus_has_week3_section():
    """course-syllabus.md contains a Week 3 section for Agentic Systems Design."""
    assert COURSE_SYLLABUS.exists(), f"course-syllabus.md not found at {COURSE_SYLLABUS}"
    text = COURSE_SYLLABUS.read_text(encoding="utf-8")
    assert re.search(r"Week 3", text), "course-syllabus.md missing Week 3 section"


def test_course_syllabus_week3_references_all_three_agentic_cubelets():
    """course-syllabus.md Week 3 section references ST-004, ST-005, and ST-006."""
    text = COURSE_SYLLABUS.read_text(encoding="utf-8")
    for cubelet_id in ("ST-004", "ST-005", "ST-006"):
        assert cubelet_id in text, (
            f"course-syllabus.md should reference {cubelet_id} in Week 3 section"
        )
