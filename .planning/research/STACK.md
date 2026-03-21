# Stack Research: Agentic Systems Thinking Cubelets

**Domain:** Educational interactive artifacts for agent architecture analysis
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Executive Summary

The existing stack (React 19, Vite 8, Python FastMCP, custom SVG visualizations) is sufficient for the new agentic systems cubelets. **No new core dependencies required**. The custom SVG approach used in existing cubelets (feedback-loop-builder.jsx, leverage-point-scorer.jsx) extends naturally to agent architecture diagrams. Add only **minimal supporting libraries** for tree layout algorithms and MCP introspection.

## Recommended Stack Additions

### Supporting Libraries (React/Frontend)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **dagre** | ^0.8.5 | Directed graph layout algorithm | ST-004 agent flow layouts, ST-005 tool dependency graphs |
| **None (use existing)** | - | SVG-based visualization | Continue pattern from existing cubelets |

**Rationale for dagre:** Lightweight (13KB), battle-tested layout algorithm for directed acyclic graphs. Provides automatic positioning for agent nodes and tool dependencies without bringing in heavy visualization frameworks. Used by many flow/architecture tools (ReactFlow uses it internally).

### Supporting Libraries (Python/MCP)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **pydantic** | ^2.10.0 | Data validation for agent models | Already in use (implicit via FastMCP), formalize version |
| **typing-extensions** | ^4.12.0 | Enhanced type hints for agent architectures | Complex nested agent structures (ST-004, ST-005) |

**Rationale:** No new runtime dependencies. Pydantic already used for CLD models — extend pattern to AgentArchitecture and ToolStack models. Typing-extensions improves IDE support for complex agent/tool type definitions.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **None** | - | Existing Vite + ESLint setup sufficient |

## Installation

```bash
# Frontend additions (preview-app)
cd preview-app
npm install dagre@^0.8.5

# Python additions (MCP servers)
cd ../../../mcp-servers/systems-thinking
# Add to pyproject.toml dependencies:
# pydantic = "^2.10.0"
# typing-extensions = "^4.12.0"
uv sync
```

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **ReactFlow** | 500KB+ bundle, unnecessary complexity for educational diagrams | Custom SVG + dagre layout (matches existing pattern) |
| **D3.js** | 200KB+, steep learning curve, overkill for static diagrams | Custom SVG (established in existing cubelets) |
| **Cytoscape.js** | Heavy framework, over-engineered for course artifacts | dagre for layout, custom SVG for rendering |
| **LangGraph** (Python) | Not needed — cubelets MODEL agent systems, don't RUN them | Pydantic models only (data structures, not execution) |
| **networkx** (Python) | Graph analysis library, too heavy for educational MCP tools | Simple Python loops for cycle detection (existing pattern) |

**Core principle:** Keep artifacts lightweight, maintainable, and consistent with existing cubelets. Students interact with static diagrams, not live agent systems.

## Stack Patterns by Feature

### ST-004: Agent Feedback Loops

**Frontend (agent-feedback-loops.jsx):**
- Import `dagre` for automatic agent node positioning
- Custom SVG rendering (match feedback-loop-builder.jsx style)
- Agent nodes (rectangles), tool calls (edges), feedback paths (highlighted cycles)

**Backend (MCP tool: analyze_agent_architecture):**
```python
from pydantic import BaseModel
from typing import List, Literal

class AgentNode(BaseModel):
    id: str
    role: str  # "orchestrator", "specialist", "human"
    tools: List[str]

class AgentEdge(BaseModel):
    from_agent: str
    to_agent: str
    via_tool: str
    polarity: Literal["+", "-"]

class AgentArchitecture(BaseModel):
    name: str
    agents: List[AgentNode]
    edges: List[AgentEdge]
```

**Pattern:** Extend CLD cycle-detection logic to agent architectures. Reuse existing `findCycles()` function pattern from feedback-loop-builder.jsx.

### ST-005: Tool Orchestration as System Design

**Frontend (tool-orchestration.jsx):**
- Import `dagre` for hierarchical MCP tool stack layout
- Render tool nodes (color-coded by MCP server)
- Show data flow edges (tool output → tool input)
- Leverage point indicators (node size, glow effects)

**Backend (MCP tool: analyze_tool_stack):**
```python
class MCPTool(BaseModel):
    name: str
    server: str
    inputs: List[str]
    outputs: List[str]
    dependencies: List[str]  # other tools this depends on

class ToolStack(BaseModel):
    name: str
    tools: List[MCPTool]
    flows: List[dict]  # tool call chains
```

