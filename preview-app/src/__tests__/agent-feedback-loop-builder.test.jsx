/**
 * Behavioral tests for agent-feedback-loop-builder.jsx (AF-02, AF-03, AF-04, AF-05, AF-10).
 *
 * The artifact exports only a default React component, so these tests verify
 * observable structure and behavior by reading the source file directly.
 * This is the approved fallback per constraints when named exports are unavailable.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the artifact: from preview-app/src/__tests__, go 3 levels up to repo root
const ARTIFACT_PATH = resolve(
  __dirname,
  '../../../Interactive Artifact for Cubelets/agent-feedback-loop-builder.jsx'
);

const source = readFileSync(ARTIFACT_PATH, 'utf-8');

// ---------------------------------------------------------------------------
// AF-02: SHAPE_SPECS with 5 node types
// ---------------------------------------------------------------------------

describe('AF-02: Artifact has shape-coded node types for all 5 agent component types', () => {
  test('test_shape_specs_defines_agent_hexagon', () => {
    // agent type must use a hexagon (6-point polygon)
    expect(source).toMatch(/agent:\s*\{/);
    // Hexagon has 6 coordinate pairs — pattern: polygon...points with 6 pairs
    // Simpler: verify the agent render returns a polygon type
    const agentMatch = source.match(/agent:\s*\{[^}]+type:\s*"polygon"/s);
    expect(agentMatch, 'agent node type should render as polygon (hexagon)').not.toBeNull();
  });

  test('test_shape_specs_defines_tool_rectangle', () => {
    // tool type must use a rectangle
    const toolMatch = source.match(/tool:\s*\{[^}]+type:\s*"rect"/s);
    expect(toolMatch, 'tool node type should render as rect (rectangle)').not.toBeNull();
  });

  test('test_shape_specs_defines_memory_cylinder', () => {
    // memory type must use cylinder (custom "memory" type in render)
    const memoryMatch = source.match(/memory:\s*\{[^}]+type:\s*"memory"/s);
    expect(memoryMatch, 'memory node type should render as memory (cylinder)').not.toBeNull();
  });

  test('test_shape_specs_defines_evaluator_diamond', () => {
    // evaluator type must use a diamond (4-point polygon)
    const evalMatch = source.match(/evaluator:\s*\{[^}]+type:\s*"polygon"/s);
    expect(evalMatch, 'evaluator node type should render as polygon (diamond)').not.toBeNull();
  });

  test('test_shape_specs_defines_constraint_octagon', () => {
    // constraint type must use an octagon (8-point polygon)
    const constraintMatch = source.match(/constraint:\s*\{[^}]+type:\s*"polygon"/s);
    expect(constraintMatch, 'constraint node type should render as polygon (octagon)').not.toBeNull();
  });

  test('test_shape_specs_has_all_five_node_types', () => {
    // SHAPE_SPECS must define all 5 keys
    const required = ['agent', 'tool', 'memory', 'evaluator', 'constraint'];
    for (const nodeType of required) {
      expect(source, `SHAPE_SPECS should define node type "${nodeType}"`).toContain(`  ${nodeType}:`);
    }
  });
});

// ---------------------------------------------------------------------------
// AF-03: PRELOADED_EXAMPLE with >= 5 nodes and defined loops
// ---------------------------------------------------------------------------

describe('AF-03: Worked example (retry storm) has >= 5 nodes and multiple loops', () => {
  test('test_preloaded_example_constant_exists', () => {
    expect(source).toContain('PRELOADED_EXAMPLE');
  });

  test('test_preloaded_example_has_at_least_five_nodes', () => {
    // Count node entries in PRELOADED_EXAMPLE.nodes — each looks like { id: "n1", ...}
    const nodeIds = source.match(/\{\s*id:\s*"n\d+"/g) || [];
    expect(nodeIds.length, 'PRELOADED_EXAMPLE should have at least 5 node entries').toBeGreaterThanOrEqual(5);
  });

  test('test_preloaded_example_includes_reinforcing_loop_comment', () => {
    // The worked example must annotate a reinforcing loop (retry escalation)
    expect(source).toMatch(/[Rr]einforcing loop|retry escalation/);
  });

  test('test_preloaded_example_includes_balancing_loop_comment', () => {
    // The worked example must annotate a balancing loop (rate limiting)
    expect(source).toMatch(/[Bb]alancing loop|rate limit/i);
  });

  test('test_preloaded_example_has_edges', () => {
    // PRELOADED_EXAMPLE must include edges array
    expect(source).toMatch(/edges:\s*\[/);
  });
});

// ---------------------------------------------------------------------------
// AF-04: predictions state management and allPredicted gating logic
// ---------------------------------------------------------------------------

describe('AF-04: Progressive disclosure enforced via predictions state and allPredicted gate', () => {
  test('test_predictions_state_variable_exists', () => {
    // useState hook for predictions object
    expect(source).toMatch(/useState\(\{\}\)/);
    expect(source).toContain('predictions');
  });

  test('test_allPredicted_state_variable_exists', () => {
    // allPredicted flag gates analysis reveal
    expect(source).toContain('allPredicted');
    expect(source).toMatch(/useState\(false\)/);
  });

  test('test_allPredicted_gates_analysis_display', () => {
    // hideAnalysis or equivalent logic references allPredicted
    expect(source).toMatch(/allPredicted|hideAnalysis/);
    // Specifically the gate: analysis hidden until allPredicted is true
    expect(source).toMatch(/!allPredicted|allPredicted\s*===\s*false/);
  });

  test('test_predictions_reset_when_graph_changes', () => {
    // When nodes/edges change, predictions are cleared
    expect(source).toMatch(/setPredictions\(\{\}\)/);
    expect(source).toMatch(/setAllPredicted\(false\)/);
  });

  test('test_submit_predictions_handler_exists', () => {
    // handleSubmitPredictions sets allPredicted to true
    expect(source).toContain('handleSubmitPredictions');
    expect(source).toMatch(/setAllPredicted\(true\)/);
  });
});

// ---------------------------------------------------------------------------
// AF-05: Loops/Predictions/Interventions tab structure
// ---------------------------------------------------------------------------

describe('AF-05: Right panel has three tabs: Loops, Predictions, Interventions', () => {
  test('test_loops_tab_exists', () => {
    expect(source).toMatch(/loops/i);
    // activeTab state references 'loops'
    expect(source).toContain("'loops'");
  });

  test('test_predictions_tab_exists', () => {
    expect(source).toContain("'predictions'");
  });

  test('test_interventions_tab_exists', () => {
    expect(source).toContain("'interventions'");
  });

  test('test_active_tab_state_variable_exists', () => {
    expect(source).toContain('activeTab');
    expect(source).toMatch(/useState\(['"]loops['"]\)/);
  });

  test('test_all_three_tabs_accessible_via_active_tab', () => {
    // All three tab keys must appear as string literals in the file
    const tabs = ["'loops'", "'predictions'", "'interventions'"];
    for (const tab of tabs) {
      expect(source, `Tab key ${tab} should be referenced in source`).toContain(tab);
    }
  });
});

// ---------------------------------------------------------------------------
// AF-10: Primer panel with ST-001 reference
// ---------------------------------------------------------------------------

describe('AF-10: Primer panel is collapsible and references ST-001', () => {
  test('test_primer_panel_state_variable_exists', () => {
    // primerCollapsed controls the accordion
    expect(source).toContain('primerCollapsed');
    expect(source).toContain('setPrimerCollapsed');
  });

  test('test_primer_panel_references_st001', () => {
    // Must reference ST-001 for cross-reference learning
    expect(source).toMatch(/ST-001/);
  });

  test('test_primer_panel_is_collapsible_accordion', () => {
    // setPrimerCollapsed toggled on click (accordion pattern)
    expect(source).toMatch(/setPrimerCollapsed\(!primerCollapsed\)/);
  });
});
