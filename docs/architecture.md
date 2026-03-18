# Collapse Engine — Architecture

## Overview

The Collapse Engine is an adaptive workflow management system that evaluates the human operator's current state (energy, stress, connectivity, battery) and automatically adjusts task lists to match available capacity. It is designed to operate reliably whether online or completely offline.

## Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `src/types.ts` | Shared TypeScript interfaces and type aliases |
| `src/notion/client.ts` | Notion API integration with mock/offline fallback |
| `src/notion/schema.ts` | Notion database property schema definitions |
| `src/engine/stateEvaluator.ts` | Determines system mode from human state |
| `src/engine/taskAdapter.ts` | Rewrites task list based on mode |
| `src/proof/logger.ts` | Appends adaptation decisions to audit log |
| `src/agent/index.ts` | Orchestrates the full evaluation cycle |
| `src/ui/cli.ts` | Renders adaptation results to the terminal |
| `src/index.ts` | CLI entry point — wires everything together |

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    src/index.ts                      │
│                  (Entry Point / CLI)                  │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 CollapseAgent.run()                   │
│                  src/agent/index.ts                   │
└───┬─────────────────────────────────────────────┬───┘
    │                                             │
    ▼                                             ▼
┌──────────────────────┐            ┌─────────────────────┐
│    NotionClient       │            │    evaluateState()   │
│  src/notion/client.ts │            │  stateEvaluator.ts  │
│  (or mock data)       │            └──────────┬──────────┘
└──────────┬───────────┘                        │
           │                                    ▼
    HumanState + Tasks              ┌─────────────────────┐
           │                        │    adaptTasks()      │
           └────────────────────────│  taskAdapter.ts      │
                                    └──────────┬──────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │   logAdaptation()    │
                                   │  proof/logger.ts     │
                                   └──────────┬──────────┘
                                               │
                                               ▼
                                   ┌─────────────────────┐
                                   │   displayResult()    │
                                   │    ui/cli.ts         │
                                   └─────────────────────┘
```

## How Offline Mode Works

The system operates in two connectivity layers:

1. **Data Layer (Notion API)**: If `NOTION_TOKEN`, `NOTION_STATE_DB_ID`, or `NOTION_TASKS_DB_ID` environment variables are not set, the client automatically falls back to reading from `data/sample-state.json` and `data/sample-tasks.json`. This allows the engine to run fully without any network access.

2. **Task Layer (connectivity field)**: The `HumanState.connectivity` field signals whether the operator is online/degraded/offline. In `critical` mode with `connectivity='offline'`, all task titles are prefixed with `[OFFLINE MODE]` to make the context explicit.

## How the Proof System Works

Every time the agent runs, it creates a `ProofEntry` containing:
- A unique UUID
- The full input state
- The mode decision and reason
- The original task list
- The adapted task list

This entry is appended to `proof/adaptations.json` (configurable via `PROOF_LOG_PATH`). The file grows as an audit log, enabling:
- Retrospective analysis of how the system responded to state changes
- Debugging of unexpected adaptations
- Personal tracking over time

The proof directory is git-ignored (except `.gitkeep`) to avoid committing personal data.
