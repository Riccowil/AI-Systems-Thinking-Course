# Architecture Research: Agentic Systems Thinking Cubelets

**Domain:** Educational course extension (3 new cubelets for existing AI systems thinking course)
**Researched:** 2026-03-21
**Confidence:** HIGH (based on existing codebase analysis)

## Existing Architecture Overview

The current "AI for Systems Thinking" course follows a three-layer deliverable pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: INTERACTIVE ARTIFACTS                │
│  React JSX components + Vite preview app + Vercel deployment     │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  W1-C1.jsx │  │  W1-C2.jsx │  │  W1-C3.jsx │  │ ST-001   │  │
│  │  System    │  │  AI Lever  │  │  Mindset   │  │ Feedback │  │
│  │  Thinking  │  │  Finder    │  │  Shift     │  │ Loops    │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  │
│        └───────────────┴───────────────┴───────────────┘        │
│                          App.jsx                                 │
│              (Tabbed navigation with lazy loading)               │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 2: MCP TOOLS (Python)                   │
│       FastMCP stdio servers + JSON/Markdown responses            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐       │
│  │  systems-thinking (base) — 5 tools                    │       │
│  │  create_causal_loop, identify_feedback_loops, etc.   │       │
│  └──────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  week1-foundations — 3 tools                          │       │
│  │  analyze_system_map, find_ai_leverage,               │       │
│  │  analyze_workflow_redesign                            │       │
│  └──────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  systems-thinking-cubelets — 3 tools                 │       │
│  │  score_reinforcing_loops, compare_interventions,     │       │
│  │  detect_burden_shift                                 │       │
│  └──────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 3: CLAUDE SKILLS                        │
│          .skill packages (SKILL.md + reference docs)             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ system-map-  │  │ reinforcing- │  │ burden-shift-│          │
│  │ explorer     │  │ loop-mapper  │  │ detector     │          │
│  │ .skill       │  │ .skill       │  │ .skill       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Current Component Responsibilities

| Component | Responsibility | Current Implementation |
|-----------|----------------|------------------------|
| **Preview App (Vite)** | Host all interactive artifacts with tabbed navigation | React 19 + lazy loading, deployed to Vercel |
| **App.jsx** | Artifact navigation and state management | useState + array of lazy-loaded components |
| **Individual Artifacts** | Standalone interactive experiences (CLD builders, simulators, scorers) | Self-contained React components with dark cybernetic theme |
| **MCP Servers** | Provide callable tools for systems analysis | Python FastMCP stdio servers with Pydantic validation |
| **Claude Skills** | Guided multi-step workflows for using tools | .skill packages with SKILL.md + reference docs |
| **Cubelet Markdown** | Six-face knowledge structure (WHAT/WHY/HOW/WHERE/WHEN/APPLY) | Structured .md files with quality gate scoring |

## Integration Points for New Cubelets (ST-004, ST-005, ST-006)

### ST-004: Agent Feedback Loops
**Focus:** Apply CLD mapping to agent architectures

**Integration points:**
- **Artifact layer:** New `agent-feedback-mapper.jsx` component
- **MCP layer:** New tool in existing `systems-thinking-cubelets` server (4th tool)
- **Skill layer:** New `agent-feedback-analyzer.skill` package
- **Data dependency:** Reuses CLD structures from ST-001 but models agent components

### ST-005: Tool Orchestration as System Design
**Focus:** Apply leverage point analysis to MCP tool stacks

**Integration points:**
- **Artifact layer:** New `tool-orchestration-scorer.jsx` component
- **MCP layer:** New tool in existing `systems-thinking-cubelets` server (5th tool)
- **Skill layer:** New `tool-stack-analyzer.skill` package
- **Data dependency:** Extends Meadows hierarchy from ST-002 for tool composition

### ST-006: Shifting the Burden in Automation
**Focus:** Detect automation debt using the archetype

**Integration points:**
- **Artifact layer:** New `automation-burden-detector.jsx` component
- **MCP layer:** New tool in existing `systems-thinking-cubelets` server (6th tool)
- **Skill layer:** New `automation-debt-detector.skill` package
- **Data dependency:** Reuses erosion detection from ST-003 for automation contexts

### Integration Decision: Extend Existing Server vs New Server

**RECOMMENDATION: Extend existing `systems-thinking-cubelets` server**

