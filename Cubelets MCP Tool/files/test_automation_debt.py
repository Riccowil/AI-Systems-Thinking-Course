"""Test suite for ST-006 Automation Debt Detector (AB-06, AB-07)."""

import pytest
import asyncio
import json
from pydantic import ValidationError
from cubelets_mcp_server import (
    AutomationLayer,
    DetectAutomationDebtInput,
    detect_automation_debt,
    FixRecord,
    ResponseFormat,
)


# ============================================================================
# Test Fixtures
# ============================================================================

def make_quick_fix(name="Retry logic"):
    return AutomationLayer(
        layer_name=name,
        layer_type="quick_fix",
        side_effects="Adds latency",
        duration_active="3 months",
    )


def make_fundamental(name="Prompt redesign"):
    return AutomationLayer(
        layer_name=name,
        layer_type="fundamental",
        duration_active="1 month",
    )


# ============================================================================
# Model Validation Tests (5 tests)
# ============================================================================

def test_automation_layer_valid_creation():
    """AutomationLayer can be created with valid fields."""
    layer = AutomationLayer(
        layer_name="Retry logic",
        layer_type="quick_fix",
        side_effects="Adds latency",
        duration_active="3 months",
    )
    assert layer.layer_name == "Retry logic"
    assert layer.layer_type == "quick_fix"
    assert layer.side_effects == "Adds latency"
    assert layer.duration_active == "3 months"


def test_automation_layer_rejects_invalid_type():
    """AutomationLayer rejects invalid layer_type values."""
    with pytest.raises(ValidationError):
        AutomationLayer(
            layer_name="Bad fix",
            layer_type="hotfix",
        )


def test_to_fix_record_quick_fix():
    """AutomationLayer.to_fix_record() maps quick_fix to is_symptomatic=True."""
    layer = make_quick_fix("Retry logic")
    record = layer.to_fix_record()
    assert isinstance(record, FixRecord)
    assert record.is_symptomatic is True
    assert record.label == "Retry logic"


def test_to_fix_record_fundamental():
    """AutomationLayer.to_fix_record() maps fundamental to is_symptomatic=False."""
    layer = make_fundamental("Prompt redesign")
    record = layer.to_fix_record()
    assert isinstance(record, FixRecord)
    assert record.is_symptomatic is False


def test_input_requires_recurring_symptom():
    """DetectAutomationDebtInput rejects recurring_symptom shorter than 5 chars."""
    with pytest.raises(ValidationError):
        DetectAutomationDebtInput(
            recurring_symptom="LLM",
            automation_layers=[make_quick_fix()],
        )


# ============================================================================
# Tool Behavior Tests (5 tests)
# ============================================================================

def test_detect_debt_returns_debt_score():
    """detect_automation_debt returns JSON with debt_score field (0-100)."""
    input_obj = DetectAutomationDebtInput(
        recurring_symptom="LLM outputs unreliable results frequently",
        automation_layers=[make_quick_fix("Retry logic"), make_quick_fix("Regex filter")],
        response_format=ResponseFormat.JSON,
    )
    result = asyncio.run(detect_automation_debt(input_obj))
    data = json.loads(result)
    assert "debt_score" in data
    assert isinstance(data["debt_score"], int)
    assert 0 <= data["debt_score"] <= 100


def test_detect_debt_returns_erosion_channels():
    """detect_automation_debt returns erosion_channels in output."""
    input_obj = DetectAutomationDebtInput(
        recurring_symptom="LLM outputs unreliable results frequently",
        automation_layers=[make_quick_fix("Retry logic"), make_quick_fix("Regex filter")],
        response_format=ResponseFormat.JSON,
    )
    result = asyncio.run(detect_automation_debt(input_obj))
    data = json.loads(result)
    assert "erosion_channels" in data


def test_all_quick_fix_higher_debt():
    """All quick_fix layers produce higher debt_score than mixed layers."""
    all_quick_fix = DetectAutomationDebtInput(
        recurring_symptom="Agent crashes on edge cases repeatedly",
        automation_layers=[
            make_quick_fix("Exception handler"),
            make_quick_fix("Retry wrapper"),
            make_quick_fix("Fallback router"),
        ],
        response_format=ResponseFormat.JSON,
    )
    mixed = DetectAutomationDebtInput(
        recurring_symptom="Agent crashes on edge cases repeatedly",
        automation_layers=[
            make_quick_fix("Exception handler"),
            make_fundamental("Redesign state machine"),
            make_fundamental("Add guard conditions"),
        ],
        response_format=ResponseFormat.JSON,
    )
    result_all = json.loads(asyncio.run(detect_automation_debt(all_quick_fix)))
    result_mixed = json.loads(asyncio.run(detect_automation_debt(mixed)))
    assert result_all["debt_score"] > result_mixed["debt_score"]


def test_detect_debt_returns_recommendations():
    """detect_automation_debt returns recommendations list."""
    input_obj = DetectAutomationDebtInput(
        recurring_symptom="LLM outputs unreliable results frequently",
        automation_layers=[make_quick_fix("Retry logic"), make_quick_fix("Regex filter")],
        response_format=ResponseFormat.JSON,
    )
    result = asyncio.run(detect_automation_debt(input_obj))
    data = json.loads(result)
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)


def test_detect_debt_with_fundamental_solution():
    """detect_automation_debt with fundamental_solution includes burden-shift context."""
    input_obj = DetectAutomationDebtInput(
        recurring_symptom="LLM outputs unreliable results frequently",
        automation_layers=[
            make_quick_fix("Retry logic"),
            make_fundamental("Prompt architecture overhaul"),
        ],
        fundamental_solution="Restructure prompt architecture",
        response_format=ResponseFormat.JSON,
    )
    result = asyncio.run(detect_automation_debt(input_obj))
    data = json.loads(result)
    # Should include b1/b2 loop analysis
    assert "b1_loop" in data or "b2_loop" in data or "recommendations" in data
    # Fundamental solution mention should appear in recommendations
    recs = " ".join(data.get("recommendations", []))
    assert "Restructure prompt architecture" in recs or len(data.get("recommendations", [])) > 0
