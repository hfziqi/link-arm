export type {
  ToolDefinition,
  ToolCall,
  ToolExecutionResult,
  ToolExecutionContext,
  ToolHandler,
  ToolRegistration,
  ToolPlugin,
  ToolPlatformConfig
} from './types'
export { ToolCategory } from './types'

export { ToolPlatform, getToolPlatform, resetToolPlatform, BaseToolPlugin } from './core'

export {
  AGIToolsPlugin,
  getAGIToolsPlugin,
  resetAGIToolsPlugin,
  BusinessToolsPlugin,
  getBusinessToolsPlugin,
  resetBusinessToolsPlugin,
  LocalFileSystemPlugin
} from './plugins'
export type { BusinessToolsDependencies } from './plugins'
