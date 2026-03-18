export const StateLogSchema = {
  name: 'StateLog',
  properties: {
    energy: { type: 'number', description: 'Energy level on a 1-5 scale' },
    stress: { type: 'number', description: 'Stress level on a 1-5 scale' },
    connectivity: {
      type: 'select',
      options: ['online', 'degraded', 'offline'],
      description: 'Current connectivity level',
    },
    battery: {
      type: 'select',
      options: ['full', 'medium', 'low'],
      description: 'Device battery level',
    },
    cognitiveLoad: { type: 'number', description: 'Cognitive load on a 1-5 scale' },
    timestamp: { type: 'rich_text', description: 'ISO 8601 timestamp of the state entry' },
  },
} as const;

export const TasksSchema = {
  name: 'Tasks',
  properties: {
    id: { type: 'rich_text', description: 'Unique task identifier' },
    title: { type: 'title', description: 'Task title' },
    description: { type: 'rich_text', description: 'Full task description' },
    priority: {
      type: 'select',
      options: ['critical', 'high', 'medium', 'low', 'optional'],
      description: 'Task priority level',
    },
    cognitiveLoad: { type: 'number', description: 'Estimated cognitive load on a 1-5 scale' },
    failureCost: { type: 'number', description: 'Consequence of not completing on a 1-5 scale' },
    steps: { type: 'rich_text', description: 'JSON-encoded array of task steps' },
    isOptional: { type: 'checkbox', description: 'Whether the task is optional' },
  },
} as const;
