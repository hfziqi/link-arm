# 🗺️ Link-Arm Roadmap

This roadmap outlines the future development direction of Link-Arm (Open Source). Our goal is to build the most powerful, extensible, and user-friendly local AI Agent desktop client.

## 📍 Current Status (v1.0)
- ✅ **Pure Local Architecture**: No backend dependencies, direct connection to AI providers.
- ✅ **Multi-Model Orchestration**: "CEO -> Executor" hierarchical collaboration mode (currently serial execution).
- ✅ **Local Knowledge Base**: Simple RAG implementation based on local file management.
- ✅ **Tauri v2 Core**: High performance with native system capability support.

## 🚀 Future Milestones

### Phase 1: Ecosystem Expansion (Highest Priority)
**Core Focus: Model Context Protocol (MCP) Support**
To compete with leading AI clients and leverage a broader ecosystem, we will prioritize MCP integration.

- [ ] **MCP Client Implementation**: Implement MCP protocol in Tauri backend/frontend.
- [ ] **Tool Connection Capability**: Allow Link-Arm to connect to standard MCP servers (e.g., Google Drive, Slack, GitHub, Postgres, etc.).
- [ ] **Unified Tool Interface**: Standardize internal tools (like file system operations) to match MCP patterns.

### Phase 2: Performance & Capabilities
**Core Focus: Parallel Execution & Advanced Orchestration**
Enhance `AGIOrchestrator` to support complex high-concurrency workflows.

- [ ] **Model Parallel Execution**: Refactor orchestration engine to support parallel subtask execution based on `Promise.all` (e.g., "search web" and "write code" simultaneously).
- [ ] **Async UI Rendering**: Update collaboration panel to support parallel display of multiple streaming outputs.
- [ ] **Complex Dependency Graphs**: Support task planning based on DAG (Directed Acyclic Graph).

### Phase 3: Developer Experience
**Core Focus: Plugins & Customization**

- [ ] **Plugin System**: Lightweight plugin architecture supporting community extensions.
- [ ] **Prompt Marketplace**: Share and import "CEO" and "Executor" prompt templates.
- [ ] **Theme System**: Fully customizable UI themes.

## 🔮 Long-term Vision
- **Local-First AI Operating System**: Become the central hub for all local AI operations.
- **Privacy-Centric Fine-tuning**: Utilize user data to fine-tune small models locally (optional feature).

---
*Note: This roadmap may be adjusted based on community feedback and technical feasibility.*
