import * as fs from 'fs';
import * as path from 'path';
import { ProofEntry } from '../types';

function getLogPath(): string {
  return process.env.PROOF_LOG_PATH ?? path.join(process.cwd(), 'proof', 'adaptations.json');
}

export function logAdaptation(entry: ProofEntry): void {
  const logPath = getLogPath();
  const dir = path.dirname(logPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let entries: ProofEntry[] = [];
  if (fs.existsSync(logPath)) {
    try {
      const raw = fs.readFileSync(logPath, 'utf-8');
      entries = JSON.parse(raw);
    } catch {
      entries = [];
    }
  }

  entries.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(entries, null, 2), 'utf-8');
}

export function getProofLog(): ProofEntry[] {
  const logPath = getLogPath();
  if (!fs.existsSync(logPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(logPath, 'utf-8');
    return JSON.parse(raw) as ProofEntry[];
  } catch {
    return [];
  }
}
