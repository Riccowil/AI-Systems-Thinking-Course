# Phase 7: Content Foundations - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock all design decisions, data models, prerequisite mappings, and visual vocabulary so cubelet building (Phases 8-10) proceeds without rework. This phase produces design documents and updated course infrastructure files — no artifacts, MCP tools, or skills are built here.

</domain>

<decisions>
## Implementation Decisions

### Agent Experience Checkpoint
- Conceptual only — no prior agent-building experience required
- Students must understand what agents, tools, and memory ARE, but don't need to have built one
- Framework-agnostic examples throughout (no LangChain/CrewAI/AutoGen specifics)
- 3-question casual self-assessment checklist at top of ST-004 cubelet markdown (warm-up, not a test)
  - Example questions: "Can you explain what an AI agent does that a chatbot doesn't?", "What's a tool call?", "Why might an agent need memory?"
- All 3 new cubelets (ST-004/005/006) get always-accessible collapsible sidebar primer panels in their artifacts
  - ST-004 primer: agent basics (what agents, tools, memory, evaluators, constraints are)
  - ST-005 primer: tool orchestration basics (dependencies, redundancy, blast radius)
  - ST-006 primer: automation debt basics (quick fixes vs fundamental solutions, erosion)
- Agent vocabulary also woven into cubelet WHAT/HOW faces (belt and suspenders)
- Primer panels cross-reference prerequisite cubelets with direct links to preview app tabs

### Data Model Depth
- Compose with existing models — AgentLink wraps CausalLink internally, AutomationLayer wraps FixRecord
- Phase 7 spec depth: field names + types + example values (not full Pydantic code)
- Fixed 5 node types for AgentComponent: agent, tool, memory, evaluator, constraint (no custom types)
- AutomationLayer mirrors existing FixRecord pattern with AI-specific fields (automation_type, failure_mode, tech_debt_indicator)
- All new models transform to existing formats for reuse of proven graph/analysis logic

### Agent Node Visual Vocabulary
- Shape-coded nodes (distinct SVG shapes per type):
  - Agent: hexagon
  - Tool: rectangle
  - Memory: cylinder
  - Evaluator: diamond
  - Constraint: octagon
- Subtle color tint per shape — muted palette colors as secondary reinforcement (shapes do heavy lifting)
- Same CLD edge style as existing artifacts — curved bezier paths with polarity labels (+/-)
  - Teal (#00d4aa) for positive polarity, coral (#ff6b6b) for negative polarity
- Visual vocabulary document specifies: SVG path data, fill color hex values, stroke, and dimensions per shape
- No separate rendered legend graphic — text descriptions with SVG specs are sufficient

### Week 3 Syllabus Framing
- Module title: "Systems Thinking for AI Agents"
  - Framing: students bring systems thinking skills forward into agent territory
- Difficulty level: Advanced (progression: Foundational → Intermediate → Advanced)
- Time per cubelet (variable):
  - ST-004 Agent Feedback Loops: ~8 minutes
  - ST-005 Tool Orchestration: ~12 minutes (highest complexity)
  - ST-006 Automation Debt: ~10 minutes (simulation game needs time)
  - Total module: ~30 minutes
- Practice exercises: "Apply to YOUR agent stack" — students analyze their own agent/tool systems
  - ST-004: "Map your agent's feedback loops"
  - ST-005: "Audit your MCP tool stack"
  - ST-006: "Find automation debt in your workflow"

### Claude's Discretion
- Exact SVG path coordinates and dimensions for each shape (within the shape-coding spec above)
- Specific muted color hex values for each shape tint (must be from existing palette family)
- Field validator rules for Pydantic models (follow existing validation patterns in cubelets-mcp/server.py)
- Practice exercise rubrics (follow existing pattern: passing = minimum viable, excellent = stretch goal)
- Exact wording of self-assessment questions (3 questions, casual tone, about agents/tools/memory)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CausalLink(from_var, to_var, polarity, strength)` in cubelets-mcp/server.py — AgentLink composes with this
- `FixRecord` model in detect_burden_shift tool — AutomationLayer composes with this
- `score_reinforcing_loops` tool — reused by ST-004's analyze_agent_feedback_loops via composition (AF-07)
- `compare_interventions` tool — reused by ST-005's analyze_tool_orchestration via composition (TO-07)
- `detect_burden_shift` tool — reused by ST-006's detect_automation_debt via composition (AB-07)
- Feedback loop builder SVG canvas (feedback-loop-builder.jsx) — node rendering, edge curves, cycle detection patterns
- App.jsx lazy-loading tab pattern — add 3 new entries for ST-004/005/006

### Established Patterns
- FastMCP + Pydantic models with field validators for cross-field checks
- ResponseFormat enum (markdown/json) for all MCP tools
- Inline styles only in React artifacts (no external CSS)
- Dark cybernetic palette: #0f1117 (bg), #161922 (panel), #00d4aa (teal accent), #ff6b6b (coral), #6b8aff (blue), #e8ecf4 (text), #4a5270 (muted)
- Fonts: DM Sans (body), JetBrains Mono (code/tabs)
- Quality gate scoring: 6 faces x 10 points = 60 max, 42 minimum pass, target 53/60

### Integration Points
- `cubelets-mcp/server.py` — add 3 new tools (analyze_agent_feedback_loops, analyze_tool_orchestration, detect_automation_debt)
- `prerequisite-chain.json` — add ST-004/005/006 entries with dependency ordering
- `master-syllabus.json` — add Module M3 with 3 new lessons
- `course-syllabus.md` — add Week 3 section
- `preview-app/App.jsx` — add 3 new lazy-loaded tabs

</code_context>

<specifics>
## Specific Ideas

- The module framing "Systems Thinking for AI Agents" positions this as students APPLYING their systems thinking toolkit to a new domain — not learning new frameworks
- The "apply to YOUR agent stack" exercise pattern creates personal stakes — students analyze systems they actually use
- Agent experience is conceptual-only entry barrier, but primer panels + WHAT/HOW face coverage means no student gets left behind
- Variable timing (8/12/10) acknowledges ST-005 is the most complex cubelet while keeping total module at 30 minutes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-content-foundations*
*Context gathered: 2026-03-21*
