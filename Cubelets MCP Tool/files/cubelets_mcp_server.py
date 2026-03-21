"""
Systems Thinking Cubelets MCP Server
=====================================
Extension tools for ST-001 (Reinforcing Feedback Loops), ST-002 (Leverage Points),
and ST-003 (Shifting the Burden) cubelets.

Designed to pair with the existing systems-thinking MCP server tools:
  - create_causal_loop
  - identify_feedback_loops
  - find_leverage_points
  - run_scenario
  - export_cld_diagram

These new tools add cubelet-specific analysis that the base server doesn't cover.

Author: Ricco Wilson | Wilson Consulting Unlimited
Course: Divergence Academy - Intelligent Automation Immersive
"""

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from enum import Enum
import json

# ============================================================================
# Server Initialization
# ============================================================================

mcp = FastMCP("systems_thinking_cubelets_mcp")

# ============================================================================
# Shared Enums & Models
# ============================================================================

class ResponseFormat(str, Enum):
    """Output format for tool responses."""
    MARKDOWN = "markdown"
    JSON = "json"


class Polarity(str, Enum):
    """Causal link polarity."""
    POSITIVE = "+"
    NEGATIVE = "-"


class CausalLink(BaseModel):
    """A directed causal link between two variables."""
    model_config = ConfigDict(str_strip_whitespace=True)

    from_var: str = Field(..., description="Source variable name", min_length=1, max_length=200)
    to_var: str = Field(..., description="Target variable name", min_length=1, max_length=200)
    polarity: Polarity = Field(..., description="Link polarity: '+' (same direction) or '-' (opposite direction)")
    strength: Optional[float] = Field(
        default=1.0,
        description="Coupling strength of this link (0.0–1.0). Defaults to 1.0 if unknown.",
        ge=0.0, le=1.0
    )


class AgentComponent(BaseModel):
    """A node in an agent architecture diagram (ST-004)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    id: str = Field(..., description="Unique identifier for this component", min_length=1, max_length=50)
    name: str = Field(..., description="Display name for this component", min_length=1, max_length=200)
    component_type: Literal["agent", "tool", "memory", "evaluator", "constraint"] = Field(
        ...,
        description="Category of this component (5 fixed types)"
    )
    description: str = Field(default="", description="What this component does", max_length=500)
    position_x: Optional[float] = Field(default=None, description="Canvas x position for layout")
    position_y: Optional[float] = Field(default=None, description="Canvas y position for layout")


class AgentLink(BaseModel):
    """A directed causal link between two agent components (ST-004)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    from_component: str = Field(..., description="ID of source AgentComponent", min_length=1, max_length=50)
    to_component: str = Field(..., description="ID of target AgentComponent", min_length=1, max_length=50)
    polarity: Polarity = Field(..., description="Link polarity: '+' (same direction) or '-' (opposite direction)")
    strength: Optional[float] = Field(
        default=1.0,
        description="Coupling strength of this link (0.0–1.0). Defaults to 1.0 if unknown.",
        ge=0.0, le=1.0
    )
    label: str = Field(default="", description="Describes the interaction", max_length=200)
    link_type: Optional[Literal["data_flow", "control_flow", "feedback", "dependency"]] = Field(
        default=None,
        description="Categorizes the interaction type"
    )

    def to_causal_link(self) -> CausalLink:
        """Transform this AgentLink to a CausalLink for reuse with loop detection logic."""
        return CausalLink(
            from_var=self.from_component,
            to_var=self.to_component,
            polarity=self.polarity,
            strength=self.strength
        )


class MeadowsLevel(str, Enum):
    """Meadows hierarchy intervention levels (1=lowest leverage, 12=highest)."""
    CONSTANTS = "1"
    BUFFERS = "2"
    POSITIVE_GAIN = "3"
    NEGATIVE_STRENGTH = "4"
    DELAYS = "5"
    FEEDBACK_STRUCTURE = "6"
    INFORMATION_FLOWS = "7"
    RULES = "8"
    SELF_ORGANIZATION = "9"
    GOALS = "10"
    PARADIGM = "11"
    TRANSCENDING = "12"


