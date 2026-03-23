"""
Systems Thinking Cubelets MCP Server
=====================================
Extension tools for ST-001 (Reinforcing Feedback Loops), ST-002 (Leverage Points),
ST-003 (Shifting the Burden), and ST-004 (Agent Feedback Loops) cubelets.

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
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
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
# ST-004: Agent Feedback Loop Analyzer
# ============================================================================

@mcp.tool(
    name="analyze_agent_feedback_loops",
    annotations={
        "title": "ST-004: Analyze Agent Feedback Loops",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def analyze_agent_feedback_loops(params: AnalyzeAgentFeedbackLoopsInput) -> str:
    """Analyze feedback loops in agent architectures to detect potentially harmful patterns.

    This tool accepts an agent architecture (components + links) and returns loop classifications
    with severity scores. It identifies three critical patterns:
    - Retry storms: Agent → Tool → Error → Agent loops that amplify under load
    - Cost spirals: Agent → Complex Task → Higher Cost → More Agents reinforcing loops
    - Capability snowballs: Agent → Success → More Complex Tasks → Better Agent reinforcing loops

    For each closed loop found, this tool:
    1. Transforms AgentLink to CausalLink via to_causal_link() composition
    2. Reuses _find_all_cycles() for graph traversal (same algorithm as ST-001)
    3. Classifies as reinforcing (even negative count) or balancing (odd negative count)
    4. Computes severity score (0-100) from loop gain
    5. Assigns loop IDs (R1, R2 for reinforcing; B1, B2 for balancing)
    6. For high-severity loops (67+): auto-generates intervention suggestions

    Severity scoring:
    - Score = loop_gain * 100 (clamped to 0-100)
    - Low: 0-33 (monitor)
    - Medium: 34-66 (plan mitigation)
    - High: 67-100 (immediate intervention recommended)

    This implements the ST-004 pattern: 'Agent systems create feedback loops. Loops create
    emergent behavior. Not all emergence is desirable.'

    Use when a user describes an agent architecture with multiple components (agents, tools,
    memory, evaluators, constraints) and wants to understand potential feedback dynamics.

    Args:
        params: Agent components, links between components, and output format preference.

    Returns:
        Loop analysis with severity scores, loop IDs, intervention recommendations, and
        dominant dynamic classification.
    """
    # Build ID-to-name mapping for readable output
    id_to_name = {comp.id: comp.name for comp in params.components}

    # Extract component names as variables (for readable loop paths)
    variables = [comp.name for comp in params.components]

    # Transform AgentLinks to CausalLinks, mapping IDs to names
    causal_links = []
    for link in params.links:
        causal_links.append(CausalLink(
            from_var=id_to_name[link.from_component],
            to_var=id_to_name[link.to_component],
            polarity=link.polarity,
            strength=link.strength
        ))

    # Reuse the existing cycle detection logic from ST-001
    cycles = _find_all_cycles(variables, causal_links)

    # Add severity scoring and loop IDs
    reinforcing = []
    balancing = []

    for cycle in cycles:
        # Severity score = loop_gain * 100 (clamped to 0-100)
        severity_score = min(int(cycle["loop_gain"] * 100), 100)

        # Severity label
        if severity_score <= 33:
            severity_label = "Low"
        elif severity_score <= 66:
            severity_label = "Medium"
        else:
            severity_label = "High"

        # Add to appropriate list with enriched data
        enriched_cycle = {
            **cycle,
            "severity_score": severity_score,
            "severity_label": severity_label,
        }

        if cycle["loop_type"] == "reinforcing":
            reinforcing.append(enriched_cycle)
        else:
            balancing.append(enriched_cycle)

    # Assign loop IDs
    for i, loop in enumerate(sorted(reinforcing, key=lambda c: c["loop_gain"], reverse=True), 1):
        loop["loop_id"] = f"R{i}"

    for i, loop in enumerate(sorted(balancing, key=lambda c: c["loop_gain"], reverse=True), 1):
        loop["loop_id"] = f"B{i}"

    # Generate intervention suggestions for high-severity loops
    interventions = []
    all_loops = reinforcing + balancing
    high_severity_loops = [loop for loop in all_loops if loop["severity_score"] >= 67]

    for loop in high_severity_loops:
        # Find the link in the cycle with the highest strength
        max_strength = 0.0
        max_from = None
        max_to = None

        # Map path back to original links to find strengths
        for link in params.links:
            from_name = id_to_name[link.from_component]
            to_name = id_to_name[link.to_component]
            # Check if this link is part of the loop path
            for j in range(len(loop["path"]) - 1):
                if from_name == loop["path"][j] and to_name == loop["path"][j + 1]:
                    if (link.strength or 1.0) > max_strength:
                        max_strength = link.strength or 1.0
                        max_from = from_name
                        max_to = to_name

        if max_from and max_to:
            suggestion = (
                f"Consider adding rate limiting between {max_from} and {max_to} "
                f"to reduce coupling (current strength: {max_strength})"
            )
            interventions.append({
                "loop_id": loop["loop_id"],
                "severity": loop["severity_score"],
                "suggestion": suggestion,
            })

    # Compute variable participation (same as ST-001)
    participation = {v: {"reinforcing": 0, "balancing": 0, "total": 0} for v in variables}
    for cycle in cycles:
        for var in cycle["path"][:-1]:
            participation[var][cycle["loop_type"]] += 1
            participation[var]["total"] += 1

    # Determine dominant dynamic
    dominant_dynamic = (
        "reinforcing" if len(reinforcing) > len(balancing)
        else "balancing" if len(balancing) > len(reinforcing)
        else "balanced"
    )

    result = {
        "total_loops": len(cycles),
        "reinforcing_count": len(reinforcing),
        "balancing_count": len(balancing),
        "loops": sorted(all_loops, key=lambda c: c["severity_score"], reverse=True),
        "high_severity_count": len(high_severity_loops),
        "interventions": interventions,
        "variable_participation": participation,
        "dominant_dynamic": dominant_dynamic,
    }

    if params.format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown output
    md = []
    md.append("# Agent Feedback Loop Analysis (ST-004)")
    md.append("")
    md.append(f"**Total loops found:** {result['total_loops']}")
    md.append(f"**Reinforcing:** {result['reinforcing_count']} | **Balancing:** {result['balancing_count']}")
    md.append(f"**High-severity loops:** {result['high_severity_count']}")
    md.append(f"**Dominant dynamic:** {result['dominant_dynamic'].upper()}")
    md.append("")

    if result['loops']:
        md.append("## Loop Analysis")
        md.append("")
        md.append("| Loop ID | Path | Type | Severity | Score |")
        md.append("|---------|------|------|----------|-------|")
        for loop in result['loops']:
            path = " → ".join(loop["path"])
            md.append(f"| {loop['loop_id']} | {path} | {loop['loop_type'].capitalize()} | {loop['severity_label']} | {loop['severity_score']}/100 |")
        md.append("")

    if interventions:
        md.append("## Intervention Recommendations (High-Severity Loops)")
        md.append("")
        for intv in interventions:
            md.append(f"**{intv['loop_id']}** (Severity: {intv['severity']}/100)")
            md.append(f"- {intv['suggestion']}")
            md.append("")

    md.append("## Component Loop Participation")
    for var in sorted(participation.keys(), key=lambda v: participation[v]["total"], reverse=True):
        p = participation[var]
        if p["total"] > 0:
            md.append(f"- **{var}**: {p['total']} loops ({p['reinforcing']}R, {p['balancing']}B)")

    md.append("")
    md.append("---")
    md.append("*Agent systems create feedback loops. Loops create emergent behavior. Not all emergence is desirable.*")
    md.append("*High-severity reinforcing loops can produce retry storms, cost spirals, or capability snowballs.*")

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
# ST-005: Tool Orchestration Analysis
# ============================================================================

class MCPTool(BaseModel):
    """A node representing an MCP tool in an orchestration graph."""
    model_config = ConfigDict(str_strip_whitespace=True)

    tool_id: str = Field(
        ...,
        description="Unique identifier for this tool",
        min_length=1,
        max_length=100
    )
    name: str = Field(
        ...,
        description="Display name for this tool",
        min_length=1,
        max_length=200
    )
    server: str = Field(
        ...,
        description="MCP server hosting this tool",
        min_length=1,
        max_length=100
    )
    description: str = Field(
        default="",
        description="What this tool does",
        max_length=500
    )
    inputs: List[str] = Field(
        default_factory=list,
        description="Input parameter names"
    )
    outputs: List[str] = Field(
        default_factory=list,
        description="Output field names"
    )
    estimated_latency_ms: Optional[int] = Field(
        default=None,
        description="Estimated execution time in milliseconds",
        ge=0
    )
    criticality: Optional[Literal["low", "medium", "high", "critical"]] = Field(
        default=None,
        description="How critical this tool is to the workflow"
    )


class ToolDependency(BaseModel):
    """A directed dependency between two tools."""
    model_config = ConfigDict(str_strip_whitespace=True)

    from_tool: str = Field(
        ...,
        description="Tool ID that depends on another tool",
        min_length=1,
        max_length=100
    )
    to_tool: str = Field(
        ...,
        description="Tool ID that is depended upon",
        min_length=1,
        max_length=100
    )
    dependency_type: Literal["required", "optional", "enhances"] = Field(
        ...,
        description="Type of dependency relationship"
    )
    data_fields: List[str] = Field(
        default_factory=list,
        description="Specific data fields passed between tools"
    )
    description: str = Field(
        default="",
        description="Description of this dependency",
        max_length=300
    )

    @model_validator(mode="after")
    def validate_no_self_reference(self):
        """Prevent self-referential dependencies."""
        if self.from_tool == self.to_tool:
            raise ValueError(f"Tool cannot depend on itself: {self.from_tool}")
        return self


class AnalyzeToolOrchestrationInput(BaseModel):
    """Input for analyzing tool orchestration health and dependencies."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    tools: List[MCPTool] = Field(
        ...,
        description="List of MCP tools in the orchestration",
        min_length=1,
        max_length=50
    )
    dependencies: List[ToolDependency] = Field(
        default_factory=list,
        description="List of dependencies between tools"
    )
    interventions: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Optional interventions for Meadows scoring (action_type + target_tool pairs)"
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' or 'json'"
    )

    @field_validator("dependencies")
    @classmethod
    def validate_dependencies_reference_tools(cls, v: List[ToolDependency], info) -> List[ToolDependency]:
        """Validate that dependencies reference valid tool IDs."""
        if "tools" in info.data:
            tool_ids = {tool.tool_id for tool in info.data["tools"]}
            for dep in v:
                if dep.from_tool not in tool_ids:
                    raise ValueError(f"from_tool '{dep.from_tool}' not in tools list")
                if dep.to_tool not in tool_ids:
                    raise ValueError(f"to_tool '{dep.to_tool}' not in tools list")
        return v


