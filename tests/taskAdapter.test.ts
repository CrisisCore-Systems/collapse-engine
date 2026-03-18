import { adaptTasks } from '../src/engine/taskAdapter';
import { Task, HumanState } from '../src/types';

const baseState: HumanState = {
  energy: 5,
  stress: 1,
  connectivity: 'online',
  battery: 'full',
  cognitiveLoad: 1,
  timestamp: '2026-03-18T10:00:00Z',
};

const tasks: Task[] = [
  {
    id: 'task-001',
    title: 'Deploy production hotfix',
    description: 'Critical security patch',
    priority: 'critical',
    cognitiveLoad: 5,
    failureCost: 5,
    steps: ['Review diff', 'Run tests', 'Deploy', 'Monitor'],
    isOptional: false,
  },
  {
    id: 'task-002',
    title: 'Weekly status report',
    description: 'Summary for stakeholders',
    priority: 'medium',
    cognitiveLoad: 3,
    failureCost: 2,
    steps: ['Gather metrics', 'Draft summary', 'Send'],
    isOptional: false,
  },
  {
    id: 'task-003',
    title: 'Refactor auth module',
    description: 'Optional cleanup',
    priority: 'optional',
    cognitiveLoad: 4,
    failureCost: 1,
    steps: ['Identify smells', 'Extract functions', 'Update tests', 'PR'],
    isOptional: true,
  },
  {
    id: 'task-004',
    title: 'Respond to incident',
    description: 'Critical incident response',
    priority: 'high',
    cognitiveLoad: 4,
    failureCost: 5,
    steps: ['Read report', 'Find root cause', 'Mitigate', 'Respond', 'Post-mortem'],
    isOptional: false,
  },
];

describe('adaptTasks - normal mode', () => {
  test('returns all tasks unchanged', () => {
    const result = adaptTasks(tasks, 'normal', baseState);
    expect(result).toHaveLength(tasks.length);
  });

  test('steps are identical to originals', () => {
    const result = adaptTasks(tasks, 'normal', baseState);
    for (let i = 0; i < tasks.length; i++) {
      expect(result[i].simplifiedSteps).toEqual(tasks[i].steps);
    }
  });

  test('no tasks are deferred', () => {
    const result = adaptTasks(tasks, 'normal', baseState);
    expect(result.every((t) => !t.deferred)).toBe(true);
  });
});

describe('adaptTasks - degraded mode', () => {
  test('optional tasks are removed', () => {
    const result = adaptTasks(tasks, 'degraded', baseState);
    const ids = result.map((t) => t.originalId);
    expect(ids).not.toContain('task-003');
  });

  test('high cognitive load tasks have simplified steps', () => {
    const result = adaptTasks(tasks, 'degraded', baseState);
    const task001 = result.find((t) => t.originalId === 'task-001');
    expect(task001).toBeDefined();
    // cognitiveLoad=5 >= 4, so simplified to first 2 + '...'
    expect(task001!.simplifiedSteps).toHaveLength(3);
    expect(task001!.simplifiedSteps[2]).toBe('...');
  });

  test('normal cognitive load tasks retain full steps', () => {
    const result = adaptTasks(tasks, 'degraded', baseState);
    const task002 = result.find((t) => t.originalId === 'task-002');
    expect(task002).toBeDefined();
    expect(task002!.simplifiedSteps).toEqual(tasks[1].steps);
  });
});

describe('adaptTasks - critical mode', () => {
  test('only critical and high priority tasks are kept', () => {
    const result = adaptTasks(tasks, 'critical', baseState);
    const ids = result.map((t) => t.originalId);
    expect(ids).toContain('task-001'); // critical
    expect(ids).toContain('task-004'); // high
    expect(ids).not.toContain('task-002'); // medium
    expect(ids).not.toContain('task-003'); // optional
  });

  test('steps simplified to max 2 for non-deferred tasks', () => {
    const result = adaptTasks(tasks, 'critical', baseState);
    for (const t of result) {
      if (!t.deferred) {
        expect(t.simplifiedSteps.length).toBeLessThanOrEqual(2);
      }
    }
  });

  test('last step of non-deferred tasks is "Verify completion"', () => {
    const result = adaptTasks(tasks, 'critical', baseState);
    for (const t of result) {
      if (!t.deferred && t.simplifiedSteps.length > 0) {
        expect(t.simplifiedSteps[t.simplifiedSteps.length - 1]).toBe('Verify completion');
      }
    }
  });

  test('tasks with failureCost <= 2 are deferred', () => {
    const lowCostHighPriority: Task = {
      id: 'task-005',
      title: 'Low cost high priority',
      description: 'Test task',
      priority: 'high',
      cognitiveLoad: 3,
      failureCost: 2,
      steps: ['Do something'],
      isOptional: false,
    };
    const result = adaptTasks([...tasks, lowCostHighPriority], 'critical', baseState);
    const task005 = result.find((t) => t.originalId === 'task-005');
    expect(task005).toBeDefined();
    expect(task005!.deferred).toBe(true);
  });

  test('offline mode prefixes titles with [OFFLINE MODE]', () => {
    const offlineState = { ...baseState, connectivity: 'offline' as const };
    const result = adaptTasks(tasks, 'critical', offlineState);
    for (const t of result) {
      expect(t.title).toMatch(/^\[OFFLINE MODE\]/);
    }
  });

  test('online mode does NOT prefix titles', () => {
    const result = adaptTasks(tasks, 'critical', baseState);
    for (const t of result) {
      expect(t.title).not.toMatch(/^\[OFFLINE MODE\]/);
    }
  });
});
