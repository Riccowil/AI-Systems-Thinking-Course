---
title: "AI for Systems Thinking — Course Syllabus"
author: Ricco Wilson
organization: Wilson Consulting Unlimited
program: Divergence Academy — Intelligent Automation Immersive
team: B
date: 2026-03-17
updated: 2026-03-21
status: Active
---

# AI for Systems Thinking — Course Syllabus

## Course Overview

This course teaches systems thinking through an AI lens, using modular "Cubelets" as knowledge units. Each cubelet covers one concept across six faces (WHAT, WHY, HOW, WHERE, WHEN, APPLY) and is supported by three deliverable types: Interactive Artifacts for hands-on learning, MCP Tools for programmatic analysis, and Claude Skills for on-demand guided workflows.

**Total cubelets:** 9 (3 foundational + 3 intermediate + 3 advanced)
**Total deliverables:** 27 (9 artifacts + 9 MCP tools + 9 skills)
**Quality gate:** v1.0 cubelets scored 52-53/60 (87-88%), all PASS. v1.1 cubelets PENDING.

---

## Week 1: Foundations of Systems Thinking + AI

**Theme:** Build the mental models needed to see businesses as systems, place AI at high-leverage points, and redesign workflows for system-level outcomes.

### Lesson 1.1 — What Is Systems Thinking? (W1-C1)

**Concept:** Systems Thinking Fundamentals
**Difficulty:** Foundational | **Time:** ~10 minutes | **Score:** 53/60

**Learning objectives:**
- Define systems thinking and distinguish it from linear cause-and-effect analysis
- Identify stocks, flows, variables, and delays in a business system
- Map causal relationships and identify feedback loops
- Predict system behavior based on loop structure

**Deliverables:**
- Interactive Artifact: `systems-thinking-fundamentals.jsx` — System Explorer where students build system diagrams and see dynamics animate over time
- MCP Tool: `analyze_system_map` — Validates system maps, detects loops, assesses structural health
- Claude Skill: `system-map-explorer.skill` — Guided 6-step workflow for building and analyzing system maps

**Practice exercise:** Pick one recurring problem in a business you know. Draw a causal loop diagram with at least 6 variables, 1 reinforcing loop, 1 balancing loop, and 1 explicit delay.

---

### Lesson 1.2 — Where AI Fits in Your Business System (W1-C2)

**Concept:** AI as a System Lever
**Difficulty:** Foundational | **Time:** ~10 minutes | **Score:** 53/60
**Prerequisite:** W1-C1

**Learning objectives:**
- Classify AI interventions as prediction, automation, or decision support
- Identify the system bottleneck in a business workflow
- Apply the turbocharger analogy to evaluate AI placement quality
- Design controls (human-in-the-loop, monitoring, escalation) for AI steps

**Deliverables:**
- Interactive Artifact: `ai-system-lever.jsx` — AI Placement Workbench where students drag-drop AI interventions onto workflow nodes and see system impact
- MCP Tool: `find_ai_leverage` — Scores AI placements against bottleneck alignment, automation potential, error reduction, and throughput
- Claude Skill: `ai-leverage-finder.skill` — Guided 6-step workflow for finding optimal AI placement

**Practice exercise:** Pick one business workflow. Identify 3 candidate AI leverage points and label each as prediction, automation, or decision support. Write a 1-sentence hypothesis for system impact per point.

---

### Lesson 1.3 — The SMB AI Mindset Shift (W1-C3)

**Concept:** SMB AI Mindset Shift (Tool Buying -> System Redesign)
**Difficulty:** Foundational | **Time:** ~10 minutes | **Score:** 52/60
**Prerequisites:** W1-C1, W1-C2

**Learning objectives:**
- Distinguish tool-first (bolt-on) from AI-first (system redesign) approaches
- Detect the Faster Oven antipattern and approval bottleneck trap
- Redesign a workflow with AI roles, quality standards, and escalation paths
- Measure outcomes (cycle time, throughput, quality) instead of activity (items generated)

