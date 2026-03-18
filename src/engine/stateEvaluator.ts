import { HumanState, SystemMode } from '../types';

export function evaluateState(state: HumanState): { mode: SystemMode; reason: string } {
  const criticalReasons: string[] = [];
  const degradedReasons: string[] = [];

  // Critical conditions
  if (state.energy <= 2) {
    criticalReasons.push(`energy is critically low (${state.energy}/5)`);
  }
  if (state.stress >= 4) {
    criticalReasons.push(`stress is critically high (${state.stress}/5)`);
  }
  if (state.battery === 'low') {
    criticalReasons.push('battery is low');
  }

  if (criticalReasons.length > 0) {
    return {
      mode: 'critical',
      reason: `CRITICAL mode: ${criticalReasons.join('; ')}`,
    };
  }

  // Degraded conditions
  if (state.energy === 3) {
    degradedReasons.push(`energy is reduced (${state.energy}/5)`);
  }
  if (state.stress === 3) {
    degradedReasons.push(`stress is elevated (${state.stress}/5)`);
  }
  if (state.battery === 'medium') {
    degradedReasons.push('battery is at medium level');
  }
  if (state.connectivity === 'degraded') {
    degradedReasons.push('connectivity is degraded');
  }

  if (degradedReasons.length > 0) {
    return {
      mode: 'degraded',
      reason: `DEGRADED mode: ${degradedReasons.join('; ')}`,
    };
  }

  return {
    mode: 'normal',
    reason: 'NORMAL mode: all systems within acceptable parameters',
  };
}