**Rationale:**
1. **Cohesion:** All three new cubelets apply existing systems thinking frameworks (CLD, Meadows, Shifting-the-Burden) to agentic contexts — thematically aligned with current server
2. **Tool chaining:** New tools will call existing base tools (create_causal_loop, find_leverage_points, run_scenario) — already connected
3. **Server count management:** 3 servers is manageable, 6 servers fragments discovery
4. **Code reuse:** Can import shared models (CausalLink, MeadowsLevel, FixRecord) without duplication
5. **Student experience:** Single namespace (`systems_thinking_cubelets_mcp`) makes tool discovery predictable

**Pattern observed in existing code:**
- `week1-foundations` server: 3 tools (W1-C1, W1-C2, W1-C3)
- `systems-thinking-cubelets` server: 3 tools (ST-001, ST-002, ST-003)
- Both extend the base `systems-thinking` server's tools

**Extension path:**
- Add 3 new tools to `systems-thinking-cubelets` server → 6 total tools
- Maintain existing tool names and signatures (backward compatible)
- Group new tools with ST-004/005/006 docstring annotations

### Preview App Expansion

**Current structure:**
```javascript
// App.jsx
const artifacts = [
  { id: 'w1c1', label: 'W1-C1: Systems Thinking', component: lazy(...) },
  // ... 6 total artifacts
]
```

**Expansion to 9 artifacts:**
```javascript
const artifacts = [
  // Week 1 (unchanged)
  { id: 'w1c1', label: 'W1-C1: Systems Thinking', component: lazy(...) },
  { id: 'w1c2', label: 'W1-C2: AI System Lever', component: lazy(...) },
  { id: 'w1c3', label: 'W1-C3: SMB Mindset Shift', component: lazy(...) },

  // Week 2: Core Systems Archetypes (unchanged)
  { id: 'st001', label: 'ST-001: Feedback Loops', component: lazy(...) },
  { id: 'st002', label: 'ST-002: Leverage Points', component: lazy(...) },
  { id: 'st003', label: 'ST-003: Burden Shift', component: lazy(...) },

  // Week 3: Agentic Systems Design (NEW)
  { id: 'st004', label: 'ST-004: Agent Feedback Loops', component: lazy(...) },
  { id: 'st005', label: 'ST-005: Tool Orchestration', component: lazy(...) },
  { id: 'st006', label: 'ST-006: Automation Debt', component: lazy(...) },
]
```

**UI consideration:** 9 tabs may exceed viewport width on mobile. Options:
1. **Horizontal scroll** (current behavior — already implemented with `overflowX: 'auto'`)
2. **Grouped tabs** (Week 1 / Week 2 / Week 3 collapsible sections)
3. **Dropdown selector** for mobile + tabs for desktop

**RECOMMENDATION: Keep horizontal scroll** (no change needed — existing CSS handles overflow)

## New Data Structures Required

### 1. Agent Architecture Model (ST-004)

```python
class AgentComponent(BaseModel):
    """A component in an agent architecture (tool, memory, planner, etc.)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., description="Component name (e.g., 'MCP Tool Router', 'Conversation Memory', 'Cost Limiter')")
    component_type: Literal["tool", "memory", "planner", "evaluator", "constraint", "output"] = Field(...)
    token_cost_per_call: Optional[float] = Field(default=None, description="Average token cost when this component executes")
    latency_seconds: Optional[float] = Field(default=None, description="Average latency in seconds")
    error_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)

class AgentLink(BaseModel):
    """A directed dependency between agent components."""
    model_config = ConfigDict(str_strip_whitespace=True)

    from_component: str = Field(...)
    to_component: str = Field(...)
    link_type: Literal["triggers", "reads", "writes", "constrains"] = Field(...)
    polarity: Polarity = Field(..., description="'+' = more input → more output, '-' = more input → less output")
    description: str = Field(default="", max_length=500)

class AnalyzeAgentArchitectureInput(BaseModel):
    """Input for mapping an agent architecture as a causal loop diagram."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    agent_name: str = Field(...)
    components: List[AgentComponent] = Field(..., min_length=4, max_length=30)
    links: List[AgentLink] = Field(..., min_length=3)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)
```

**Integration with existing tools:** Converts AgentComponent/AgentLink → CausalLink format, then calls `score_reinforcing_loops` for loop detection.

### 2. Tool Stack Model (ST-005)

