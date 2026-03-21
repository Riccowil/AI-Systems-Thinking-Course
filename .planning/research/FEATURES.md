# Feature Research — Agentic Systems Thinking Cubelets

**Domain:** Educational interactive artifacts for AI agent system design
**Researched:** 2026-03-21
**Confidence:** MEDIUM (based on existing cubelet patterns + training data on agentic systems; no web verification available)

## Feature Landscape

### Table Stakes (Users Expect These)

Features students assume exist based on established cubelet pattern (ST-001, ST-002, ST-003).

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Visual CLD canvas for agent architectures | Students saw it in ST-001, expect same affordance for agent systems | MEDIUM | Reuse feedback-loop-builder structure but with agent-specific node types (agent, tool, data source, retry logic, etc.) |
| Interactive scoring/analysis mechanism | ST-001 has loop detection, ST-002 has leverage scoring, ST-003 has simulation — pattern requires interactive analysis | MEDIUM | Must provide immediate feedback on student's mental model vs. algorithmic analysis |
| Worked example from real AI ops context | All prior cubelets loaded real examples (AI Ops loop, EDI platform) — students expect domain relevance | LOW | Pre-populate with recognizable patterns: retry storms, cost spirals, quality degradation |
| Three-layer deliverable (Artifact + MCP + Skill) | Non-negotiable per PROJECT.md requirements | HIGH | Each cubelet produces JSX artifact, Python MCP tool, .skill file |
| Dark cybernetic aesthetic consistency | Established brand across all 6 existing cubelets | LOW | Reuse color palette (charcoal, teal, amber, pink), JetBrains Mono, DM Sans |
| Right panel instrumentation | All existing cubelets have right-side analysis/metrics panel | LOW | Display loop metrics, leverage rankings, or debt accumulation scores |
| Tutorial overlay on empty canvas | ST-001 and ST-003 show contextual help when no data present | LOW | "Map your agent's retry loop" or "Identify tool redundancy" prompts |
| Progressive disclosure (landing → input → reveal) | ST-002 pattern: students score first, then reveal analysis | MEDIUM | Prevents passive consumption; forces active prediction before feedback |

### Differentiators (Competitive Advantage)

Features that set these cubelets apart from generic systems thinking education — the "AI lens" that makes systems thinking actionable for agent builders.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Agent-specific node vocabulary in CLD builder | Generic CLD tools don't know "retry logic," "context window," "tool call," "embedding cache" — these cubelets do | MEDIUM | ST-004: Pre-populate node palette with agent architecture primitives; students map real architectures faster |
| Cost/latency/quality tradeoff visualization | Generic systems thinking misses the AI ops triangle — these cubelets surface it explicitly | HIGH | Show how feedback loops create spirals in all 3 dimensions simultaneously; unique to AI domain |
| MCP tool stack complexity scoring | No existing tool analyzes MCP server composition for redundancy, coupling, or blast radius | HIGH | ST-005: Algorithm scores tool overlap, dependency depth, failure cascade risk — actionable for tool stack refactoring |
| Automation debt detection heuristics | "Shifting the burden" archetype is taught generically — applying it to AI automation with specific erosion channels (training data loss, context degradation, prompt drift) is novel | MEDIUM | ST-006: Scenario library specific to AI automation anti-patterns |
| Live agent execution trace import | Students paste LangGraph trace JSON, artifact auto-generates CLD from actual execution | HIGH | Bridges theory to practice — "your agent right now" not "hypothetical system" |
| Comparison mode: before/after refactor | Load two CLDs (current vs. proposed architecture), diff the feedback loops and leverage points | MEDIUM | Answers "will this refactor actually help?" with systems analysis |
| Token/cost calculator integration | When student identifies reinforcing loop involving token usage, artifact estimates $ impact at scale | MEDIUM | Makes abstract "growth" concrete: "this loop costs $2,400/mo at 10K users" |
| Archetype pattern library for agents | Pre-built templates: "Retry Storm," "Cache Invalidation Cascade," "Context Window Bloat," "Tool Call Explosion" | MEDIUM | Students match observed behavior to known archetype, accelerating diagnosis |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems or dilute learning outcomes.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-generate CLD from codebase | "Just analyze my repo and build the diagram for me" — sounds efficient | Eliminates the learning. Drawing the CLD IS the pedagogy. Students must externalize their mental model to discover what they don't understand. | Offer "import trace" for single execution, not whole codebase. Keep human in the loop. |
| Real-time multi-user collaboration | "We want teams to build CLDs together like Figma" | Adds auth, sync, conflict resolution complexity with zero pedagogical benefit. Cubelets are individual learning tools, not team workspaces. | Export/import JSON so students can share diagrams asynchronously. No live collab. |
| LLM chat interface for analysis | "Why not let students ask Claude about their diagram?" | Moves locus of analysis from student's brain to LLM. The artifact's job is to scaffold thinking, not replace it. | Keep analysis deterministic and algorithmic. Explanation text can be rich, but no free-form chat. |
| Video walkthroughs embedded in artifact | "Students want video tutorials in the UI" | Bloats artifact, competes with attention, creates maintenance burden (videos go stale). | Link to external video in cubelet README. Keep artifact focused on interaction, not content delivery. |
| Gamification (points, badges, leaderboards) | "Make it more engaging with XP and achievements" | Extrinsic motivation crowds out intrinsic. Systems thinking rewards are insight and capability, not badges. Leaderboards create perverse incentives (game the scoring vs. learn the concept). | Accuracy score (ST-002 pattern) is sufficient feedback. Grade at end of simulation (ST-003 pattern) is sufficient closure. |
| LMS integration (SCORM export, gradebook sync) | "Students want credit for completing these" | Out of scope per PROJECT.md. Adds complexity, breaks standalone model. Course is immersive/intensive, not traditional LMS. | Cubelets are self-contained. Facilitator observes participation live, no automated grading needed. |

