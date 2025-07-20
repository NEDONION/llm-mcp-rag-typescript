# LLM + MCP + RAG TypeScript Version

构建一个轻量、无框架依赖的增强型大语言模型智能体（Augmented LLM Agent），结合 Chat + MCP + RAG，支持多任务智能处理流程，例如网页阅读总结、本地文档问答等。

Build a lightweight, framework-free Augmented LLM Agent powered by Chat + MCP + RAG, supporting intelligent workflows
like web summarization and document-grounded Q&A.

## Key Features

- **Framework-Free**
    - No LangChain, LlamaIndex, CrewAI, or AutoGen — built from scratch with full control.
    - 不依赖第三方框架，自主构建，透明可控。
- **Multi-MCP Support for LLM and Tool Orchestration**
    - Connect to one or more MCP servers for model execution and tool integration.
    - 支持多个 MCP 服务并行编排，实现模型推理与工具调用的灵活调度与切换
- **RAG Engine & In-Memory Vector Engine (Backend & Frontend)**
    - Upload and manage knowledge documents. 上传和管理知识库
    - Generate embeddings with `BAAI/bge-m3` for knowledge documents each from Embedding Model Provider.
    - Run-time injects vectors in memory for fast similarity search. 运行时注入向量在内存中以进行快速相似性搜索.
    - Compute similarity via dot product, retrieve only the most relevant Top K content. 通过点积计算相似度，仅检索最相关的内容.

## System Architecture

```mermaid
graph TB
    subgraph "UI Layer / 用户界面层"
        UI[React Frontend App / 前端应用]
        Admin[Admin Dashboard / 管理后台]
        Chat[Chat Interface / 聊天界面]
    end

    subgraph "API Gateway Layer / API网关层"
        API[Express API Server / 接口服务器]
        Routes[Route Controllers / 路由控制器]
    end

    subgraph "Core Business Layer / 核心业务层"
        Agent[Agent Orchestrator / 协调器]
        LLM[ChatOpenAI / 大语言模型]
        RAG[Embedding Retriever / 向量检索]
        VectorStore[Vector Store / 向量存储]
    end

    subgraph "Tool Integration Layer / 工具集成层"
        MCP1[Fetch MCP Client / 抓取工具]
        MCP2[Filesystem MCP Client / 文件工具]
        MCP3[Other MCP Clients / 其他工具]
    end

    subgraph "External Services / 外部服务层"
        OpenAI[OpenAI API]
        EmbeddingAPI[Embedding Service / 向量服务]
        Web[Web Pages / 网页]
        FileSystem[Local Filesystem / 本地文件]
    end

    subgraph "Storage Layer / 数据存储层"
        Knowledge[Knowledge Docs / 知识库]
        Output[Output Files / 输出文件]
        Memory[In-Memory Vector Store / 内存向量]
    end

%% Connections
    UI --> API
    Admin --> API
    Chat --> API
    API --> Agent
    Routes --> Agent
    Agent --> LLM
    Agent --> MCP1
    Agent --> MCP2
    Agent --> MCP3
    Agent --> RAG
    RAG --> VectorStore
    RAG --> EmbeddingAPI
    MCP1 --> Web
    MCP2 --> FileSystem
    MCP3 --> Web
    LLM --> OpenAI
    RAG --> Knowledge
    VectorStore --> Memory
    MCP2 --> Output
```

## Agent Internal Architecture

```mermaid
graph LR
    subgraph "Core Components"
        A[Agent Class]
        C[ChatOpenAI]
        M1[MCPClient 1]
        M2[MCPClient 2]
        M3[MCPClient N]
    end

    subgraph "Tool Execution Flow"
        T1[Tool Call 1]
        T2[Tool Call 2]
        T3[Tool Call N]
    end

    subgraph "Dialog Management"
        D1[User Input]
        D2[LLM Response]
        D3[Tool Results]
        D4[Final Reply]
    end

    A --> C
    A --> M1
    A --> M2
    A --> M3
    C --> D1
    C --> D2
    C --> D3
    C --> D4
    M1 --> T1
    M2 --> T2
    M3 --> T3
```

## RAG Architecture

```mermaid
graph TB
    subgraph "RAG Flow / RAG处理流程"
        Q[User Query / 用户查询]
        E[Embedding Generation / 向量生成]
        S[Similarity Search / 相似度搜索]
        R[Retrieved Docs / 检索结果]
        C[Context Injection / 上下文注入]
    end

    subgraph "Vector Store / 向量存储"
        VS[VectorStore]
        VI[VectorStoreItem]
        V1[Vector 1]
        V2[Vector 2]
        VN[Vector N]
    end

    subgraph "Knowledge Base"
        KB[Docs]
        K1[Doc 1]
        K2[Doc 2]
        KN[Doc N]
    end

    subgraph "External Services / Model Providers"
        EM[Embedding API]
        BGE[BAAI/bge-m3 Model]
    end

    Q --> E
    E --> EM
    EM --> BGE
    KB --> E
    K1 --> E
    K2 --> E
    KN --> E
    E --> VS
    VS --> VI
    VI --> V1
    VI --> V2
    VI --> VN
    Q --> S
    S --> VS
    S --> R
    R --> C
```