```python
class MCPTool(BaseModel):
    """An MCP tool in a tool orchestration stack."""
    model_config = ConfigDict(str_strip_whitespace=True)

    tool_name: str = Field(..., description="MCP tool name (e.g., 'create_causal_loop')")
    server: str = Field(..., description="MCP server hosting this tool")
    calls_per_workflow: Optional[int] = Field(default=1, description="How many times this tool is called in typical workflow", ge=1)
    avg_token_cost: Optional[float] = Field(default=None, description="Average tokens consumed per call", ge=0)
    is_human_in_loop: bool = Field(default=False, description="Whether this tool requires human review/approval")

class ToolDependency(BaseModel):
    """A dependency between tools (e.g., Tool B requires output from Tool A)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    upstream_tool: str = Field(...)
    downstream_tool: str = Field(...)
    dependency_type: Literal["data", "sequencing", "validation"] = Field(
        ...,
        description="'data' = output feeds input, 'sequencing' = must run after, 'validation' = checks output"
    )

class ToolIntervention(BaseModel):
    """A proposed change to the tool stack (add tool, remove approval, change composition)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    target_tool: str = Field(...)
    intervention_type: Literal["add", "remove", "replace", "reorder", "cache"] = Field(...)
    meadows_level: MeadowsLevel = Field(..., description="Meadows hierarchy classification")
    description: str = Field(...)
    estimated_impact: Optional[str] = Field(default=None)

class AnalyzeToolStackInput(BaseModel):
    """Input for analyzing tool orchestration as system design."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    workflow_name: str = Field(...)
    tools: List[MCPTool] = Field(..., min_length=2, max_length=30)
    dependencies: List[ToolDependency] = Field(...)
    interventions: List[ToolIntervention] = Field(..., min_length=1)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)
```

**Integration with existing tools:** Extends `compare_interventions` logic but applies to tool composition instead of business workflows.

### 3. Automation Debt Model (ST-006)

```python
class AutomationLayer(BaseModel):
    """A layer of automation (workaround, patch, or fundamental solution)."""
    model_config = ConfigDict(str_strip_whitespace=True)

    layer_name: str = Field(..., description="Name of this automation layer (e.g., 'Retry logic', 'Validation fallback')")
    trigger_symptom: str = Field(..., description="What symptom triggers this layer")
    is_symptomatic: bool = Field(..., description="True = treats symptom, False = addresses root cause")
    blocks_fundamental_solution: Optional[str] = Field(
        default=None,
        description="How this layer makes the fundamental solution harder (erosion channel)"
    )
    added_date: Optional[str] = Field(default=None, description="When this layer was added (e.g., 'Q1 2025')")
    token_cost_overhead: Optional[float] = Field(default=None, description="Extra tokens consumed by this layer per execution", ge=0)

class DetectAutomationDebtInput(BaseModel):
    """Input for detecting Shifting the Burden in automation contexts."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    automation_name: str = Field(...)
    recurring_failure: str = Field(..., description="The recurring automation failure (e.g., 'LLM outputs don't match schema')")
    automation_layers: List[AutomationLayer] = Field(..., min_length=1, max_length=20)
    fundamental_solution: Optional[str] = Field(default=None)
    fundamental_viability_now: Optional[int] = Field(default=None, ge=1, le=10)
    fundamental_viability_original: Optional[int] = Field(default=None, ge=1, le=10)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)
```

**Integration with existing tools:** Adapts `detect_burden_shift` for automation contexts. AutomationLayer maps to FixRecord with automation-specific fields.

## Data Flow for New Cubelets

### ST-004: Agent Architecture → CLD Analysis Flow

```
User Input: Agent components + dependencies
    ↓
[Validation] Component types, polarity rules
    ↓
[Transform] AgentComponent → Variable, AgentLink → CausalLink
    ↓
[Call existing tool] score_reinforcing_loops(variables, causal_links)
    ↓
[Enrich] Add agent-specific metrics (token cost loops, latency loops)
    ↓
[Response] Markdown with agent architecture insights
```

### ST-005: Tool Stack → Leverage Point Analysis Flow

```
User Input: MCP tools + dependencies + interventions
    ↓
[Validation] Tool references, dependency graph validity
    ↓
[Analysis] Detect bottleneck tools (highest calls, token cost, human-in-loop)
    ↓
[Call existing tool] compare_interventions(interventions with Meadows levels)
    ↓
[Enrich] Add tool-specific warnings (approval bottleneck, cache opportunities)
    ↓
[Response] Ranked interventions with tool stack recommendations
```

### ST-006: Automation Layers → Burden Shift Detection Flow

