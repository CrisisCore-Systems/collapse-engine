import { Task, AdaptedTask, SystemMode, HumanState } from '../types';

export function adaptTasks(tasks: Task[], mode: SystemMode, state: HumanState): AdaptedTask[] {
  switch (mode) {
    case 'normal':
      return adaptNormal(tasks);
    case 'degraded':
      return adaptDegraded(tasks);
    case 'critical':
      return adaptCritical(tasks, state);
  }
}

function adaptNormal(tasks: Task[]): AdaptedTask[] {
  return tasks.map((task) => ({
    originalId: task.id,
    title: task.title,
    simplifiedSteps: task.steps,
    deferred: false,
    reason: 'Normal operation — task unchanged',
  }));
}

function adaptDegraded(tasks: Task[]): AdaptedTask[] {
  const result: AdaptedTask[] = [];
  for (const task of tasks) {
    if (task.isOptional) {
      continue;
    }
    if (task.cognitiveLoad >= 4) {
      const simplified = task.steps.slice(0, 2);
      if (task.steps.length > 2) {
        simplified.push('...');
      }
      result.push({
        originalId: task.id,
        title: task.title,
        simplifiedSteps: simplified,
        deferred: false,
        reason: `Degraded mode: task simplified due to high cognitive load (${task.cognitiveLoad}/5)`,
      });
    } else {
      result.push({
        originalId: task.id,
        title: task.title,
        simplifiedSteps: task.steps,
        deferred: false,
        reason: 'Degraded mode: task retained at full detail',
      });
    }
  }
  return result;
}

function adaptCritical(tasks: Task[], state: HumanState): AdaptedTask[] {
  const result: AdaptedTask[] = [];
  const offlinePrefix = state.connectivity === 'offline' ? '[OFFLINE MODE] ' : '';

  for (const task of tasks) {
    if (task.priority !== 'critical' && task.priority !== 'high') {
      continue;
    }

    if (task.failureCost <= 2) {
      result.push({
        originalId: task.id,
        title: `${offlinePrefix}${task.title}`,
        simplifiedSteps: [],
        deferred: true,
        reason: `Critical mode: deferred — failure cost is low (${task.failureCost}/5) and resources are limited`,
      });
      continue;
    }

    const mostImportant = task.steps[0] ?? 'Complete the task';
    const simplifiedSteps = [mostImportant, 'Verify completion'];

    result.push({
      originalId: task.id,
      title: `${offlinePrefix}${task.title}`,
      simplifiedSteps,
      deferred: false,
      reason: `Critical mode: steps reduced to essentials — energy/stress/battery at critical levels`,
    });
  }

  return result;
}
