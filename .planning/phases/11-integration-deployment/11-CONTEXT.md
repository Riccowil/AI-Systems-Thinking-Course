# Phase 11: Integration + Deployment - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire all 3 new cubelets (ST-004/005/006) into the existing preview app, MCP server, and course infrastructure. Students access 9 cubelets through a single deployed app with consistent aesthetic and working prerequisites. No new features — mechanical integration of completed work.

</domain>

<decisions>
## Implementation Decisions

### Tab Layout and Navigation
- Grouped by module: Week 1 (W1-C1/C2/C3), Week 2 (ST-001/002/003), Week 3 (ST-004/005/006)
- Tab labels: ID + short name (e.g. "ST-004: Agent Feedback")
- Lazy-loaded with React.lazy + Suspense
- Keep existing App.jsx from main repo — already has all 9 tabs correctly configured
- No landing/home view — load first artifact (W1-C1) by default

### Aesthetic Consistency
- Visual spot-check across all 9 tabs (not automated CSS audit)
- Primary accent: teal (#00d4aa) for all artifacts where possible
- Per-artifact accent variation: Claude judges case-by-case whether changing accent breaks the artifact's visual logic
- Tab nav only — no additional header/footer chrome
- Self-contained inline styles per artifact — no shared theme provider or CSS variables
- v1.0 artifacts confirmed working — focus verification on new Week 3 artifacts

### Artifact Integration
- Copy .jsx files from "Interactive Artifact for Cubelets/" into preview-app/src/
- Source of truth: Claude decides per existing v1.0 pattern

### Deployment Strategy
- Merge admiring-lovelace worktree branch to main first, then integrate on main
- Push to main triggers Vercel auto-deploy — no staging preview needed
- Skip dagre dependency (INTG-08) — Phase 8 decided on topological sort fallback instead
- Single PR: "v1.1 Agentic Systems Design" covering Phase 8-10 work + integration

### Skill and MCP Verification
- Skills: ZIP structure + content check (SKILL.md, references/, MCP tool refs, workflow, examples)
- Skills: Installation docs at Claude's discretion
- MCP server: Claude decides whether to re-run pytest suites or trust Phase 8-10 results

### Course Data Updates
- master-syllabus.json: verify existing Week 3 entries are correct (already added in Phase 7)
- prerequisite-chain.json: verify ST-004/005/006 entries with correct dependency ordering

### Testing Strategy
- Build verification: `npm run build` must succeed with all 9 artifacts
- Re-run existing vitest suites from Phases 9-10
- Phase 9 Wave 0 stubs: leave as documented stubs — don't block deployment
- No new E2E or integration tests (v1.2 concern)

### Error Handling
- Simple error boundary: "Failed to load artifact. Refresh to try again." in dark theme
- No retry button needed

### Git Workflow
- Merge worktree branch to main first
- Integration work on main with atomic commits
- Single PR for entire v1.1 milestone
- Git tag v1.1.0 on completion + update ROADMAP.md progress table

### Performance
- No concerns — lazy loading + Vercel free tier handles 9 static artifacts easily

### Claude's Discretion
- Home view vs load-first-artifact decision
- Per-artifact accent color adjustment (keep or change to teal)
- Artifact source of truth pattern (follow v1.0 convention)
- Skill installation docs (brief README or skip)
- MCP test re-run (redundant check or trust prior results)
- Milestone closure ceremony level

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- preview-app/src/App.jsx (main repo): Complete 9-tab layout with Week grouping, lazy loading, dark cybernetic theme
- 6 v1.0 artifacts in preview-app/src/ (main repo): Working, deployed, confirmed functional
- 3 v1.1 artifacts in "Interactive Artifact for Cubelets/": agent-feedback-loop-builder.jsx, tool-orchestration-analyzer.jsx, automation-debt-simulator.jsx
- 3 cubelet markdowns in Cubelets/CubeletsMarkdown/: ST-004, ST-005, ST-006
- 3 skill ZIPs in "Claude skills build for Cubelets/files/": agent-feedback-analyzer.skill, tool-stack-analyzer.skill, automation-debt-detector.skill
- cubelets_mcp_server.py: Already has 6 tools (3 original + 3 new from Phases 8-10)
- master-syllabus.json: Already includes Week 3 module (added Phase 7)
- prerequisite-chain.json: Already includes ST-004/005/006 entries (added Phase 7)

### Established Patterns
- Dark cybernetic theme: #0f1117 background, #00d4aa teal accent, DM Sans + JetBrains Mono fonts
- Inline styles per artifact (self-contained for Claude.ai sandbox compatibility)
- Lazy loading with React.lazy + Suspense fallback
- Vitest + jsdom for artifact unit tests
- Pytest for MCP tool tests
- Python zipfile verification for skill ZIPs

### Integration Points
- preview-app/src/App.jsx: Tab configuration array (weeks → tabs → lazy imports)
- preview-app/package.json: Dependencies (no dagre needed)
- Vercel: preview-app-two.vercel.app (auto-deploys from main branch)
- Git: admiring-lovelace worktree → main branch merge

</code_context>

<specifics>
## Specific Ideas

- App.jsx already exists in main repo with exact desired structure — copy/use directly
- INTG-08 (dagre) is a dead requirement — Phase 8 chose topological sort fallback instead
- INTG-02 (MCP server 6 tools) is already satisfied from Phase 8-10 execution
- Most "integration" is verification of already-completed work + file copies + deployment

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-integration-deployment*
*Context gathered: 2026-03-23*
