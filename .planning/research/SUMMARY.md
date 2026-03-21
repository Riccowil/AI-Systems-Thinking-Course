# Project Research Summary

**Project:** AI for Systems Thinking — v1.1 Agentic Systems Design
**Domain:** Educational interactive artifacts (3 new cubelets: ST-004, ST-005, ST-006)
**Researched:** 2026-03-21
**Confidence:** MEDIUM

## Executive Summary

This milestone adds three "applied" cubelets to an existing systems thinking course, bridging foundational concepts (feedback loops, leverage points, shifting the burden) into the agentic AI domain. The existing stack, architecture, and delivery patterns are battle-tested across six cubelets — the core technical risk is low. **No new frameworks, no new servers, no architectural overhaul.** The work is primarily content design and domain adaptation: take proven interactive patterns (CLD builders, scoring matrices, simulation games) and rewire them for agent architectures, MCP tool stacks, and automation debt scenarios. The only new dependency is `dagre` (13KB graph layout library) for automatic node positioning in agent diagrams.

The real risk is pedagogical, not technical. All four research tracks converge on the same warning: **these cubelets demand more cognitive load than the foundational ones because students must hold systems thinking frameworks AND unfamiliar agent concepts simultaneously.** The existing cubelet format (8-10 minute engagement, single-concept focus) may crack under this dual-domain synthesis. Pitfalls research identifies abstraction inversion (teaching agent systems to students who have never built an agent) and complexity cliff (too many concepts per cubelet) as the top two threats. Features research confirms that progressive disclosure and worked examples are table stakes, not nice-to-haves — they are the primary defense against cognitive overload.

