# Pitfalls Research — Agentic AI Educational Content

**Domain:** Educational content design — adding agentic AI modules to systems thinking course
**Researched:** 2026-03-21
**Confidence:** MEDIUM (pedagogical research + educational design patterns, limited web verification)

## Critical Pitfalls

### Pitfall 1: Abstraction Inversion — Teaching Agents Before Agent Components

**What goes wrong:**
Students who understand systems thinking (feedback loops, leverage points, archetypes) but have never built an agent cannot apply ST-004 (Agent Feedback Loops) because they don't yet have the concrete agent experience to abstract from. The cubelet becomes theoretical knowledge divorced from practice.

**Why it happens:**
The existing course progression assumes students have systems thinking foundations (W1-C1) but doesn't verify they have hands-on agent experience. ST-004 through ST-006 attempt to teach "agents as systems" to students who may not yet know what an agent IS beyond conceptual definitions.

**How to avoid:**
- Add prerequisite verification: "Before ST-004, have you run an agentic workflow? Built a multi-step agent? Debugged a tool call failure?"
- Include a concrete agent warmup exercise in ST-004's APPLY section (5-minute hands-on task)
- Provide a reference agent implementation students can poke at during the lesson
- Consider splitting ST-004 into two cubelets: "ST-004a: Agent Fundamentals" (practical) + "ST-004b: Agent Feedback Loops" (systems lens)

**Warning signs:**
- Students score high on ST-001/002/003 but struggle with ST-004 practice exercises
- Feedback: "I understand the framework but don't know where to apply it"
- Practice submissions use hypothetical examples instead of real agent architectures
- MCP tool usage for ST-004/005/006 significantly lower than ST-001/002/003

**Phase to address:**
Phase 1 (Requirements Definition) — clarify prerequisite chain and add agent experience checkpoint before agentic cubelets

---

### Pitfall 2: Complexity Cliff — Applied Cubelets Require More Cognitive Load Than Format Allows

**What goes wrong:**
ST-004 (Agent Feedback Loops) requires students to simultaneously hold: (1) systems thinking CLD construction, (2) agent architecture components, (3) LLM behavior dynamics, (4) tool orchestration patterns. The cubelet format works for focused concepts (reinforcing loops, leverage points) but breaks under multi-domain synthesis tasks. Students hit cognitive overload and disengage.

**Why it happens:**
The existing cubelets (ST-001 through ST-003) apply ONE systems thinking framework to familiar business contexts. The new cubelets apply systems thinking frameworks to UNFAMILIAR AI/agent contexts, adding domain-learning overhead the format wasn't designed for. The 8-10 minute time budget becomes unrealistic.

**How to avoid:**
- **Scope reduction:** ST-004 focuses on ONE agent feedback loop type (e.g., context accumulation loops), not all possible agent loops
- **Progressive disclosure:** Break complex examples into phases — "Here's the agent architecture (given). Now map ONE loop. Now map interactions."
- **Chunked practice exercises:** Instead of "map this entire agent system," provide "complete this partially-mapped agent CLD"
- **Extend time budget:** Acknowledge that applied cubelets may need 12-15 minutes, not 8-10
- **Reference architectures:** Provide 2-3 canonical agent patterns students can reuse (ReAct loop, Plan-Execute-Reflect, Multi-agent handoff)

**Warning signs:**
- Quality gate scores drop below 42/60 aggregate for ST-004/005/006
- Student feedback: "Too much at once," "Need more time," "Lost the thread halfway through"
- Practice exercises submitted incomplete or at surface-level analysis
- Artifact interaction time doubles but comprehension doesn't improve

**Phase to address:**
Phase 2 (Content Design) — prototype ST-004 with beta testers, measure actual time-to-completion and cognitive load, adjust scope before building ST-005/006

---

### Pitfall 3: False Prerequisite Chain — Teaching Tool Orchestration Before Agent Control Flow

**What goes wrong:**
ST-005 (Tool Orchestration as System Design) teaches leverage point analysis on tool stacks, but students can't identify leverage points in a tool stack if they don't understand how agents select, sequence, and retry tools. The cubelet assumes agent execution model knowledge that wasn't taught in prerequisites.

