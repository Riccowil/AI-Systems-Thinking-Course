# Phase 11: Integration + Deployment - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate all v1.1 deliverables (ST-004, ST-005, ST-006) into the preview app, update syllabus and prerequisite chain, verify MCP server and Claude skills, and deploy to Vercel. This is a mechanical integration phase — no new features, just assembly and verification.

</domain>

<decisions>
## Implementation Decisions

### Tab Organization
- Group tabs by week: Week 1 (3 tabs) | Week 2 (3 tabs) | Week 3 (3 tabs) with visual separators
- Week 3 tab labels: 'ST-004: Agent Feedback', 'ST-005: Tool Orchestration', 'ST-006: Automation Debt'
- Keep existing Week 2 labels unchanged (ST-001/002/003)
- Visual separator style: Claude decides (week label headers or thin vertical dividers)
- Default active tab: Claude decides (W1-C1 or localStorage recall)
- Prerequisite gating on navigation: Claude decides (free navigation or soft warning banner)

### Syllabus & Prerequisites
- Mirror Week 2 structure in master-syllabus.json for Week 3
- Prerequisite ordering per CFND-01: ST-004 requires ST-001, ST-005 requires ST-002 + ST-004, ST-006 requires ST-003
- Update prerequisite-chain.json with ST-004/005/006 entries

### Vercel Deployment
- Push to main branch, auto-deploy via existing Vercel connection
- Project already configured: projectId=prj_APAKi6GOWFmnAVJ0GaVAMJmxBdIn, team configured
- Default Vercel URL for now — custom domain deferred to post-v1.1
- No environment variables needed — pure client-side React
- No dagre dependency — ST-005 uses built-in topological layout, passed UAT

### Dark Theme Consistency
- Visual spot-check in preview app — load each of 9 tabs, confirm palette matches
- Fix any artifacts that look off compared to the established dark cybernetic palette

### Verification Strategy
- MCP server: Call each of 6 tools from current session with minimal test inputs
- Claude skills: Manual smoke test — install each ZIP, invoke via /skill-name, confirm multi-step workflow runs
- Artifacts: Visual spot-check all 9 tabs in preview app after integration

### Claude's Discretion
- Week group separator visual design
- Default tab behavior (first tab vs localStorage)
- Prerequisite navigation warnings (none vs soft banner)
- Order of integration tasks
- Any minor style adjustments for tab bar with 9 tabs

</decisions>

<code_context>
## Existing Code Insights

### Preview App Structure
- `preview-app/src/App.jsx` — Main app with lazy-loaded tab array, currently 6 artifacts
- `preview-app/.vercel/project.json` — Vercel project config (already connected)
- `preview-app/src/` — Contains 6 artifact JSX files copied from `Interactive Artifact for Cubelets/`

### Artifacts to Integrate
- `Interactive Artifact for Cubelets/agent-feedback-analyzer.jsx` — ST-004 artifact (Phase 8)
- `Interactive Artifact for Cubelets/tool-orchestration-analyzer.jsx` — ST-005 artifact (Phase 9)
- `Interactive Artifact for Cubelets/automation-debt-simulator.jsx` — ST-006 artifact (Phase 10)

### MCP Server
- `packages/cubelets-mcp/server.py` — Extended from 3 to 6 tools across Phases 8-10
- Tools: score_reinforcing_loops, compare_interventions, detect_burden_shift, analyze_agent_feedback_loops, analyze_tool_orchestration, detect_automation_debt

### Skills
- ST-004: agent-feedback-analyzer.skill (Phase 8)
- ST-005: tool-stack-analyzer.skill (Phase 9)
- ST-006: automation-debt-detector.skill (Phase 10)

### Config Files to Update
- `master-syllabus.json` — Add Week 3 module with 3 lessons
- `prerequisite-chain.json` — Add ST-004/005/006 entries with dependency links

</code_context>

<deferred>
## Deferred Ideas

- Custom domain for preview app (post-v1.1 classroom validation)
- dagre library for improved auto-layout (built-in layout sufficient for now)
- Automated color audit script for theme consistency (visual spot-check sufficient)
- Automated skill testing framework (manual smoke test sufficient)

</deferred>