The recommended approach: **build ST-004 first as the pathfinder cubelet, validate it with beta testers, then apply lessons to ST-005 and ST-006.** This sequencing is reinforced by the prerequisite chain (ST-005 depends on ST-004's agent control flow coverage) and by the architecture's build order recommendation (MCP tools before artifacts, artifacts before skills). Do not build all three cubelets in parallel — the applied domain is uncertain enough that the first cubelet will surface design decisions that change the other two.

## Key Findings

### Recommended Stack

The existing stack (React 19, Vite 8, Python FastMCP, custom SVG visualizations) covers 90% of needs. No visualization frameworks (ReactFlow, D3, Cytoscape) are warranted — they break aesthetic consistency and add 30-500KB of unnecessary bundle weight. The custom SVG approach used in all existing cubelets extends naturally to agent diagrams.

**Core technologies (no changes):**
- **React 19 + Vite 8:** Existing preview app — add 3 new lazy-loaded tabs
- **Python FastMCP + Pydantic 2.x:** Existing MCP server — add 3 new tool functions
- **Custom SVG rendering:** Proven in 6 cubelets, maintains dark cybernetic theme

**Single addition:**
- **dagre ^0.8.5:** Lightweight directed graph layout algorithm (13KB) for automatic agent node and tool dependency positioning. Battle-tested, no framework dependencies, fills the only genuine capability gap.

**Explicitly rejected:** ReactFlow (500KB, breaks theme), D3.js (200KB, overkill), LangGraph Python (cubelets MODEL agents, they do not RUN them), networkx (too heavy for educational tools).

### Expected Features

**Must have (table stakes) — students expect these from existing cubelet pattern:**
- Interactive CLD canvas with agent-specific node vocabulary (agent, tool, memory, evaluator, constraint)
- Progressive disclosure: student predicts/scores first, then sees algorithmic analysis
- Worked examples from real AI ops contexts (retry storms, cost spirals, automation debt)
- Three-layer deliverable per cubelet (JSX artifact + MCP tool + Claude skill) — non-negotiable
- Dark cybernetic aesthetic consistency (charcoal, teal, amber, pink palette)
- Right-panel instrumentation (metrics, scores, loop classifications)
- Tutorial overlay on empty canvas

**Should have (differentiators):**
- Agent-specific node vocabulary in CLD builder (not just generic "Variable 1")
- Cost/latency/quality tradeoff visualization for feedback loops
- MCP tool stack complexity scoring (redundancy, coupling, blast radius)
- Automation debt detection heuristics with AI-specific erosion channels
- Archetype pattern library (retry storm, cache invalidation cascade, context bloat, tool explosion)

**Defer to v1.2+:**
- Live agent execution trace import (LangGraph JSON parser)
- Cost calculator overlay with dollar projections
- Comparison mode (before/after refactor diff)
- Custom scenario builder for ST-006

**Defer to v2.0+:**
- Multi-agent system modeling
- Continuous monitoring integration (DataDog, LangSmith)
- Tool marketplace scoring
- Cross-session debt tracking persistence

**Anti-features (explicitly reject):**
- Auto-generate CLD from codebase (eliminates the learning)
- Real-time multi-user collaboration (complexity without pedagogical benefit)
- LLM chat interface for analysis (moves analysis from student brain to AI)
- Gamification (extrinsic motivation crowds out systems thinking insight)

### Architecture Approach

The architecture is additive, not transformative. All three cubelets follow the proven three-layer pattern and integrate into existing infrastructure: 3 new JSX components added to the preview app's tab array, 3 new Python tool functions added to the existing `systems-thinking-cubelets` MCP server (growing it from 3 to 6 tools), and 3 new `.skill` packages. The key architectural decision is to **extend the existing MCP server rather than creating a fourth one** — this preserves tool discovery cohesion and enables code reuse of shared Pydantic models (CausalLink, MeadowsLevel, FixRecord).

**Major components (all extensions of existing):**
1. **Preview App (Vite)** — Add 3 new lazy-loaded tabs for ST-004/005/006 artifacts; horizontal scroll CSS already handles overflow
2. **systems-thinking-cubelets MCP server** — Add 3 new tools that transform domain-specific inputs (AgentComponent, MCPTool, AutomationLayer) into shared data structures, then call existing analysis tools
3. **Claude Skills** — 3 new `.skill` packages following established naming and structure conventions
4. **Cubelet Markdown** — 3 new six-face knowledge structures (WHAT/WHY/HOW/WHERE/WHEN/APPLY)

**Data flow pattern (consistent across all 3 cubelets):**
User input (domain-specific) --> Validation --> Transform to shared models --> Call existing tool --> Enrich with domain-specific insights --> Response

### Critical Pitfalls

Research identified 8 pitfalls. The top 5 that must be addressed in roadmap planning:

1. **Abstraction Inversion** — Students may know systems thinking but have never built an agent. ST-004 becomes theoretical without concrete agent experience. **Mitigation:** Add agent experience prerequisite checkpoint; include hands-on agent warmup exercise; provide reference agent implementations.

2. **Complexity Cliff** — Applied cubelets require dual-domain synthesis (systems thinking + agent architecture) that exceeds the 8-10 minute format. **Mitigation:** Scope each cubelet to ONE framework application; extend time budget to 12-15 minutes; use progressive disclosure and partially-completed examples to reduce load.

3. **Archetype Misapplication** — Shifting the Burden does not map cleanly to ALL automation scenarios. Forcing it creates false pattern matching. **Mitigation:** Explicitly define when the archetype applies and when it does not; include counter-examples; tune MCP tool to detect non-matches.

4. **Deliverable Stack Mismatch** — MCP tools for agentic concepts need structured input (agent graphs, tool call logs) that students do not know how to provide. **Mitigation:** Ship canonical example architectures as default inputs; accept simplified text-based representations; design phased tool usage (examples first, own systems later).

5. **Integration Discontinuity** — New cubelets that do not explicitly reference earlier prerequisites feel disconnected. **Mitigation:** Add prerequisite callback sections; use consistent visual cues across ST-002 and ST-005; include 30-second refresher panels in artifacts.

## Agreements and Tensions Across Research

**Strong agreement across all 4 files:**
- Extend existing infrastructure, do not create new servers or frameworks
- The three-layer deliverable pattern (artifact + MCP tool + skill) is non-negotiable and proven
- Progressive disclosure is essential, not optional — it is the primary cognitive load defense
- Worked examples with real AI ops scenarios are table stakes
- Custom SVG over heavy visualization frameworks

**Key tension: Stack simplicity vs. feature ambition.**
Stack research recommends minimal additions (dagre only). Features research identifies HIGH-complexity differentiators (MCP tool stack scoring, cost/latency/quality visualization, live trace import). Architecture bridges this by showing how existing tools can be composed to deliver complex features without new dependencies. **Resolution:** Build complex features through composition of simple components, not through adding complex libraries. Defer the highest-complexity features (trace import, cost calculator) to v1.2.

**Key tension: Pedagogical depth vs. cubelet format constraints.**
Features research lists rich analysis outputs (loop severity scoring, archetype pattern libraries, refactor comparisons). Pitfalls research warns that complexity cliff will break the 8-10 minute engagement window. **Resolution:** Scope each cubelet to one primary interaction. ST-004 = build CLD. ST-005 = score interventions. ST-006 = play decision game. Rich analysis is the OUTPUT, not additional work for the student.

## Implications for Roadmap

Based on research, suggested phase structure (5 phases):

### Phase 1: Requirements and Content Design Foundations
**Rationale:** Pitfalls 1, 3, and 7 must be addressed before any building begins. The prerequisite chain, agent experience checkpoint, and concept-to-cubelet mappings are design decisions that cascade into every downstream deliverable.
**Delivers:** Updated prerequisite-chain.md with ST-004/005/006 dependencies; agent experience checkpoint criteria; expanded design system documentation for agent visual vocabulary; cubelet markdown drafts (WHAT/WHY/HOW faces) for all 3 cubelets; Pydantic data model specifications (AgentComponent, MCPTool, AutomationLayer)
**Addresses features:** Three-layer deliverable planning, prerequisite refresher design, agent node vocabulary definition
**Avoids pitfalls:** Abstraction Inversion (#1), False Prerequisite Chain (#3), Integration Discontinuity (#7)

### Phase 2: ST-004 Pathfinder (Agent Feedback Loops — full stack)
**Rationale:** ST-004 is the pathfinder. It has MEDIUM complexity (reuses ST-001 canvas), tests the dual-domain cognitive load hypothesis, and its agent control flow coverage is a prerequisite for ST-005. Build the complete three-layer stack for ST-004 first to validate the approach.
**Delivers:** agent-feedback-mapper.jsx artifact, analyze_agent_architecture MCP tool, agent-feedback-analyzer.skill, ST-004 cubelet markdown (all 6 faces)
**Uses:** dagre for graph layout, existing CLD cycle detection, Pydantic AgentComponent/AgentLink models
**Avoids pitfalls:** Complexity Cliff (#2) — validated with beta testers before proceeding; Aesthetic Drift (#6) — establishes agent visual vocabulary for ST-005/006 to follow
**Research flag:** Needs beta testing with 2-3 students to measure actual time-to-completion and cognitive load before proceeding to Phase 3

### Phase 3: ST-005 Tool Orchestration (full stack)
**Rationale:** Depends on ST-004 for agent control flow foundation. ST-005 is the highest-complexity cubelet (dependency graph analysis, Meadows scoring heuristics, comparison diff logic). Lessons from ST-004 pathfinder inform scope decisions here.
**Delivers:** tool-orchestration-scorer.jsx artifact, analyze_tool_stack MCP tool, tool-stack-analyzer.skill, ST-005 cubelet markdown (all 6 faces)
**Uses:** dagre for hierarchical tool stack layout, existing compare_interventions logic, Pydantic MCPTool/ToolDependency models
**Avoids pitfalls:** Deliverable Stack Mismatch (#5) — simplified input mode validated; False Prerequisite Chain (#3) — control flow primer included
**Research flag:** MCP tool stack scoring algorithm needs deeper research during planning. Meadows-level mappings for tool orchestration are novel — no established patterns to copy.

### Phase 4: ST-006 Automation Debt (full stack)
**Rationale:** ST-006 reuses the ST-003 simulation engine (MEDIUM complexity). Can incorporate lessons from both ST-004 and ST-005. The archetype misapplication risk (Pitfall 4) means content design needs the most care here.
**Delivers:** automation-burden-detector.jsx artifact, detect_automation_debt MCP tool, automation-debt-detector.skill, ST-006 cubelet markdown (all 6 faces)
**Uses:** Existing burden-shift-simulator patterns, Pydantic AutomationLayer model
**Avoids pitfalls:** Archetype Misapplication (#4) — boundaries section and counter-examples included; Assumed Agent Maturity (#8) — production case studies and persona-specific entry points
**Research flag:** Needs curated production automation case studies. Without real war stories, scenarios will feel hypothetical and fail to trigger recognition.

### Phase 5: Integration, Quality Gates, and Deployment
**Rationale:** All components validated individually. Integration phase ensures cohesion, updates course infrastructure, and applies quality gates.
**Delivers:** Updated App.jsx with 3 new tabs; updated prerequisite-chain.md and course-syllabus.md; quality gate scores (target >=42/60 per cubelet); Vercel deployment
**Avoids pitfalls:** Integration Discontinuity (#7) — final consistency review across all 9 cubelets

### Phase Ordering Rationale

- **Phase 1 before all building** because prerequisites chain, data models, and visual vocabulary cascade into every downstream component. Getting these wrong means rework.
- **ST-004 as pathfinder (Phase 2)** because it has the lowest incremental complexity (reuses ST-001 most directly), its success validates the cognitive load hypothesis, and it produces the agent control flow foundation that ST-005 requires.
- **ST-005 before ST-006 (Phase 3 before Phase 4)** because ST-005 is the highest-risk cubelet (novel scoring algorithm, highest implementation complexity) and should not be last when fatigue sets in. ST-006 is the most reuse-friendly (extends ST-003 directly) and benefits from accumulated lessons.
- **Integration last (Phase 5)** because quality gates and consistency reviews need all components present. Deploying incrementally risks aesthetic drift and prerequisite chain gaps.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (ST-004):** Agent control flow coverage scope needs definition — how much agent architecture education belongs in a systems thinking cubelet vs. is assumed prerequisite knowledge?
- **Phase 3 (ST-005):** MCP tool stack scoring algorithm is novel. No established pattern for applying Meadows hierarchy to tool composition. Needs prototyping and iteration.
- **Phase 4 (ST-006):** Production automation case studies needed. Content quality depends on real-world examples that have not been collected yet.

**Phases with standard patterns (skip deep research):**
- **Phase 1:** Prerequisite chain and data model design follow established course patterns. Extend existing conventions.
- **Phase 5:** Integration is mechanical — tab array extension, config updates, deployment. No research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Minimal additions to proven stack. dagre is battle-tested. No version conflicts. |
| Features | MEDIUM | Table stakes are clear from existing patterns. Differentiator feasibility unverified — especially MCP tool stack scoring and cost/quality visualization. |
| Architecture | HIGH | Based on direct analysis of existing codebase. Extension patterns are straightforward and well-documented in current code. |
| Pitfalls | MEDIUM | Pedagogical risks are well-reasoned from educational theory but not validated with actual students. No beta test data yet. |

**Overall confidence:** MEDIUM — The technical execution path is clear and low-risk. The pedagogical design (will students actually learn agent systems thinking from these cubelets?) is the primary uncertainty and can only be resolved through testing.

### Gaps to Address

- **Agent experience baseline:** No data on what percentage of target students have hands-on agent building experience. Survey or prerequisite assessment needed before Phase 2.
- **Cognitive load measurement:** No empirical validation that the 8-10 minute cubelet format works for dual-domain synthesis. Phase 2 beta test must measure this explicitly.
- **dagre maintenance status:** Library works but last major update was 2018. Verify NPM for actively maintained alternatives if long-term support matters (unlikely to be an issue since it is a pure algorithm library).
- **Production case studies for ST-006:** Currently zero collected. Content quality for automation debt scenarios depends on gathering real anonymized war stories from practitioners.
- **LangGraph trace format:** If live trace import moves to v1.2, the current LangGraph execution trace JSON schema needs verification against 2026 versions.
- **MCP server metadata standards:** ST-005's tool stack analysis assumes a consistent way to describe MCP tool inputs/outputs/dependencies. This format needs specification during Phase 1.

## Sources

### Primary (HIGH confidence)
- Existing codebase: cubelets_mcp_server.py, week1_foundations_mcp_server.py, App.jsx, package.json, prerequisite-chain.md
- PROJECT.md: Course structure, quality gates, three-layer deliverable requirements
- FastMCP documentation: Pydantic model patterns, stdio server architecture
- React 19 / Vite 8 documentation: Lazy loading, code splitting, Suspense patterns

### Secondary (MEDIUM confidence)
- dagre NPM package: v0.8.5 stable, compatible with modern React, pure algorithm library
- Pydantic 2.x: Standard for Python validation, FastMCP compatible
- Cognitive Load Theory (Sweller): Applied to complexity cliff analysis
- Senge "The Fifth Discipline": Systems archetypes catalog and pedagogical patterns
- ReAct pattern (Yao et al.): Agent architecture reference for ST-004 examples

### Tertiary (LOW confidence, needs validation)
- dagre active maintenance status (functional but development slowed since 2018)
- LangGraph execution trace format (training data only, unverified against 2026 versions)
- MCP server metadata standards (emerging, not yet standardized)
- Current AI ops cost benchmarks (needed for cost calculator feature, not yet collected)
- Agent education best practices (based on 2025 knowledge cutoff, may miss 2026 developments)

---
*Research completed: 2026-03-21*
*Ready for roadmap: yes*
