# AI + Systems Thinking for SMBs — Course Delivery Package

**Author:** Ricco Wilson, Wilson Consulting
**For:** Divergence Academy
**Version:** 1.1.0 | March 2026

---

## What's Included

### 1. Interactive Artifacts (Live)

**URL:** https://preview-app-two.vercel.app

9 tabbed interactive experiences students use in-browser. No install needed.

| Tab | Cubelet | Week | Topic |
|-----|---------|------|-------|
| Systems Thinking Fundamentals | W1-C1 | 1 | Stocks, flows, feedback loops |
| AI System Lever | W1-C2 | 1 | Where AI creates impact in workflows |
| SMB Mindset Shift | W1-C3 | 1 | Tool-first vs AI-first redesign |
| Feedback Loop Builder | ST-001 | 2 | Build and classify CLDs |
| Leverage Point Scorer | ST-002 | 2 | Meadows hierarchy, node scoring |
| Burden Shift Simulator | ST-003 | 2 | Shifting the Burden archetype |
| Agent Feedback Loop Builder | ST-004 | 3 | AI agent feedback dynamics |
| Tool Orchestration Analyzer | ST-005 | 3 | MCP tool stacks, blast radius |
| Automation Debt Simulator | ST-006 | 3 | Automation debt detection |

### 2. MCP Servers (Claude Desktop/CLI Tools)

Two Python-based MCP servers give students hands-on tool access inside Claude:

- **week1-foundations** — System maps, AI leverage analysis, workflow redesign
- **systems-thinking-cubelets** — Loop scoring, intervention comparison, burden detection

Location: `Cubelets MCP Tool/files/`

### 3. Claude Skills

Installable `.skill` files for Claude Code that provide guided workflows for each cubelet topic.

Location: `Claude skills build for Cubelets/files/`

### 4. Course Syllabus

- `course-syllabus.md` — Human-readable syllabus with week structure and learning objectives
- `master-syllabus.json` — Machine-readable syllabus with full metadata, time estimates, prerequisites
- `prerequisite-chain.json` — Dependency graph for cubelet ordering

### 5. Cubelet Source Content

- `Cubelets/CubeletsMarkdown/` — 6-face markdown docs for each cubelet
- `Interactive Artifact for Cubelets/` — JSX source files for all 9 artifacts

### 6. Source Code

- `preview-app/` — Vite + React app deployed on Vercel
- `Cubelets MCP Tool/files/` — MCP server Python code + tests

---

## Course Structure

**Total Duration:** ~85 minutes across 3 weeks

### Week 1: Foundations (30 min)
- W1-C1: What Is Systems Thinking? (10 min)
- W1-C2: Where AI Creates Impact (10 min)
- W1-C3: AI-First Workflow Redesign (10 min)

### Week 2: Core Patterns (30 min)
- ST-001: Feedback Loops & CLDs (10 min)
- ST-002: Leverage Points & Interventions (10 min)
- ST-003: Shifting the Burden (10 min)

### Week 3: Agentic Systems (25 min)
- ST-004: Agent Feedback Loops (8 min)
- ST-005: Tool Orchestration & Stack Health (8 min)
- ST-006: Automation Debt (9 min)

### Prerequisites
- Week 1 is linear: C1 > C2 > C3
- Week 2 requires Week 1 complete, then linear: ST-001 > ST-002 > ST-003
- Week 3: ST-004 requires ST-001; ST-005 requires ST-002 + ST-004; ST-006 requires ST-003

---

## Quick Start for Instructors

### Students use the interactive artifacts:
1. Open https://preview-app-two.vercel.app
2. Click through tabs matching the week/cubelet being taught
3. Each artifact is self-contained with instructions, examples, and exercises

### To set up MCP tools in Claude Desktop:
See `MCP-SETUP-GUIDE.md` in this package.

### GitHub Repository:
https://github.com/Riccowil/AI-Systems-Thinking-Course (private)

---

## Questions?

Contact: Ricco Wilson — Ricco.Wilson@gmail.com