**Why it happens:**
Tool orchestration is a downstream effect of agent control flow (how the agent decides which tool to call, when, with what error handling). Teaching orchestration-as-system-design before control-flow-as-system-structure inverts the dependency chain.

**How to avoid:**
- **Reorder prerequisites:** Ensure ST-004 (Agent Feedback Loops) covers agent control flow patterns before ST-005 (Tool Orchestration)
- **Explicit sub-prerequisites:** ST-005 WHAT section includes 2-minute primer on "How agents orchestrate tools" before diving into leverage points
- **Worked examples with annotated control flow:** Every ST-005 example includes a diagram showing the agent's decision logic, not just the tool stack
- **MCP tool scaffolding:** `compare_interventions` (from ST-002) extended with agent-specific Meadows level mappings

**Warning signs:**
- Students correctly apply Meadows hierarchy but misidentify what counts as "parameter vs structure" in tool stacks
- Practice exercises focus on tool selection (what tools exist) instead of orchestration design (how tools compose)
- MCP tool output shows leverage point scores but students don't trust the rankings because the underlying control flow is unclear

**Phase to address:**
Phase 1 (Requirements Definition) — validate that ST-004 prerequisite adequately covers agent control flow; Phase 2 (Content Design) — add control flow primer to ST-005 WHAT section

---

### Pitfall 4: Archetype Misapplication — Shifting the Burden Doesn't Map Cleanly to Automation Scenarios

**What goes wrong:**
ST-006 (Shifting the Burden in Automation) forces the archetype onto automation scenarios where it doesn't naturally fit. The three-loop structure (B1: symptomatic fix, B2: fundamental solution, R1: erosion) works for business process debt but fractures when applied to technical automation patterns. Students learn to mechanically label loops without understanding when the archetype actually applies.

**Why it happens:**
Not all automation debt follows the Shifting the Burden structure. Some follows different archetypes (Tragedy of the Commons, Fixes that Fail, Escalation). Some isn't archetype-driven at all — it's just poor tooling choices. Forcing one archetype onto all automation scenarios creates false pattern matching.

**How to avoid:**
- **Scope to valid use cases:** ST-006 explicitly defines when Shifting the Burden applies to automation (workaround accumulation, quick-fix vs root-cause tension, capability erosion) and when it doesn't
- **Teach archetype boundaries:** Include counter-examples in WHAT section: "This looks like burden-shifting but is actually Fixes that Fail because..."
- **Alternative archetype references:** WHERE section mentions related archetypes and provides decision tree for which applies when
- **Detection before classification:** APPLY framework starts with "Is this Shifting the Burden? Check for: recurring symptom, two competing fixes, erosion channel" before mapping B1/B2/R1

**Warning signs:**
- Students label every automation problem as Shifting the Burden regardless of structure
- Practice exercises show correct B1/B2/R1 labeling but miss the erosion channel (copying format without understanding mechanism)
- MCP tool `detect_burden_shift` returns false positives when automation debt follows different patterns
- Quality gate scores for ST-006 WHAT/WHY faces drop (concept clarity issues)

**Phase to address:**
Phase 2 (Content Design) — validate archetype applicability with real automation scenarios; Phase 3 (MCP Tool Development) — tune `detect_burden_shift` to return "NOT Shifting the Burden — likely [other archetype]" instead of forcing classification

---

### Pitfall 5: Deliverable Stack Mismatch — MCP Tools for Agentic Concepts Require Agent Context

**What goes wrong:**
The three-layer deliverable stack (Artifact + MCP Tool + Skill) assumes tools can operate independently. But MCP tools for ST-004/005/006 need access to the student's actual agent code, architecture diagrams, or execution traces to produce meaningful output. Without that context, the tools degrade to generic templates that don't match real student systems.

**Why it happens:**
ST-001 through ST-003 tools operate on student-provided text descriptions (system maps, interventions, workflow descriptions). ST-004 through ST-006 tools need structured input (agent execution graphs, tool call logs, retry patterns) that students don't know how to provide yet.

