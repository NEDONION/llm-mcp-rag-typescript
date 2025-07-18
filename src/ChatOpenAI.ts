import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js"
import 'dotenv/config'
import {logTitle} from "./utils";
import {ToolAdapter} from "./tools/ToolAdapter";

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

/**
 * ChatOpenAI 类用于与 OpenAI Chat API 交互并支持工具调用
 * ChatOpenAI class for interacting with OpenAI API and handling function/tool calls
 */
export default class ChatOpenAI {
    private llm: OpenAI;
    private model: string;
    private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    private tools: Tool[];

    constructor(model: string, systemPrompt: string = '', tools: Tool[] = [], context: string = '') {
        this.llm = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });
        this.model = model;
        this.tools = tools;

        // 如果有系统提示词 和上下文，则添加到消息参数列表
        if (systemPrompt) this.messages.push({role: "system", content: systemPrompt});
        if (context) this.messages.push({role: "user", content: context});
    }

    /**
     * 主对话函数，发送用户 prompt 并处理返回的内容和工具调用
     * Main chat function: sends prompt and handles response and tool calls
     */
    async chat(prompt?: string): Promise<{ content: string, toolCalls: ToolCall[] }> {
        logTitle('CHAT');
        if (prompt) {
            this.messages.push({role: "user", content: prompt});
        }
        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
            tools: this.getToolsDefinition(),
        });
        let content = "";
        let toolCalls: ToolCall[] = [];
        logTitle('RESPONSE');
        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta;
            // 处理普通Content
            if (delta.content) {
                const contentChunk = chunk.choices[0].delta.content || "";
                content += contentChunk;
                process.stdout.write(contentChunk);
            }
            // 处理ToolCall
            if (delta.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    // 第一次要创建一个toolCall
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({id: '', function: {name: '', arguments: ''}});
                    }
                    let currentCall = toolCalls[toolCallChunk.index];
                    // 累加字段 逐块返回 - accumulating streamed fields
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id;
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name;
                    if (toolCallChunk.function?.arguments) currentCall.function.arguments += toolCallChunk.function.arguments;
                }
            }
        }
        // 将 AI 回复加入历史消息（含 tool call）
        this.messages.push({
            role: "assistant",
            content: content,
            tool_calls: toolCalls.map(call => ({id: call.id, type: "function", function: call.function}))
        });
        return {
            content: content,
            toolCalls: toolCalls,
        };
    }

    /**
     * 添加工具返回结果到消息队列
     * Appends tool execution result to message history
     */
    public appendToolResult(toolCallId: string, toolOutput: string) {
        this.messages.push({
            role: "tool",
            content: toolOutput,
            tool_call_id: toolCallId
        });
    }

    /**
     * 获取工具定义列表，用于传给 OpenAI API
     * Returns OpenAI-compatible tool definitions
     */
    private getToolsDefinition(): any[] {
        return ToolAdapter.getToolDefinitionsForModel(this.model, this.tools);
    }
}