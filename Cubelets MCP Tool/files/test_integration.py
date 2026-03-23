"""
Phase 11 integration tests — gaps INTG-01, INTG-04, INTG-05, INTG-07, INTG-08.

INTG-01: App.jsx (on master branch) has 9 lazy imports
INTG-04: master-syllabus.json has M3 module with lessons for ST-004, ST-005, ST-006
INTG-05: prerequisite-chain.json — ST-004 req [ST-001], ST-005 req [ST-002, ST-004],
          ST-006 req [ST-003]
INTG-07: https://preview-app-two.vercel.app returns HTTP 200 (skipped if no network)
INTG-08: preview-app/package.json does NOT have dagre in dependencies

Manual-only (not tested here):
  INTG-03: Claude skills require human verification
  INTG-06: Dark cybernetic aesthetic requires visual judgment
"""

import json
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
FILES_DIR = Path(__file__).parent
REPO_ROOT = FILES_DIR.parent.parent  # "Cubelets MCP Tool/files" -> repo root

MASTER_SYLLABUS = REPO_ROOT / "master-syllabus.json"
PREREQ_CHAIN = REPO_ROOT / "prerequisite-chain.json"
PREVIEW_PKG = REPO_ROOT / "preview-app" / "package.json"

VERCEL_URL = "https://preview-app-two.vercel.app"


# ---------------------------------------------------------------------------
# Helper: check network reachability
# ---------------------------------------------------------------------------
def _vercel_reachable() -> bool:
    try:
        urllib.request.urlopen(VERCEL_URL, timeout=5)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------------------
# INTG-01: App.jsx on master branch has exactly 9 lazy imports
# ---------------------------------------------------------------------------

def test_app_jsx_on_master_has_nine_lazy_imports():
    """INTG-01: App.jsx (master branch) must contain 9 lazy(() => import(...)) calls."""
    result = subprocess.run(
        ["git", "show", "master:preview-app/src/App.jsx"],
        capture_output=True,
        text=True,
        cwd=str(REPO_ROOT),
    )
    assert result.returncode == 0, (
        f"Could not read App.jsx from master branch: {result.stderr}"
    )
    content = result.stdout
    lazy_count = content.count("lazy(() => import(")
    assert lazy_count == 9, (
        f"Expected 9 lazy imports in App.jsx, found {lazy_count}"
    )


# ---------------------------------------------------------------------------
# INTG-04: master-syllabus.json has M3 module with ST-004, ST-005, ST-006 lessons
# ---------------------------------------------------------------------------

def test_master_syllabus_has_m3_module():
    """INTG-04: master-syllabus.json must contain a module with module_id 'M3'."""
    assert MASTER_SYLLABUS.exists(), f"master-syllabus.json not found: {MASTER_SYLLABUS}"
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    modules = data.get("modules", [])
    module_ids = [m.get("module_id") for m in modules]
    assert "M3" in module_ids, f"No M3 module found in master-syllabus.json. Found: {module_ids}"


def test_master_syllabus_m3_has_st004_lesson():
    """INTG-04: M3 module must have a lesson for cubelet ST-004."""
    assert MASTER_SYLLABUS.exists(), f"master-syllabus.json not found: {MASTER_SYLLABUS}"
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    m3 = next((m for m in data.get("modules", []) if m.get("module_id") == "M3"), None)
    assert m3 is not None, "M3 module not found"
    cubelet_ids = [lesson.get("cubelet_id") for lesson in m3.get("lessons", [])]
    assert "ST-004" in cubelet_ids, f"ST-004 lesson not found in M3. Found: {cubelet_ids}"


def test_master_syllabus_m3_has_st005_lesson():
    """INTG-04: M3 module must have a lesson for cubelet ST-005."""
    assert MASTER_SYLLABUS.exists(), f"master-syllabus.json not found: {MASTER_SYLLABUS}"
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    m3 = next((m for m in data.get("modules", []) if m.get("module_id") == "M3"), None)
    assert m3 is not None, "M3 module not found"
    cubelet_ids = [lesson.get("cubelet_id") for lesson in m3.get("lessons", [])]
    assert "ST-005" in cubelet_ids, f"ST-005 lesson not found in M3. Found: {cubelet_ids}"


