# Collapse Engine

> Adaptive workflow engine for real-world instability — powered by human-state awareness and Notion MCP.

## What Is This?

The Collapse Engine reads your current state (energy, stress, connectivity, battery) and automatically rewrites your task list to match your actual capacity. When you're running on empty, it doesn't pretend you can do everything. It collapses your obligations to what you can actually handle.

Three system modes:

- **NORMAL** — Full task list, all steps intact
- **DEGRADED** — Optional work dropped, complex tasks simplified
- **CRITICAL** — Only critical/high tasks, max 2 steps each, offline-aware

## Quick Start

```bash
# Install dependencies
npm install

# Run with mock data (no Notion token required)
npm run dev

# Build for production
npm run build
npm start

# Run tests
npm test
```

## Configuration

All configuration is via environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_TOKEN` | No | Notion integration token. If not set, mock data is used |
| `NOTION_STATE_DB_ID` | No | Notion database ID for StateLog entries |
| `NOTION_TASKS_DB_ID` | No | Notion database ID for Tasks |
| `PROOF_LOG_PATH` | No | Path for proof log file. Defaults to `proof/adaptations.json` |

If none of the Notion variables are set, the engine runs entirely from `data/sample-state.json` and `data/sample-tasks.json`.

## Architecture

```
src/
  index.ts          ← Entry point
  types.ts          ← All shared interfaces
  agent/
    index.ts        ← Orchestrates the full cycle
  notion/
    client.ts       ← Notion API + mock fallback
    schema.ts       ← Database schemas
  engine/
    stateEvaluator.ts  ← Determines mode from state
    taskAdapter.ts     ← Rewrites tasks for mode
  ui/
    cli.ts          ← Terminal display
  proof/
    logger.ts       ← Audit log writer
```

See [docs/architecture.md](docs/architecture.md) and [docs/state-engine.md](docs/state-engine.md) for full documentation.

## Example Output

```
============================================================
          [ SYSTEM MODE: CRITICAL ]
============================================================

CURRENT STATE
------------------------------------------------------------
  Energy       : 2/5
  Stress       : 4/5
  Cognitive    : 4/5
  Battery      : low
  Connectivity : online
  Timestamp    : 2026-03-18T10:00:00Z

ADAPTED TASKS
------------------------------------------------------------
  Total original  : 4
  Active tasks    : 2
  Deferred tasks  : 0
  Removed tasks   : 2

ACTIVE TASK LIST
------------------------------------------------------------
  [task-001] Deploy production hotfix
  Reason: Critical mode: steps reduced to essentials
  Steps:
    - Review the patch diff carefully
    - Verify completion

  [task-004] Respond to critical incident report
  Reason: Critical mode: steps reduced to essentials
  Steps:
    - Read incident report thoroughly
    - Verify completion

============================================================
  Timestamp: 2026-03-18T10:05:23.000Z
============================================================
```

## Design Philosophy

The Collapse Engine treats **human state as a first-class system constraint**. Most task managers assume you have unlimited capacity. The Collapse Engine assumes you don't — and plans accordingly.

The proof log provides a full audit trail of every adaptation decision, allowing you to review how the system responded to your state over time.

Offline mode is a feature, not a fallback. When connectivity is unavailable, the system explicitly marks it — and adjusts accordingly.

## License

See [LICENSE](LICENSE).