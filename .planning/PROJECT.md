# AI for Systems Thinking — Course Factory

## What This Is

A modular course for Divergence Academy's Intelligent Automation Immersive that teaches systems thinking through an AI lens. Each concept is packaged as a "cubelet" — a structured knowledge unit with six faces (WHAT, WHY, HOW, WHERE, WHEN, APPLY) — and delivered through three layers: Interactive Artifacts (React JSX), MCP Tools (Python servers), and Claude Skills (.skill packages). Now covers 9 cubelets across 3 weeks (Foundations, Intermediate, Agentic Systems Design), totaling 85 minutes of interactive content. Built by Ricco Wilson for Team B.

## Core Value

Every cubelet ships three usable deliverables — an interactive artifact students can touch, an MCP tool they can call, and a Claude skill they can invoke — so learning is always hands-on, never passive.

## Requirements

### Validated

<!-- Shipped and confirmed valuable in v1.0 + v1.1. -->

- [x] **FOUND-01**: Student can explore systems thinking fundamentals via interactive CLD builder (W1-C1) — v1.0
- [x] **FOUND-02**: Student can identify AI leverage points in business workflows (W1-C2) — v1.0
- [x] **FOUND-03**: Student can redesign workflows with AI-first mindset (W1-C3) — v1.0
- [x] **INTER-01**: Student can map and score reinforcing feedback loops (ST-001) — v1.0
- [x] **INTER-02**: Student can compare interventions using Meadows' hierarchy (ST-002) — v1.0
- [x] **INTER-03**: Student can detect shifting-the-burden archetypes (ST-003) — v1.0
- [x] **INFRA-01**: Preview app deployed to Vercel with tabbed interface — v1.0
- [x] **INFRA-02**: MCP servers running in Claude Desktop + CLI — v1.0
- [x] **INFRA-03**: Claude skills installed and functional — v1.0
- [x] **INFRA-04**: Quality gate system — all cubelets scored and PASS — v1.0
- [x] **AGENT-01**: Student can map agent architectures as CLDs with agent-specific node vocabulary and auto-detected feedback loops (ST-004) — v1.1
- [x] **AGENT-02**: Student can analyze MCP tool stacks with dependency graphs, health scoring, and Meadows-level intervention comparison (ST-005) — v1.1
- [x] **AGENT-03**: Student can detect automation debt through 12-round scenario simulation with shifting-the-burden archetype (ST-006) — v1.1
- [x] **AGENT-04**: 3 new MCP tools compose with existing tools (AgentLink wraps CausalLink, AutomationLayer wraps FixRecord) — v1.1
- [x] **AGENT-05**: 9 cubelets deployed to Vercel with consistent dark cybernetic aesthetic — v1.1
- [x] **AGENT-06**: Course syllabus updated with Week 3 module, prerequisite chain covers all 9 cubelets — v1.1

### Active

<!-- v1.2 scope — Polish & Deferred Features -->

- [ ] **ENHANCE-01**: Student can import live agent execution traces into ST-004 feedback loop builder
- [ ] **ENHANCE-02**: Student can view cost impact overlay on agent feedback loop analysis (ST-004)
- [ ] **ENHANCE-03**: Student can compare two tool stack configurations side-by-side (ST-005)
- [ ] **ENHANCE-04**: Student can build custom automation debt scenarios with editable parameters (ST-006)
- [ ] **ENHANCE-05**: Student can browse a library of common system archetype patterns across cubelets
- [ ] **TECH-01**: Fix 9 vitest Wave 0 stubs for ST-005 (replace with real assertions)
- [ ] **TECH-02**: Update master-syllabus.json quality_gate to COMPLETE
- [ ] **TECH-03**: Expand ST-004 primer panel to match ST-005's depth
- [ ] **TECH-04**: Fix ST-003 prerequisite inconsistency between reference files

### Out of Scope

