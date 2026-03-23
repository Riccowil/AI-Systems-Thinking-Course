# Phase 12: Audit Gap Closure - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the 1 partial requirement (TO-10) and resolve tech debt identified by v1.1 milestone audit: expand ST-005 primer panel with full ST-002 prerequisite refresher content, generate retroactive VERIFICATION.md for phases 7/9/10/11, and fix MCP tool decorator style inconsistency. No new features — mechanical fixes to existing work.

</domain>

<decisions>
## Implementation Decisions

### ST-005 Primer Panel Expansion (TO-10)
- Replace current 2-sentence primer content entirely (not append)
- Claude decides content depth: full Meadows hierarchy or key-concepts-only, based on artifact size constraints and pedagogical fit
- Claude decides visual treatment: color-coded tier labels or plain text, based on existing ST-005 color palette
- Claude decides title: keep "Primer: Tool Orchestration" or rename to reflect Meadows content
- Must include actual Meadows hierarchy levels and leverage scoring methodology — not just a cross-reference to ST-002
- Reference: ST-004's primer (agent-feedback-loop-builder.jsx lines 426-436) has ~3 rich paragraphs with color-coded labels — target similar richness

### Retroactive VERIFICATION.md Generation
- Document what was ALREADY verified during execution — no re-running tests
- Match Phase 8's VERIFICATION.md format: Nyquist dimensions, must_haves checklist, test evidence
- Claude adapts per-phase: Phase 7 (docs-only) may use 'document review' evidence instead of test sections; code phases use test results
- Claude decides evidence level per-phase: commit SHAs + file paths where easily available, phase summaries where chasing commits isn't worth it
- Phases needing VERIFICATION.md: 7 (Content Foundations), 9 (ST-005 Tool Orchestration), 10 (ST-006 Automation Debt), 11 (Integration + Deployment)

### MCP Tool Style Consistency
- Audit ALL 6 tool decorators in cubelets_mcp_server.py for consistent style
- Fix everything found: name= parameters, annotations, docstring format — normalize all to identical decorator style
- Known issue: detect_automation_debt (line 1533) missing explicit name= parameter
- Re-run MCP test suite (pytest) after all fixes to confirm nothing broke

### Claude's Discretion
- Primer content depth and visual treatment (full table vs key concepts, colors vs plain)
- Primer section title
- Per-phase VERIFICATION.md evidence level and structure adaptation
- Which other MCP tool inconsistencies to fix (if any found beyond name=)
- Test execution approach (which test files to run)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 8 VERIFICATION.md (.planning/phases/08-st-004-pathfinder/08-VERIFICATION.md): Template/reference for retroactive VERIFICATIONs
- ST-004 primer panel (agent-feedback-loop-builder.jsx:426-436): Rich primer with color-coded labels, 3 paragraphs — reference for ST-005 expansion
- MEADOWS_HIERARCHY array in leverage-point-scorer.jsx: 12 levels with labels and tiers — source content for primer
- cubelets_mcp_server.py: 6 tools with @mcp.tool() decorators, 5 use explicit name=, 1 (detect_automation_debt) does not

### Established Patterns
- Primer panels: collapsible accordion at top of right panel, ~280px width, fontSize 10-11px, DM Sans font
- MCP tool decorators: @mcp.tool(name="tool_name", annotations={...}) with async def pattern
- VERIFICATION.md: Nyquist 8-dimension framework, must_haves checklist, evidence sections
- Dark cybernetic palette: #0f1117 bg, #00d4aa teal accent, health score colors (green/amber/red)

### Integration Points
- tool-orchestration-analyzer.jsx line 570-572: Primer panel content to replace
- cubelets_mcp_server.py line 1533: detect_automation_debt decorator to fix
- .planning/phases/: 4 phase directories needing VERIFICATION.md files

</code_context>

<specifics>
## Specific Ideas

- ST-004's primer is the gold standard for what ST-005's should look like: rich content, color-coded where helpful, self-contained enough that students don't need to leave the tab
- The audit flagged TO-10 as "partial" — the cross-reference exists but the actual content doesn't. Fix means embedding the knowledge, not just pointing to it.
- VERIFICATION.md retroactive generation is documentation of work already done, not new testing. The evidence exists in git history and test logs.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-audit-gap-closure*
*Context gathered: 2026-03-23*
