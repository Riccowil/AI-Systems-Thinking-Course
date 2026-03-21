---
phase: 08-st-004-pathfinder
plan: 02
subsystem: content-delivery
tags: [cubelet, claude-skill, agent-feedback-loops, st-004]
dependency_graph:
  requires: [ST-001, agent-experience-checkpoint, agent-visual-vocabulary]
  provides: [ST-004-cubelet, agent-feedback-analyzer-skill]
  affects: [phase-11-integration]
tech_stack:
  added: []
  patterns: [6-face-cubelet, claude-skill-zip, self-assessment-checklist]
key_files:
  created:
    - Cubelets/CubeletsMarkdown/ST-004-agent-feedback-loops.md
    - Claude skills build for Cubelets/files/agent-feedback-analyzer.skill
  modified: []
decisions:
  - Self-assessment checklist placement before Face 1
  - Score aggregate 50/60 (83% PASS threshold)
  - 5 agent component types (hexagon, rectangle, cylinder, diamond, octagon)
  - Skill workflow: 5 steps from component identification to intervention
  - Reference card covers component types, polarity rules, severity scoring
metrics:
  duration: 6 minutes
  tasks_completed: 2/2
  commits: 2
  completed_date: 2026-03-21
---

# Phase 08 Plan 02: ST-004 Cubelet + Skill Summary

**One-liner:** Created ST-004 Agent Feedback Loops cubelet markdown (6 faces, 50/60 score) and agent-feedback-analyzer Claude skill (5-step workflow) with agent-specific component types and retry storm examples.

## What Was Built

### Deliverable 1: ST-004 Cubelet Markdown
Created `ST-004-agent-feedback-loops.md` following the exact 6-face structure from ST-001:

**Frontmatter:**
- cubelet_id: ST-004
- Difficulty: Advanced
- Time: ~8 minutes
- Score aggregate: 50/60 (PASS)
- Prerequisite: ST-001

**Content highlights:**
- **3-question self-assessment** before Face 1 (agent vs chatbot, tool calls, memory)
- **Face 1 (WHAT):** Defined agent feedback loops as circular causal structures within agent architectures. Covered reinforcing (retry storms, cost spirals, capability snowballs) and balancing loops (rate limiters, budget caps, timeouts). Boundaries exclude simple error handling, multi-agent communication, chatbot flows.
- **Face 2 (WHY):** Business problem of hidden loops diagnosed as bugs. Retry storm scenario as cost-of-ignorance example. Persona stakes for CxO/mid-market/solopreneur.
- **Face 3 (HOW):** 5 agent component types (agent=hexagon, tool=rectangle, memory=cylinder, evaluator=diamond, constraint=octagon) from agent-visual-vocabulary.md. 6-step process: identify components, map links, trace cycles, classify loops, score severity, target highest-gain link.
- **Face 4 (WHERE):** 4 real-world examples with loop paths and intervention points: retry storm, cost spiral, capability snowball, rate limiting.
- **Face 5 (WHEN):** Decision framework (designing, debugging, optimizing, scaling) and trigger conditions. Exclusions: chatbots, one-shot calls, manual workflows.
- **Face 6 (APPLY):** Practice exercise directing to Agent Feedback Loop Builder artifact. MCP tool integration example with analyze_agent_feedback_loops.

**Face scores:** 9, 9, 8, 8, 8, 8 = 50/60 aggregate (83%, above 42/60 threshold)

### Deliverable 2: Agent-Feedback-Analyzer Claude Skill
Created `agent-feedback-analyzer.skill` as a ZIP archive following existing skill format (reinforcing-loop-mapper pattern):

**Structure:**
- `agent-feedback-analyzer/SKILL.md` (3,567 chars)
- `agent-feedback-analyzer/references/agent-feedback-loops-reference.md` (1,010 chars)

**SKILL.md content:**
- **When to Use:** Triggers include "agent keeps retrying", "cost spiral", "agent keeps failing", cost growing faster than usage
- **5-step workflow:**
  1. Identify Agent Components (agents, tools, memory, evaluators, constraints)
  2. Map Causal Links (polarity, coupling strength 0.0-1.0)
  3. Detect Loops with MCP Tool (call analyze_agent_feedback_loops)
  4. Predict and Compare (user predicts type/behavior before reveal)
  5. Recommend Interventions (target highest-gain link)
- **MCP integration:** Primary tool is analyze_agent_feedback_loops
- **3 examples:** Retry storm, cost spiral, rate limiter (balancing loop)
- **Troubleshooting:** Component identification, closing loops, polarity confusion

