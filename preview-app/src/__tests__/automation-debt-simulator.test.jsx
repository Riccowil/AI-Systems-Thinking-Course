import { describe, test, expect, vi } from 'vitest';

// Mock React hooks -- pure functions in artifact do not depend on them,
// but the module-level import of react must resolve cleanly.
vi.mock('react', () => ({
  useState: vi.fn(init => [init, vi.fn()]),
  useCallback: vi.fn(fn => fn),
  useRef: vi.fn(() => ({ current: null })),
}));

import { SimEngine, stepSim, getGrade, SCENARIOS, COUNTER_PATTERNS, QUIZ } from '../automation-debt-simulator.jsx';

describe('AB-02: 12-Round Decision Game', () => {
  test('test_simulation_engine_initializes: SimEngine returns correct starting state', () => {
    const state = SimEngine();
    expect(state.symptomSeverity).toBe(70);
    expect(state.fundamentalCapacity).toBe(100);
    expect(state.orgWill).toBe(100);
    expect(state.fixDependency).toBe(0);
    expect(state.round).toBe(0);
    expect(state.attemptNumber).toBe(1);
  });

  test('test_stepSim_symptomatic: symptomatic choice increases fixDependency', () => {
    const initial = SimEngine();
    const next = stepSim(initial, 'symptomatic', 'llm_confidence');
    expect(next.fixDependency).toBeGreaterThan(initial.fixDependency);
  });

  test('test_stepSim_nothing: doing nothing increases symptomSeverity', () => {
    const initial = SimEngine();
    const next = stepSim(initial, 'nothing', 'llm_confidence');
    expect(next.symptomSeverity).toBeGreaterThan(initial.symptomSeverity);
  });
});

describe('AB-03: Three Scenarios', () => {
  test('test_scenarios_complete: all 3 scenarios have required fields', () => {
    const requiredKeys = ['llm_confidence', 'agent_edge_cases', 'tool_latency'];
    for (const key of requiredKeys) {
      expect(SCENARIOS).toHaveProperty(key);
      const sc = SCENARIOS[key];
      expect(sc.symptomatic).toHaveProperty('quickEffect');
      expect(sc.fundamental).toHaveProperty('delay');
    }
  });
});

describe('AB-04: Four Metrics Tracked', () => {
  test('test_four_metrics_in_history: history entries contain all 4 metrics', () => {
    const initial = SimEngine();
    const next = stepSim(initial, 'symptomatic', 'llm_confidence');
    expect(next.history).toHaveLength(1);
    const entry = next.history[0];
    expect(entry).toHaveProperty('symptom');
    expect(entry).toHaveProperty('capacity');
    expect(entry).toHaveProperty('dependency');
    expect(entry).toHaveProperty('will');
  });
});

describe('AB-05: Grading and Gauge', () => {
  test('test_grade_A_threshold: composite >= 0.80 returns grade A', () => {
    // symptomSeverity=10 -> sev=0.90, fundamentalCapacity=90 -> cap=0.90,
    // fixDependency=5 -> dep=0.95, orgWill=85 -> wil=0.85
    // composite = 0.90*0.3 + 0.90*0.3 + 0.95*0.2 + 0.85*0.2 = 0.27+0.27+0.19+0.17 = 0.90
    const result = getGrade({ symptomSeverity: 10, fundamentalCapacity: 90, fixDependency: 5, orgWill: 85 });
    expect(result.grade).toBe('A');
  });

  test('test_debt_score_derivation: debt score tracks inverse of composite', () => {
    const result = getGrade({ symptomSeverity: 10, fundamentalCapacity: 90, fixDependency: 5, orgWill: 85 });
    expect(result.composite).toBeGreaterThan(0);
    expect(result.composite).toBeLessThanOrEqual(1);
    const debtScore = Math.round((1 - result.composite) * 100);
    expect(debtScore).toBeGreaterThanOrEqual(0);
    expect(debtScore).toBeLessThanOrEqual(100);
  });
});

describe('AB-10: Archetype Boundaries', () => {
  test('test_counter_patterns_present: 3 counter-patterns defined', () => {
    expect(COUNTER_PATTERNS).toHaveLength(3);
    for (const cp of COUNTER_PATTERNS) {
      expect(cp).toHaveProperty('name');
      expect(cp).toHaveProperty('principle');
      expect(cp).toHaveProperty('example');
      expect(cp).toHaveProperty('test');
    }
  });

  test('test_quiz_questions_present: 3 quiz questions with answers defined', () => {
    expect(QUIZ).toHaveLength(3);
    for (const q of QUIZ) {
      expect(q).toHaveProperty('q');
      expect(q).toHaveProperty('opts');
      expect(q).toHaveProperty('answer');
      expect(q).toHaveProperty('explain');
    }
  });
});