## Feature Dependencies

```
[Interactive CLD Canvas]
    └──requires──> [Node Vocabulary] (agent-specific primitives)
    └──requires──> [Loop Detection Algorithm]
    └──enhances──> [Cost Calculator] (optional layer)

[Progressive Disclosure Pattern]
    └──requires──> [Scoring Input UI]
    └──requires──> [Reveal Mechanism]
    └──conflicts──> [Auto-Analysis] (anti-feature)

[Live Trace Import]
    └──requires──> [LangGraph JSON Parser]
    └──requires──> [CLD Canvas]
    └──enhances──> [Worked Example] (supplement, not replace)

[MCP Tool Stack Scoring]
    └──requires──> [MCP Server Metadata]
    └──requires──> [Dependency Graph Algorithm]
    └──enhances──> [Comparison Mode]

[Three-Layer Deliverable]
    └──requires──> [Interactive Artifact] (JSX)
    └──requires──> [MCP Tool] (Python)
    └──requires──> [Claude Skill] (.skill file)
    — ALL required per PROJECT.md constraint
```

### Dependency Notes

- **Interactive CLD Canvas requires Node Vocabulary:** ST-004 needs domain-specific node types (agent, tool, prompt, cache, etc.) not just generic "Variable 1." This makes CLDs readable and actionable.
- **Progressive Disclosure requires Scoring Input:** ST-002 pattern proven effective — student predicts leverage, then sees algorithmic score. Creates "aha" moment. Must preserve this sequence.
- **Live Trace Import enhances Worked Example:** Don't replace curated examples with trace import. Trace is supplemental — students should start with known-good example, then import their own traces for practice.
- **MCP Tool Stack Scoring requires Dependency Graph Algorithm:** ST-005 needs graph analysis to detect tool redundancy (two tools doing same job), coupling (tool A always calls tool B), and blast radius (tool C failure cascades where?). Non-trivial but implementable.
- **Three-Layer Deliverable is non-negotiable:** Every cubelet must ship artifact, MCP tool, and skill. This is a validated requirement from PROJECT.md context.

## Cubelet-Specific Feature Breakdown

### ST-004: Agent Feedback Loops

**Concept:** Apply CLD mapping to agent architectures to surface retry storms, cost spirals, quality degradation loops.