**Deliverables:**
- Interactive Artifact: `smb-mindset-shift.jsx` — Workflow Redesign Simulator with side-by-side Tool-First vs AI-First comparison
- MCP Tool: `analyze_workflow_redesign` — Compares current vs redesigned workflows, detects antipatterns, scores redesign quality
- Claude Skill: `workflow-redesigner.skill` — Guided 6-step workflow for AI-first SOP creation

**Practice exercise:** Select one workflow you own. Redesign it AI-first and write the new SOP in 10 bullet points, including: where AI acts, where humans check, and how exceptions escalate.

---

## Week 2+: Applied Systems Thinking (Intermediate)

**Theme:** Apply systems thinking tools to real AI operations problems using formal frameworks for feedback loop analysis, leverage point identification, and archetype detection.

### Lesson 2.1 — Reinforcing Feedback Loops (ST-001)

**Concept:** Reinforcing Feedback Loops
**Difficulty:** Intermediate | **Time:** ~8 minutes | **Score:** 53/60
**Prerequisite:** W1-C1

**Learning objectives:**
- Construct causal loop diagrams (CLDs) from system descriptions
- Apply the polarity rule to classify loops (even negatives = reinforcing)
- Calculate loop gain from coupling strengths
- Identify the highest-leverage link for intervention

**Deliverables:**
- Interactive Artifact: `feedback-loop-builder.jsx` — Canvas-based CLD builder with real-time loop detection, polarity classification, and pulse animations
- MCP Tool: `score_reinforcing_loops` — Graph traversal to find, classify, and score all feedback loops with per-variable participation
- Claude Skill: `reinforcing-loop-mapper.skill` — 7-step guided workflow from runaway variable to intervention recommendation

**Worked example:** AI Operations Cost Spiral — Agent Complexity -> Token Usage -> AI Spend -> Team Scaling Pressure. Intervention: prompt caching at Token Usage link for projected 55% cost reduction.

---

### Lesson 2.2 — Leverage Points in Complex Systems (ST-002)

**Concept:** Leverage Points in Complex Systems
**Difficulty:** Intermediate | **Time:** ~8 minutes | **Score:** 53/60
**Prerequisites:** W1-C2, ST-001

**Learning objectives:**
- Apply Meadows' 12-level hierarchy to classify interventions
- Distinguish parameter tweaks (Levels 1-4) from structural changes (Levels 5-7) from paradigm shifts (Levels 8-12)
- Compute composite leverage scores weighting structural depth and node connectivity
- Recognize the 10x ROI variance between parameter and structural interventions

**Deliverables:**
- Interactive Artifact: `leverage-point-scorer.jsx` — Analyst's workbench with gamified scoring, Meadows hierarchy sidebar, and Intuition Accuracy measurement
- MCP Tool: `compare_interventions` — Ranked comparison with Meadows classification, structural gap analysis, and composite scoring
- Claude Skill: `leverage-point-analyzer.skill` — 6-step guided workflow for finding and comparing leverage points

**Worked example:** Budget cap (Level 1, parameter) vs. prompt caching + model tiering (Level 6, feedback structure) — both target AI Spend, but structural gap of 5 levels produces 10x ROI variance.

---

### Lesson 2.3 — Shifting the Burden Archetype (ST-003)

**Concept:** Shifting the Burden Archetype
**Difficulty:** Intermediate | **Time:** ~8 minutes | **Score:** 53/60
**Prerequisites:** ST-001, ST-002

**Learning objectives:**
- Map the three-loop archetype: B1 (symptomatic fix), B2 (fundamental solution), R1 (erosion)
- Detect erosion channels and compute risk scores
- Design transition strategies that maintain symptomatic fixes while building fundamental solutions
- Recognize the archetype in technical debt, workaround accumulation, and "we'll fix it properly next sprint" patterns

