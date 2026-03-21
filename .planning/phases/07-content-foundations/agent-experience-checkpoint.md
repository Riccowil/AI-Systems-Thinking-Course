# Agent Experience Checkpoint

**Phase:** 07-content-foundations
**Created:** 2026-03-21
**Status:** Design specification

## Purpose

Define the minimum conceptual knowledge students need before entering ST-004 (Agent Feedback Loops). This is NOT a gate -- it is a warm-up that activates prior knowledge and flags gaps. Students who check all 3 self-assessment questions proceed directly. Students who don't are supported by always-accessible primer panels.

## Entry Requirements (Conceptual Only)

No prior agent-building experience required. Students must understand what agents, tools, and memory ARE, but do not need to have built one. Framework-agnostic -- no LangChain, CrewAI, AutoGen, or other framework-specific knowledge expected.

Required conceptual understanding:
- Can explain what an AI agent does that a chatbot does not (agency, tool use, planning)
- Can describe what a "tool call" means in an agent context
- Understands why an agent might need memory (context persistence across turns)
- Knows that agents can fail in loops (retry, escalation, cost spirals)
- No specific framework knowledge required

## 3-Question Self-Assessment Checklist

Place at top of ST-004 cubelet markdown. Casual tone, warm-up not a test. Simple checkbox list with no scoring.

**Before you start, check yourself:**

- [ ] **"Can you explain what an AI agent does that a chatbot doesn't?"**
  Expected: mentions autonomy, tool use, or multi-step planning

- [ ] **"What's a tool call?"**
  Expected: agent invoking an external capability -- API, database, function

- [ ] **"Why might an agent need memory?"**
  Expected: maintaining context, learning from past interactions, avoiding repeated mistakes

**If you checked all 3** -- you're ready, dive in.
**If not** -- no worries. Open the primer panel (sidebar) for a quick refresher before starting.

## Primer Panel Specifications

All 3 new cubelets get always-accessible collapsible sidebar primer panels in their interactive artifacts. Panels are collapsed by default but can be opened at any time. They do NOT block progress.

### ST-004 Primer: Agent Basics

Content topics:
- **What is an AI agent (vs chatbot):** Autonomy -- agents decide what to do next. Tool use -- agents invoke external capabilities. Planning loops -- agents break goals into steps and iterate.
- **What are tools:** External capabilities an agent can invoke (APIs, databases, functions, MCP tools). The agent decides when and which tool to call.
- **What is agent memory:** Context that persists across interactions. Short-term (conversation history) vs long-term (learned preferences, past decisions).
- **What are evaluators:** Components that judge output quality. They answer "did this work?" and decide whether to retry, escalate, or accept.
- **What are constraints:** Rules limiting agent behavior. Budget limits, time limits, safety guardrails, scope restrictions.
- **Cross-reference:** Links to ST-001 tab in preview app (loop polarity, reinforcing vs balancing)

### ST-005 Primer: Tool Orchestration Basics

Content topics:
- **What is a tool dependency:** One tool requires another's output to function. Tool B needs Tool A's result before it can run.
- **What is redundancy:** Multiple tools doing the same thing. Can be intentional (fallback) or wasteful (duplicate effort).
- **What is blast radius:** How many things break when one tool fails. High blast radius = many downstream tools affected.
- **Cross-reference:** Links to ST-002 tab in preview app (Meadows hierarchy, leverage scoring)

### ST-006 Primer: Automation Debt Basics

Content topics:
- **What is a quick fix in automation:** A temporary workaround that reduces immediate pain but doesn't solve the root cause. Example: routing low-confidence outputs to humans instead of improving the model.
- **What is a fundamental solution:** A root-cause fix that eliminates the problem permanently. Example: retraining the model on edge cases so it handles them natively.
- **What is erosion:** How quick fixes make fundamental solutions harder over time. Resources get diverted, skills atrophy, architecture couples to the workaround.
- **Cross-reference:** Links to ST-003 tab in preview app (B1/B2/R1 loops, shifting the burden archetype)

## Belt and Suspenders

Agent vocabulary is ALSO woven into cubelet WHAT and HOW faces, not just primer panels. Students encounter definitions:
1. In the cubelet content itself (WHAT face defines terms, HOW face uses them in context)
2. In the primer panel as a reference sidebar

This dual-coverage ensures no student falls through the cracks regardless of whether they open the primer.

## Primer Panel Cross-References

Each primer panel includes direct links to prerequisite cubelet tabs in the preview app:
- ST-004 primer links to ST-001 tab (reinforcing feedback loops)
- ST-005 primer links to ST-002 tab (leverage points)
- ST-006 primer links to ST-003 tab (shifting the burden)

Links open the prerequisite cubelet in a new tab so students can review without losing their place.

---

*Specification for Phase 7: Content Foundations*
*Satisfies: CFND-02 (Agent experience checkpoint)*