## Frontend Architecture

```mermaid
graph TB
    subgraph "React App"
        App[App.tsx]
        Router[React Router]
        Theme[Theme Provider]
    end

    subgraph "Pages"
        ChatPage[Chat Page 对话]
        AdminPage[Admin Page 管理]
        RAGPage[RAG Config Page RAG配置]
    end

    subgraph "UI Components"
        ChatLLM[ChatLLM]
        ChatInput[ChatInput]
        AIAnswer[AI Answer]
        Sidebar[Sidebar]
        AdminLayout[Admin Layout]
    end

    subgraph "API Layer"
        APIClient[API Client]
        Axios[Axios]
    end

    subgraph "Styling"
        CSS[CSS Modules]
        Antd[Ant Design]
        Icons[Icon Set]
    end

    App --> Router
    App --> Theme
    Router --> ChatPage
    Router --> AdminPage
    Router --> RAGPage
    ChatPage --> ChatLLM
    ChatPage --> ChatInput
    ChatPage --> AIAnswer
    ChatPage --> Sidebar
    AdminPage --> AdminLayout
    ChatLLM --> APIClient
    ChatInput --> APIClient
    AdminLayout --> APIClient
    APIClient --> Axios
    ChatLLM --> CSS
    ChatInput --> CSS
    AIAnswer --> CSS
    Sidebar --> CSS
    AdminLayout --> CSS
    CSS --> Antd
    CSS --> Icons
```

## Data Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Frontend
    participant API as API Server
    participant Agent as Agent Orchestrator
    participant LLM as LLM
    participant MCP as Tools
    participant RAG as RAG System
    participant External as External Services/Model Provider
    User ->> UI: Send Query
    UI ->> API: HTTP Request
    API ->> Agent: Init Agent
    Agent ->> RAG: Retrieve Context
    RAG ->> External: Request Embedding
    External -->> RAG: Return Vectors 向量
    RAG -->> Agent: Return Docs
    Agent ->> LLM: Query + Context
    LLM -->> Agent: LLM Response

    alt Tool Call Needed
        Agent ->> MCP: Call Tool
        MCP ->> External: Execute
        External -->> MCP: Result
        MCP -->> Agent: Tool Output
        Agent ->> LLM: Send Result
        LLM -->> Agent: Final Answer
    end

    Agent -->> API: Return Response
    API -->> UI: HTTP Response
    UI -->> User: Show Result

```

## **The augmented LLM**

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

![](https://raw.githubusercontent.com/NEDONION/my-pics-space/main/20250717172938.png)

```mermaid
classDiagram
    class Agent {
        +init()
        +close()
        +invoke(prompt: string)
        -mcpClients: MCPClient[]
        -llm: ChatOpenAI
        -model: string
        -systemPrompt: string
        -context: string
    }
    class ChatOpenAI {
        +chat(prompt?: string)
        +appendToolResult(toolCallId: string, toolOutput: string)
        -llm: OpenAI
        -model: string
        -messages: OpenAI.Chat.ChatCompletionMessageParam[]
        -tools: Tool[]
    }
    class EmbeddingRetriever {
        +embedDocument(document: string)
        +embedQuery(query: string)
        +retrieve(query: string, topK: number)
        -embeddingModel: string
        -vectorStore: VectorStore
    }
    class MCPClient {
        +init()
        +close()
        +getTools()
        +callTool(name: string, params: Record<string, any>)
        -mcp: Client
        -command: string
        -args: string[]
        -transport: StdioClientTransport
        -tools: Tool[]
    }
    class VectorStore {
        +addEmbedding(embedding: number[], document: string)
        +search(queryEmbedding: number[], topK: number)
        -vectorStore: VectorStoreItem[]
    }
    class VectorStoreItem {
        -embedding: number[]
        -document: string
    }

    Agent --> MCPClient: uses
    Agent --> ChatOpenAI: interacts with
    ChatOpenAI --> ToolCall: manages
    EmbeddingRetriever --> VectorStore: uses
    VectorStore --> VectorStoreItem: contains
```

## How to start

### 1. Install dependencies

```bash
   pnpm install
   
   brew install uv
 ```

> uv is required to run MCP servers. You can skip it if you're not using local MCP backends.

### 2. Configure environment variables

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
```
### 3. Local Start Testing Function (`Index.ts`)
#### 3.1 Write your task prompt

Add your task prompt in the `prompts/` directory.
For example:

```shell
prompts/task2_hackernews_csv.md
```

#### 3.2 Run the agent

```bash
pnpm run dev
```

### 4. Run Backend Server and Frontend UI as Application

```bash 
pnpm run setup
pnpm run all
```


## MCP

- [MCP Architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- [MCP Client](https://modelcontextprotocol.io/quickstart/client)
- [Fetch MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
- [Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)