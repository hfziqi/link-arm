import { BaseToolPlugin } from '../core/BaseToolPlugin'
import { ToolCategory } from '../types'
import type { ToolDefinition, ToolExecutionResult, ToolExecutionContext } from '../types'
import { createLogger } from '../../shared/utils/logger'

const logger = createLogger('BusinessToolsPlugin')

export interface BusinessToolsDependencies {
  fileService: {
    listFiles: (params: any) => Promise<any>
    readFile: (fileId: string) => Promise<any>
    writeFile: (fileId: string, content: string, fileType?: string) => Promise<any>
    createFile: (params: any) => Promise<any>
    deleteFile: (fileId: string, recursive?: boolean) => Promise<any>
    renameFile: (fileId: string, newTitle: string) => Promise<any>
    copyFile: (fileId: string, newTitle: string, parentId?: string) => Promise<any>
  }

  knowledgeService: {
    createDocument: (title: string, content: string, fileType?: string, parentId?: string) => Promise<any>
    createFolder: (title: string, parentId?: string) => Promise<any>
    getOrCreateFolder: (title: string, parentId?: string) => Promise<any>
    deleteResource: (id: string, type: 'document' | 'folder') => Promise<any>
    renameResource: (id: string, type: 'document' | 'folder', newName: string) => Promise<any>
    moveResource: (id: string, type: 'document' | 'folder', targetParentId?: string) => Promise<any>
  }
}

export class BusinessToolsPlugin extends BaseToolPlugin {
  readonly name = 'business-tools'
  readonly description = 'Business tools including file and knowledge base management'

  private deps?: BusinessToolsDependencies

  constructor() {
    super()
    this.registerTools()
  }

  private registerTools(): void {
    this.registerTool(
      this.createListFilesTool(),
      this.handleListFiles.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createReadFileTool(),
      this.handleReadFile.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createWriteFileTool(),
      this.handleWriteFile.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createCreateDocumentTool(),
      this.handleCreateDocument.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createDeleteResourceTool(),
      this.handleDeleteResource.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createRenameResourceTool(),
      this.handleRenameResource.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createCopyDocumentTool(),
      this.handleCopyDocument.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createCreateFolderTool(),
      this.handleCreateFolder.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createGetOrCreateFolderTool(),
      this.handleGetOrCreateFolder.bind(this),
      ToolCategory.BUSINESS
    )

    this.registerTool(
      this.createMoveResourceTool(),
      this.handleMoveResource.bind(this),
      ToolCategory.BUSINESS
    )

    logger.info('[BusinessToolsPlugin] Tools registered')
  }

  setDependencies(deps: BusinessToolsDependencies): void {
    this.deps = deps
    logger.info('[BusinessToolsPlugin] Dependencies injected')
  }

  protected async onInitialize(): Promise<void> {
    logger.info('[BusinessToolsPlugin] Plugin initialized')
  }