MEADOWS_LABELS = {
    "1": "Constants, parameters, numbers",
    "2": "Buffer / stock sizes",
    "3": "Positive feedback loop gain",
    "4": "Negative feedback loop strength",
    "5": "Feedback loop delays",
    "6": "Feedback loop structure (adding/removing loops)",
    "7": "Information flows (who has access to what)",
    "8": "Rules of the system (incentives, constraints)",
    "9": "Self-organization (ability to evolve structure)",
    "10": "Goals of the system",
    "11": "Mindset / paradigm from which goals arise",
    "12": "Transcending paradigms",
}

MEADOWS_TIER = {
    "1": "low", "2": "low", "3": "low", "4": "low",
    "5": "medium", "6": "medium", "7": "medium",
    "8": "high", "9": "high", "10": "high", "11": "high", "12": "high",
}


# ============================================================================
# ST-001: Reinforcing Feedback Loop Scorer
# ============================================================================

class ScoreReinforcingLoopInput(BaseModel):
    """Input for scoring and classifying feedback loops in a causal structure."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    variables: List[str] = Field(
        ...,
        description="List of variable names in the system (3–20 variables). Example: ['Agent Complexity', 'Token Usage', 'AI Spend', 'Team Scaling Pressure']",
        min_length=3, max_length=20
    )
    causal_links: List[CausalLink] = Field(
        ...,
        description="List of directed causal links with polarity. Each link connects from_var → to_var with '+' or '-' polarity.",
        min_length=2
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for structured data"
    )

    @field_validator("causal_links")
    @classmethod
    def validate_links_reference_variables(cls, v: List[CausalLink], info) -> List[CausalLink]:
        if "variables" in info.data:
            var_set = set(info.data["variables"])
            for link in v:
                if link.from_var not in var_set:
                    raise ValueError(f"from_var '{link.from_var}' not in variables list")
                if link.to_var not in var_set:
                    raise ValueError(f"to_var '{link.to_var}' not in variables list")
        return v


class AnalyzeAgentFeedbackLoopsInput(BaseModel):
    """Input for analyzing feedback loops in agent architectures (ST-004)."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    components: List[AgentComponent] = Field(
        ...,
        description="List of agent components in the architecture",
        min_length=2
    )
    links: List[AgentLink] = Field(
        ...,
        description="List of directed links between components with polarity",
        min_length=1
    )
    format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' or 'json'"
    )

    @field_validator("links")
    @classmethod
    def validate_links_reference_components(cls, v: List[AgentLink], info) -> List[AgentLink]:
        """Validate that links reference valid component IDs."""
        if "components" in info.data:
            component_ids = {comp.id for comp in info.data["components"]}
            for link in v:
                if link.from_component not in component_ids:
                    raise ValueError(f"from_component '{link.from_component}' not in component list")
                if link.to_component not in component_ids:
                    raise ValueError(f"to_component '{link.to_component}' not in component list")
        return v


