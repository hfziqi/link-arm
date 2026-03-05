import { BaseToolPlugin } from '../core/BaseToolPlugin'
import { ToolCategory } from '../types'
import type { ToolDefinition, ToolExecutionResult, ToolExecutionContext } from '../types'
import { createLogger } from '../../shared/utils/logger'
import { fileSystemService } from '../../../infrastructure/fileSystem/fileSystemService'

const logger = createLogger('LocalFileSystemPlugin')

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export class LocalFileSystemPlugin extends BaseToolPlugin {
  readonly name = 'local-file-system'
  readonly description = 'Local file system tools for desktop and downloads directory'

  constructor() {
    super()
    this.registerTools()
  }

  protected async onInitialize(): Promise<void> {
    logger.info('[LocalFileSystemPlugin] Plugin initialized')
  }

  private registerTools(): void {
    this.registerTool(
      this.createListDesktopFilesTool(),
      this.handleListDesktopFiles.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createListDirectoryTool(),
      this.handleListDirectory.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createReadLocalFileTool(),
      this.handleReadLocalFile.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createWriteLocalFileTool(),
      this.handleWriteLocalFile.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createListDownloadsFilesTool(),
      this.handleListDownloadsFiles.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createCreateLocalDirectoryTool(),
      this.handleCreateLocalDirectory.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    this.registerTool(
      this.createDeleteLocalFileTool(),
      this.handleDeleteLocalFile.bind(this),
      ToolCategory.FILE_SYSTEM
    )

    logger.info('[LocalFileSystemPlugin] File system tools registered')
  }

  private createListDesktopFilesTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'list_desktop_files',
        description: `List all files and folders on desktop.

Use examples:
- "Help me see what files are on the desktop"
- "List desktop contents"
- "What documents are on the desktop"

Returns:
- File name
- File type (file/directory)
- File size
- Modified time`,
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    }
  }

  private async handleListDesktopFiles(
    _args: {},
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      const desktopPath = await fileSystemService.getDesktopPath()
      const files = await fileSystemService.listDirectory(desktopPath)

      const stats = {
        files: files.filter(f => f.is_file).length,
        directories: files.filter(f => f.is_dir).length,
        total: files.length
      }

      return {
        success: true,
        result: {
          path: desktopPath,
          files: files.map(f => ({
            name: f.name,
            type: f.is_dir ? 'directory' : 'file',
            size: f.is_file ? formatFileSize(f.size) : '-',
            modified: f.modified ? new Date(f.modified * 1000).toLocaleString() : '-'
          })),
          stats
        }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to list desktop files'
      }
    }
  }

  private createListDirectoryTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'list_directory',
        description: `List all files and folders in specified directory.

Use examples:
- "List contents of a folder"
- "View directory structure"

Parameters:
- path: Full path of directory (e.g., "C:\\Users\\username\\Documents")`,
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Full path of the directory'
            }
          },
          required: ['path']
        }
      }
    }
  }

  private async handleListDirectory(
    args: { path: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      const files = await fileSystemService.listDirectory(args.path)

      return {
        success: true,
        result: {
          path: args.path,
          files: files.map(f => ({
            name: f.name,
            type: f.is_dir ? 'directory' : 'file',
            size: f.is_file ? formatFileSize(f.size) : '-',
            modified: f.modified ? new Date(f.modified * 1000).toLocaleString() : '-'
          }))
        }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to list directory'
      }
    }
  }

  private createReadLocalFileTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'read_local_file',
        description: `Read local text file content.

Use examples:
- "Read content of this file"
- "Open text file"
- "View file content"

Supported formats:
- Text files (.txt)
- Markdown files (.md)
- Code files (.js, .ts, .py, etc.)
- JSON files (.json)
- Other text formats

Parameters:
- path: Full path of the file`,
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Full path of the file'
            }
          },
          required: ['path']
        }
      }
    }
  }

  private async handleReadLocalFile(
    args: { path: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      const content = await fileSystemService.readFile(args.path)
      return {
        success: true,
        result: {
          path: args.path,
          content
        }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to read file'
      }
    }
  }

  private createWriteLocalFileTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'write_local_file',
        description: `Write content to local file (create or overwrite).

Use examples:
- "Save content to file"
- "Create new file"
- "Modify file content"

Parameters:
- path: Full path of the file
- content: File content`,
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Full path of the file'
            },
            content: {
              type: 'string',
              description: 'Content to write'
            }
          },
          required: ['path', 'content']
        }
      }
    }
  }

  private async handleWriteLocalFile(
    args: { path: string; content: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      await fileSystemService.writeFile(args.path, args.content)

      const pathParts = args.path.split(/[\\/]/)
      const fileName = pathParts[pathParts.length - 1]

      return {
        success: true,
        result: {
          path: args.path,
          name: fileName,
          size: args.content.length
        }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to write file'
      }
    }
  }

  private createListDownloadsFilesTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'list_downloads_files',
        description: `List all files and folders in downloads directory.

Use examples:
- "Help me see what's in the download directory"
- "List recently downloaded files"
- "Download folder contents"`,
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    }
  }

  private async handleListDownloadsFiles(
    _args: {},
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      const downloadsPath = await fileSystemService.getDownloadsPath()
      const files = await fileSystemService.listDirectory(downloadsPath)

      const stats = {
        files: files.filter(f => f.is_file).length,
        directories: files.filter(f => f.is_dir).length,
        total: files.length
      }

      return {
        success: true,
        result: {
          path: downloadsPath,
          files: files.map(f => ({
            name: f.name,
            type: f.is_dir ? 'directory' : 'file',
            size: f.is_file ? formatFileSize(f.size) : '-',
            modified: f.modified ? new Date(f.modified * 1000).toLocaleString() : '-'
          })),
          stats
        }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to get download directory'
      }
    }
  }

  private createCreateLocalDirectoryTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'create_local_directory',
        description: `Create local directory (if not exists).

Use examples:
- "Create new folder"
- "Create directory structure"

Parameters:
- path: Full path of the directory (will create all parent directories automatically)`,
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Full path of the directory'
            }
          },
          required: ['path']
        }
      }
    }
  }

  private async handleCreateLocalDirectory(
    args: { path: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      await fileSystemService.createDirectory(args.path)

      const pathParts = args.path.split(/[\\/]/)
      const dirName = pathParts[pathParts.length - 1] || args.path

      return {
        success: true,
        result: { path: args.path, name: dirName }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to create directory'
      }
    }
  }

  private createDeleteLocalFileTool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: 'delete_local_file',
        description: `Delete local file or folder.

Can delete:
- Files at any path (e.g., desktop, downloads directory, etc.)
- Folders (will recursively delete all contents)

Danger: Cannot recover after deletion, please use with caution!

Use examples:
- "Delete file on desktop"
- "Delete this folder"
- "Remove local file"

Parameters:
- path: Full path of file or folder`,
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Full path of the file or folder'
            }
          },
          required: ['path']
        }
      }
    }
  }

  private async handleDeleteLocalFile(
    args: { path: string },
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    try {
      await fileSystemService.deleteFile(args.path)

      const pathParts = args.path.split(/[\\/]/)
      const fileName = pathParts[pathParts.length - 1] || args.path

      return {
        success: true,
        result: { path: args.path, name: fileName, deleted: true }
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      }
    }
  }
}
