# AI for Systems Thinking — Course Factory

## What This Is

A modular course for Divergence Academy's Intelligent Automation Immersive that teaches systems thinking through an AI lens. Each concept is packaged as a "cubelet" — a structured knowledge unit with six faces (WHAT, WHY, HOW, WHERE, WHEN, APPLY) — and delivered through three layers: Interactive Artifacts (React JSX), MCP Tools (Python servers), and Claude Skills (.skill packages). Built by Ricco Wilson for Team B.

## Core Value

Every cubelet ships three usable deliverables — an interactive artifact students can touch, an MCP tool they can call, and a Claude skill they can invoke — so learning is always hands-on, never passive.

## Requirements

### Validated

<!-- Shipped and confirmed valuable in v1.0. -->

- [x] **FOUND-01**: Student can explore systems thinking fundamentals via interactive CLD builder (W1-C1)
- [x] **FOUND-02**: Student can identify AI leverage points in business workflows (W1-C2)
- [x] **FOUND-03**: Student can redesign workflows with AI-first mindset (W1-C3)
- [x] **INTER-01**: Student can map and score reinforcing feedback loops (ST-001)
- [x] **INTER-02**: Student can compare interventions using Meadows' hierarchy (ST-002)
- [x] **INTER-03**: Student can detect shifting-the-burden archetypes (ST-003)
- [x] **INFRA-01**: Preview app deployed to Vercel with tabbed interface
- [x] **INFRA-02**: MCP servers (week1-foundations, systems-thinking-cubelets) running in Claude Desktop + CLI
- [x] **INFRA-03**: 6 Claude skills installed and functional
- [x] **INFRA-04**: Quality gate system — all cubelets scored 52-53/60 (87-88%), all PASS

### Active

<!-- Current scope: v1.1 — Week 3: Agentic Systems Design -->

(Defining in this milestone)

### Out of Scope

- Video lectures — Cubelets are interactive-first, not lecture-first
- LMS integration — Standalone delivery via Vercel + Claude, not Moodle/Canvas
- Student auth/accounts — No login system; open access artifacts
- Grading automation — Quality gates are author-side, not student-side

## Context

- **Program**: Divergence Academy — Intelligent Automation Immersive
- **Team**: B
- **Aesthetic**: Dark cybernetic blueprint (charcoal canvas, teal/amber/pink accents, JetBrains Mono / DM Sans)
- **Cubelet format**: 6 faces (WHAT, WHY, HOW, WHERE, WHEN, APPLY), scored 1-10 each, min 6/face, min 42/60 aggregate
- **Three-layer deliverable stack**: Interactive Artifact (JSX) + MCP Tool (Python) + Claude Skill (.skill)
- **Existing MCP servers**: `week1-foundations` (3 tools), `systems-thinking-cubelets` (3 tools), `systems-thinking` base (5 tools)
- **Deployment**: https://preview-app-two.vercel.app (Vite React app)
- **Course progression**: W1-C1 → W1-C2 → W1-C3 → ST-001 → ST-002 → ST-003
- **Total time**: 55 minutes across 6 cubelets

## Constraints

- **Cubelet format**: Every new concept must follow the 6-face structure and quality gate — non-negotiable
- **Three-layer stack**: Each cubelet produces exactly 3 deliverables (artifact + MCP tool + skill)
- **Aesthetic consistency**: New artifacts must match the dark cybernetic blueprint theme
- **Prerequisite chain**: New cubelets must specify prerequisites from existing chain
- **MCP server organization**: New tools go into existing servers or a new dedicated server — no orphan scripts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cubelet as knowledge unit | Structured, scoreable, consistent format across all concepts | ✓ Good |
| Three-layer deliverable stack | Ensures every concept has hands-on, programmatic, and guided paths | ✓ Good |
| Dark cybernetic aesthetic | Consistent brand, professional feel, accessible on dark screens | ✓ Good |
| Python MCP servers | Lightweight, easy to extend, matches team skill direction | ✓ Good |
| Vercel deployment | Free tier, instant deploys, good for React artifacts | ✓ Good |

## Current Milestone: v1.1 Agentic Systems Design

**Goal:** Add 3 new cubelets (ST-004, ST-005, ST-006) that apply systems thinking frameworks to agentic AI design — teaching students to see agents, tool stacks, and automation as systems.

**Target features:**
- ST-004: Agent Feedback Loops — apply CLD mapping to agent architectures
- ST-005: Tool Orchestration as System Design — apply leverage point analysis to tool stacks
- ST-006: Shifting the Burden in Automation — detect automation debt using the archetype

---
*Last updated: 2026-03-21 after v1.1 milestone start*
