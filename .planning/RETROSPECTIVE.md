# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Agentic Systems Design

**Shipped:** 2026-03-23
**Phases:** 6 | **Plans:** 17 | **Sessions:** ~4

### What Was Built
- 3 new cubelets (ST-004, ST-005, ST-006) with complete three-layer stacks (artifact + MCP tool + skill)
- ST-004: Shape-coded CLD builder for agent architectures with progressive disclosure and severity scoring
- ST-005: Dependency graph analyzer for MCP tool stacks with Meadows hierarchy intervention scoring
- ST-006: 12-round scenario simulation game revealing automation debt through shifting-the-burden archetype
- Content foundations: prerequisite chain, data models, visual vocabulary, course syllabus Week 3
- Integration: 9-tab preview app deployed to Vercel, 6-tool MCP server, 3 Claude skills
- Nyquist validation: 76 tests across all phases

### What Worked
- **Pathfinder approach**: Phase 8 (ST-004) validated the dual-domain cubelet format before committing to ST-005/ST-006. The composition pattern (AgentLink wraps CausalLink) proved out and was replicated for ST-005/ST-006.
- **Content Foundations phase first**: Locking data models, visual vocabulary, and prerequisite chain in Phase 7 prevented rework in Phases 8-10. Zero design conflicts downstream.
- **Composition over duplication**: Extending the existing MCP server with wrapping models (to_causal_link, to_fix_record) kept the codebase DRY and validated that new tools reuse existing algorithms.
- **Named ES exports for testability**: Making artifact functions individually testable (SimEngine, stepSim, getGrade, SCENARIOS) enabled proper vitest coverage without needing React rendering.
- **Retroactive VERIFICATION.md generation**: Phase 12 proved that retroactive verification (using SUMMARY evidence) produces equivalent quality to real-time verification — useful for phases executed before GSD was fully configured.

### What Was Inefficient
- **REQUIREMENTS.md checkbox maintenance**: 30/43 checkboxes never updated during execution. The authoritative record was in VERIFICATION.md files, making the checkboxes redundant busywork. Future: either auto-update or drop checkboxes in favor of VERIFICATION.md as single source of truth.
- **Phase 9 plan count mismatch**: ROADMAP listed 4 plans for Phase 9 but only 3 were executed (09-04 absorbed into 09-03). Plan scope should be updated when execution deviates.
- **ROADMAP checkbox staleness**: Phases 8, 9, 10 plan checkboxes in ROADMAP were never checked off despite completion. Same hygiene issue as REQUIREMENTS.md.
- **Wave 0 test stub lifecycle**: ST-005 vitest stubs were created but never promoted to real assertions. The TDD pattern (RED stub → GREEN implementation) needs a completion gate.

### Patterns Established
- **Composition pattern for MCP tools**: New tools wrap existing data models and reuse shared algorithms (AgentLink.to_causal_link(), AutomationLayer.to_fix_record())
- **Named ES export convention for artifacts**: Export pure functions and constants for testability, keep React rendering internal
- **3-phase cubelet development**: Plan 01 (MCP tool), Plan 02 (cubelet + skill), Plan 03 (artifact) — consistent across ST-004/005/006
- **Retroactive verification as valid alternative**: When phases ship without formal verification, SUMMARY evidence plus downstream consumption proves equivalent confidence
- **Primer panel convention**: Each artifact includes a collapsible prerequisite refresher panel referencing the foundation cubelet

### Key Lessons
1. **Lock designs before building**: Phase 7's data model specs eliminated rework. Every hour spent on design docs saved multiple hours of implementation churn.
2. **Composition validates architecture**: If a new tool can reuse existing algorithms via composition (wrapping, not forking), the architecture is sound. If it can't, the architecture needs rethinking.
3. **Documentation hygiene needs automation**: Manual checkbox updates are unreliable. Either automate them (gsd-tools could update REQUIREMENTS.md from VERIFICATION.md) or accept VERIFICATION.md as the single source of truth.
4. **3-day milestone is achievable**: 6 phases, 17 plans, 20K+ lines in 3 days demonstrates that GSD + clear requirements + locked designs = high velocity.

### Cost Observations
- Model mix: ~60% sonnet (execution, auditors), ~30% opus (orchestration, verification), ~10% haiku (unused)
- Sessions: ~4 across 3 days
- Notable: Parallel agent spawning (3 auditors simultaneously for Nyquist validation) was highly efficient

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Cubelets shipped | 6 | 3 (9 total) |
| Quality gate scores | 52-53/60 | 48-54/60 |
| MCP tools | 3 | 6 |
| Total course time | 55 min | 85 min |
| Phases | 6 | 6 |
| Plans | ~12 (pre-GSD) | 17 |
| Days | unknown | 3 |
| Verified by audit | no | yes (43/43) |

**Observations:**
- Quality scores slightly lower in v1.1 (48-54 vs 52-53) — acceptable given higher complexity (agent-specific vocabulary, composition patterns, simulation engine)
- GSD framework added significant overhead in documentation but delivered high confidence in completeness
- 3-day execution cadence is sustainable for 3-cubelet milestones

---

*Last updated: 2026-03-23 after v1.1 milestone*
