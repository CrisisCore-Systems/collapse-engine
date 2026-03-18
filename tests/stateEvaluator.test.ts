import { evaluateState } from '../src/engine/stateEvaluator';
import { HumanState } from '../src/types';

const baseState: HumanState = {
  energy: 5,
  stress: 1,
  connectivity: 'online',
  battery: 'full',
  cognitiveLoad: 1,
  timestamp: '2026-03-18T10:00:00Z',
};

describe('evaluateState', () => {
  // Critical conditions
  test('energy=1 -> critical', () => {
    const result = evaluateState({ ...baseState, energy: 1 });
    expect(result.mode).toBe('critical');
    expect(result.reason).toContain('CRITICAL');
  });

  test('energy=2 -> critical', () => {
    const result = evaluateState({ ...baseState, energy: 2 });
    expect(result.mode).toBe('critical');
    expect(result.reason).toContain('energy');
  });

  test('stress=4 -> critical', () => {
    const result = evaluateState({ ...baseState, stress: 4 });
    expect(result.mode).toBe('critical');
    expect(result.reason).toContain('stress');
  });

  test('stress=5 -> critical', () => {
    const result = evaluateState({ ...baseState, stress: 5 });
    expect(result.mode).toBe('critical');
  });

  test('battery=low -> critical', () => {
    const result = evaluateState({ ...baseState, battery: 'low' });
    expect(result.mode).toBe('critical');
    expect(result.reason).toContain('battery');
  });

  // Degraded conditions
  test('energy=3 -> degraded', () => {
    const result = evaluateState({ ...baseState, energy: 3 });
    expect(result.mode).toBe('degraded');
    expect(result.reason).toContain('DEGRADED');
  });

  test('stress=3 -> degraded', () => {
    const result = evaluateState({ ...baseState, stress: 3 });
    expect(result.mode).toBe('degraded');
  });

  test('battery=medium -> degraded', () => {
    const result = evaluateState({ ...baseState, battery: 'medium' });
    expect(result.mode).toBe('degraded');
  });

  test('connectivity=degraded -> degraded', () => {
    const result = evaluateState({ ...baseState, connectivity: 'degraded' });
    expect(result.mode).toBe('degraded');
  });

  // Normal conditions
  test('normal conditions -> normal', () => {
    const result = evaluateState(baseState);
    expect(result.mode).toBe('normal');
    expect(result.reason).toContain('NORMAL');
  });

  // Multiple conditions — most severe wins
  test('energy=3 AND battery=low -> critical (most severe)', () => {
    const result = evaluateState({ ...baseState, energy: 3, battery: 'low' });
    expect(result.mode).toBe('critical');
  });

  test('energy=3 AND connectivity=degraded -> degraded', () => {
    const result = evaluateState({ ...baseState, energy: 3, connectivity: 'degraded' });
    expect(result.mode).toBe('degraded');
  });

  test('reason string is non-empty', () => {
    const result = evaluateState(baseState);
    expect(result.reason.length).toBeGreaterThan(0);
  });
});