  private createListFilesTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'list_files',
        description: 'List files and folders in specified directory',
        parameters: {
          type: 'object',
          properties: {
            folder_id: {
              type: 'string',
              description: 'Folder ID, if not provided lists root directory'
            }
          },
          required: []
        }
      }
    }
  }

  private createReadFileTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Read file content',
        parameters: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'File ID'
            }
          },
          required: ['file_id']
        }
      }
    }
  }

  private createWriteFileTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Write file content',
        parameters: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'File ID'
            },
            content: {
              type: 'string',
              description: 'File content'
            }
          },
          required: ['file_id', 'content']
        }
      }
    }
  }

  private createCreateDocumentTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'create_document',
        description: 'Create new document',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Document title'
            },
            content: {
              type: 'string',
              description: 'Document content'
            },
            file_type: {
              type: 'string',
              description: 'File type, supports txt or docx, default txt'
            },
            parent_id: {
              type: 'string',
              description: 'Parent folder ID'
            }
          },
          required: ['title', 'content']
        }
      }
    }
  }

  private async handleListFiles(
    args: { folder_id?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.fileService.listFiles({
        parentId: args.folder_id,
        pageSize: 100
      })
      return { success: true, result }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to list files'
      }
    }
  }

  private async handleReadFile(
    args: { file_id: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.fileService.readFile(args.file_id)
      return { success: true, result }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to read file'
      }
    }
  }

  private async handleWriteFile(
    args: { file_id: string; content: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      await this.deps.fileService.writeFile(args.file_id, args.content)
      return { success: true, result: { message: 'File written successfully' } }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to write file'
      }
    }
  }

  private async handleCreateDocument(
    args: { title: string; content: string; file_type?: string; parent_id?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const normalizedFileType = args.file_type === 'docx' ? 'docx' : 'txt'
      const doc = await this.deps.knowledgeService.createDocument(
        args.title,
        args.content,
        normalizedFileType,
        args.parent_id
      )
      return { success: true, result: { document: doc } }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to create document'
      }
    }
  }

  private createDeleteResourceTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'delete_resource',
        description: `Delete resources (documents or folders) from knowledge base.

Note: This is for deleting knowledge base resources, not local files!

Use examples:
- Delete knowledge base document → { "id": "doc-abc123", "type": "document" }
- Delete folder → { "id": "folder-ghi789", "type": "folder" }`,
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Resource ID (from list_resources)' },
            type: { type: 'string', enum: ['document', 'folder'], description: 'Resource type' }
          },
          required: ['id', 'type']
        }
      }
    }
  }

  private async handleDeleteResource(
    args: { id: string; type: 'document' | 'folder' },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      await this.deps.knowledgeService.deleteResource(args.id, args.type)
      return { success: true, result: { id: args.id, type: args.type, deleted: true } }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to delete resource' }
    }
  }

  private createRenameResourceTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'rename_resource',
        description: `Rename resources (documents or folders) in knowledge base.

Use examples:
- Rename document → { "id": "doc-abc123", "type": "document", "newName": "new name" }`,
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Resource ID' },
            type: { type: 'string', enum: ['document', 'folder'], description: 'Resource type' },
            newName: { type: 'string', description: 'New name' }
          },
          required: ['id', 'type', 'newName']
        }
      }
    }
  }

  private async handleRenameResource(
    args: { id: string; type: 'document' | 'folder'; newName: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      await this.deps.knowledgeService.renameResource(args.id, args.type, args.newName)
      return { success: true, result: { id: args.id, type: args.type, newName: args.newName } }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to rename' }
    }
  }

  private createCopyDocumentTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'copy_document',
        description: `Copy documents or folders to specified location.

Use examples:
- Copy document → { "resourceId": "doc-abc123", "newTitle": "new document name", "parentId": "folder-xyz" }`,
        parameters: {
          type: 'object',
          properties: {
            resourceId: { type: 'string', description: 'Resource ID to copy' },
            newTitle: { type: 'string', description: 'New name (optional)' },
            parentId: { type: 'string', description: 'Target folder ID (optional)' }
          },
          required: ['resourceId']
        }
      }
    }
  }

  private async handleCopyDocument(
    args: { resourceId: string; newTitle?: string; parentId?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.fileService.copyFile(args.resourceId, args.newTitle || '', args.parentId)
      return { success: true, result }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to copy' }
    }
  }

  private createCreateFolderTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'create_folder',
        description: `Create new folder.

Use examples:
- Create folder → { "title": "new folder" }
- Create in specified folder → { "title": "sub folder", "parentId": "folder-abc123" }`,
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Folder name' },
            parentId: { type: 'string', description: 'Parent folder ID (optional)' }
          },
          required: ['title']
        }
      }
    }
  }

  private async handleCreateFolder(
    args: { title: string; parentId?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.knowledgeService.createFolder(args.title, args.parentId)
      return { success: true, result }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to create folder' }
    }
  }

  private createGetOrCreateFolderTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'get_or_create_folder',
        description: `Get existing folder by name or create if not exists. Use this instead of create_folder when collaborating with other models to avoid duplicate folders.

Use examples:
- Get or create folder → { "title": "components" }
- Get or create in parent folder → { "title": "components", "parentId": "folder-abc123" }`,
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Folder name' },
            parentId: { type: 'string', description: 'Parent folder ID (optional)' }
          },
          required: ['title']
        }
      }
    }
  }

  private async handleGetOrCreateFolder(
    args: { title: string; parentId?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.knowledgeService.getOrCreateFolder(args.title, args.parentId)
      return { success: true, result }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to get or create folder' }
    }
  }

  private createMoveResourceTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'move_resource',
        description: `Move a document or folder to a different folder.

Use examples:
- Move document to folder → { "id": "doc-123", "type": "document", "targetParentId": "folder-abc" }
- Move folder to another folder → { "id": "folder-xyz", "type": "folder", "targetParentId": "folder-abc" }
- Move to root (no parent) → { "id": "doc-123", "type": "document" }`,
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Resource ID to move' },
            type: { type: 'string', enum: ['document', 'folder'], description: 'Resource type' },
            targetParentId: { type: 'string', description: 'Target parent folder ID (omit to move to root)' }
          },
          required: ['id', 'type']
        }
      }
    }
  }

  private async handleMoveResource(
    args: { id: string; type: 'document' | 'folder'; targetParentId?: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    if (!this.deps) {
      return { success: false, result: null, error: 'Dependency not injected' }
    }

    try {
      const result = await this.deps.knowledgeService.moveResource(args.id, args.type, args.targetParentId)
      return { success: true, result }
    } catch (error) {
      return { success: false, result: null, error: error instanceof Error ? error.message : 'Failed to move resource' }
    }
  }
}

let businessToolsPluginInstance: BusinessToolsPlugin | null = null

export function getBusinessToolsPlugin(): BusinessToolsPlugin {
  if (!businessToolsPluginInstance) {
    businessToolsPluginInstance = new BusinessToolsPlugin()
  }
  return businessToolsPluginInstance
}

export function resetBusinessToolsPlugin(): void {
  businessToolsPluginInstance = null
}