def _detect_cycles_in_tools(tools: List[MCPTool], dependencies: List[ToolDependency]) -> List[List[str]]:
    """Detect cycles in tool dependency graph using DFS."""
    # Build adjacency list
    adj: Dict[str, List[str]] = {tool.tool_id: [] for tool in tools}
    for dep in dependencies:
        adj[dep.from_tool].append(dep.to_tool)

    cycles = []
    visited_starts = set()

    def dfs(start, current, path, path_set):
        for neighbor in adj.get(current, []):
            if neighbor == start and len(path) >= 2:
                cycles.append(path + [start])
                continue
            if neighbor not in path_set and neighbor not in visited_starts:
                path_set.add(neighbor)
                dfs(start, neighbor, path + [neighbor], path_set)
                path_set.discard(neighbor)

    for tool_id in adj.keys():
        dfs(tool_id, tool_id, [tool_id], {tool_id})
        visited_starts.add(tool_id)

    # Deduplicate cycles
    unique_cycles = []
    seen = set()
    for cycle in cycles:
        key = tuple(sorted(cycle[:-1]))
        if key not in seen:
            seen.add(key)
            unique_cycles.append(cycle)

    return unique_cycles


def _calculate_health_scores(
    tools: List[MCPTool],
    dependencies: List[ToolDependency],
    cycles: List[List[str]]
) -> Dict[str, int]:
    """Calculate complexity, redundancy, brittleness, and aggregate scores."""
    # Complexity: edge count + (cycle count * 10), clamped 0-100
    edge_count = len(dependencies)
    cycle_count = len(cycles)
    complexity = min(100, edge_count + (cycle_count * 10))

    # Redundancy: count tool pairs with matching inputs AND outputs overlap
    redundancy_count = 0
    for i, tool1 in enumerate(tools):
        for tool2 in tools[i + 1:]:
            input_overlap = set(tool1.inputs) & set(tool2.inputs)
            output_overlap = set(tool1.outputs) & set(tool2.outputs)
            if input_overlap and output_overlap:
                redundancy_count += 1
    redundancy = min(100, redundancy_count * 20)

    # Brittleness: max blast radius depth via required-only edges
    # Build adjacency list with only required dependencies
    adj: Dict[str, List[str]] = {tool.tool_id: [] for tool in tools}
    for dep in dependencies:
        if dep.dependency_type == "required":
            adj[dep.from_tool].append(dep.to_tool)

    # BFS to find max depth from each tool
    max_depth = 0
    for tool_id in adj.keys():
        visited = {tool_id}
        queue = [(tool_id, 0)]
        while queue:
            current, depth = queue.pop(0)
            max_depth = max(max_depth, depth)
            for neighbor in adj[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, depth + 1))

    brittleness = min(100, max_depth * 20)

    # Aggregate: average of the three scores
    aggregate = round((complexity + redundancy + brittleness) / 3)

    return {
        "complexity": complexity,
        "redundancy": redundancy,
        "brittleness": brittleness,
        "aggregate": aggregate
    }