**Interactive behaviors students expect:**
- Click canvas to add nodes (agent components: retry logic, tool calls, context assembly, output validation)
- Connect nodes with +/− polarity to model causal relationships
- Auto-detect closed loops and classify as reinforcing or balancing
- Identify problematic reinforcing loops (e.g., "Failed LLM call → Retry → Token usage → Cost → Budget pressure → Cheaper model → Higher failure rate → More retries")
- Score loop "severity" based on growth rate, cost impact, or quality degradation risk

**Analysis outputs:**
- Loop classification: Reinforcing (R1, R2...) vs. Balancing (B1, B2...)
- Severity score: How fast does this loop amplify? (mild/moderate/severe)
- Intervention recommendations: "Break this loop at the retry logic node (add exponential backoff)" or "Add balancing loop via circuit breaker"
- Cost projection: "At current growth rate, this loop will cost $X/month by Q3"

**What makes it click:**
- **"That's MY agent!"** moment when student maps their own retry storm and sees it classified as a reinforcing loop
- Seeing abstract "exponential growth" become concrete "your API bill doubles every 2 weeks"
- Recognizing that the fix isn't "reduce retries" (treats symptom) but "improve prompt reliability" (breaks loop)

**Complexity:** MEDIUM (reuse ST-001 canvas, add agent-specific vocabulary and cost estimation)

**Dependencies:** Requires ST-001 concepts (loop polarity rule, reinforcing vs. balancing)

---

### ST-005: Tool Orchestration as System Design

**Concept:** Apply leverage point analysis to MCP tool stacks to identify complexity, redundancy, composability failures.

**Interactive behaviors students expect:**
- Input: List of MCP tools in a stack (manually entered or imported from server config)
- For each tool, specify: purpose, inputs, outputs, dependencies (which other tools it calls)
- Artifact builds dependency graph and identifies patterns:
  - **Redundancy:** Tool A and Tool B both do X (consolidation opportunity)
  - **Coupling:** Tool C always calls Tool D (tight coupling risk)
  - **Blast radius:** Tool E failure cascades to 5 other tools
  - **Dead ends:** Tool F produces output no other tool consumes
- Score each tool by leverage (Meadows hierarchy): Is this a parameter tweak (L1) or structural change (L6)?