```
User Input: Automation layers + fundamental solution
    ↓
[Validation] Layer types, viability ratings
    ↓
[Transform] AutomationLayer → FixRecord mapping
    ↓
[Call existing tool] detect_burden_shift(symptom, fixes, fundamental solution)
    ↓
[Enrich] Add automation-specific erosion channels (token cost, schema drift)
    ↓
[Response] B1/B2/R1 loops with automation debt transition strategy
```

## Recommended Project Structure

```
Course factory/
├── preview-app/
│   ├── src/
│   │   ├── main.jsx                          # Entry point
│   │   ├── App.jsx                            # MODIFY: Add ST-004/005/006 tabs
│   │   ├── systems-thinking-fundamentals.jsx # Existing
│   │   ├── ai-system-lever.jsx               # Existing
│   │   ├── smb-mindset-shift.jsx             # Existing
│   │   ├── feedback-loop-builder.jsx         # Existing
│   │   ├── leverage-point-scorer.jsx         # Existing
│   │   ├── burden-shift-simulator.jsx        # Existing
│   │   ├── agent-feedback-mapper.jsx         # NEW (ST-004)
│   │   ├── tool-orchestration-scorer.jsx     # NEW (ST-005)
│   │   └── automation-burden-detector.jsx    # NEW (ST-006)
│   ├── package.json
│   └── vite.config.js
│
├── Cubelets MCP Tool/
│   └── files/
│       ├── cubelets_mcp_server.py            # MODIFY: Add 3 new tools
│       └── week1_foundations_mcp_server.py   # Unchanged
│
├── Claude skills build for Cubelets/
│   └── files/
│       ├── reinforcing-loop-mapper.skill      # Existing
│       ├── leverage-point-analyzer.skill      # Existing
│       ├── burden-shift-detector.skill        # Existing
│       ├── agent-feedback-analyzer.skill      # NEW (ST-004)
│       ├── tool-stack-analyzer.skill          # NEW (ST-005)
│       └── automation-debt-detector.skill     # NEW (ST-006)
│
└── Cubelets/
    └── CubeletsMarkdown/
        ├── ST-001-reinforcing-feedback-loops.md  # Existing
        ├── ST-002-leverage-points.md             # Existing
        ├── ST-003-shifting-the-burden.md         # Existing
        ├── ST-004-agent-feedback-loops.md        # NEW
        ├── ST-005-tool-orchestration.md          # NEW
        └── ST-006-automation-debt.md             # NEW
```

### Structure Rationale

- **preview-app/src/:** All artifacts in one flat directory for easy discovery and lazy loading — no subdirectories needed with only 9 components
- **Cubelets MCP Tool/files/:** Single server file extension maintains cohesion; could split if server exceeds 1500 lines
- **Claude skills/:** One .skill per cubelet maintains 1:1 mapping between cubelet and guided workflow
- **CubeletsMarkdown/:** Numbered sequence (ST-001 → ST-006) shows learning progression

## Architectural Patterns

### Pattern 1: Three-Layer Deliverable Stack

**What:** Every cubelet produces exactly three artifacts: Interactive Artifact (JSX) + MCP Tool (Python) + Claude Skill (.skill)

**When to use:** For all new cubelets — non-negotiable per project constraints

**Trade-offs:**
- **Pro:** Consistent student experience, multiple learning modalities, enforces concept completeness
- **Con:** 3x development effort per concept, must maintain parity across layers

**Example:**
```
ST-004: Agent Feedback Loops
├── agent-feedback-mapper.jsx       → Interactive CLD builder for agent architectures
├── analyze_agent_architecture()    → MCP tool for programmatic analysis
└── agent-feedback-analyzer.skill   → Guided workflow combining both
```

### Pattern 2: MCP Tool Composition via Shared Models

**What:** New tools import existing Pydantic models (CausalLink, MeadowsLevel, FixRecord) and transform domain-specific inputs into shared structures, then call existing tools.

**When to use:** When new analysis reuses existing frameworks but applies to new domains (agents, tools, automation).

**Trade-offs:**
- **Pro:** DRY principle, consistent validation, backward compatible
- **Con:** Tight coupling between tools, harder to change shared models

**Example:**
```python
# ST-004 tool
async def analyze_agent_architecture(params: AnalyzeAgentArchitectureInput) -> str:
    # Transform agent-specific structures
    variables = [comp.name for comp in params.components]
    causal_links = [
        CausalLink(
            from_var=link.from_component,
            to_var=link.to_component,
            polarity=link.polarity,
            strength=1.0
        )
        for link in params.links
    ]

    # Call existing ST-001 tool
    loop_analysis = await score_reinforcing_loops(
        ScoreReinforcingLoopInput(
            variables=variables,
            causal_links=causal_links,
            response_format=params.response_format
        )
    )

    # Enrich with agent-specific insights
    # ...
```