**How to avoid:**
- **Example-driven mode:** MCP tools ship with 3-4 canonical agent architectures as default inputs (ReAct loop, multi-agent handoff, RAG pipeline) — students analyze examples before bringing their own systems
- **Reduced input requirements:** Tools accept simplified representations (text-based agent pseudocode, simplified architecture diagrams) instead of full execution traces
- **Hybrid approach:** Interactive artifacts include the complex visualizations, MCP tools provide analysis functions on simplified inputs, skills guide students through the mapping process
- **Phased tool usage:** ST-004 tool analyzes provided examples, ST-005 tool accepts student-simplified inputs, ST-006 tool handles full student architectures (progressive complexity)

**Warning signs:**
- MCP tool adoption rate drops for ST-004/005/006 compared to ST-001/002/003
- Student feedback: "Tool doesn't work with my setup," "Don't know what to input," "Output too generic"
- Tools used only in "example mode," never with student's real systems
- Practice exercises submitted without MCP tool usage (students skip the tool layer)

**Phase to address:**
Phase 3 (MCP Tool Development) — prototype input interfaces with beta testers, validate that students can successfully provide required context; Phase 4 (Artifact Development) if tool input becomes too complex, shift functionality to artifacts

---

### Pitfall 6: Aesthetic Drift — Agentic Visualizations Break the Cybernetic Blueprint Theme

**What goes wrong:**
Agent feedback loop diagrams, tool orchestration flowcharts, and automation debt visualizations require different visual languages than the existing artifacts. Attempting to force them into the dark cybernetic blueprint aesthetic produces illegible diagrams or abandons the aesthetic entirely, breaking course cohesion.

**Why it happens:**
The existing aesthetic (charcoal canvas, teal/amber/pink accents, JetBrains Mono / DM Sans) works well for CLDs, scoring matrices, and simulation dashboards. Agent architectures need different primitives: execution flow diagrams, hierarchical tool trees, time-series traces. These don't naturally map to the established visual vocabulary.

**How to avoid:**
- **Extend visual vocabulary, don't replace:** Define agent-specific visual components (execution node style, tool call edges, retry indicators) that use the same color palette and typography but new shapes
- **Design system documentation:** Before building ST-004 artifact, document the expanded visual vocabulary with examples
- **Component library:** Build reusable React components for agent visualization primitives (AgentNode, ToolCallEdge, FeedbackArc) that enforce aesthetic consistency
- **Prototype early:** Build one agent visualization mockup during Phase 2, validate it maintains aesthetic cohesion before building all three artifacts

**Warning signs:**
- ST-004/005/006 artifacts feel visually disconnected from ST-001/002/003
- Student feedback mentions inconsistent look-and-feel
- New artifacts use different color schemes, fonts, or layout conventions
- Quality gate DROP on APPLY sections because visualizations are harder to parse

**Phase to address:**
Phase 2 (Content Design) — expand design system before artifact development; Phase 4 (Artifact Development) — enforce component reuse, conduct aesthetic consistency review before deployment

---

### Pitfall 7: Integration Discontinuity — New Cubelets Don't Reference Earlier Prerequisites

**What goes wrong:**
ST-004/005/006 are written as if they stand alone, without explicit callbacks to the foundational concepts from W1-C1, W1-C2, W1-C3. Students who completed the earlier cubelets months ago don't recognize that ST-005 (Tool Orchestration) is applying the same leverage point framework from ST-002, just in a new domain. The course feels like disconnected modules instead of a progressive skill build.

**Why it happens:**
Authors assume students have active recall of earlier concepts. In reality, students completing Week 3 content may have finished Week 1 weeks or months prior. Without explicit "remember when we..." bridges, prerequisite knowledge feels inaccessible.

**How to avoid:**
- **Explicit prerequisite callbacks:** ST-005 WHAT section includes: "Recall from ST-002 that Meadows' hierarchy ranks interventions by structural depth. Now we apply that same hierarchy to tool stacks."
- **Visual consistency cues:** Use the same diagram style for Meadows hierarchy in ST-005 that was used in ST-002 (visual memory trigger)
- **Quick refresher sections:** 30-second "Prerequisite Reminder" panel in each artifact showing 2-3 key concepts from earlier cubelets
- **MCP tool cross-references:** ST-005 `compare_interventions` includes flag: "This is the same tool from ST-002, now applied to tool stacks instead of business workflows"
- **Skill scaffolding:** Claude skills for ST-004/005/006 include step 0: "Which earlier cubelet taught you [prerequisite concept]? Open that artifact as reference."

