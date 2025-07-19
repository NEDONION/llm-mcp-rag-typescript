import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js"
import {logTitle} from "./utils";
import {ToolAdapter} from "./tools/ToolAdapter";
import 'dotenv/config'

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
        console.log('[Init] OpenAI client initialized with model:', model);
        this.model = model;
        this.tools = tools;

        // 如果有系统提示词 和上下文，则添加到消息参数列表
        if (systemPrompt) {
            this.messages.push({role: "system", content: systemPrompt});
            console.log('[Init] System prompt added:', systemPrompt);
        }
        if (context) {
            // RAG
            this.messages.push({ role: "user", content: context });
            console.log('[Init] Initial context added:', context);
        }
    }

    /**
     * 主对话函数，发送用户 prompt 并处理返回的内容和工具调用
     * Main chat function: sends prompt and handles response and tool calls
     */
    async chat(prompt?: string): Promise<{ content: string; toolCalls: ToolCall[] }> {
        logTitle('CHAT');

        if (prompt) {
            console.log('[UserPrompt]', prompt);
            this.messages.push({ role: 'user', content: prompt });
        }

        const toolsDef = this.getToolsDefinition();
        console.log('[ToolDefs] Tools sent to model:', toolsDef.map((t) => t.function?.name));

        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
            tools: toolsDef,
        });

        let content = '';
        const toolCalls: ToolCall[] = [];

        console.log('[LLM] Chat stream started for model:', this.model);
        logTitle('RESPONSE');

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
                const contentChunk = delta.content;
                content += contentChunk;
                process.stdout.write(contentChunk);
            }

            if (delta?.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    // 确保 toolCalls 数组已有这个 index 的元素
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({ id: '', function: { name: '', arguments: '' } });
                    }
                    const currentCall = toolCalls[toolCallChunk.index];
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id;
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name;
                    if (toolCallChunk.function?.arguments)
                        currentCall.function.arguments += toolCallChunk.function.arguments;
                }
            }
        }

        console.log('[Chat Result] Final content:', content);
        console.log('[Chat Result] toolCalls:', toolCalls);

        // 构建 assistant 消息（避免空 tool_calls）
        const assistantMessage: any = {
            role: 'assistant',
            content: content,
        };

        if (toolCalls.length > 0) {
            assistantMessage.tool_calls = toolCalls.map((call) => ({
                id: call.id,
                type: 'function',
                function: call.function,
            }));
        }

        this.messages.push(assistantMessage);
        console.log('[Message] Appended to context:', assistantMessage);

        return {
            content,
            toolCalls,
        };
    }


    /**
     * chatStream：以流式返回 LLM 输出（逐 token），可用于 SSE/WebSocket
     */
    async *chatStream(prompt?: string): AsyncGenerator<string> {
        logTitle('CHAT STREAM');
        if (prompt) {
            this.messages.push({ role: "user", content: prompt });
        }

        const toolsDef = this.getToolsDefinition();
        console.log('[ToolDefs] Tools sent to model (stream):', toolsDef.map(t => t.function?.name));

        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            stream: true,
            tools: toolsDef,
        });

        let content = '';
        let toolCalls: ToolCall[] = [];

        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta;

            // 正常内容片段
            if (delta.content) {
                const token = delta.content;
                content += token;
                yield token;
            }

            // 工具调用（逐块构建）
            if (delta.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({ id: '', function: { name: '', arguments: '' } });
                    }
                    const currentCall = toolCalls[toolCallChunk.index];
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id;
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name;
                    if (toolCallChunk.function?.arguments) currentCall.function.arguments += toolCallChunk.function.arguments;
                }
            }
        }

        // 添加完整回复和工具调用到消息历史
        this.messages.push({
            role: "assistant",
            content: content,
            tool_calls: toolCalls.length > 0
                ? toolCalls.map(call => ({ id: call.id, type: "function", function: call.function }))
                : undefined
        });
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
        console.log(`[ToolResult] Result added for toolCallId=${toolCallId}:`, toolOutput);
    }

    /**
     * 获取工具定义列表，用于传给 OpenAI API
     * Returns OpenAI-compatible tool definitions
     */
    private getToolsDefinition(): any[] {
        try {
            const defs = ToolAdapter.getToolDefinitionsForModel(this.model, this.tools);
            console.log(`[ToolDefs] Getting tool definitions for model: ${this.model}`);
            return defs;
        } catch (err) {
            console.error('[ToolDefs] Failed to convert tool definitions:', err);
            throw err;
        }
    }
}