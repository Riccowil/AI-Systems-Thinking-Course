# Data Model Specifications

**Phase:** 07-content-foundations
**Created:** 2026-03-21
**Status:** Design specification

## Design Principles

- All new models compose with existing models (no duplication of proven logic)
- Follow existing patterns: `ConfigDict(str_strip_whitespace=True)`, `Field` with description/constraints
- Follow existing `ResponseFormat` enum pattern for output formatting
- All models will be added to `cubelets_mcp_server.py` alongside existing models
- Spec depth: field names + types + example values (not full Pydantic code -- implementation follows during Phase 8-10)

## Model 1: AgentComponent

**Purpose:** Represents a node in an agent architecture diagram. Used by ST-004 (Agent Feedback Loops) and ST-005 (Tool Orchestration).

**Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | `str` | Yes | min 1, max 50 | Unique identifier (e.g. "agent-1", "tool-router") |
| `name` | `str` | Yes | min 1, max 200 | Display name (e.g. "GPT-4 Router Agent") |
| `component_type` | `Literal["agent", "tool", "memory", "evaluator", "constraint"]` | Yes | Fixed 5 types only | Category of this component |
| `description` | `str` | No | max 500 | What this component does |
| `position_x` | `Optional[float]` | No | -- | Canvas x position for layout |
| `position_y` | `Optional[float]` | No | -- | Canvas y position for layout |

**Validation rules:**
- `component_type` must be one of the 5 fixed types (no custom types allowed)
- `name` must be non-empty after whitespace stripping
- `id` must be non-empty after whitespace stripping

**Example payload:**
```json
{
  "id": "agent-1",
  "name": "GPT-4 Router Agent",
  "component_type": "agent",
  "description": "Routes incoming requests to specialized sub-agents based on intent classification"
}
```

## Model 2: AgentLink

**Purpose:** A directed causal link between two agent components. Wraps `CausalLink` internally for reuse of loop detection logic. Used by ST-004.

**Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `from_component` | `str` | Yes | min 1, max 50 | ID of source AgentComponent |
| `to_component` | `str` | Yes | min 1, max 50 | ID of target AgentComponent |
| `polarity` | `Polarity` | Yes | "+" or "-" | Same enum as CausalLink |
| `strength` | `Optional[float]` | No | 0.0-1.0, default 1.0 | Coupling strength |
| `label` | `str` | No | max 200 | Describes the interaction (e.g. "triggers retry") |
| `link_type` | `Optional[Literal["data_flow", "control_flow", "feedback", "dependency"]]` | No | -- | Categorizes the interaction |

**Internal composition:**
```
AgentLink.to_causal_link() -> CausalLink(
    from_var=self.from_component,
    to_var=self.to_component,
    polarity=self.polarity,
    strength=self.strength
)
```

This transformation allows reuse of `score_reinforcing_loops` without modification.

**Validation rules:**
- `from_component` and `to_component` must be non-empty
- `polarity` required (same "+" / "-" enum as CausalLink)
- Cross-validation (from/to reference valid component IDs) happens at tool input level, not model level

**Example payload:**
```json
{
  "from_component": "agent-1",
  "to_component": "tool-1",
  "polarity": "+",
  "strength": 0.8,
  "label": "invokes tool on each request",
  "link_type": "control_flow"
}
```

## Model 3: MCPTool

**Purpose:** Represents an MCP tool in a tool stack diagram. Used by ST-005 (Tool Orchestration).

**Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `tool_id` | `str` | Yes | min 1, max 100 | Unique identifier (e.g. "score_reinforcing_loops") |
| `name` | `str` | Yes | min 1, max 200 | Display name |
| `server` | `str` | Yes | min 1, max 100 | MCP server name (e.g. "systems-thinking-cubelets") |
| `description` | `str` | No | max 500 | What this tool does |
| `inputs` | `List[str]` | No | -- | Input parameter names, for dependency tracking |
| `outputs` | `List[str]` | No | -- | Output field names, for dependency tracking |
| `estimated_latency_ms` | `Optional[int]` | No | ge 0 | Typical response time, for blast radius analysis |
| `criticality` | `Optional[Literal["low", "medium", "high", "critical"]]` | No | -- | How important this tool is to the stack |

**Validation rules:**
- `tool_id`, `name`, and `server` must be non-empty after whitespace stripping

**Example payload:**
```json
{
  "tool_id": "score_reinforcing_loops",
  "name": "Score Reinforcing Loops",
  "server": "systems-thinking-cubelets",
  "description": "Graph traversal to find, classify, and score all feedback loops",
  "inputs": ["variables", "causal_links"],
  "outputs": ["loops", "variable_participation", "dominant_dynamic"],
  "estimated_latency_ms": 200,
  "criticality": "high"
}
```

