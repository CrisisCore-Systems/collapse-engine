import { NotionClient } from '../notion/client';
import { evaluateState } from '../engine/stateEvaluator';
import { adaptTasks } from '../engine/taskAdapter';
import { logAdaptation } from '../proof/logger';
import { AdaptationResult, ProofEntry } from '../types';
import { randomUUID } from 'crypto';

export class CollapseAgent {
  constructor(private notionClient: NotionClient) {}

  async run(): Promise<AdaptationResult> {
    const state = await this.notionClient.getLatestState();
    const tasks = await this.notionClient.getTasks();

    const { mode, reason } = evaluateState(state);
    const adaptedTasks = adaptTasks(tasks, mode, state);

    const timestamp = new Date().toISOString();

    const proofEntry: ProofEntry = {
      id: randomUUID(),
      timestamp,
      stateInput: state,
      modeDecision: mode,
      modeReason: reason,
      tasksBefore: tasks,
      tasksAfter: adaptedTasks,
    };

    logAdaptation(proofEntry);

    return {
      mode,
      state,
      originalTasks: tasks,
      adaptedTasks,
      timestamp,
    };
  }
}
