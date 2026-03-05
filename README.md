# Link-Arm

**Link Your AI Power** - Multi-model AI Collaboration Assistant

A desktop application built with React + TypeScript + Tauri.

## ✨ 开源版本特点

- 🔒 **纯本地运行**：无需后端服务器，所有数据存储在本地
- 🤖 **直接连接 AI**：AI 请求直接发送到提供商（OpenAI/Claude/DeepSeek 等）
- 🛠️ **本地工具支持**：
  - 本地文件系统操作（桌面、下载目录等）
  - 知识库管理（文档、文件夹）
  - 子模型调用（多模型协作）
- 📱 **跨平台**：支持 Windows、macOS、Linux

## 🎯 核心功能

1. **AI 对话**：支持流式响应，多轮对话
2. **模型管理**：
   - 自定义模型配置（API Key、Base URL、模型名称）
   - 支持 OpenAI、Claude、DeepSeek 等兼容 OpenAI 格式的 API
3. **知识库**：
   - 创建、编辑、删除文档
   - 文件夹管理
   - AI 可读取知识库内容
4. **本地工具**：
   - 读取本地文件
   - 操作桌面/下载目录
   - 子模型调用（任务分发）
5. **数据隔离**：使用设备ID确保数据安全

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Rust（用于 Tauri）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 启动桌面应用（新终端）
npm run desktop:dev
```

### 构建生产版本

```bash
# 构建桌面应用
npm run desktop
```

构建后的安装包位于 `src-tauri/target/release/bundle/` 目录。

## 📁 项目结构

```
src/
├── application/        # 应用层服务
│   ├── services/      # 业务服务
│   └── init.ts        # 应用初始化
├── domains/           # 领域层
│   ├── agi/           # AGI 核心（工具系统、记忆、编排）
│   ├── chat/          # 对话管理
│   ├── models/        # 模型管理
│   ├── tools-v2/      # 工具系统 V2
│   ├── unified-knowledge/  # 知识库
│   └── shared/        # 共享工具
├── infrastructure/    # 基础设施层
│   ├── ai/            # AI 服务封装
│   ├── repository/    # 数据仓库
│   ├── storage/       # 存储实现（Tauri）
├── presentation/      # 表示层
│   ├── components/    # UI 组件
│   ├── hooks/         # React Hooks
│   └── styles/        # 样式系统
└── config/            # 配置文件
```

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript
- **桌面框架**：Tauri v2
- **状态管理**：Zustand
- **样式**：Styled Components
- **构建工具**：Vite

## 🔧 模型配置

首次使用时，需要添加自定义模型：

1. 点击侧边栏"模型"图标
2. 点击"添加模型"
3. 填写以下信息：
   - **名称**：显示名称（如"DeepSeek"）
   - **提供商**：选择或输入（如"deepseek"）
   - **Base URL**：API 地址（如 `https://api.deepseek.com`）
   - **API Key**：你的 API 密钥
   - **模型名称**：模型 ID（如 `deepseek-chat`）

## 🗺️ 路线图

当前版本 (v1.0) 支持基于 **CEO -> Executor** 分层架构的串行协作模式。

我们正在积极开发下一代功能，重点包括：
1. **MCP (Model Context Protocol) 支持**：接入更广泛的工具生态（GitHub, Slack, Database 等）。
2. **并行执行引擎**：支持多个子模型同时执行互不依赖的任务，大幅提升复杂任务的处理速度。

详细规划请参考 [ROADMAP.md](./ROADMAP.md)。

## 📝 注意事项

1. **API Key 安全**：API Key 存储在本地，不会上传到任何服务器
2. **数据存储**：所有数据存储在应用数据目录，具体位置取决于操作系统：
   - Windows: `%APPDATA%/com.linkarm.app/`
   - macOS: `~/Library/Application Support/com.linkarm.app/`
   - Linux: `~/.local/share/com.linkarm.app/`
3. **设备ID**：首次启动时自动生成，用于数据隔离

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！详细的开发指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。