**Warning signs:**
- Students ask questions answered in earlier cubelets ("What's a leverage point again?")
- Practice exercises re-explain prerequisite concepts instead of applying them
- Quality gate scores don't improve from ST-004 to ST-006 (no skill compounding)
- Student feedback: "Feels like starting over each time"

**Phase to address:**
Phase 2 (Content Design) — map every new concept to its prerequisite cubelet, add explicit callbacks; Phase 5 (Skills Development) — include prerequisite refreshers in skill workflows

---

### Pitfall 8: Assumed Agent Maturity — Students Know Systems Thinking but Not Production AI

**What goes wrong:**
ST-006 (Shifting the Burden in Automation) assumes students have experienced automation debt in production systems — they've seen the workaround accumulation, the "we'll fix it next sprint" cycles, the erosion of fundamental solution capacity. Students who've only built hobby agents or classroom exercises don't have the lived experience to recognize the archetype.

**Why it happens:**
The course serves multiple student personas: experienced ops engineers adding systems thinking vocabulary, new developers learning both AI and systems thinking, hobbyists exploring concepts. ST-006 is written for the first persona but taught to all three.

**How to avoid:**
- **Rich worked examples:** Provide 3-4 detailed automation debt case studies in ST-006 so students without production experience can learn from documented examples
- **Persona-specific entry points:** APPLY section includes three variants: "If you've experienced this...", "If you've read about this...", "If this is new to you..."
- **Simulation depth:** Interactive artifact for ST-006 includes 12-round decision game (already planned) that SIMULATES the erosion experience students might not have lived
- **Anonymous war stories:** Collect real automation debt stories from practitioners, anonymize, include as case studies
- **Expectation management:** Prerequisites explicitly state: "This cubelet draws on production AI experience. If you don't have it yet, focus on the provided case studies."

**Warning signs:**
- Practice exercises use hypothetical examples instead of real systems students have worked on
- Student questions focus on "could this happen" instead of "how do I fix this"
- Quality gate scores for ST-006 significantly lower than ST-003 (similar complexity, but ST-003 scenarios are more familiar)
- Feedback: "Interesting concept but hard to relate to"

**Phase to address:**
Phase 2 (Content Design) — collect production case studies before writing ST-006 content; Phase 4 (Artifact Development) — ensure simulation provides visceral experience of erosion dynamics

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reusing ST-002's `compare_interventions` tool for ST-005 without agent-specific extensions | Faster tool development, consistent API | Tool output doesn't address agent-specific Meadows mappings, students get generic leverage scores | MVP only — extend tool before production release |
| Teaching ST-004/005/006 without hands-on agent prerequisites | Can ship content faster, reach broader audience | Students learn framework patterns but can't apply them to real systems | NEVER — defeats the "hands-on, never passive" core value |
| Single worked example per cubelet (instead of 3-4) | Faster content creation | Students can't distinguish archetype from specific example, over-generalize | Only for ST-005 if tool orchestration patterns are highly consistent |
| Skipping prerequisite refresher sections in ST-004/005/006 | Cleaner content, less repetition | Students forget earlier concepts, fail to compound learning | Only if cubelets consumed within 1-2 weeks (cohort model, not self-paced) |
| Using generic agent diagrams instead of domain-specific examples (e.g., customer service agent, data pipeline agent) | Easier to maintain, fewer artifacts to build | Students struggle to map generic patterns to their specific domains | Acceptable for ST-004 WHAT section, NOT acceptable for APPLY section |

## Integration Gotchas

