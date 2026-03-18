# Collapse Engine — State Engine Documentation

## State Parameters

The `HumanState` object describes the operator's current condition across five dimensions:

| Parameter | Type | Scale | Description |
|-----------|------|-------|-------------|
| `energy` | number | 1–5 | Physical and mental energy. 1 = depleted, 5 = fully rested |
| `stress` | number | 1–5 | Stress level. 1 = calm, 5 = overwhelmed |
| `connectivity` | select | online/degraded/offline | Network connectivity status |
| `battery` | select | full/medium/low | Device battery state |
| `cognitiveLoad` | number | 1–5 | How mentally loaded the operator is. 1 = clear, 5 = at capacity |
| `timestamp` | string | ISO 8601 | When this state was recorded |

## Mode Determination Rules

The `evaluateState()` function applies the following rules in priority order (most severe wins):

### CRITICAL Mode

Triggered when **any** of the following are true:

- `energy <= 2` — operator is dangerously depleted
- `stress >= 4` — operator is overwhelmed
- `battery == 'low'` — device may shut down imminently

**Effect**: System enters emergency triage. Only the most critical tasks survive.

### DEGRADED Mode

Triggered when **any** of the following are true (and no critical conditions apply):

- `energy == 3` — energy is below optimal
- `stress == 3` — stress is elevated
- `battery == 'medium'` — battery needs monitoring
- `connectivity == 'degraded'` — network is unreliable

**Effect**: System reduces cognitive overhead. Optional work is dropped, complex tasks are simplified.

### NORMAL Mode

All parameters are within safe ranges. No critical or degraded conditions detected.

**Effect**: Full task list is presented as-is.

## Task Adaptation Rules

### Normal Mode

All tasks returned unchanged. Steps are not modified.

### Degraded Mode

1. **Optional tasks** (`isOptional == true`) are silently removed
2. **High-load tasks** (`cognitiveLoad >= 4`) have their steps truncated to the first 2, followed by `"..."`
3. **Other tasks** are returned as-is

### Critical Mode

1. **Only** `critical` and `high` priority tasks are retained
2. Tasks with `failureCost <= 2` are **deferred** (steps removed, `deferred: true`)
3. Remaining tasks are reduced to exactly **2 steps**: the first step and `"Verify completion"`
4. If `connectivity == 'offline'`, all task titles are prefixed with `[OFFLINE MODE]`

## Example Transformation

### Input State

```json
{
  "energy": 2,
  "stress": 4,
  "connectivity": "online",
  "battery": "low",
  "cognitiveLoad": 4,
  "timestamp": "2026-03-18T10:00:00Z"
}
```

→ **Mode: CRITICAL** (energy ≤ 2, stress ≥ 4, battery = low)

### Input Tasks

| ID | Title | Priority | cognitiveLoad | failureCost | Optional |
|----|-------|----------|---------------|-------------|----------|
| task-001 | Deploy production hotfix | critical | 5 | 5 | No |
| task-002 | Weekly status report | medium | 3 | 2 | No |
| task-003 | Refactor auth module | optional | 4 | 1 | Yes |
| task-004 | Respond to incident | high | 4 | 5 | No |

### Output (Critical Mode)

| ID | Title | Steps | Deferred | Reason |
|----|-------|-------|----------|--------|
| task-001 | Deploy production hotfix | ["Review the patch diff carefully", "Verify completion"] | No | Critical mode: steps reduced |
| task-002 | *(removed — not critical/high)* | — | — | — |
| task-003 | *(removed — not critical/high)* | — | — | — |
| task-004 | Respond to critical incident report | ["Read incident report thoroughly", "Verify completion"] | No | Critical mode: steps reduced |