**Pattern:** Apply Meadows' leverage point scoring to tool placement in stack. Reuse leverage-point-scorer.jsx scoring logic.

### ST-006: Shifting the Burden in Automation

**Frontend (automation-burden.jsx):**
- Two-loop diagram (quick fix loop + fundamental solution loop)
- Agent nodes positioned using `dagre` or manual layout
- Highlight "side effect" edges (dashed lines)

**Backend (MCP tool: detect_burden_shift):**
```python
class AutomationPattern(BaseModel):
    symptom: str
    quick_fix_agent: str
    fundamental_solution: str
    side_effect: str  # what quick fix makes worse
```

**Pattern:** Reuse burden-shift-simulator.jsx archetype detection logic. Adapt for agent architectures instead of business processes.

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| dagre@^0.8.5 | React 19.x | No React version constraints, pure algorithm library |
| pydantic@^2.10.0 | Python >=3.11 | Matches existing systems-thinking MCP Python version requirement |
| FastMCP@^1.26.0 | pydantic 2.x | Already validated in existing MCP servers |

## Integration Points

### Existing to New

| Existing Component | New Component | Integration |
|-------------------|---------------|-------------|
| feedback-loop-builder.jsx | agent-feedback-loops.jsx | Copy `findCycles()`, adapt for AgentEdge[] instead of generic edges |
| leverage-point-scorer.jsx | tool-orchestration.jsx | Copy scoring logic, apply to ToolStack instead of generic interventions |
| burden-shift-simulator.jsx | automation-burden.jsx | Copy archetype detection, adapt for agent patterns |
| systems-thinking MCP | New tools: analyze_agent_architecture, analyze_tool_stack, detect_burden_shift | Add to existing server.py, follow create_causal_loop pattern |

### Preview App Updates

No structural changes needed. Add 3 new tabs to existing Vite app:

```javascript
// In preview-app/src/App.jsx
import AgentFeedbackLoops from './components/agent-feedback-loops'
import ToolOrchestration from './components/tool-orchestration'
import AutomationBurden from './components/automation-burden'

// Add to tabData array
{ id: 'ST-004', label: 'Agent Feedback Loops', component: AgentFeedbackLoops },
{ id: 'ST-005', label: 'Tool Orchestration', component: ToolOrchestration },
{ id: 'ST-006', label: 'Automation Burden', component: AutomationBurden },
```

## Why Minimal Stack Additions?

**Existing capabilities cover 90% of needs:**
1. **Custom SVG rendering** — proven in 6 cubelets, students familiar with interaction patterns
2. **Cycle detection algorithms** — already implemented, just adapt to agent graphs
3. **Pydantic modeling** — established pattern for domain objects (CLD, FeedbackLoop, etc.)
4. **FastMCP tooling** — server setup, tool registration, JSON serialization all working

**Only missing piece:** Automatic graph layout algorithms. `dagre` fills this gap with minimal weight.

**Alternative considered:** Using ReactFlow or similar. **Rejected** because:
- Breaks aesthetic consistency (custom dark theme hard to apply)
- 30x larger bundle (500KB vs 13KB for dagre)
- Learning curve for students (new interaction model vs familiar SVG patterns)
- Over-engineered for static educational diagrams

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| **dagre addition** | HIGH | Battle-tested, lightweight, widely used for graph layouts |
| **No viz framework** | HIGH | Existing cubelets prove custom SVG approach works well |
| **Pydantic models** | HIGH | Established pattern, just extending to new domain objects |
| **Version compatibility** | MEDIUM | React 19 is very recent (released Jan 2025), dagre maintained but last major update 2018 — still works but not actively developed |

## Sources

**MEDIUM confidence (training data + version verification):**
- dagre library: NPM shows 0.8.5 stable, last updated 2018, still compatible with modern React
- React 19.2.4: Current stable (verified in existing package.json)
- Vite 8.0.0: Current stable (verified in existing package.json)
- Pydantic 2.x: Standard for Python type validation, FastMCP compatible
- FastMCP 1.26.0: Verified in existing pyproject.toml

**LOW confidence (training data only, needs verification):**
- dagre actively maintained status (works but development slowed)
- Alternative layout libraries (not researched due to WebSearch unavailable)

**Verification needed:** Check NPM for dagre alternatives if active maintenance is required. However, since it's a pure algorithm library (no framework dependencies), lack of recent updates is not a blocker — the algorithm is stable.

---
*Stack research for: Agentic Systems Thinking Cubelets (ST-004, ST-005, ST-006)*
*Researched: 2026-03-21*
