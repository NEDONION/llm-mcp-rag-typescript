# LLM + MCP + RAG TypeScript Version

Build a lightweight, framework-free Augmented LLM Agent in TypeScript, featuring multi-MCP tool orchestration, in-memory RAG knowledge retrieval, real-time chat, and a modern web interface for intelligent document Q&A, web summarization, and automated workflows.

> 基于TypeScript构建的轻量级无框架增强型大语言模型智能体，集成多MCP工具编排、内存RAG知识检索、实时聊天与现代Web界面，支持智能文档问答、网页摘要和自动化工作流。

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
%% ==== User ====
  User[User 用户]

%% ==== UI ====
  subgraph "UI Layer 用户界面"
    UIGroup[Frontend UI - Chat]
    UIAdmin[RAG Admin Management]
  end

%% ==== API ====
  subgraph "API Gateway"
    API[Backend API Server]
  end

%% ==== Core ====
  subgraph "Core Business"
    Agent[Agent Orchestrator 协调器]
    LLM[LLM 大模型接入]
    RAG[RAG System]
    VectorStore[In-Memory Vector Store]
  end

%% ==== Tool ====
  subgraph "Tool Integration 工具集成层"
    MCP[MCP Clients]
  end

%% ==== Storage ====
  subgraph "Storage Layer"
    Knowledge[Knowledge DB]
    Embedding[Embedding DB]
    Output[Output Files]
  end

%% ==== External Only ====
  subgraph "External Services/Providers"
    OpenAI[OpenAI API Key]
    BGE[BAAI/bge-m3 Model]
  end

%% ==== Request Flow ====
  User --> UIGroup
  UIGroup --> API
  API --> Agent
  Agent --> LLM
  Agent --> RAG
  Agent --> MCP
  Agent --> API
  API --> UIGroup
  UIGroup --> User

%% ==== RAG Flow ====
  RAG --> VectorStore
  RAG --> Embedding
  RAG --> Knowledge
  VectorStore --> Embedding

%% ==== MCP ====
  MCP --> Knowledge
  MCP --> Output
  MCP --> FileSystem

%% ==== External Calls ====
  LLM --> OpenAI
  RAG --> BGE
```

## Agent Internal Architecture

```mermaid
graph LR
  subgraph "Core Components"
    A[Agent Instance]
    LLM[ChatOpenAI]
    M1[MCPClient 1]
    M2[MCPClient 2]
    M3[MCPClient N]
  end

  subgraph "Tool Execution"
    T1[Tool Call 1]
    T2[Tool Call 2]
    T3[Tool Call N]
    R[Tool Results]
  end

  subgraph "Dialog Flow"
    U[User Input]
    I[Initial LLM Response]
    F[Final Reply]
  end

%% User path
  U --> A
  A --> LLM
  LLM --> I

%% Tool path
  LLM --> A
  A --> M1
  A --> M2
  A --> M3
  M1 --> T1
  M2 --> T2
  M3 --> T3
  T1 --> R
  T2 --> R
  T3 --> R
  R --> A
  A --> LLM
  LLM --> F
```

## RAG Architecture

```mermaid
graph TB
  subgraph "RAG System"
    Q[User Query]
    E[Embedding Generation 向量生成]
    S[Similarity Search 相似度搜索]
    VS[VectorStore ]
    VI[Vector Dot Product & Top K 向量点积]
    R[Retrieved Docs 检索结果]
    C[Context Injection 上下文注入]
    LLM[LLM]
    A[Final Answer]
  end

  subgraph "Embedding DB 向量数据库"
    DB[Embedding DB]
    D1[Doc1Embedding]
    D2[Doc2Embedding]
    DN[DocNEmbedding]
  end

  subgraph "Knowledge DB 知识库文档"
    KB[Docs]
    K1[Doc 1]
    K2[Doc 2]
    KN[Doc N]
  end

  subgraph "External Services/Providers"
    EM[Embedding API]
    BGE[BAAI/bge-m3 Model]
  end

%% Embedding Generation
  Q --> E
  E --> EM
  EM --> BGE

%% Upload & Embedding
  KB --> E
  E --> DB
  DB --> D1
  DB --> D2
  DB --> DN

%% Load to VectorStore
  DB --> VS
  VS --> VI

%% Retrieval flow
  Q --> S
  S --> VS
  VI --> R
  R --> C
  C --> LLM --> A
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
        RAGPage[RAG Management Page]
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
  participant EmbeddingDB as Embedding Store
  participant External as External Model Provider (e.g. bge-m3)

%% === Embedding Preparation Phase (outside runtime) ===
  Note over RAG, External: [Build Phase] RAG receives new knowledge docs
  RAG ->> External: Generate Embeddings
  External -->> RAG: Return Vectors
  RAG ->> EmbeddingDB: Store Embeddings

%% === Runtime Query Flow ===
  User ->> UI: Send Query
  UI ->> API: HTTP Request
  API ->> Agent: Init Agent
  Agent ->> RAG: Retrieve Context
  RAG ->> EmbeddingDB: Load Matching Vectors
  EmbeddingDB -->> RAG: Load Vectors into Memory
  RAG -->> Agent: Return Context Docs

  Agent ->> LLM: Query + Injected Context
  LLM -->> Agent: LLM Response

  alt Tool Call Needed
    Agent ->> MCP: Call Tool
    MCP ->> External: Execute Tool Logic
    External -->> MCP: Tool Result
    MCP -->> Agent: Tool Output
    Agent ->> LLM: Send Tool Result
    LLM -->> Agent: Final Answer
  end

  Agent -->> API: Return Final Response
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
# LLM API Provider
OPENAI_API_KEY=
OPENAI_BASE_URL=

# External Embedding Model Provider
EMBEDDING_KEY=
EMBEDDING_BASE_URL=

#DB as Storage, we use MongoDB
#DATABASE_URL=
```
### 3. Local Start Testing Function (only `Index.ts` as demo)
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