def _find_all_cycles(variables: List[str], links: List[CausalLink]) -> List[Dict]:
    """Graph traversal to find all unique cycles and classify by polarity."""
    adj: Dict[str, List[Dict]] = {v: [] for v in variables}
    for link in links:
        adj[link.from_var].append({
            "to": link.to_var,
            "polarity": link.polarity.value,
            "strength": link.strength or 1.0,
        })

    cycles = []
    visited_starts = set()

    def dfs(start, current, path, path_set, polarities, strengths):
        for neighbor in adj.get(current, []):
            target = neighbor["to"]
            if target == start and len(path) >= 2:
                cycle_polarities = polarities + [neighbor["polarity"]]
                cycle_strengths = strengths + [neighbor["strength"]]
                neg_count = sum(1 for p in cycle_polarities if p == "-")
                loop_type = "reinforcing" if neg_count % 2 == 0 else "balancing"

                # Loop gain = product of strengths
                gain = 1.0
                for s in cycle_strengths:
                    gain *= s

                cycles.append({
                    "path": path + [start],
                    "polarities": cycle_polarities,
                    "negative_count": neg_count,
                    "loop_type": loop_type,
                    "loop_gain": round(gain, 4),
                    "cycle_length": len(path),
                })
                continue

            if target not in path_set and target not in visited_starts:
                path_set.add(target)
                dfs(
                    start, target,
                    path + [target], path_set,
                    polarities + [neighbor["polarity"]],
                    strengths + [neighbor["strength"]],
                )
                path_set.discard(target)

    for var in variables:
        dfs(var, var, [var], {var}, [], [])
        visited_starts.add(var)

    # Deduplicate by sorted node set
    unique = []
    seen = set()
    for cycle in cycles:
        key = tuple(sorted(cycle["path"][:-1]))
        if key not in seen:
            seen.add(key)
            unique.append(cycle)

    return unique