**Deliverables:**
- Interactive Artifact: `burden-shift-simulator.jsx` — 12-round decision game with live gauges, animated archetype diagram, sparkline trajectories, and end-game grading
- MCP Tool: `detect_burden_shift` — Auto-classifies fixes, maps B1/B2/R1 loops, computes erosion risk (0-100), generates transition strategy
- Claude Skill: `burden-shift-detector.skill` — 8-step guided workflow from recurring symptom to transition plan

**Worked example:** AI-Powered EDI Platform — failed-confidence documents pile up, manual review fixes symptoms but erodes parser improvement capacity. Erosion risk: 78/100 (HIGH).

---

## Week 3: Systems Thinking for AI Agents (Advanced)

**Theme:** Apply systems thinking frameworks to the agentic AI domain -- map agent architectures as feedback systems, analyze tool stacks as dependency networks, and detect automation debt through system archetypes.

**Module title:** Systems Thinking for AI Agents
**Difficulty:** Advanced | **Total time:** ~30 minutes

### Lesson 3.1 — Agent Feedback Loops (ST-004)

**Concept:** Agent Feedback Loops
**Difficulty:** Advanced | **Time:** ~8 minutes | **Score:** PENDING
**Prerequisite:** ST-001

**Learning objectives:**
- Map an agent architecture as a causal loop diagram using agent-specific node vocabulary
- Identify reinforcing and balancing feedback loops within agent control flows
- Score loop severity and predict runaway behavior (retry storms, cost spirals)
- Design interventions to break harmful agent feedback loops

**Deliverables:**
- Interactive Artifact: `agent-feedback-mapper.jsx` — Agent CLD Builder with agent-specific nodes (agent, tool, memory, evaluator, constraint), auto-detected feedback loops, and severity scoring
- MCP Tool: `analyze_agent_feedback_loops` — Accepts agent components and links, returns loop classification (R1, R2, B1, B2) with severity scores
- Claude Skill: `agent-feedback-analyzer.skill` — Guides multi-step workflow for mapping and analyzing agent architecture feedback loops

**Worked example:** Retry Storm — Agent routes request > Tool fails > Agent retries > Rate limit triggers > Timeout increases > Agent retries harder. Reinforcing loop with severity score and intervention recommendation.

**Practice exercise:** Choose an AI agent system you use or are building. Map 3+ agent components (agents, tools, memory) as nodes, draw causal links between them, and identify at least one feedback loop. Is it reinforcing or balancing? What happens if it runs unchecked?

---

### Lesson 3.2 — Tool Orchestration as System Design (ST-005)

**Concept:** Tool Orchestration as System Design
**Difficulty:** Advanced | **Time:** ~12 minutes | **Score:** PENDING
**Prerequisites:** ST-002, ST-004

**Learning objectives:**
- Input MCP tools and their dependencies to build a tool stack dependency graph
- Identify redundancy, coupling, and blast radius across a tool stack
- Score tool interventions (add, remove, refactor) using Meadows hierarchy
- Evaluate tool stack health using complexity, redundancy, and brittleness metrics

**Deliverables:**
- Interactive Artifact: `tool-orchestration-scorer.jsx` — Tool Stack Analyzer with dependency graph, health scoring, and Meadows-based intervention ranking
- MCP Tool: `analyze_tool_orchestration` — Accepts tool list, dependencies, and interventions, returns health scores and refactor recommendations
- Claude Skill: `tool-stack-analyzer.skill` — Guides multi-step workflow for auditing and analyzing MCP tool stacks as systems

**Worked example:** Realistic MCP tool stack with 5 interconnected tools showing redundancy in data-fetch tools, high coupling at the router, and blast radius analysis for the central orchestrator.

**Practice exercise:** List 3-5 MCP tools (or API tools) in a stack you use. Map their dependencies. Identify: which tool has the highest blast radius? Score one intervention (adding or removing a tool) on the Meadows hierarchy. Is it a parameter tweak or a structural change?

---

### Lesson 3.3 — Shifting the Burden in Automation (ST-006)

**Concept:** Shifting the Burden in Automation
**Difficulty:** Advanced | **Time:** ~10 minutes | **Score:** PENDING
**Prerequisite:** ST-003

