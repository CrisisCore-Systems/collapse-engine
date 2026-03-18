import { AdaptationResult } from '../types';

export function displayResult(result: AdaptationResult): void {
  const width = 60;
  const border = '='.repeat(width);
  const modePad = Math.floor((width - result.mode.toUpperCase().length - 16) / 2);
  const modeLabel = ' '.repeat(Math.max(0, modePad)) + `[ SYSTEM MODE: ${result.mode.toUpperCase()} ]`;

  console.log(border);
  console.log(modeLabel);
  console.log(border);
  console.log();

  console.log('CURRENT STATE');
  console.log('-'.repeat(width));
  console.log(`  Energy       : ${result.state.energy}/5`);
  console.log(`  Stress       : ${result.state.stress}/5`);
  console.log(`  Cognitive    : ${result.state.cognitiveLoad}/5`);
  console.log(`  Battery      : ${result.state.battery}`);
  console.log(`  Connectivity : ${result.state.connectivity}`);
  console.log(`  Timestamp    : ${result.state.timestamp}`);
  console.log();

  const deferred = result.adaptedTasks.filter((t) => t.deferred);
  const active = result.adaptedTasks.filter((t) => !t.deferred);
  const removed = result.originalTasks.length - result.adaptedTasks.length;

  console.log('ADAPTED TASKS');
  console.log('-'.repeat(width));
  console.log(`  Total original  : ${result.originalTasks.length}`);
  console.log(`  Active tasks    : ${active.length}`);
  console.log(`  Deferred tasks  : ${deferred.length}`);
  console.log(`  Removed tasks   : ${removed}`);
  console.log();

  if (active.length > 0) {
    console.log('ACTIVE TASK LIST');
    console.log('-'.repeat(width));
    for (const task of active) {
      console.log(`  [${task.originalId}] ${task.title}`);
      console.log(`  Reason: ${task.reason}`);
      if (task.simplifiedSteps.length > 0) {
        console.log('  Steps:');
        for (const step of task.simplifiedSteps) {
          console.log(`    - ${step}`);
        }
      }
      console.log();
    }
  }

  if (deferred.length > 0) {
    console.log('DEFERRED TASKS');
    console.log('-'.repeat(width));
    for (const task of deferred) {
      console.log(`  [${task.originalId}] ${task.title}`);
      console.log(`  Reason: ${task.reason}`);
    }
    console.log();
  }

  console.log(border);
  console.log(`  Timestamp: ${result.timestamp}`);
  console.log(border);
}