def _generate_refactor_recommendations(health_scores: Dict[str, int], cycles: List[List[str]]) -> List[str]:
    """Generate refactor recommendations for Critical-tier metrics (67+)."""
    recommendations = []

    if health_scores["complexity"] >= 67:
        if cycles:
            recommendations.append(
                f"COMPLEXITY CRITICAL: {len(cycles)} cycle(s) detected. "
                "Break circular dependencies to reduce complexity."
            )
        else:
            recommendations.append(
                "COMPLEXITY CRITICAL: High edge count. "
                "Consider introducing orchestration layers or reducing direct dependencies."
            )

    if health_scores["redundancy"] >= 67:
        recommendations.append(
            "REDUNDANCY CRITICAL: Multiple tools share inputs and outputs. "
            "Consolidate overlapping functionality or create shared utility tools."
        )

    if health_scores["brittleness"] >= 67:
        recommendations.append(
            "BRITTLENESS CRITICAL: Deep required-dependency chains detected. "
            "Add fallback paths or convert critical dependencies to optional where possible."
        )

    return recommendations


@mcp.tool(
    name="analyze_tool_orchestration",
    annotations={
        "title": "ST-005: Analyze Tool Orchestration Health",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def analyze_tool_orchestration(params: AnalyzeToolOrchestrationInput) -> str:
    """Analyze MCP tool orchestration to detect health issues and recommend improvements.

    This tool accepts a list of MCP tools and their dependencies, then calculates:
    1. Complexity score (edges + cycle penalty)
    2. Redundancy score (overlapping tool capabilities)
    3. Brittleness score (required-dependency depth)
    4. Aggregate health score (average of the three)

    Health tiers:
    - 0-33: Healthy (green zone)
    - 34-66: At Risk (yellow zone - plan mitigation)
    - 67-100: Critical (red zone - immediate action needed)

    For Critical-tier metrics, the tool auto-generates refactor recommendations.

    Optional: Provide interventions (action_type + target_tool) to compose with
    compare_interventions for Meadows-ranked refactor analysis. Action types map to
    Meadows levels:
    - add_tool -> L1 (Constants/parameters)
    - remove_tool -> L2 (Buffer sizes)
    - add_cache/fallback -> L5 (Delays)
    - refactor_dependency -> L6 (Feedback structure)

    This implements ST-005: 'Tool orchestration health = complexity + redundancy + brittleness.
    Cycles, overlaps, and deep required chains are the three failure modes.'

    Use when designing multi-tool workflows, reviewing MCP server architectures, or
    debugging orchestration issues.

    Args:
        params: Tools, dependencies, optional interventions, and output format.

    Returns:
        Health scores, cycle detection, refactor recommendations, and optional
        Meadows-ranked intervention analysis.
    """
    # Detect cycles
    cycles = _detect_cycles_in_tools(params.tools, params.dependencies)

    # Calculate health scores
    health_scores = _calculate_health_scores(params.tools, params.dependencies, cycles)

    # Assign tier labels
    def get_tier(score: int) -> str:
        if score <= 33:
            return "Healthy"
        elif score <= 66:
            return "At Risk"
        else:
            return "Critical"

    # Generate recommendations for Critical scores
    recommendations = _generate_refactor_recommendations(health_scores, cycles)

    # Build basic result
    result: Dict[str, Any] = {
        "tools_analyzed": len(params.tools),
        "dependencies_analyzed": len(params.dependencies),
        "cycles_detected": len(cycles),
        "health_scores": health_scores,
        "tiers": {
            "complexity": get_tier(health_scores["complexity"]),
            "redundancy": get_tier(health_scores["redundancy"]),
            "brittleness": get_tier(health_scores["brittleness"]),
            "aggregate": get_tier(health_scores["aggregate"])
        },
        "recommendations": recommendations
    }

    # Add cycle details if present
    if cycles:
        result["cycle_paths"] = [" → ".join(cycle) for cycle in cycles]

    # Compose with compare_interventions if interventions provided
    if params.interventions:
        # Map action types to Meadows levels
        action_to_meadows = {
            "add_tool": MeadowsLevel.CONSTANTS,
            "remove_tool": MeadowsLevel.BUFFERS,
            "add_cache": MeadowsLevel.DELAYS,
            "add_fallback": MeadowsLevel.DELAYS,
            "refactor_dependency": MeadowsLevel.FEEDBACK_STRUCTURE,
        }

        # Create Intervention objects
        interventions_list = []
        for intv_data in params.interventions:
            action_type = intv_data.get("action_type", "")
            target_tool = intv_data.get("target_tool", "")
            meadows_level = action_to_meadows.get(action_type, MeadowsLevel.CONSTANTS)

            intervention = Intervention(
                target_variable=target_tool,
                label=f"{action_type.replace('_', ' ').title()}",
                description=intv_data.get("description", ""),
                meadows_level=meadows_level,
                estimated_impact=intv_data.get("estimated_impact")
            )
            interventions_list.append(intervention)

        # Call compare_interventions
        comparison_input = CompareInterventionsInput(
            system_description="MCP tool orchestration",
            interventions=interventions_list,
            response_format=params.response_format
        )
        intervention_analysis = await compare_interventions(comparison_input)

        if params.response_format == ResponseFormat.JSON:
            result["intervention_analysis"] = json.loads(intervention_analysis)
        else:
            result["intervention_analysis"] = intervention_analysis

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown output
    md = []
    md.append("# Tool Orchestration Health Analysis (ST-005)")
    md.append("")
    md.append(f"**Tools analyzed:** {result['tools_analyzed']}")
    md.append(f"**Dependencies:** {result['dependencies_analyzed']}")
    md.append(f"**Cycles detected:** {result['cycles_detected']}")
    md.append("")

    md.append("## Health Scores")
    md.append("")
    md.append("| Metric | Score | Tier |")
    md.append("|--------|-------|------|")
    for metric in ["complexity", "redundancy", "brittleness", "aggregate"]:
        score = health_scores[metric]
        tier = result["tiers"][metric]
        emoji = "🟢" if tier == "Healthy" else "🟡" if tier == "At Risk" else "🔴"
        md.append(f"| {metric.title()} | {score}/100 | {tier} {emoji} |")
    md.append("")

    if cycles:
        md.append("## Cycles Detected")
        md.append("")
        for i, cycle in enumerate(result["cycle_paths"], 1):
            md.append(f"{i}. {cycle}")
        md.append("")

    if recommendations:
        md.append("## Refactor Recommendations")
        md.append("")
        for rec in recommendations:
            md.append(f"- {rec}")
        md.append("")

    if "intervention_analysis" in result and isinstance(result["intervention_analysis"], str):
        md.append("## Intervention Analysis (Meadows-Ranked)")
        md.append("")
        md.append(result["intervention_analysis"])

    md.append("---")
    md.append("*Tool orchestration health = complexity + redundancy + brittleness.*")
    md.append("*Cycles, overlaps, and deep required chains are the three failure modes.*")

    return "\n".join(md)


# ============================================================================
# ST-006: Automation Debt Detector
# ============================================================================

class AutomationLayer(BaseModel):
    """An automation layer applied to a recurring problem in an AI/ML system."""
    model_config = ConfigDict(str_strip_whitespace=True)

    layer_name: str = Field(..., description="Name of the automation layer (e.g., 'Retry logic', 'Validation pipeline', 'Exception handler')", min_length=1, max_length=200)
    layer_type: str = Field(
        ...,
        description="Type of automation layer: 'quick_fix' (treats symptom), 'fundamental' (addresses root cause), or 'transition' (maintains fix while building solution)",
        pattern="^(quick_fix|fundamental|transition)$"
    )
    side_effects: Optional[str] = Field(default=None, description="Known side effects (e.g., 'Adds latency', 'Blocks architecture improvements')", max_length=500)
    duration_active: Optional[str] = Field(default=None, description="How long this layer has been running (e.g., '3 months', 'since Q1')")

    def to_fix_record(self) -> FixRecord:
        """Convert AutomationLayer to FixRecord for detect_burden_shift composition."""
        return FixRecord(
            label=self.layer_name,
            description=f"Automation layer: {self.layer_type}",
            is_symptomatic=self.layer_type == "quick_fix",
            side_effects=self.side_effects,
            duration_active=self.duration_active,
        )


class DetectAutomationDebtInput(BaseModel):
    """Input for detecting automation debt via shifting-the-burden analysis."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    automation_layers: List[AutomationLayer] = Field(
        ...,
        description="All automation layers applied to the system",
        min_length=1, max_length=20
    )
    fundamental_solution: Optional[str] = Field(
        default=None,
        description="The known fundamental solution (e.g., 'Restructure prompt architecture', 'Redesign agent state machine')"
    )
    recurring_symptom: str = Field(
        ...,
        description="The recurring problem symptom (e.g., 'LLM outputs unreliable', 'Agent crashes on edge cases')",
        min_length=5, max_length=500
    )
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)


AUTOMATION_EROSION_CHANNELS = {
    "Knowledge Drain": "Quick fixes prevent learning root causes. Institutional knowledge never forms — the team forgets why the system was broken.",
    "Complexity Creep": "Each workaround adds a layer. The system grows harder to change with every fix applied.",
    "Normalization": "The degraded state becomes 'normal'. The team stops seeing it as a problem worth fixing.",
}


@mcp.tool(
    name="detect_automation_debt",
    annotations={
        "title": "Detect Automation Debt",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    }
)
async def detect_automation_debt(params: DetectAutomationDebtInput) -> str:
    """Detect automation debt in AI/ML systems using shifting-the-burden archetype analysis.

    Accepts automation layers (quick fixes, fundamental solutions, transition strategies)
    and identifies burden-shift patterns with B1/B2/R1 loop analysis.

    Returns debt score (0-100), erosion channels, automation coverage estimate,
    and specific recommendations for addressing the debt.

    This composes with the existing detect_burden_shift tool by converting
    AutomationLayer inputs to FixRecord format.

    Args:
        params: Automation layers, fundamental solution, and recurring symptom.

    Returns:
        Automation debt analysis with debt score, erosion channels, and recommendations.
    """
    # Convert AutomationLayers to FixRecords for burden-shift composition
    fix_records = [layer.to_fix_record() for layer in params.automation_layers]

    # Build burden-shift input
    burden_input = DetectBurdenShiftInput(
        recurring_symptom=params.recurring_symptom,
        fixes_applied=fix_records,
        fundamental_solution=params.fundamental_solution,
    )

    # Call existing detect_burden_shift internally
    # (reuse classification and erosion logic)
    classified = []
    for fix in burden_input.fixes_applied:
        classification = _classify_fix(fix)
        classified.append({
            "label": fix.label,
            "classification": classification,
            "side_effects": fix.side_effects,
        })

    symptomatic = [f for f in classified if f["classification"] == "symptomatic"]
    fundamental = [f for f in classified if f["classification"] == "fundamental"]

    erosion = _compute_erosion_risk(
        burden_input.fixes_applied,
        None, None,
    )

    # Compute automation-specific debt score
    quick_fix_ratio = len(symptomatic) / max(len(classified), 1)
    erosion_factor = erosion["risk_score"] / 100
    debt_score = int(min(100, (quick_fix_ratio * 60 + erosion_factor * 40)))

    # Identify active erosion channels
    active_channels = []
    if len(symptomatic) >= 2 and len(fundamental) == 0:
        active_channels.append("Knowledge Drain")
    if any(f.get("side_effects") for f in classified):
        active_channels.append("Complexity Creep")
    if quick_fix_ratio > 0.7 and erosion["risk_score"] > 40:
        active_channels.append("Normalization")

    # Automation coverage estimate
    fundamental_count = len(fundamental)
    total_count = len(classified)
    coverage = int((fundamental_count / max(total_count, 1)) * 100)

    # Generate recommendations
    recommendations = []
    if debt_score > 60:
        recommendations.append(f"High automation debt ({debt_score}/100). Prioritize fundamental solution investment.")
    if "Knowledge Drain" in active_channels:
        recommendations.append("Knowledge Drain detected: Convert manual corrections into training data or documentation.")
    if "Complexity Creep" in active_channels:
        recommendations.append("Complexity Creep detected: Audit and consolidate overlapping automation layers.")
    if "Normalization" in active_channels:
        recommendations.append("Normalization detected: Schedule regular health reviews to prevent acceptance of degraded state.")
    if params.fundamental_solution and debt_score > 30:
        recommendations.append(f"Transition strategy: Maintain current fixes while investing in '{params.fundamental_solution}'.")
    if not recommendations:
        recommendations.append("Automation debt is manageable. Continue monitoring.")

    result = {
        "recurring_symptom": params.recurring_symptom,
        "debt_score": debt_score,
        "debt_level": "Critical" if debt_score >= 67 else "At Risk" if debt_score >= 34 else "Healthy",
        "automation_coverage_estimate": f"{coverage}%",
        "erosion_channels": {ch: AUTOMATION_EROSION_CHANNELS[ch] for ch in active_channels},
        "b1_loop": {"fixes": [f["label"] for f in symptomatic]},
        "b2_loop": {"fixes": [f["label"] for f in fundamental]},
        "erosion_risk_score": erosion["risk_score"],
        "recommendations": recommendations,
    }

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(result, indent=2)

    # Markdown output
    md = []
    md.append("# Automation Debt Analysis")
    md.append("")
    md.append(f"**Symptom:** {params.recurring_symptom}")
    md.append(f"**Debt Score:** {debt_score}/100 ({result['debt_level']})")
    md.append(f"**Automation Coverage:** {coverage}% fundamental")
    md.append("")

    if active_channels:
        md.append("## Active Erosion Channels")
        for ch in active_channels:
            md.append(f"- **{ch}**: {AUTOMATION_EROSION_CHANNELS[ch]}")
        md.append("")

    md.append("## Loop Analysis")
    md.append(f"- **B1 (Symptomatic):** {', '.join(f['label'] for f in symptomatic) or 'None'}")
    md.append(f"- **B2 (Fundamental):** {', '.join(f['label'] for f in fundamental) or 'None'}")
    md.append(f"- **Erosion Risk:** {erosion['risk_score']}/100")
    md.append("")

    md.append("## Recommendations")
    for rec in recommendations:
        md.append(f"- {rec}")

    return "\n".join(md)


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    mcp.run(transport="stdio")
