# Link-Arm

**Link Your AI Power** - Multi-model AI Collaboration Assistant

A desktop application built with React + TypeScript + Tauri.

## ✨ Open Source Features

- 🔒 **Pure Local Execution**: No backend server required, all data stored locally
- 🤖 **Direct AI Connection**: AI requests sent directly to providers (OpenAI/Claude/DeepSeek, etc.)
- 🛠️ **Local Tool Support**:
  - Local file system operations (Desktop, Downloads, etc.)
  - Knowledge base management (documents, folders)
  - Sub-model invocation (multi-model collaboration)
- 📱 **Cross-Platform**: Supports Windows, macOS, Linux

## 🎯 Core Features

1. **AI Chat**: Streaming responses, multi-turn conversations
2. **Model Management**:
   - Custom model configuration (API Key, Base URL, Model Name)
   - Support for OpenAI, Claude, DeepSeek and other OpenAI-compatible APIs
3. **Knowledge Base**:
   - Create, edit, delete documents
   - Folder management
   - AI can read knowledge base content
4. **Local Tools**:
   - Read local files
   - Operate Desktop/Downloads directories
   - Sub-model invocation (task distribution)
5. **Data Isolation**: Uses device ID to ensure data security

## 🚀 Quick Start

### Requirements

- Node.js 18+
- Rust (for Tauri)

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
# Start frontend dev server
npm run dev

# Start desktop app (new terminal)
npm run desktop:dev
```

### Build Production Version

```bash
# Build desktop app
npm run desktop
```

Built installers are located in `src-tauri/target/release/bundle/` directory.

## 📁 Project Structure

```
src/
├── application/        # Application layer services
│   ├── services/      # Business services
│   └── init.ts        # App initialization
├── domains/           # Domain layer
│   ├── agi/           # AGI core (tools, memory, orchestration)
│   ├── chat/          # Chat management
│   ├── models/        # Model management
│   ├── tools-v2/      # Tool system V2
│   ├── unified-knowledge/  # Knowledge base
│   └── shared/        # Shared utilities
├── infrastructure/    # Infrastructure layer
│   ├── ai/            # AI service wrapper
│   ├── repository/    # Data repositories
│   ├── storage/       # Storage implementation (Tauri)
├── presentation/      # Presentation layer
│   ├── components/    # UI components
│   ├── hooks/         # React Hooks
│   └── styles/        # Style system
└── config/            # Configuration files
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Tauri v2
- **State Management**: Zustand
- **Styling**: Styled Components
- **Build Tool**: Vite

## 🔧 Model Configuration

When using for the first time, you need to add custom models:

1. Click the "Models" icon in the sidebar
2. Click "Add Model"
3. Fill in the following information:
   - **Name**: Display name (e.g., "DeepSeek")
   - **Provider**: Select or enter (e.g., "deepseek")
   - **Base URL**: API address (e.g., `https://api.deepseek.com`)
   - **API Key**: Your API key
   - **Model Name**: Model ID (e.g., `deepseek-chat`)

## 🗺️ Roadmap

Current version (v1.0) supports serial collaboration mode based on **CEO -> Executor** hierarchical architecture.

We are actively developing next-generation features, focusing on:
1. **MCP (Model Context Protocol) Support**: Connect to broader tool ecosystem (GitHub, Slack, Database, etc.)
2. **Parallel Execution Engine**: Support multiple sub-models executing independent tasks simultaneously, significantly improving complex task processing speed

For detailed plans, please refer to [ROADMAP.md](./ROADMAP.md).

## 📝 Notes

1. **API Key Security**: API Keys are stored locally and will not be uploaded to any server
2. **Data Storage**: All data is stored in the app data directory, location depends on OS:
   - Windows: `%APPDATA%/com.linkarm.app/`
   - macOS: `~/Library/Application Support/com.linkarm.app/`
   - Linux: `~/.local/share/com.linkarm.app/`
3. **Device ID**: Automatically generated on first launch, used for data isolation

## 🤝 Contributing

Issues and Pull Requests are welcome! For detailed development guidelines, please refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

This project is open-sourced under [MIT License](./LICENSE).