Common mistakes when connecting new cubelets to existing course infrastructure.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MCP Server organization | Creating fourth server `agentic-cubelets` separate from `systems-thinking-cubelets` | Extend existing `systems-thinking-cubelets` server with 3 new tools — keeps related tools together |
| Prerequisite chain updates | Adding ST-004/005/006 without updating `prerequisite-chain.md` | Update prerequisite map showing ST-004 requires W1-C1 + W1-C2, ST-005 requires ST-002 + ST-004, etc. |
| Quality gate scoring | Using same rubric for applied cubelets as foundational ones | Applied cubelets may need adjusted rubric (e.g., APPLY section weighted higher, WHAT section more forgiving) |
| Claude Skills naming | Using generic names like `agent-analyzer.skill` | Follow existing pattern: `agent-feedback-mapper.skill`, `tool-orchestration-analyzer.skill`, `automation-burden-detector.skill` |
| Vercel deployment | Building separate preview app for agentic cubelets | Extend existing tabbed interface in `preview-app-two.vercel.app` with Week 3 tab containing ST-004/005/006 |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| MCP tools analyzing large agent execution traces in-memory | Tool timeouts, memory errors when processing 1000+ tool calls | Stream processing, pagination, or summary modes for large traces | 500+ tool calls per analysis |
| Interactive artifacts rendering complex agent graphs client-side | Browser slowdown, unresponsive UI with 50+ node agent architectures | Virtual scrolling, collapse/expand nodes, level-of-detail rendering | 40+ nodes or 100+ edges |
| Skills scaffolding that requires students to manually copy-paste agent code into prompts | Works fine for 20-line examples, breaks for 500-line agent systems | Tool integration that reads agent code from files or accepts GitHub links | Agent code exceeds 100 lines |
| Simulation state (ST-006 12-round game) stored entirely in React state | Fast and simple for solo student, breaks if extended to multiplayer or replay features | Consider state management library or export/import state snapshots | Not an issue for current scope — flag for future |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Assuming students understand agent terminology (ReAct, planning loop, tool use) | Confusion, disengagement when ST-004 uses unfamiliar terms without definition | Glossary panel in artifacts, hover-to-define in MCP tool output, terminology primer in WHAT sections |
| Overloading artifacts with multiple interactive modes (edit mode, analysis mode, simulation mode, export mode) | Cognitive overload, students miss key features buried in mode switches | One primary interaction per artifact — ST-004: build CLD, ST-005: score interventions, ST-006: play decision game |
| Practice exercises require setting up complex agent environments | Students skip practice because setup friction too high | Provide Replit templates, codesandbox links, or simplified pseudo-agent formats for practice |
| No visual distinction between "foundational" (ST-001/002/003) and "applied" (ST-004/005/006) cubelets | Students expect same difficulty/time, get frustrated when applied cubelets are harder | Badge or label in artifact UI: "Applied" track, adjust time estimates, add difficulty indicators |
| MCP tool output uses technical jargon (graph traversal, polarity products, Meadows Level 6.2) | Students trust tool less because output feels opaque | Plain language output with optional "Show technical details" expansion |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **ST-004 Artifact:** Often missing concrete agent examples — verify artifact includes at least 2 pre-loaded agent architectures students can explore before building their own
- [ ] **ST-005 MCP Tool:** Often missing agent-specific Meadows level mappings — verify tool knows that "add tool to stack" is Level 1, "redesign tool selection logic" is Level 6, "change agent goal structure" is Level 10
- [ ] **ST-006 Decision Game:** Often missing erosion visualization — verify gauges/sparklines show B1 rising, B2 capacity declining, symptom recurring
- [ ] **All Artifacts:** Often missing prerequisite refresher panels — verify each ST-004/005/006 artifact includes 30-second reminder of which earlier cubelet introduced prerequisite concepts
- [ ] **All MCP Tools:** Often missing graceful degradation for incomplete inputs — verify tools provide useful output even when student can't provide full agent execution context
- [ ] **All Skills:** Often missing example invocations in SKILL.md — verify each skill includes 2-3 realistic prompt examples that trigger the workflow
- [ ] **Prerequisite Chain:** Often missing updates for new cubelets — verify `prerequisite-chain.md` maps ST-004/005/006 dependencies and updates deliverable stack table
- [ ] **Course Syllabus:** Often missing Week 3 section — verify `course-syllabus.md` includes ST-004/005/006 with learning objectives, deliverables, practice exercises matching ST-001/002/003 format

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Abstraction Inversion (Pitfall 1) | MEDIUM | Add ST-004a prerequisite cubelet with agent fundamentals, OR add 5-minute hands-on agent warmup to ST-004 APPLY section |
| Complexity Cliff (Pitfall 2) | LOW | Scope reduction: focus each cubelet on ONE framework application, extend time budget from 8min to 12min, provide reference architectures |
| False Prerequisite Chain (Pitfall 3) | LOW | Add 2-minute control flow primer to ST-005 WHAT section, include annotated control flow diagrams in worked examples |
| Archetype Misapplication (Pitfall 4) | MEDIUM | Add boundaries section to ST-006 WHAT ("When this archetype applies / doesn't apply"), provide counter-examples, tune MCP tool to detect non-matches |
| Deliverable Stack Mismatch (Pitfall 5) | HIGH | Shift complex functionality from MCP tools to artifacts, OR provide canonical example architectures as default tool inputs, OR accept simplified text-based agent representations |
| Aesthetic Drift (Pitfall 6) | MEDIUM | Document expanded visual vocabulary, build shared component library for agent primitives, conduct design review before artifact deployment |
| Integration Discontinuity (Pitfall 7) | LOW | Add explicit prerequisite callbacks to WHAT sections, include refresher panels in artifacts, update skills with prerequisite check step |
| Assumed Agent Maturity (Pitfall 8) | MEDIUM | Collect 3-4 production case studies, add persona-specific APPLY variants, ensure simulation provides visceral experience for students without production background |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Abstraction Inversion | Phase 1 (Requirements) | Prerequisite chain explicitly states "hands-on agent experience" checkpoint before ST-004 |
| Complexity Cliff | Phase 2 (Content Design) | Beta tester completion time measured, cognitive load survey shows acceptable scores |
| False Prerequisite Chain | Phase 1 (Requirements) + Phase 2 (Content Design) | ST-004 content includes agent control flow coverage, ST-005 builds on it |
| Archetype Misapplication | Phase 2 (Content Design) | ST-006 includes archetype boundaries section, counter-examples documented |
| Deliverable Stack Mismatch | Phase 3 (MCP Tool Development) | Tool input prototyped with beta testers, simplified input mode validated |
| Aesthetic Drift | Phase 2 (Content Design) + Phase 4 (Artifact Development) | Visual vocabulary documented, component library built before artifacts |
| Integration Discontinuity | Phase 2 (Content Design) | Every new concept mapped to prerequisite cubelet, callbacks written |
| Assumed Agent Maturity | Phase 2 (Content Design) | Production case studies collected, persona-specific entry points written |