**Learning objectives:**
- Recognize the shifting-the-burden archetype in AI automation contexts
- Play a 12-round scenario-based decision game to experience automation debt accumulation
- Classify automation responses as quick-fix, fundamental investment, or transition strategy
- Design transition plans that maintain symptomatic fixes while building fundamental automation solutions

**Deliverables:**
- Interactive Artifact: `automation-burden-detector.jsx` — Automation Debt Simulator with 3 AI scenarios, 12-round decision game, and post-game debt diagnosis
- MCP Tool: `detect_automation_debt` — Accepts automation layers and fundamental solution, identifies burden shift patterns with B1/B2/R1 loop analysis
- Claude Skill: `automation-debt-detector.skill` — Guides multi-step workflow for detecting and diagnosing automation debt

**Worked example:** Three pre-loaded AI automation scenarios: (1) LLM low-confidence outputs routed to human review, (2) Agent edge-case failures handled by fallback scripts, (3) Tool call latency issues masked by caching layers.

**Practice exercise:** Find one automation in your workflow that started as a "quick fix" and is still running. Map the B1 (symptomatic) and B2 (fundamental) loops. Has the fundamental solution become harder to implement over time? If yes, identify the erosion channel and draft a transition strategy.

---

## Technical Infrastructure

### MCP Servers

| Server | Transport | Tools | Status |
|--------|-----------|-------|--------|
| systems-thinking (base) | Node.js / stdio | create_causal_loop, identify_feedback_loops, find_leverage_points, run_scenario, export_cld_diagram | Deployed |
| systems-thinking-cubelets | Python / stdio | score_reinforcing_loops, compare_interventions, detect_burden_shift, analyze_agent_feedback_loops, analyze_tool_orchestration, detect_automation_debt | Configured (3 existing + 3 pending) |
| week1-foundations | Python / stdio | analyze_system_map, find_ai_leverage, analyze_workflow_redesign | Configured |

### Claude Skills

| Skill | Cubelet | Trigger Phrases |
|-------|---------|-----------------|
| system-map-explorer | W1-C1 | "map this system", "why does this keep happening", "feedback loops" |
| ai-leverage-finder | W1-C2 | "where should I add AI", "bottleneck", "AI placement" |
| workflow-redesigner | W1-C3 | "redesign this workflow", "AI but nothing changed", "approval bottleneck" |
| reinforcing-loop-mapper | ST-001 | "map a feedback loop", "why is X accelerating", "vicious cycle" |
| leverage-point-analyzer | ST-002 | "find leverage", "where should I intervene", "Meadows hierarchy" |
| burden-shift-detector | ST-003 | "is this a workaround", "why does this keep coming back", "technical debt" |
| agent-feedback-analyzer | ST-004 | "map agent loops", "retry storm", "agent feedback" |
| tool-stack-analyzer | ST-005 | "audit my tools", "tool dependencies", "blast radius" |
| automation-debt-detector | ST-006 | "automation debt", "quick fix still running", "burden shift in automation" |

### Interactive Artifacts

All artifacts use the same dark cybernetic blueprint aesthetic (charcoal canvas, teal/amber/pink accents, JetBrains Mono / DM Sans typography). Each renders in Claude's artifact viewer or any React environment.

---

## Assessment

### Per-Cubelet Quality Gate

Each cubelet is scored on 6 faces (1-10 each):
- **Minimum per face:** 6/10
- **Minimum aggregate:** 42/60 (70%)
- **Pass threshold:** All faces >= 6 AND aggregate >= 42

### Practice Exercises

Each lesson includes a hands-on practice exercise. Assessment rubrics define "passing" (minimum viable) and "excellent" (stretch goal) criteria.

**Week 3 exercises** follow the "Apply to YOUR agent stack" pattern -- students analyze their own agent systems, tool stacks, and automation workflows rather than hypothetical examples.

### Course Completion

Students who complete all 9 cubelets with passing quality gate scores and submit practice exercises for at least 6 of 9 lessons earn course completion.
