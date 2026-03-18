import { NotionClient } from './notion/client';
import { CollapseAgent } from './agent';
import { displayResult } from './ui/cli';

async function main() {
  const client = new NotionClient();
  const agent = new CollapseAgent(client);
  const result = await agent.run();
  displayResult(result);
}

main().catch(console.error);