### Pattern 3: Lazy-Loaded Component Tabs

**What:** App.jsx maintains a flat array of artifact metadata (id, label, lazy-loaded component). Active tab state drives which component renders.

**When to use:** For preview app artifact navigation — already implemented, just extend the array.

**Trade-offs:**
- **Pro:** Simple state model, code-splitting via React.lazy, predictable navigation
- **Con:** No deep linking (URL doesn't change), no browser history for tabs, no multi-tab viewing

**Example:**
```javascript
// Existing pattern — just add new entries
const artifacts = [
  // ... existing 6 artifacts
  { id: 'st004', label: 'ST-004: Agent Feedback Loops', component: lazy(() => import('./agent-feedback-mapper.jsx')) },
  { id: 'st005', label: 'ST-005: Tool Orchestration', component: lazy(() => import('./tool-orchestration-scorer.jsx')) },
  { id: 'st006', label: 'ST-006: Automation Debt', component: lazy(() => import('./automation-burden-detector.jsx')) },
]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 6 cubelets → 9 cubelets | **No changes needed.** Existing architecture handles this directly via array extension. |
| 9 cubelets → 15+ cubelets | **Consider:** (1) Grouped navigation (collapsible sections by week), (2) Search/filter, (3) URL routing for deep links. Preview app remains viable up to ~20 artifacts. |
| 1 MCP server → 3 MCP servers | **Optimal.** Claude Desktop handles multiple stdio servers efficiently. Beyond 5 servers, consider consolidation or namespace prefixes. |
| 3 tools/server → 6 tools/server | **Safe.** FastMCP handles this with no performance impact. Tool discovery remains manageable under 10 tools/server. |

### Scaling Priorities

1. **First bottleneck:** Preview app tab overflow on mobile — mitigated by existing horizontal scroll CSS, no action needed until 12+ artifacts
2. **Second bottleneck:** MCP tool discovery with 6+ tools in one server — mitigated by descriptive tool names and ST-00X prefixes, becomes issue at 15+ tools

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating a Fourth MCP Server for New Cubelets

**What people might do:** Create `agentic-systems-cubelets` as a new server for ST-004/005/006

**Why it's wrong:**
- Fragments tool discovery (student now needs to know 4 server namespaces)
- Breaks thematic cohesion (these cubelets apply the same frameworks as ST-001/002/003)
- Adds MCP server management overhead (more Claude Desktop configs, more stdio processes)

**Do this instead:** Extend existing `systems-thinking-cubelets` server to 6 tools. Thematic grouping (all cubelets) trumps size concerns until server hits 10+ tools.

### Anti-Pattern 2: Duplicating Pydantic Models Across Tools

**What people might do:** Copy CausalLink, MeadowsLevel, FixRecord into new tool definitions to avoid imports

**Why it's wrong:**
- Validation logic diverges over time
- Schema changes require updates in multiple places
- Larger server file with redundant code

**Do this instead:** Import shared models from the top of the server file. If model needs domain-specific fields, use Pydantic inheritance:
```python
class AgentLink(CausalLink):
    """Extends CausalLink with agent-specific fields."""
    link_type: Literal["triggers", "reads", "writes", "constrains"] = Field(...)
```

### Anti-Pattern 3: Monolithic Artifact Components (1000+ lines)

**What people might do:** Build agent-feedback-mapper.jsx as a single 1500-line component with all UI, state, and logic inline

**Why it's wrong:**
- Hard to maintain and debug
- Difficult to reuse visualization logic across artifacts
- Large bundle size even with lazy loading

**Do this instead:** Extract shared UI patterns into reusable sub-components (if 3+ artifacts share the pattern). For ST-004/005/006, check if CLD rendering, scoring UI, or results tables can be extracted. Keep artifacts under 500 lines where possible.

## Integration Points Summary

### Modified Components

| Component | Change Type | Reason |
|-----------|-------------|--------|
| `App.jsx` | Extend artifacts array | Add ST-004/005/006 tab entries |
| `cubelets_mcp_server.py` | Add 3 new tool functions | analyze_agent_architecture, analyze_tool_stack, detect_automation_debt |
| Vercel deployment config | None needed | Vite build auto-includes new .jsx files |

### New Components

| Component | Type | Dependencies |
|-----------|------|--------------|
| `agent-feedback-mapper.jsx` | React component | Existing dark theme CSS vars |
| `tool-orchestration-scorer.jsx` | React component | Existing dark theme CSS vars |
| `automation-burden-detector.jsx` | React component | Existing dark theme CSS vars |
| `agent-feedback-analyzer.skill` | Claude skill | MCP tool: analyze_agent_architecture |
| `tool-stack-analyzer.skill` | Claude skill | MCP tool: analyze_tool_stack |
| `automation-debt-detector.skill` | Claude skill | MCP tool: detect_automation_debt |
| `ST-004-agent-feedback-loops.md` | Cubelet markdown | Prerequisites: W1-C1, ST-001 |
| `ST-005-tool-orchestration.md` | Cubelet markdown | Prerequisites: W1-C2, ST-002 |
| `ST-006-automation-debt.md` | Cubelet markdown | Prerequisites: ST-003 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Artifact ↔ MCP Tool | User manually calls tool via Claude Desktop / CLI | No programmatic connection — artifacts are standalone experiences |
| MCP Tool ↔ MCP Tool | Function call within same server | New tools call `score_reinforcing_loops`, `compare_interventions`, `detect_burden_shift` |
| Claude Skill ↔ MCP Tool | Tool invocation directives in SKILL.md | Skill guides multi-step workflows that combine tools |
| Cubelet Markdown ↔ Skill | Skill references cubelet faces in SKILL.md | Skill implements the APPLY face workflow |

## Build Order Recommendation

Based on prerequisite chain and component dependencies:

### Phase 1: Foundation (Parallel)
1. **Cubelet Markdown** (ST-004/005/006) — defines WHAT/WHY/HOW/WHERE/WHEN/APPLY for each concept
2. **Data model design** — finalize Pydantic models for AgentComponent, MCPTool, AutomationLayer

**Rationale:** Markdown defines the concept; data models define the analysis structure. Both inform artifact and tool design.

### Phase 2: MCP Tools (Sequential with testing)
3. **ST-004 MCP Tool** (`analyze_agent_architecture`) — test with sample agent architectures
4. **ST-005 MCP Tool** (`analyze_tool_stack`) — test with sample MCP workflows
5. **ST-006 MCP Tool** (`detect_automation_debt`) — test with sample automation layers

**Rationale:** Tools provide programmatic foundation. Testing each before moving to next validates data structures. Sequential because they share similar patterns — learnings from ST-004 inform ST-005.

### Phase 3: Interactive Artifacts (Parallel after tools validated)
6. **agent-feedback-mapper.jsx** (ST-004)
7. **tool-orchestration-scorer.jsx** (ST-005)
8. **automation-burden-detector.jsx** (ST-006)

**Rationale:** Artifacts depend on validated tools for testing realistic scenarios. Can be built in parallel by different developers (or same developer with context switching).

### Phase 4: Claude Skills (After tools + artifacts exist)
9. **agent-feedback-analyzer.skill** (ST-004)
10. **tool-stack-analyzer.skill** (ST-005)
11. **automation-debt-detector.skill** (ST-006)

**Rationale:** Skills guide workflows using tools + artifacts. Both must exist to write effective skill steps.

### Phase 5: Integration & Deployment
12. **Update App.jsx** with new artifact tabs
13. **Quality gate scoring** for all 3 cubelets (WHAT/WHY/HOW/WHERE/WHEN/APPLY)
14. **Update prerequisite-chain.md** with ST-004/005/006 mappings
15. **Vercel deployment** (auto-triggered by git push)

**Rationale:** Integration after all components validated individually. Quality gates ensure cubelet completeness before student-facing deployment.

## Sources

**High confidence sources:**
- Existing codebase analysis (cubelets_mcp_server.py, week1_foundations_mcp_server.py, App.jsx, package.json)
- FastMCP documentation (Pydantic model patterns, stdio server architecture)
- React 19 documentation (lazy loading, Suspense patterns)
- Vite 8 documentation (code splitting, build optimization)

**Medium confidence sources:**
- MCP best practices (server organization, tool count limits) — inferred from existing codebase patterns
- Cubelet quality gate system — validated in existing prerequisite-chain.md

---
*Architecture research for: AI for Systems Thinking course extension (ST-004, ST-005, ST-006)*
*Researched: 2026-03-21*