@mcp.tool(
    name="score_reinforcing_loops",
    annotations={
        "title": "ST-001: Score & Classify Feedback Loops",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def score_reinforcing_loops(params: ScoreReinforcingLoopInput) -> str:
    """Analyze a causal loop diagram to find, classify, and score all feedback loops.

    For each closed loop found, this tool:
    1. Traces the causal chain through all variables
    2. Counts negative polarities to classify as reinforcing (even) or balancing (odd)
    3. Computes loop gain from coupling strengths
    4. Ranks loops by gain and cycle length

    This implements the polarity rule from ST-001 Face 3:
    'Count the negative links. Even (including zero) = Reinforcing. Odd = Balancing.'

    Use this AFTER creating a CLD with create_causal_loop or when a user describes
    variables and causal links and wants to know if their system contains reinforcing
    or balancing dynamics.

    Args:
        params: Variables, causal links, and output format preference.

    Returns:
        Classified feedback loops with scores, ranked by loop gain.
    """
    cycles = _find_all_cycles(params.variables, params.causal_links)

    reinforcing = [c for c in cycles if c["loop_type"] == "reinforcing"]
    balancing = [c for c in cycles if c["loop_type"] == "balancing"]

    # Compute per-variable loop participation
    participation: Dict[str, Dict] = {v: {"reinforcing": 0, "balancing": 0, "total": 0} for v in params.variables}
    for cycle in cycles:
        for var in cycle["path"][:-1]:
            participation[var][cycle["loop_type"]] += 1
            participation[var]["total"] += 1

    result = {
        "total_loops": len(cycles),
        "reinforcing_count": len(reinforcing),
        "balancing_count": len(balancing),
        "loops": sorted(cycles, key=lambda c: c["loop_gain"], reverse=True),
        "variable_participation": participation,
        "dominant_dynamic": "reinforcing" if len(reinforcing) > len(balancing) else "balancing" if len(balancing) > len(reinforcing) else "balanced",
    }

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown output
    md = []
    md.append("# Feedback Loop Analysis (ST-001)")
    md.append("")
    md.append(f"**Total loops found:** {result['total_loops']}")
    md.append(f"**Reinforcing:** {result['reinforcing_count']} | **Balancing:** {result['balancing_count']}")
    md.append(f"**Dominant dynamic:** {result['dominant_dynamic'].upper()}")
    md.append("")

    if reinforcing:
        md.append("## Reinforcing Loops (amplifying)")
        for i, loop in enumerate(sorted(reinforcing, key=lambda c: c["loop_gain"], reverse=True), 1):
            chain = " → ".join(loop["path"])
            md.append(f"**R{i}:** {chain}")
            md.append(f"  - Negative links: {loop['negative_count']} (even = reinforcing ✓)")
            md.append(f"  - Loop gain: {loop['loop_gain']}")
            md.append(f"  - Cycle length: {loop['cycle_length']} variables")
            md.append("")

    if balancing:
        md.append("## Balancing Loops (stabilizing)")
        for i, loop in enumerate(sorted(balancing, key=lambda c: c["loop_gain"], reverse=True), 1):
            chain = " → ".join(loop["path"])
            md.append(f"**B{i}:** {chain}")
            md.append(f"  - Negative links: {loop['negative_count']} (odd = balancing ✓)")
            md.append(f"  - Loop gain: {loop['loop_gain']}")
            md.append("")

    md.append("## Variable Loop Participation")
    for var in sorted(participation.keys(), key=lambda v: participation[v]["total"], reverse=True):
        p = participation[var]
        md.append(f"- **{var}**: {p['total']} loops ({p['reinforcing']}R, {p['balancing']}B)")

    md.append("")
    md.append("---")
    md.append("*Polarity Rule: Count negative links. Even (incl. zero) = Reinforcing. Odd = Balancing.*")
    md.append("*A reinforcing loop amplifies whatever direction the system is moving — growth OR decline.*")

    return "\n".join(md)


# ============================================================================
# ST-002: Intervention Comparator
# ============================================================================

class Intervention(BaseModel):
    """A proposed intervention at a specific variable."""
    model_config = ConfigDict(str_strip_whitespace=True)

    target_variable: str = Field(..., description="The CLD variable this intervention targets", min_length=1)
    label: str = Field(..., description="Short name for this intervention (e.g., 'Budget cap', 'Prompt caching')", min_length=1, max_length=200)
    description: str = Field(
        default="",
        description="What this intervention does and how it changes the system",
        max_length=1000
    )
    meadows_level: MeadowsLevel = Field(
        ...,
        description="Meadows hierarchy level (1=constants/parameters, 6=feedback structure, 10=goals, 12=transcending paradigms)"
    )
    estimated_impact: Optional[str] = Field(
        default=None,
        description="Estimated impact description (e.g., '55% cost reduction', 'Moderate risk reduction')"
    )


class CompareInterventionsInput(BaseModel):
    """Input for comparing two or more interventions using Meadows hierarchy."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    system_description: str = Field(
        ...,
        description="Brief description of the system being analyzed (e.g., 'AI operations cost management for MCP server infrastructure')",
        min_length=10, max_length=1000
    )
    interventions: List[Intervention] = Field(
        ...,
        description="Two or more interventions to compare. Include at least one parameter-level and one structural-level for meaningful comparison.",
        min_length=2, max_length=10
    )
    leverage_scores: Optional[Dict[str, float]] = Field(
        default=None,
        description="Optional: leverage scores from find_leverage_points (variable_name → score 0.0–1.0). Enriches the comparison."
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' or 'json'"
    )


@mcp.tool(
    name="compare_interventions",
    annotations={
        "title": "ST-002: Compare Interventions via Meadows Hierarchy",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def compare_interventions(params: CompareInterventionsInput) -> str:
    """Compare two or more system interventions using Meadows' hierarchy of leverage points.

    For each intervention, this tool:
    1. Classifies it by Meadows level (1–12) and tier (low/medium/high)
    2. Compares structural depth across interventions
    3. Identifies which intervention changes system structure vs. tweaks parameters
    4. Optionally incorporates leverage scores from find_leverage_points

    This implements the core ST-002 insight: 'Same node, dramatically different impact'
    depending on whether the intervention is a parameter change (Level 1) or a structural
    change (Level 6+).

    The 10x ROI variance that CxOs see lives in the gap between parameter tweaks
    and structural changes.

    Use AFTER find_leverage_points has ranked CLD nodes, when the user needs to decide
    HOW to intervene at a given node.

    Args:
        params: System description, interventions with Meadows levels, optional leverage scores.

    Returns:
        Ranked comparison with Meadows classification, tier analysis, and recommendation.
    """
    scored = []
    for intv in params.interventions:
        level_num = int(intv.meadows_level.value)
        tier = MEADOWS_TIER[intv.meadows_level.value]
        label = MEADOWS_LABELS[intv.meadows_level.value]
        leverage = None
        if params.leverage_scores and intv.target_variable in params.leverage_scores:
            leverage = params.leverage_scores[intv.target_variable]

        # Composite score: Meadows level normalized + leverage score if available
        meadows_score = level_num / 12.0
        composite = meadows_score
        if leverage is not None:
            composite = (meadows_score * 0.6) + (leverage * 0.4)

        scored.append({
            "label": intv.label,
            "target_variable": intv.target_variable,
            "description": intv.description,
            "meadows_level": level_num,
            "meadows_label": label,
            "tier": tier,
            "leverage_score": leverage,
            "composite_score": round(composite, 3),
            "estimated_impact": intv.estimated_impact,
        })

    scored.sort(key=lambda x: x["composite_score"], reverse=True)

    # Analysis
    tiers_present = set(s["tier"] for s in scored)
    has_parameter = any(s["meadows_level"] <= 4 for s in scored)
    has_structural = any(5 <= s["meadows_level"] <= 7 for s in scored)
    has_paradigm = any(s["meadows_level"] >= 8 for s in scored)
    structural_gap = max(s["meadows_level"] for s in scored) - min(s["meadows_level"] for s in scored)

    result = {
        "system": params.system_description,
        "interventions_ranked": scored,
        "analysis": {
            "structural_gap": structural_gap,
            "has_parameter_level": has_parameter,
            "has_structural_level": has_structural,
            "has_paradigm_level": has_paradigm,
            "tiers_represented": sorted(tiers_present),
            "recommendation": scored[0]["label"] if scored else None,
        }
    }

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown
    md = []
    md.append("# Intervention Comparison (ST-002)")
    md.append(f"**System:** {params.system_description}")
    md.append("")
    md.append("## Ranked Interventions")
    md.append("")

    for i, s in enumerate(scored, 1):
        tier_emoji = {"low": "🟡", "medium": "🔵", "high": "🟣"}.get(s["tier"], "⚪")
        md.append(f"### #{i}: {s['label']} {tier_emoji}")
        md.append(f"**Target:** {s['target_variable']}")
        md.append(f"**Meadows Level {s['meadows_level']}:** {s['meadows_label']}")
        md.append(f"**Tier:** {s['tier'].upper()}")
        if s["leverage_score"] is not None:
            md.append(f"**Node leverage score:** {s['leverage_score']}")
        md.append(f"**Composite score:** {s['composite_score']}")
        if s["description"]:
            md.append(f"**How:** {s['description']}")
        if s["estimated_impact"]:
            md.append(f"**Estimated impact:** {s['estimated_impact']}")
        md.append("")

    md.append("## Structural Gap Analysis")
    md.append(f"**Gap between lowest and highest intervention:** {structural_gap} Meadows levels")
    if structural_gap >= 4:
        md.append("⚠️ **Large structural gap detected.** The highest-ranked intervention operates at a fundamentally different system level than the lowest. This is where the 10x ROI variance lives.")
    elif structural_gap >= 2:
        md.append("Moderate structural gap. Higher-level intervention likely outperforms but both may be worth pursuing.")
    else:
        md.append("Interventions are at similar depth. Differentiation comes from execution quality, not structural advantage.")

    if has_parameter and has_structural:
        md.append("")
        md.append("**Parameter vs. Structure:** You have both parameter-level and structural-level interventions targeting the same system. The structural intervention changes *how the system works*; the parameter intervention changes *a number within the existing structure*. Per Meadows: structural changes produce lasting shifts; parameter changes require ongoing enforcement.")

    md.append("")
    md.append(f"**Recommended lead intervention:** {scored[0]['label']}")
    md.append("")
    md.append("---")
    md.append("*Same node, dramatically different impact. A budget cap and prompt caching both target AI Spend — but one is Level 1 (parameter), the other Level 6 (feedback structure).*")

    return "\n".join(md)


# ============================================================================
# ST-003: Burden Shift Detector
# ============================================================================

class FixRecord(BaseModel):
    """A fix that has been applied to a recurring problem."""
    model_config = ConfigDict(str_strip_whitespace=True)

    label: str = Field(..., description="Name of the fix (e.g., 'Route to human review', 'Add validation layer')", min_length=1, max_length=200)
    description: str = Field(default="", description="What this fix does", max_length=1000)
    times_applied: int = Field(default=1, description="How many times this fix has been applied or is currently active", ge=1)
    is_symptomatic: Optional[bool] = Field(
        default=None,
        description="If known: True = treats symptom, False = addresses root cause. Leave None for auto-classification."
    )
    side_effects: Optional[str] = Field(
        default=None,
        description="Known side effects of this fix (e.g., 'Adds latency', 'Blocks parser improvement', 'Increases cost')"
    )
    duration_active: Optional[str] = Field(
        default=None,
        description="How long this fix has been running (e.g., '3 months', '6 sprints', 'since Q1')"
    )


class DetectBurdenShiftInput(BaseModel):
    """Input for detecting the Shifting the Burden archetype."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    recurring_symptom: str = Field(
        ...,
        description="The recurring problem symptom (e.g., 'Failed-confidence EDI documents pile up', 'LLM outputs unreliable')",
        min_length=5, max_length=500
    )
    fixes_applied: List[FixRecord] = Field(
        ...,
        description="All fixes that have been applied to this symptom, including currently active ones",
        min_length=1, max_length=20
    )
    fundamental_solution: Optional[str] = Field(
        default=None,
        description="The known fundamental solution, if identified (e.g., 'Restructure prompt architecture', 'Auto-generate training data from corrections')"
    )
    fundamental_viability_now: Optional[int] = Field(
        default=None,
        description="Rate the viability of the fundamental solution TODAY on 1–10 scale. Compare to when the first fix was applied. Decline = erosion confirmed.",
        ge=1, le=10
    )
    fundamental_viability_original: Optional[int] = Field(
        default=None,
        description="Rate the viability of the fundamental solution WHEN THE FIRST FIX WAS APPLIED on 1–10 scale.",
        ge=1, le=10
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' or 'json'"
    )


def _classify_fix(fix: FixRecord) -> str:
    """Auto-classify a fix as symptomatic or fundamental based on heuristics."""
    if fix.is_symptomatic is not None:
        return "symptomatic" if fix.is_symptomatic else "fundamental"

    symptomatic_signals = [
        "review", "retry", "validation", "layer", "check", "manual",
        "workaround", "patch", "cap", "limit", "filter", "override",
        "queue", "escalat", "monitor", "alert", "fallback", "cache",
        "hotfix", "bandaid", "temporary", "interim", "quick",
    ]
    fundamental_signals = [
        "redesign", "restructur", "refactor", "retrain", "rebuild",
        "architect", "pipeline", "automat", "root cause", "fundamental",
        "systematic", "transform", "replace", "migrate", "re-engineer",
    ]

    text = (fix.label + " " + fix.description + " " + (fix.side_effects or "")).lower()
    symp_score = sum(1 for s in symptomatic_signals if s in text)
    fund_score = sum(1 for s in fundamental_signals if s in text)

    if fund_score > symp_score:
        return "fundamental"
    return "symptomatic"


def _compute_erosion_risk(fixes: List[FixRecord], viability_now: Optional[int], viability_orig: Optional[int]) -> Dict:
    """Compute erosion risk score and channel analysis."""
    symptomatic_fixes = [f for f in fixes if _classify_fix(f) == "symptomatic"]
    total_applications = sum(f.times_applied for f in symptomatic_fixes)

    # Erosion channels from side effects
    erosion_channels = [
        f.side_effects for f in symptomatic_fixes
        if f.side_effects
    ]

    # Viability decline
    viability_decline = None
    if viability_now is not None and viability_orig is not None:
        viability_decline = viability_orig - viability_now

    # Risk score (0–100)
    risk = 0
    risk += min(total_applications * 8, 40)  # More applications = more dependency
    risk += len(symptomatic_fixes) * 10       # More distinct fixes = more complexity
    if viability_decline and viability_decline > 0:
        risk += viability_decline * 5          # Direct erosion evidence
    if len(erosion_channels) > 0:
        risk += len(erosion_channels) * 8      # Known side effects = confirmed erosion
    risk = min(risk, 100)

    severity = "low" if risk < 30 else "moderate" if risk < 60 else "high" if risk < 80 else "critical"

    return {
        "risk_score": risk,
        "severity": severity,
        "symptomatic_fix_count": len(symptomatic_fixes),
        "total_applications": total_applications,
        "erosion_channels": erosion_channels,
        "viability_decline": viability_decline,
    }


@mcp.tool(
    name="detect_burden_shift",
    annotations={
        "title": "ST-003: Detect Shifting the Burden Archetype",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def detect_burden_shift(params: DetectBurdenShiftInput) -> str:
    """Analyze a recurring problem to detect the Shifting the Burden system archetype.

    This tool maps the three interacting loops:
    - B1 (Symptomatic Fix): Quick fix reduces symptom → pressure drops → no investment in root cause
    - B2 (Fundamental Solution): Root cause fix eliminates symptom long-term but has delay and cost
    - R1 (Erosion): Each symptomatic fix creates side effects that erode capacity for fundamental solution

    For each fix provided, this tool:
    1. Classifies it as symptomatic or fundamental (auto or manual)
    2. Maps erosion channels from side effects
    3. Computes erosion risk score (0–100)
    4. Detects viability decline if before/after ratings provided
    5. Generates a transition strategy recommendation

    This implements the archetype from ST-003: 'Not procrastination — Shifting the Burden
    is taking action, the wrong kind.'

    Use when a user describes a recurring problem with multiple attempted fixes, or when
    reviewing technical debt, workaround accumulation, or 'we'll fix it properly next sprint'
    patterns.

    Args:
        params: Recurring symptom, fixes applied, optional fundamental solution details.

    Returns:
        Archetype analysis with B1/B2/R1 mapping, erosion risk score, and transition strategy.
    """
    # Classify all fixes
    classified = []
    for fix in params.fixes_applied:
        classification = _classify_fix(fix)
        classified.append({
            "label": fix.label,
            "description": fix.description,
            "classification": classification,
            "times_applied": fix.times_applied,
            "side_effects": fix.side_effects,
            "duration_active": fix.duration_active,
        })

    symptomatic = [f for f in classified if f["classification"] == "symptomatic"]
    fundamental = [f for f in classified if f["classification"] == "fundamental"]

    # Compute erosion
    erosion = _compute_erosion_risk(
        params.fixes_applied,
        params.fundamental_viability_now,
        params.fundamental_viability_original,
    )

    # Archetype confirmation
    archetype_confirmed = (
        len(symptomatic) >= 1
        and (erosion["risk_score"] >= 30 or (erosion["viability_decline"] and erosion["viability_decline"] > 0))
    )

    # Transition strategy
    transition = None
    if params.fundamental_solution:
        transition = {
            "maintain": f"Continue running: {', '.join(f['label'] for f in symptomatic[:2])}",
            "build": f"Invest in parallel: {params.fundamental_solution}",
            "measure": "Track fundamental solution viability monthly. If declining, increase investment.",
            "transition_trigger": "When fundamental solution handles 50%+ of symptom load, begin phasing out symptomatic fixes.",
        }

    result = {
        "symptom": params.recurring_symptom,
        "archetype_detected": archetype_confirmed,
        "fixes_classified": classified,
        "b1_loop": {
            "type": "Balancing (quick fix)",
            "fixes": [f["label"] for f in symptomatic],
            "total_applications": sum(f["times_applied"] for f in symptomatic),
        },
        "b2_loop": {
            "type": "Balancing (fundamental)",
            "solution": params.fundamental_solution or "Not yet identified",
            "viability_now": params.fundamental_viability_now,
            "viability_original": params.fundamental_viability_original,
        },
        "r1_loop": {
            "type": "Reinforcing (erosion)",
            "erosion_risk": erosion,
        },
        "transition_strategy": transition,
    }

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown
    md = []
    md.append("# Burden Shift Analysis (ST-003)")
    md.append("")
    md.append(f"**Recurring symptom:** {params.recurring_symptom}")
    md.append("")

    if archetype_confirmed:
        md.append("⚠️ **SHIFTING THE BURDEN ARCHETYPE DETECTED**")
    else:
        md.append("ℹ️ Archetype pattern not strongly confirmed. May be early stage or correctly managed.")
    md.append("")

    # B1
    md.append("## B1: Symptomatic Fix Loop")
    if symptomatic:
        for f in symptomatic:
            applied = f"(applied {f['times_applied']}×)" if f["times_applied"] > 1 else ""
            duration = f" — running {f['duration_active']}" if f["duration_active"] else ""
            md.append(f"- **{f['label']}** {applied}{duration}")
            if f["side_effects"]:
                md.append(f"  - Side effect: {f['side_effects']}")
    else:
        md.append("No symptomatic fixes identified.")
    md.append("")

    # B2
    md.append("## B2: Fundamental Solution Loop")
    if params.fundamental_solution:
        md.append(f"**Identified solution:** {params.fundamental_solution}")
        if params.fundamental_viability_now is not None and params.fundamental_viability_original is not None:
            decline = params.fundamental_viability_original - params.fundamental_viability_now
            md.append(f"**Viability then:** {params.fundamental_viability_original}/10 → **Viability now:** {params.fundamental_viability_now}/10")
            if decline > 0:
                md.append(f"📉 **Viability declined by {decline} points.** Erosion confirmed.")
            elif decline == 0:
                md.append("Viability stable — erosion not yet measurable.")
            else:
                md.append("✅ Viability improved — fundamental solution is being invested in.")
    else:
        md.append("⚠️ **Fundamental solution not yet identified.** This is step 3 of the action framework.")
    md.append("")

    # R1
    md.append("## R1: Erosion Loop")
    md.append(f"**Erosion risk score:** {erosion['risk_score']}/100 ({erosion['severity'].upper()})")
    if erosion["erosion_channels"]:
        md.append("**Erosion channels:**")
        for ch in erosion["erosion_channels"]:
            md.append(f"  - {ch}")
    md.append("")

    # Transition strategy
    if transition:
        md.append("## Transition Strategy")
        md.append(f"**Maintain:** {transition['maintain']}")
        md.append(f"**Build:** {transition['build']}")
        md.append(f"**Measure:** {transition['measure']}")
        md.append(f"**Transition trigger:** {transition['transition_trigger']}")
    else:
        md.append("## Next Step")
        md.append("Identify the fundamental solution (Step 3 of ST-003 action framework), then re-run this analysis to generate a transition strategy.")

    md.append("")
    md.append("---")
    md.append("*Shifting the Burden is not procrastination — it's taking action, the wrong kind.*")
    md.append("*The pattern is self-concealing: each fix produces measurable improvement.*")
    md.append("*Check: Could we still implement the fundamental solution today? If it's getting harder, you're in the window.*")

    return "\n".join(md)


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    mcp.run(transport="stdio")
