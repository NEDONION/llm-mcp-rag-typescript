import MCPClient from "./clients/MCPClient";
import path from "path";
import Agent from "./clients/Agent";
import {loadPrompt} from "./utils";

const outPath = path.join(process.cwd(), 'output');
const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);
const fileMCP = new MCPClient("mcp-server-file", "npx", ['-y', '@modelcontextprotocol/server-filesystem', outPath]);

const Y_COMBINATOR_URL = 'https://news.ycombinator.com/'

async function main() {
    // RAG
    // const context = await retrieveContext();

    // Agent
    const agent = new Agent('openai/gpt-4o-mini', [fetchMCP, fileMCP], '');
    await agent.init();

    const task = await loadPrompt('task2_hackernews_csv.md');
    await agent.invoke(task);

    await agent.close();
}

// Run the main function
main()