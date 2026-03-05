/**
 * Code Creation Rules - Base Prompt
 * 
 * Purpose: Define common rules for code creation and project structure planning
 * 
 * Use cases:
 * - CEO: Plan project structure, delegate code tasks
 * - Executor: Execute code creation, create files
 */

export interface CodeCreationOptions {
  role?: 'ceo' | 'executor' | 'default'
}

/**
 * Code Creation Core Rules (shared by all models)
 */
export const CODE_CREATION_RULES = {
  whenToCreateFiles: [
    'User requests writing code, creating components, or creating projects',
    'User requests implementing a functional module',
    'User requests refactoring or creating new file structure'
  ],
  
  whenNotToCreateFiles: [
    'User is just asking about code questions',
    'User requests explanation or analysis of code',
    'User requests modification of existing files (use edit instead of create)'
  ],
  
  structurePrinciples: [
    'Organize directories by functional modules',
    'Follow project tech stack conventions',
    'Keep directory structure clear and flat',
    'Place related files in the same directory'
  ],
  
  namingConventions: {
    components: 'PascalCase (e.g., Login.tsx, UserProfile.tsx)',
    utilities: 'camelCase (e.g., formatDate.ts, apiClient.ts)',
    directories: 'kebab-case or camelCase (e.g., components/, user-profile/)',
    config: 'lowercase with dot (e.g., .env, config.json)'
  }
}

/**
 * CEO Code Planning Rules
 */
export const CEO_CODE_RULES = `
## Code Creation Rules (CEO)

### When to Create Files
When user requests the following tasks, you must create files in the knowledge base:
- Write code, create components, create projects
- Implement a functional module
- Create new project structure

### Planning Process
1. **Understand Requirements**: Analyze what functionality the user needs
2. **Design Structure**: Plan directory and file structure
3. **Create Root Folder**: First use \`create_folder\` to create the project root directory
4. **Split Tasks**: Break large projects into multiple sub-tasks
5. **Delegate Execution**: Call sub-models with the root folder ID, let them create files in that folder

### Project Structure Principles
- Organize directories by functional modules
- Follow tech stack conventions (React components use .tsx, Node uses .js)
- Keep directory structure clear, avoid deep nesting

### Important: Folder Coordination
When delegating to multiple sub-models, you MUST:
1. **Create the project root folder first** - Use \`create_folder\` to create the main project folder
2. **Pass folder ID to sub-models** - Include the folder ID in your task description
3. **Tell sub-models to use \`get_or_create_folder\`** - Sub-models should use \`get_or_create_folder\` instead of \`create_folder\` to avoid creating duplicate folders

Example task delegation:
"After I create the root folder, you should use get_or_create_folder to create subdirectories. The root folder ID is: xxx"

### Example
User: "Help me write a user management system"

Your plan:
1. First, create root folder: create_folder(title="user-management")
   → Get folder ID: "folder-123"

2. Design structure:
\`\`\`
user-management/
├── frontend/
│   ├── App.tsx
│   ├── Login.tsx
│   └── Dashboard.tsx
├── backend/
│   ├── server.js
│   └── userModel.js
└── config/
    └── database.yml
\`\`\`

3. Delegate to sub-models (include root folder ID):
- call_model(task="Create frontend components. Root folder ID: folder-123. Use get_or_create_folder to create 'frontend' subdirectory, then create files inside.")
- call_model(task="Create backend files. Root folder ID: folder-123. Use get_or_create_folder to create 'backend' subdirectory, then create files inside.")
- ...`

/**
 * Executor Code Execution Rules
 */
export const EXECUTOR_CODE_RULES = `
## Code Creation Rules (Executor)

### Execution Principles
1. **Create Files**: Use create_document tool to create files
2. **Create Directories**: Use \`get_or_create_folder\` instead of \`create_folder\` to avoid duplicate folders
3. **Complete Code**: Write complete, runnable code
4. **Clear Naming**: Follow naming conventions

### Important: Use get_or_create_folder
When creating directories, ALWAYS use \`get_or_create_folder\` instead of \`create_folder\`:
- \`get_or_create_folder\` checks if a folder exists first, and returns it if it does
- This prevents multiple executors from creating duplicate folders with the same name
- Only use \`create_folder\` if you explicitly need to create a new unique folder

### File Creation Process
1. Confirm target file path and name
2. If parent directory doesn't exist, use get_or_create_folder to create it
3. Write complete code
4. Call create_document(title="filename", content="code content", parent_id="parent directory ID")
5. Return creation result

### Naming Conventions
- React components: PascalCase (e.g., Login.tsx)
- Utility functions: camelCase (e.g., formatDate.ts)
- Directories: kebab-case or camelCase

### Example
Task: "Create Login.tsx in the frontend folder. Root folder ID: folder-123"

Execution:
1. get_or_create_folder(title="frontend", parentId="folder-123")
   → Returns folder ID: "folder-456" (either existing or newly created)
2. create_document(
     title="Login.tsx",
     content="import React from 'react'\\n\\nexport const Login = () => { ... }",
     parent_id="folder-456"
   )
3. Return: "Created Login.tsx in frontend folder"`

/**
 * Build code creation prompt
 */
export function buildCodeCreationRules(options: CodeCreationOptions = {}): string {
  const { role = 'default' } = options

  if (role === 'ceo') {
    return CEO_CODE_RULES
  }

  if (role === 'executor') {
    return EXECUTOR_CODE_RULES
  }

  return ''
}