## Sources

**Pedagogical Research (Knowledge Base):**
- Cognitive Load Theory (Sweller) — applied to complexity cliff analysis
- Constructivist learning theory — abstraction requires concrete experience first
- Spaced repetition and prerequisite activation — integration discontinuity prevention
- Educational scaffolding patterns — progressive complexity in multi-domain synthesis

**Educational Design Patterns (Knowledge Base):**
- Worked examples vs. problem-solving practice balance
- Chunking complex information across time
- Prerequisite chain validation methods
- Persona-specific instructional design

**Systems Thinking Pedagogy (Knowledge Base):**
- System archetypes catalog (Senge, "The Fifth Discipline")
- Meadows' leverage points framework
- CLD construction best practices
- Common misconceptions when teaching feedback loops

**Agent Development Practices (Knowledge Base):**
- ReAct pattern (Yao et al.)
- Multi-agent orchestration patterns
- Tool use and error handling in LLM agents
- Agent debugging and observability challenges

**Course Context (Primary Sources):**
- PROJECT.md — existing course structure, quality gates, three-layer deliverable stack
- prerequisite-chain.md — validated learning path through ST-001/002/003
- course-syllabus.md — existing cubelet format, scoring rubric
- ST-001-reinforcing-feedback-loops.md — example of successful intermediate cubelet structure

**Limitations:**
- MEDIUM confidence overall — unable to verify with current pedagogical research (WebSearch unavailable)
- Agent education best practices based on knowledge cutoff (January 2025) — may miss 2026 developments
- No direct access to student feedback from ST-001/002/003 deployment — pitfalls inferred from course structure
- Production automation case studies would benefit from practitioner interviews (not conducted)

---

*Pitfalls research for: AI for Systems Thinking — v1.1 Agentic Systems Design milestone*
*Researched: 2026-03-21*
*Next: Validate critical pitfalls (1, 2, 5, 8) with beta testers before Phase 2 content design*
