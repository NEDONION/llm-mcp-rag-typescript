import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { ChatCompletionTool } from "openai/resources/chat/completions";
// import { ClaudeToolDef } from "claude/sdk"; // If Claude is supported in the future, the type can be introduced

export class ToolAdapter {
    static getToolDefinitionsForModel(model: string, tools: Tool[]): any[] {
        const normalized = model.replace(/^openai\//i, "");

        if (normalized.startsWith("gpt")) {
            return tools.map<ChatCompletionTool>((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema,
                },
            }));
        }

        // if (model.startsWith("claude")) {
        //   return tools.map<ClaudeToolFormat>((tool) => ({
        //     name: tool.name,
        //     description: tool.description,
        //     input_schema: tool.inputSchema,
        //   }));
        // }

        throw new Error(`Unsupported model: ${model}`);
    }
}