## Model 4: ToolDependency

**Purpose:** A directed dependency between two MCP tools. Used by ST-005 (Tool Orchestration).

**Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `from_tool` | `str` | Yes | min 1, max 100 | tool_id of the upstream tool |
| `to_tool` | `str` | Yes | min 1, max 100 | tool_id of the downstream tool |
| `dependency_type` | `Literal["required", "optional", "enhances"]` | Yes | -- | Strength of dependency |
| `data_fields` | `List[str]` | No | -- | Which output fields from from_tool feed into to_tool inputs |
| `description` | `str` | No | max 300 | Describes the dependency |

**Validation rules:**
- `from_tool` != `to_tool` (no self-dependencies)
- `data_fields` should be non-empty for "required" dependency_type (warning, not hard error)

**Example payload:**
```json
{
  "from_tool": "create_causal_loop",
  "to_tool": "score_reinforcing_loops",
  "dependency_type": "required",
  "data_fields": ["variables", "causal_links"],
  "description": "CLD must be created before loops can be scored"
}
```

## Model 5: AutomationLayer

**Purpose:** Represents a layer in an automation system for debt detection. Wraps `FixRecord` internally for reuse with `detect_burden_shift`. Used by ST-006 (Automation Debt).

**Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `layer_id` | `str` | Yes | min 1, max 50 | Unique identifier |
| `name` | `str` | Yes | min 1, max 200 | Display name (e.g. "Human Review Queue") |
| `automation_type` | `Literal["quick_fix", "fundamental", "transition", "monitoring"]` | Yes | -- | Classification of this automation layer |
| `description` | `str` | No | max 500 | What this layer does |
| `failure_mode` | `Optional[str]` | No | max 300 | How this layer fails (e.g. "Queue grows unbounded under load") |
| `tech_debt_indicator` | `Optional[str]` | No | max 300 | Observable sign of debt (e.g. "Review backlog exceeds 48 hours") |
| `times_applied` | `int` | No | ge 1, default 1 | How many times deployed/activated |
| `side_effects` | `Optional[str]` | No | max 500 | Known negative consequences |
| `duration_active` | `Optional[str]` | No | -- | How long this layer has been running |

**Internal composition:**
```
AutomationLayer.to_fix_record() -> FixRecord(
    label=self.name,
    description=self.description,
    times_applied=self.times_applied,
    is_symptomatic=(self.automation_type == "quick_fix"),
    side_effects=self.side_effects,
    duration_active=self.duration_active
)
```

**Automation type to symptomatic mapping:**
- `quick_fix` -> `is_symptomatic = True`
- `fundamental` -> `is_symptomatic = False`
- `transition` -> `is_symptomatic = None` (user-classified, context-dependent)
- `monitoring` -> `is_symptomatic = True` (observes but doesn't fix root cause)

**Validation rules:**
- Follow existing FixRecord validation patterns
- `name` must be non-empty after whitespace stripping

**Example payload:**
```json
{
  "layer_id": "layer-1",
  "name": "Human Review Queue",
  "automation_type": "quick_fix",
  "description": "Route low-confidence LLM outputs to human reviewers",
  "failure_mode": "Queue grows unbounded when LLM confidence drops across the board",
  "tech_debt_indicator": "Review backlog exceeds 48 hours",
  "times_applied": 15,
  "side_effects": "Blocks parser improvement resources, creates reviewer fatigue",
  "duration_active": "6 months"
}
```

## Composition Map

How each new model transforms to existing models for reuse of proven analysis logic:

```
AgentLink.to_causal_link()
    --> CausalLink
    --> score_reinforcing_loops (existing tool)
    --> Loop classification (R1, R2, B1, B2) with severity scores

AutomationLayer.to_fix_record()
    --> FixRecord
    --> detect_burden_shift (existing tool)
    --> Burden-shift pattern analysis with B1/B2/R1 identification

MCPTool + ToolDependency
    --> (new tool: analyze_tool_orchestration)
    --> compare_interventions (existing tool)
    --> Health scores + Meadows-ranked refactor recommendations
```

**Key principle:** New MCP tools handle domain-specific input validation and transformation. Existing tools handle the actual graph traversal, scoring, and analysis algorithms. No proven logic is duplicated.

## Model Relationships

```
ST-004 uses: AgentComponent + AgentLink
    AgentLink wraps CausalLink

ST-005 uses: MCPTool + ToolDependency + AgentComponent (optional, for context)
    Standalone models (no wrapping needed)

ST-006 uses: AutomationLayer
    AutomationLayer wraps FixRecord
```

---

*Specification for Phase 7: Content Foundations*
*Satisfies: CFND-03 (Pydantic data model specifications)*
