# 🗺️ Link-Arm Roadmap

This roadmap outlines the future development direction of Link-Arm (Open Source). Our goal is to build the most powerful, extensible, and user-friendly local AI Agent desktop client.

## 📍 当前状态 (v1.0)
- ✅ **纯本地架构**：无后端依赖，直接连接 AI 提供商。
- ✅ **多模型编排**："CEO -> Executor" 分层协作模式（当前为串行执行）。
- ✅ **本地知识库**：基于本地文件管理的简易 RAG 实现。
- ✅ **Tauri v2 核心**：高性能，原生系统能力支持。

## 🚀 未来里程碑

### 第一阶段：生态扩展（优先级最高）
**核心关注：模型上下文协议 (MCP) 支持**
为了与领先的 AI 客户端竞争并利用更广泛的生态系统，我们将优先集成 MCP。

- [ ] **MCP 客户端实现**：在 Tauri 后端/前端实现 MCP 协议。
- [ ] **Tool Connection Capability**: Allow Link-Arm to connect to standard MCP servers (e.g., Google Drive, Slack, GitHub, Postgres, etc.).
- [ ] **统一工具接口**：标准化内部工具（如文件系统操作）以匹配 MCP 模式。

### 第二阶段：性能与能力
**核心关注：并行执行与高级编排**
增强 `AGIOrchestrator` 以支持复杂的高并发工作流。

- [ ] **模型并行执行**：重构编排引擎，支持基于 `Promise.all` 的子任务并行执行（例如：同时进行"搜索网络"和"编写代码"）。
- [ ] **异步 UI 渲染**：更新协作面板以支持多路流式输出的并行展示。
- [ ] **复杂依赖图**：支持基于 DAG（有向无环图）的任务规划。

### 第三阶段：开发者体验
**核心关注：插件与定制化**

- [ ] **插件系统**：轻量级的插件架构，支持社区扩展。
- [ ] **提示词市场**：分享和导入 "CEO" 和 "Executor" 的提示词模板。
- [ ] **主题系统**：完全可定制的 UI 主题。

## 🔮 长期愿景
- **本地优先的 AI 操作系统**：成为所有本地 AI 操作的中心枢纽。
- **隐私为中心的微调**：利用用户数据在本地微调小模型（可选功能）。

---
*注：本路线图可能会根据社区反馈和技术可行性进行调整。*