def test_master_syllabus_m3_has_st006_lesson():
    """INTG-04: M3 module must have a lesson for cubelet ST-006."""
    assert MASTER_SYLLABUS.exists(), f"master-syllabus.json not found: {MASTER_SYLLABUS}"
    data = json.loads(MASTER_SYLLABUS.read_text(encoding="utf-8"))
    m3 = next((m for m in data.get("modules", []) if m.get("module_id") == "M3"), None)
    assert m3 is not None, "M3 module not found"
    cubelet_ids = [lesson.get("cubelet_id") for lesson in m3.get("lessons", [])]
    assert "ST-006" in cubelet_ids, f"ST-006 lesson not found in M3. Found: {cubelet_ids}"


# ---------------------------------------------------------------------------
# INTG-05: prerequisite-chain.json has correct dependency entries
# ---------------------------------------------------------------------------

def _get_prereqs_for(cubelet_id: str) -> list:
    """Return prerequisites list for a cubelet from prerequisite-chain.json."""
    assert PREREQ_CHAIN.exists(), f"prerequisite-chain.json not found: {PREREQ_CHAIN}"
    data = json.loads(PREREQ_CHAIN.read_text(encoding="utf-8"))
    chain = data.get("prerequisite_chain", {}).get("chain", [])
    entry = next((c for c in chain if c.get("cubelet_id") == cubelet_id), None)
    assert entry is not None, (
        f"No entry for {cubelet_id} in prerequisite-chain.json"
    )
    return entry.get("prerequisites", [])


def test_prerequisite_chain_st004_requires_st001():
    """INTG-05: ST-004 must require [ST-001]."""
    prereqs = _get_prereqs_for("ST-004")
    assert prereqs == ["ST-001"], (
        f"ST-004 prerequisites should be [ST-001], got {prereqs}"
    )


def test_prerequisite_chain_st005_requires_st002_and_st004():
    """INTG-05: ST-005 must require [ST-002, ST-004]."""
    prereqs = _get_prereqs_for("ST-005")
    assert set(prereqs) == {"ST-002", "ST-004"}, (
        f"ST-005 prerequisites should be {{ST-002, ST-004}}, got {prereqs}"
    )


def test_prerequisite_chain_st006_requires_st003():
    """INTG-05: ST-006 must require [ST-003]."""
    prereqs = _get_prereqs_for("ST-006")
    assert prereqs == ["ST-003"], (
        f"ST-006 prerequisites should be [ST-003], got {prereqs}"
    )


# ---------------------------------------------------------------------------
# INTG-07: Vercel production URL returns HTTP 200
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not _vercel_reachable(), reason="Network unavailable — skipping Vercel HTTP check")
def test_vercel_production_url_returns_http_200():
    """INTG-07: https://preview-app-two.vercel.app must return HTTP 200."""
    try:
        response = urllib.request.urlopen(VERCEL_URL, timeout=10)
        assert response.status == 200, (
            f"Expected HTTP 200 from {VERCEL_URL}, got {response.status}"
        )
    except urllib.error.HTTPError as exc:
        pytest.fail(f"{VERCEL_URL} returned HTTP {exc.code}: {exc.reason}")
    except urllib.error.URLError as exc:
        pytest.fail(f"Could not reach {VERCEL_URL}: {exc.reason}")


# ---------------------------------------------------------------------------
# INTG-08: package.json does NOT include dagre as a dependency
# ---------------------------------------------------------------------------

def test_preview_app_package_json_has_no_dagre_dependency():
    """INTG-08: preview-app/package.json must not list dagre in dependencies."""
    assert PREVIEW_PKG.exists(), f"package.json not found: {PREVIEW_PKG}"
    data = json.loads(PREVIEW_PKG.read_text(encoding="utf-8"))

    all_deps: dict = {}
    all_deps.update(data.get("dependencies", {}))
    all_deps.update(data.get("devDependencies", {}))
    all_deps.update(data.get("peerDependencies", {}))

    dagre_keys = [k for k in all_deps if "dagre" in k.lower()]
    assert not dagre_keys, (
        f"dagre found in package.json dependencies: {dagre_keys}"
    )