- Video lectures — Cubelets are interactive-first, not lecture-first
- LMS integration — Standalone delivery via Vercel + Claude, not Moodle/Canvas
- Student auth/accounts — No login system; open access artifacts
- Grading automation — Quality gates are author-side, not student-side
- Auto-generate CLD from codebase — Drawing the CLD IS the pedagogy
- Real-time multi-user collaboration — Auth/sync complexity with zero pedagogical benefit
- Multi-agent system modeling — Adds significant complexity, unclear if students build multi-agent yet

## Context

- **Program**: Divergence Academy — Intelligent Automation Immersive
- **Team**: B
- **Aesthetic**: Dark cybernetic blueprint (charcoal canvas, teal/amber/pink/violet accents, JetBrains Mono / DM Sans)
- **Cubelet format**: 6 faces (WHAT, WHY, HOW, WHERE, WHEN, APPLY), scored 1-10 each, min 6/face, min 42/60 aggregate
- **Three-layer deliverable stack**: Interactive Artifact (JSX) + MCP Tool (Python) + Claude Skill (.skill)
- **MCP server**: `systems-thinking-cubelets` (6 tools: score_reinforcing_loops, compare_interventions, detect_burden_shift, analyze_agent_feedback_loops, analyze_tool_orchestration, detect_automation_debt)
- **Other MCP servers**: `week1-foundations` (3 tools), `systems-thinking` base (5 tools)
- **Deployment**: https://preview-app-two.vercel.app (Vite React app, 9 tabs)
- **Course progression**: W1-C1 → W1-C2 → W1-C3 → ST-001 → ST-002 → ST-003 → ST-004 → ST-005 → ST-006
- **Total time**: 85 minutes across 9 cubelets (Week 1: 25 min, Week 2: 30 min, Week 3: 30 min)
- **Quality scores**: W1 cubelets 52-53/60, ST-001/002/003 53/60, ST-004 50/60, ST-005 48/60, ST-006 54/60

## Constraints

- **Cubelet format**: Every new concept must follow the 6-face structure and quality gate — non-negotiable
- **Three-layer stack**: Each cubelet produces exactly 3 deliverables (artifact + MCP tool + skill)
- **Aesthetic consistency**: New artifacts must match the dark cybernetic blueprint theme
- **Prerequisite chain**: New cubelets must specify prerequisites from existing chain
- **MCP server organization**: New tools go into existing servers — no orphan scripts
- **Composition pattern**: New MCP tools must compose with existing tools where applicable (wrap, not duplicate)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cubelet as knowledge unit | Structured, scoreable, consistent format across all concepts | ✓ Good |
| Three-layer deliverable stack | Ensures every concept has hands-on, programmatic, and guided paths | ✓ Good |
| Dark cybernetic aesthetic | Consistent brand, professional feel, accessible on dark screens | ✓ Good |
| Python MCP servers | Lightweight, easy to extend, matches team skill direction | ✓ Good |
| Vercel deployment | Free tier, instant deploys, good for React artifacts | ✓ Good |
| Composition over duplication (v1.1) | AgentLink wraps CausalLink, AutomationLayer wraps FixRecord — maximizes code reuse | ✓ Good |
| Custom SVG over heavy viz frameworks (v1.1) | ReactFlow/D3 rejected for sandbox compatibility, custom SVG works | ✓ Good |
| Conceptual-only agent experience checkpoint (v1.1) | No framework-specific knowledge required — lowers barrier to entry | ✓ Good |
| Single MCP server extension (v1.1) | Extended systems-thinking-cubelets from 3 to 6 tools, no new server | ✓ Good |
| Named ES exports for testability (v1.1) | vitest ESM mode, enables unit testing without React renderer | ✓ Good |

## Current Milestone: v1.2 Polish & Deferred Features

**Goal:** Ship the 5 deferred enhancements from v1.1 and clean up tracked tech debt, making existing cubelets richer without adding new concepts.

**Target features:**
- Live agent trace import (ST-004)
- Cost calculator overlay (ST-004)
- Tool stack comparison mode (ST-005)
- Custom scenario builder (ST-006)
- Archetype pattern library (cross-cubelet)
- Tech debt cleanup (vitest stubs, syllabus JSON, primer parity, prerequisite fix)

---
*Last updated: 2026-03-23 — v1.2 milestone started*