**Analysis outputs:**
- Tool stack health score: Complexity (# dependencies), Redundancy (# overlaps), Brittleness (blast radius)
- Leverage point ranking: "Refactoring Tool X would impact 7 downstream tools (L6 structural change)"
- Refactor recommendations: "Merge Tool A + Tool B" or "Add caching layer at Tool C to break coupling"
- Comparison mode: "Current stack: 12 tools, 18 dependencies, brittleness score 7.2 → Proposed: 8 tools, 10 dependencies, brittleness 3.1"

**What makes it click:**
- **"I've been building redundant tools!"** realization when artifact shows overlap
- Seeing Meadows hierarchy applied to code: "Adding another tool is a parameter change (L1, low leverage). Refactoring the tool interface is structural (L6, high leverage)."
- Understanding that fewer tools ≠ always better — composability and blast radius matter more

**Complexity:** HIGH (requires dependency graph analysis, Meadows scoring heuristics, comparison diff logic)

**Dependencies:** Requires ST-002 concepts (Meadows hierarchy, leverage point scoring)

---

### ST-006: Shifting the Burden in Automation

**Concept:** Detect automation debt using the archetype — manual workarounds erode fundamental solutions.

**Interactive behaviors students expect:**
- Scenario-based simulation (like ST-003 burden shift game)
- Pre-loaded scenarios specific to AI automation:
  - **Scenario 1:** LLM produces low-confidence outputs → Quick fix: Human review queue vs. Fundamental: Improve prompt architecture + training data pipeline
  - **Scenario 2:** Agent gets stuck in edge cases → Quick fix: Manual intervention Slack channel vs. Fundamental: Build structured error recovery + logging
  - **Scenario 3:** Tool calls too slow → Quick fix: Increase timeout limits vs. Fundamental: Optimize tool implementation + add caching
- Each round, student chooses: Apply quick fix, invest in fundamental, run transition strategy, or do nothing
- System tracks: Problem severity, Fundamental solution capacity, Dependency on quick fix, Team willingness to invest

**Analysis outputs:**
- Grade (A–F) based on final system state
- Erosion channel diagnosis: "Your quick fix (human review queue) prevented training data collection, eroding the ML model's ability to self-improve"
- Debt accumulation chart: Shows how quick fixes compound over time
- Archetype breakdown: "B1 (quick fix): Applied 7 times. B2 (fundamental): Applied 2 times. R1 (erosion): Fundamental capacity dropped 60%."

**What makes it click:**
- **"We've been doing this for 6 months"** recognition when scenario mirrors student's real work
- Seeing the hidden cost: Quick fix works today but makes the real solution harder/impossible later
- Understanding transition strategy: "Keep the Slack channel while building the error recovery system, then sunset the channel"

**Complexity:** MEDIUM (reuse ST-003 simulation engine, replace scenarios with AI automation contexts)

**Dependencies:** Requires ST-003 concepts (shifting the burden archetype, transition strategy)

## MVP Definition

### Launch With (v1.1)

Minimum viable cubelets to validate "systems thinking for agentic AI" pedagogy.

- [x] **ST-004 Interactive Artifact:** Agent feedback loop canvas with worked example (retry storm), loop detection, severity scoring — validates "students can map their own agent architectures"
- [x] **ST-004 MCP Tool:** `analyze_agent_feedback_loops` — accepts agent architecture as variables + links, returns reinforcing loops with severity scores — validates "MCP tools extend classroom learning"
- [x] **ST-004 Claude Skill:** `.skill` package for invoking ST-004 MCP tool via natural language — validates "skills make tools accessible"
- [x] **ST-005 Interactive Artifact:** Tool stack analyzer with dependency graph, redundancy detection, leverage scoring — validates "students can audit their MCP stacks"
- [x] **ST-005 MCP Tool:** `analyze_tool_orchestration` — accepts tool list + dependencies, returns health scores + refactor recommendations — validates "tool stack complexity is measurable"
- [x] **ST-005 Claude Skill:** `.skill` package for tool stack analysis — validates integration
- [x] **ST-006 Interactive Artifact:** Automation debt simulator with 3 AI-specific scenarios, 12-round decision game — validates "students recognize automation debt in their work"
- [x] **ST-006 MCP Tool:** `detect_automation_debt` — accepts workflow description + history, identifies burden shift patterns — validates "debt detection is codifiable"
- [x] **ST-006 Claude Skill:** `.skill` package for debt detection — validates integration

### Add After Validation (v1.2+)

Features to add once core cubelets are proven effective in classroom.

- [ ] **Live trace import for ST-004** — Students paste LangGraph execution trace, artifact auto-populates CLD — trigger: Students request "I want to analyze my actual agent, not the example"
- [ ] **Cost calculator overlay for ST-004** — When loop detected, estimate $/month at scale — trigger: Students ask "how much does this retry storm actually cost?"
- [ ] **Comparison mode for ST-005** — Load two tool stacks, diff the dependency graphs and scores — trigger: Students want to validate refactor plans
- [ ] **Custom scenario builder for ST-006** — Students define their own automation debt scenario with symptom/fix/erosion — trigger: Students say "we have a different version of this at work"
- [ ] **Archetype pattern library** — Pre-built CLD templates for common agent anti-patterns (cache invalidation cascade, context bloat, tool explosion) — trigger: Students repeat same patterns, need faster onboarding

### Future Consideration (v2.0+)

Features to defer until product-market fit established and Week 3 content validated.

- [ ] **Multi-agent system modeling** — Extend ST-004 to model interactions between multiple agents, not just one agent's internal loops — why defer: Adds significant complexity, unclear if immersive students are building multi-agent yet
- [ ] **Continuous monitoring integration** — ST-004 connects to live agent telemetry (DataDog, LangSmith) and alerts on new feedback loops — why defer: Requires production infrastructure, out of scope for classroom learning
- [ ] **Tool marketplace scoring** — ST-005 analyzes public MCP servers (mcp.run) and rates them by leverage/brittleness — why defer: Dependent on MCP ecosystem maturity, not critical for learning
- [ ] **Debt accumulation tracking over time** — ST-006 persists student decisions across weeks to show long-term consequences — why defer: Requires persistence layer, session management, more infrastructure than pedagogical value

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Agent-specific CLD canvas (ST-004) | HIGH | MEDIUM | P1 |
| Loop severity scoring (ST-004) | HIGH | MEDIUM | P1 |
| Tool stack dependency graph (ST-005) | HIGH | HIGH | P1 |
| Leverage point scoring for tools (ST-005) | HIGH | MEDIUM | P1 |
| Automation debt scenarios (ST-006) | HIGH | MEDIUM | P1 |
| Debt accumulation visualization (ST-006) | HIGH | LOW | P1 |
| Live trace import | MEDIUM | HIGH | P2 |
| Cost calculator overlay | MEDIUM | MEDIUM | P2 |
| Comparison mode for tool stacks | MEDIUM | MEDIUM | P2 |
| Custom scenario builder | MEDIUM | MEDIUM | P2 |
| Archetype pattern library | LOW | MEDIUM | P2 |
| Multi-agent system modeling | LOW | HIGH | P3 |
| Continuous monitoring integration | LOW | HIGH | P3 |
| Tool marketplace scoring | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v1.1 launch (Week 3 initial release)
- P2: Should have when students request (v1.2+)
- P3: Nice to have, future consideration (v2.0+)

## Learning Outcome Validation

Each cubelet must produce measurable learning outcomes aligned with "systems thinking for agentic AI" pedagogy.

### ST-004: Agent Feedback Loops

**Target outcome:** Student can identify reinforcing loops in agent architectures and predict their behavior before deployment.

**Evidence of learning:**
- Student maps their own agent architecture (not just the example) and correctly identifies ≥1 reinforcing loop
- Student predicts loop behavior ("this will cause retry storms") before simulation confirms it
- Student proposes intervention at correct node ("add circuit breaker at retry logic, not just increase timeout")

**Assessment method:** Artifact tracks student's scoring vs. algorithmic scoring (like ST-002 accuracy score). ≥70% accuracy = learning objective met.

---

### ST-005: Tool Orchestration as System Design

**Target outcome:** Student can analyze MCP tool stack complexity and identify high-leverage refactoring opportunities.

**Evidence of learning:**
- Student correctly identifies redundant tools (overlap in purpose/inputs/outputs)
- Student applies Meadows hierarchy to tool stack decisions ("this is a parameter change, not structural")
- Student prioritizes refactors by leverage point score, not gut feel

**Assessment method:** Comparison mode — student proposes refactor, artifact scores before/after complexity. Refactor must reduce complexity AND increase leverage to pass.

---

### ST-006: Shifting the Burden in Automation

**Target outcome:** Student recognizes automation debt patterns and chooses transition strategies over pure quick fixes.

**Evidence of learning:**
- Student achieves Grade B+ or better in simulation (indicates strategic use of transition strategy)
- Student articulates erosion channel ("quick fix prevents X, which degrades fundamental solution Y")
- Student applies archetype to real work ("we've been doing this — Slack channel is our quick fix, ML training pipeline is the fundamental solution we're not funding")

**Assessment method:** Post-simulation reflection prompt — "Describe a burden shift pattern in your current work and propose a transition strategy." Facilitator assesses for archetype application.

## Sources

**Pattern analysis:**
- Existing cubelets (ST-001, ST-002, ST-003) analyzed for interaction patterns, visual language, pedagogical structure
- PROJECT.md requirements (three-layer deliverable, cubelet format, quality gates)

**Domain knowledge (training data, LOW confidence where noted):**
- Agent feedback loops: Training data on LangGraph retry logic, token usage patterns, cost spirals (LOW confidence — not verified with current LangGraph docs)
- MCP tool orchestration: Training data on tool composition patterns, dependency management (MEDIUM confidence — MCP spec is recent, patterns emerging)
- Automation debt: Training data on technical debt in ML systems, "Shifting the Burden" archetype application (HIGH confidence — well-established systems thinking concept)

**Verification needed:**
- LangGraph execution trace format (for live import feature)
- MCP server metadata standards (for tool stack analysis)
- Current AI ops cost benchmarks (for cost calculator estimates)

---
*Feature research for: Agentic Systems Thinking Cubelets (ST-004, ST-005, ST-006)*
*Researched: 2026-03-21*
*Confidence: MEDIUM — based on existing cubelet patterns (validated) + agent systems domain knowledge (training data, unverified)*
