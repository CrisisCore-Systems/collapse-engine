import * as fs from 'fs';
import * as path from 'path';
import { HumanState, Task } from '../types';

export class NotionClient {
  private token: string | undefined;
  private stateDbId: string | undefined;
  private tasksDbId: string | undefined;
  private useMock: boolean;

  constructor() {
    this.token = process.env.NOTION_TOKEN;
    this.stateDbId = process.env.NOTION_STATE_DB_ID;
    this.tasksDbId = process.env.NOTION_TASKS_DB_ID;
    this.useMock = !this.token || !this.stateDbId || !this.tasksDbId;
  }

  async getLatestState(): Promise<HumanState> {
    if (this.useMock) {
      return this.getMockState();
    }
    try {
      const { Client } = await import('@notionhq/client');
      const notion = new Client({ auth: this.token });
      const response = await notion.databases.query({
        database_id: this.stateDbId!,
        sorts: [{ property: 'timestamp', direction: 'descending' }],
        page_size: 1,
      });
      if (response.results.length === 0) {
        return this.getMockState();
      }
      return this.mapPageToState(response.results[0] as any);
    } catch {
      return this.getMockState();
    }
  }

  async getTasks(): Promise<Task[]> {
    if (this.useMock) {
      return this.getMockTasks();
    }
    try {
      const { Client } = await import('@notionhq/client');
      const notion = new Client({ auth: this.token });
      const response = await notion.databases.query({
        database_id: this.tasksDbId!,
      });
      return response.results.map((page: any) => this.mapPageToTask(page));
    } catch {
      return this.getMockTasks();
    }
  }

  async logState(state: HumanState): Promise<void> {
    if (this.useMock) {
      return;
    }
    try {
      const { Client } = await import('@notionhq/client');
      const notion = new Client({ auth: this.token });
      await notion.pages.create({
        parent: { database_id: this.stateDbId! },
        properties: {
          energy: { number: state.energy },
          stress: { number: state.stress },
          connectivity: { select: { name: state.connectivity } },
          battery: { select: { name: state.battery } },
          cognitiveLoad: { number: state.cognitiveLoad },
          timestamp: {
            rich_text: [{ type: 'text', text: { content: state.timestamp } }],
          },
        },
      });
    } catch {
      // silent fail on log
    }
  }

  private getMockState(): HumanState {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'sample-state.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const states: HumanState[] = JSON.parse(raw);
    return states[0];
  }

  private getMockTasks(): Task[] {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'sample-tasks.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw) as Task[];
  }

  private mapPageToState(page: any): HumanState {
    const props = page.properties;
    return {
      energy: props.energy?.number ?? 3,
      stress: props.stress?.number ?? 3,
      connectivity: props.connectivity?.select?.name ?? 'online',
      battery: props.battery?.select?.name ?? 'full',
      cognitiveLoad: props.cognitiveLoad?.number ?? 3,
      timestamp: props.timestamp?.rich_text?.[0]?.text?.content ?? new Date().toISOString(),
    };
  }

  private mapPageToTask(page: any): Task {
    const props = page.properties;
    const stepsRaw = props.steps?.rich_text?.[0]?.text?.content ?? '[]';
    let steps: string[] = [];
    try {
      steps = JSON.parse(stepsRaw);
    } catch {
      steps = [stepsRaw];
    }
    return {
      id: props.id?.rich_text?.[0]?.text?.content ?? page.id,
      title: props.title?.title?.[0]?.text?.content ?? 'Untitled',
      description: props.description?.rich_text?.[0]?.text?.content ?? '',
      priority: props.priority?.select?.name ?? 'medium',
      cognitiveLoad: props.cognitiveLoad?.number ?? 3,
      failureCost: props.failureCost?.number ?? 3,
      steps,
      isOptional: props.isOptional?.checkbox ?? false,
    };
  }
}
