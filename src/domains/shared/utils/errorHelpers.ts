import type { ErrorInfo } from '../types/error'
import { handleError } from '../services/errorHandlingService'

export interface ErrorContext {
  source: string
  action: string
  [key: string]: unknown
}

export const errorBuilders = {
  models: {
    storageLoadFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelStorage', action }
      }),

    repositoryFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelRepository', action }
      }),

    orchestrationFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelOrchestration', action }
      })
  },

  chat: {
    messageStorageFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'MessageStorage', action }
      }),

    flowFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useChatFlow', action }
      }),

    sendFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useChatSend', action }
      })
  },

  tools: {
    backendToolsFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'BackendTools', action }
      }),

    unifiedServiceFailed: (error: unknown, action: string, toolName?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'UnifiedToolService', action, toolName }
      }),

    executionFailed: (error: unknown, action: string, toolName?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ToolExecution', action, toolName }
      })
  },

  backendTools: {
    mcpFailed: (error: unknown, action: string, serverName?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'MCPService', action, serverName }
      }),

    knowledgeServerFailed: (error: unknown, action: string, toolName?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'KnowledgeToolsServer', action, toolName }
      })
  },

  application: {
    initializationFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'InitializationService', action }
      })
  },

  api: {
    triggerDataFailed: (error: unknown, action: string, userId?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'TriggerDataApi', action, userId }
      })
  },

  knowledgeBase: {
    operationsFailed: (error: unknown, action: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useKnowledgeOperations', action }
      }),

    managerFailed: (error: unknown, action: string, type?: string) =>
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'UnifiedKnowledgeManager', action, type }
      })
  }
}

export function handleGenericError(
  error: unknown,
  source: string,
  action: string,
  additionalContext?: Record<string, unknown>
): ErrorInfo {
  return handleError(error, {
    showToast: false,
    logToConsole: true,
    context: {
      source,
      action,
      ...additionalContext
    }
  })
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler: (error: unknown) => ErrorInfo
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    errorHandler(error)
    return null
  }
}

export function withSyncErrorHandling<T>(
  operation: () => T,
  errorHandler: (error: unknown) => ErrorInfo
): T | null {
  try {
    return operation()
  } catch (error) {
    errorHandler(error)
    return null
  }
}

export function createDomainErrorHandler(domain: string, action: string) {
  return (error: unknown, additionalContext?: Record<string, unknown>) =>
    handleError(error, {
      showToast: false,
      logToConsole: true,
      context: {
        source: domain,
        action,
        ...additionalContext
      }
    })
}
