import { CollapseAgent } from '../src/agent';
import { NotionClient } from '../src/notion/client';
import * as logger from '../src/proof/logger';
import { HumanState, Task } from '../src/types';

// Mock the proof logger so it doesn't write to disk
jest.mock('../src/proof/logger', () => ({
  logAdaptation: jest.fn(),
  getProofLog: jest.fn().mockReturnValue([]),
}));

const mockState: HumanState = {
  energy: 2,
  stress: 4,
  connectivity: 'online',
  battery: 'low',
  cognitiveLoad: 4,
  timestamp: '2026-03-18T10:00:00Z',
};

const mockTasks: Task[] = [
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
    id: 'task-004',
    title: 'Respond to incident',
    description: 'High priority incident',
    priority: 'high',
    cognitiveLoad: 4,
    failureCost: 5,
    steps: ['Read report', 'Find root cause', 'Mitigate'],
    isOptional: false,
  },
];

function createMockClient(): NotionClient {
  const client = {
    getLatestState: jest.fn().mockResolvedValue(mockState),
    getTasks: jest.fn().mockResolvedValue(mockTasks),
    logState: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotionClient;
  return client;
}

describe('CollapseAgent', () => {
  let mockClient: NotionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
  });

  test('run() returns an AdaptationResult', async () => {
    const agent = new CollapseAgent(mockClient);
    const result = await agent.run();

    expect(result).toBeDefined();
    expect(result.mode).toBeDefined();
    expect(result.state).toEqual(mockState);
    expect(result.originalTasks).toEqual(mockTasks);
    expect(result.adaptedTasks).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  test('run() calls getLatestState and getTasks', async () => {
    const agent = new CollapseAgent(mockClient);
    await agent.run();

    expect(mockClient.getLatestState).toHaveBeenCalledTimes(1);
    expect(mockClient.getTasks).toHaveBeenCalledTimes(1);
  });

  test('run() logs proof entry', async () => {
    const agent = new CollapseAgent(mockClient);
    await agent.run();

    expect(logger.logAdaptation).toHaveBeenCalledTimes(1);
    const proofEntry = (logger.logAdaptation as jest.Mock).mock.calls[0][0];
    expect(proofEntry.stateInput).toEqual(mockState);
    expect(proofEntry.tasksBefore).toEqual(mockTasks);
  });

  test('mode matches state evaluation (critical state -> critical mode)', async () => {
    const agent = new CollapseAgent(mockClient);
    const result = await agent.run();

    // mockState has energy=2 (<=2) and stress=4 (>=4) and battery=low -> critical
    expect(result.mode).toBe('critical');
  });

  test('normal state results in normal mode', async () => {
    const normalState: HumanState = {
      energy: 5,
      stress: 1,
      connectivity: 'online',
      battery: 'full',
      cognitiveLoad: 1,
      timestamp: '2026-03-18T10:00:00Z',
    };
    (mockClient.getLatestState as jest.Mock).mockResolvedValue(normalState);

    const agent = new CollapseAgent(mockClient);
    const result = await agent.run();

    expect(result.mode).toBe('normal');
  });

  test('proof entry contains correct mode decision', async () => {
    const agent = new CollapseAgent(mockClient);
    await agent.run();

    const proofEntry = (logger.logAdaptation as jest.Mock).mock.calls[0][0];
    expect(proofEntry.modeDecision).toBe('critical');
    expect(proofEntry.modeReason).toContain('CRITICAL');
  });

  test('proof entry has id and timestamp', async () => {
    const agent = new CollapseAgent(mockClient);
    await agent.run();

    const proofEntry = (logger.logAdaptation as jest.Mock).mock.calls[0][0];
    expect(proofEntry.id).toBeDefined();
    expect(proofEntry.timestamp).toBeDefined();
  });
});
