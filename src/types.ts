export type ConnectivityLevel = 'online' | 'degraded' | 'offline';
export type BatteryLevel = 'full' | 'medium' | 'low';
export type SystemMode = 'normal' | 'degraded' | 'critical';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'optional';

export interface HumanState {
  energy: number;        // 1-5 scale
  stress: number;        // 1-5 scale
  connectivity: ConnectivityLevel;
  battery: BatteryLevel;
  cognitiveLoad: number; // 1-5 scale
  timestamp: string;     // ISO 8601
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  cognitiveLoad: number;  // 1-5 scale
  failureCost: number;    // 1-5 scale (consequence if not done)
  steps: string[];
  isOptional: boolean;
}

export interface AdaptedTask {
  originalId: string;
  title: string;
  simplifiedSteps: string[];
  deferred: boolean;
  reason: string;
}

export interface AdaptationResult {
  mode: SystemMode;
  state: HumanState;
  originalTasks: Task[];
  adaptedTasks: AdaptedTask[];
  timestamp: string;
}

export interface ProofEntry {
  id: string;
  timestamp: string;
  stateInput: HumanState;
  modeDecision: SystemMode;
  modeReason: string;
  tasksBefore: Task[];
  tasksAfter: AdaptedTask[];
}
