import MCPClient from "./MCPClient";
import ChatOpenAI from "../ChatOpenAI";
import { logTitle } from "../utils";

/**
 * Agent 类用于协调多个 MCP 工具客户端与一个 LLM 模型的对话过程。
 * 主要功能包括：初始化工具、使用 LLM 进行对话、根据工具调用结果继续对话。
 *
 * Agent coordinates multiple MCP tool clients and a single LLM.
 * It supports multi-turn tool-augmented conversation.
 */
export default class Agent {
    private mcpClients: MCPClient[];          // 工具客户端列表
    private llm: ChatOpenAI | null = null;    // LLM 实例，延迟初始化
    private model: string;                    // 使用的模型名称
    private systemPrompt: string;             // 系统级 prompt（可选）
    private context: string;                  // 对话上下文（可选）

    /**
     * 构造函数：初始化 Agent 所需参数
     * @param model 使用的 LLM 模型名称
     * @param mcpClients 工具客户端数组
     * @param systemPrompt 系统 prompt（可选）
     * @param context 初始上下文（可选）
     */
    constructor(model: string, mcpClients: MCPClient[], systemPrompt: string = '', context: string = '') {
        this.mcpClients = mcpClients;
        this.model = model;
        this.systemPrompt = systemPrompt;
        this.context = context;
    }

    /**
     * 初始化 Agent：连接 MCP 工具客户端并初始化 LLM，提供工具列表
     */
    async init() {
        logTitle('TOOLS');

        // 初始化所有工具客户端
        for await (const client of this.mcpClients) {
            await client.init();
        }

        // 获取所有工具并传入 LLM 初始化
        const tools = this.mcpClients.flatMap(client => client.getTools());
        this.llm = new ChatOpenAI(this.model, this.systemPrompt, tools, this.context);
    }

    /**
     * 关闭所有 MCP 工具客户端连接
     */
    async close() {
        for await (const client of this.mcpClients) {
            await client.close();
        }
    }

    /**
     * 执行一轮对话，并根据 LLM 返回的工具调用结果动态调用工具。
     * 如有工具调用，将工具结果继续反馈给 LLM，再继续对话。
     * @param prompt 用户输入
     * @returns 最终的 LLM 回复（不再触发工具调用时）
     */
    async invoke(prompt: string) {
        if (!this.llm) throw new Error('Agent not initialized');

        console.log('[Agent] Starting LLM chat...')
        // 启动对话
        let response = await this.llm.chat(prompt);

        console.log('[Agent] Initial response received:', response.content);
        console.log('[Agent] Starting tool call loop...');
        // 工具调用循环
        while (true) {
            if (response.toolCalls.length > 0) {
                for (const toolCall of response.toolCalls) {
                    // 根据工具名称查找对应的 MCPClient 实例
                    const mcp = this.mcpClients.find(client =>
                        client.getTools().some((t: any) => t.name === toolCall.function.name)
                    );

                    if (mcp) {
                        logTitle(`TOOL USE`);
                        console.log(`Calling tool: ${toolCall.function.name}`);
                        console.log(`Arguments: ${toolCall.function.arguments}`);

                        await mcp.init();
                        // 调用 MCP 工具，并将结果作为工具响应附加到对话中
                        const result = await mcp.callTool(
                            toolCall.function.name,
                            JSON.parse(toolCall.function.arguments)
                        );
                        console.log(`Result: ${JSON.stringify(result)}`);
                        this.llm.appendToolResult(toolCall.id, JSON.stringify(result));
                    } else {
                        // 工具未找到，返回错误信息
                        this.llm.appendToolResult(toolCall.id, 'Tool not found');
                    }
                }

                // 工具调用后，继续生成后续回复
                response = await this.llm.chat();
                continue;
            }

            // 无工具调用，结束对话并关闭连接
            await this.close();
            return response.content;
        }
    }

    // 流式对话生成
    async *stream(prompt: string) {
        if (!this.llm) throw new Error('Agent not initialized');

        for await (const chunk of this.llm.chatStream(prompt)) {
            yield chunk;
        }

        await this.close();
    }

}
