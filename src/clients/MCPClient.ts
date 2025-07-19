import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import {Tool} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCPClient 封装了 MCP 协议客户端，用于连接工具服务并调用其功能。
 * MCPClient wraps MCP client logic to connect and call tools over stdio transport.
 */
export default class MCPClient {
    private mcp: Client;                          // MCP 协议客户端实例
    private command: string;                      // 要运行的服务命令（例如：某个 CLI 可执行程序）
    private args: string[];                       // 启动命令的参数
    private transport: StdioClientTransport | null = null; // 标准输入输出传输通道
    private tools: Tool[] = [];                   // 工具列表（来自远端 MCP 服务）

    /**
     * 构造函数 - 初始化 MCPClient 实例
     * @param name - 当前客户端名称
     * @param command - 执行工具服务的命令
     * @param args - 命令行参数
     * @param version - 客户端版本（可选）
     */
    constructor(name: string, command: string, args: string[], version?: string) {
        this.mcp = new Client({name, version: version || "0.0.1"});
        this.command = command;
        this.args = args;
    }

    /**
     * 初始化客户端：连接到工具服务并拉取可用工具列表
     */
    public async init() {
        await this.connectToServer();
    }

    /**
     * 关闭客户端连接
     */
    public async close() {
        await this.mcp.close();
    }

    /**
     * 获取可用工具列表（由远端服务提供）
     * @returns tools 工具列表
     */
    public getTools() {
        return this.tools;
    }

    /**
     * 调用指定工具
     * @param name 工具名称
     * @param params 参数对象（应符合 inputSchema）
     */
    public async callTool(name: string, params: Record<string, any>) {
        // 如果尚未连接 transport，则自动连接
        if (!this.transport) {
            await this.connectToServer();
        }

        return this.mcp.callTool({
            name,
            arguments: params,
        });
    }


    /**
     * 内部方法：连接到工具服务并拉取工具定义
     */
    private async connectToServer() {
        try {
            // 创建 stdio 传输通道（通过子进程）
            this.transport = new StdioClientTransport({
                command: this.command,
                args: this.args,
            });

            // 与 MCP 服务建立连接
            await this.mcp.connect(this.transport);

            // 拉取工具列表并映射成本地工具结构
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                };
            });

            console.log(
                "Connected to server with tools:",
                this.tools.map(({name}) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
}