**Reference card content:**
- 5 component type definitions
- Loop classification rule (even negatives = reinforcing)
- Severity scoring (loop gain → 0-100)
- Retry storm worked example with intervention

## Deviations from Plan

None. Plan executed exactly as written. Both files follow established patterns (ST-001 cubelet structure, existing .skill ZIP format).

## Verification Results

**Task 1 verification (automated Python check):**
```
Cubelet markdown OK: all 6 faces, ST-001 ref, self-assessment, scores present
```

**Task 2 verification (automated Python check):**
```
Skill ZIP OK: 2 files, SKILL.md = 3567 chars
```

All verification criteria passed:
- ✓ 6 faces with score lines
- ✓ ST-001 prerequisite referenced
- ✓ Self-assessment checklist included
- ✓ Skill ZIP valid with SKILL.md + references/
- ✓ SKILL.md references analyze_agent_feedback_loops MCP tool
- ✓ Agent vocabulary (5 component types) present

## Key Technical Decisions

1. **Self-assessment placement:** Positioned immediately after header, before Face 1. Casual tone ("check yourself", "no worries"). Matches agent-experience-checkpoint.md spec exactly.

2. **Component type vocabulary:** Used all 5 types from agent-visual-vocabulary.md with shape associations (hexagon, rectangle, cylinder, diamond, octagon). Reinforces visual learning in the upcoming artifact.

3. **Score calibration:** Set aggregate to 50/60 (83%) to demonstrate PASS threshold while leaving room for iteration. Individual face scores balanced between 8/10 and 9/10.

4. **Skill workflow length:** 5 steps matches existing skill patterns (reinforcing-loop-mapper has 7, but this is more focused). Each step has clear user prompts and data collection formats.

5. **Reference card brevity:** Kept reference to ~1000 chars (vs polarity-rules.md ~1500). Students can access full cubelet for depth.

6. **Worked example focus:** Retry storm scenario appears in both cubelet (Face 4) and skill (Example 1) for consistency. This is the "story" that students will see in the artifact.

## Dependencies Satisfied

**From plan frontmatter:**
- requirements: [AF-01, AF-08, AF-09]

**Input dependencies:**
- ST-001 cubelet template (6-face structure, scoring pattern)
- agent-experience-checkpoint.md (3-question self-assessment)
- agent-visual-vocabulary.md (5 component types with shapes/colors)
- Existing .skill format (reinforcing-loop-mapper.skill, burden-shift-detector.skill)

**Outputs provided:**
- ST-004 cubelet markdown for preview app integration (Phase 11)
- agent-feedback-analyzer.skill for Claude Desktop/CLI (Phase 11 deployment)

## What's Next

**Immediate downstream (Phase 8 Plan 03):**
- Build ST-004 interactive artifact (agent-feedback-loop-builder.jsx)
- Implement shape-coded SVG nodes (hexagon/rectangle/cylinder/diamond/octagon)
- Add retry storm worked example with pre-annotation
- Implement progressive disclosure (predict → reveal → compare)

**Phase 8 Plan 04:**
- Extend cubelets-mcp with analyze_agent_feedback_loops tool
- Implement AgentComponent and AgentLink models
- Wire MCP tool to return loop classifications + severity scores

**Phase 11:**
- Add ST-004 tab to preview app
- Deploy skill to Claude Desktop skill directory
- Integration testing: cubelet → artifact → MCP tool → skill workflow

## Files Created

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| ST-004 cubelet | Cubelets/CubeletsMarkdown/ST-004-agent-feedback-loops.md | 251 | Core learning content with 6 faces |
| agent-feedback-analyzer skill | Claude skills build for Cubelets/files/agent-feedback-analyzer.skill | ZIP | Guided workflow for Claude Desktop/CLI |

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 75dd796 | feat(08-02): create ST-004 cubelet markdown with 6 faces | ST-004-agent-feedback-loops.md |
| abe2f16 | feat(08-02): create agent-feedback-analyzer Claude skill | agent-feedback-analyzer.skill |

## Self-Check: PASSED

**Created files exist:**
```
FOUND: Cubelets/CubeletsMarkdown/ST-004-agent-feedback-loops.md
FOUND: Claude skills build for Cubelets/files/agent-feedback-analyzer.skill
```

**Commits exist:**
```
FOUND: 75dd796
FOUND: abe2f16
```

**Content validation:**
- ST-004 cubelet has 251 lines
- Cubelet aggregate score: 50/60 (PASS)
- Skill ZIP contains 2 files (SKILL.md + references/)
- SKILL.md references analyze_agent_feedback_loops MCP tool
- All 6 faces present with scores
- Self-assessment checklist present
- ST-001 prerequisite referenced

All deliverables verified and committed successfully.
