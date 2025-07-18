import MCPClient from "./clients/MCPClient";
import path from "path";
import Agent from "./clients/Agent";
import {loadPrompt, logTitle} from "./utils";
import EmbeddingRetriever from "./rag/EmbeddingRetriever";
import fs from "fs";

const outPath = path.join(process.cwd(), 'output');
const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);
const fileMCP = new MCPClient("mcp-server-file", "npx", ['-y', '@modelcontextprotocol/server-filesystem', outPath]);

const Y_COMBINATOR_URL = 'https://news.ycombinator.com/'

async function main() {
    // Agent
    const agent = new Agent('openai/gpt-4o-mini', [fetchMCP, fileMCP], '');
    await agent.init();
    // Load task
    const task = await loadPrompt('task2_hackernews_csv.md');
    await agent.invoke(task);
    await agent.close();
}

// Run the main function
// main()

async function retrieveContext(prompt: string, topK: number): Promise<string> {
    // RAG
    const embeddingRetriever = new EmbeddingRetriever("BAAI/bge-m3");
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    const files = fs.readdirSync(knowledgeDir);
    for await (const file of files) {
        const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
        await embeddingRetriever.embedDocument(content);
    }
    return (await embeddingRetriever.retrieve(prompt, topK)).join('\n')
}

async function testChineseMovieRAG() {
    const prompt = '《盗梦空间》的导演是谁？剧情讲了什么？';
    const context = await retrieveContext(prompt, 1);
    logTitle('RAG CONTEXT-zh');
    console.log(context);
}

async function testEnglishMovieRAG() {
    const prompt = 'Who directed Matrix? What is the main plot of the movie, and why is the ending considered ambiguous?';
    const context = await retrieveContext(prompt, 1);

    logTitle('RAG CONTEXT-en');
    console.log(context);
}

testEnglishMovieRAG()
testChineseMovieRAG()