import { ErrorType, ErrorSeverity, ErrorInfo, ErrorHandlingOptions } from '../types/error'
import { createLogger } from '../../shared/utils/logger'
import { isAppError, toAppError } from '../utils/appError'

const logger = createLogger('ErrorHandlingService')

const errorMessages: Record<ErrorType, { user: string; technical: string }> = {
  [ErrorType.NETWORK]: {
    user: 'Network connection failed, please check your connection',
    technical: 'Network request failed'
  },
  [ErrorType.AUTHENTICATION]: {
    user: 'Session expired, please login again',
    technical: 'Authentication failed'
  },
  [ErrorType.AUTHORIZATION]: {
    user: 'You do not have permission to perform this action',
    technical: 'Access denied'
  },
  [ErrorType.VALIDATION]: {
    user: 'Invalid input, please check and try again',
    technical: 'Validation error'
  },
  [ErrorType.BUSINESS]: {
    user: 'Operation failed, please try again later',
    technical: 'Business logic error'
  },
  [ErrorType.SYSTEM]: {
    user: 'System error, please try again later',
    technical: 'System error'
  },
  [ErrorType.UNKNOWN]: {
    user: 'An unknown error occurred, please try again later',
    technical: 'Unknown error'
  }
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errorHistory: ErrorInfo[] = []
  private maxHistorySize = 50

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  private classifyError(error: unknown): ErrorInfo {
    if (isAppError(error)) {
      return error.toErrorInfo()
    }

    const timestamp = new Date()
    let type = ErrorType.UNKNOWN
    let severity = ErrorSeverity.MEDIUM
    let code = 'UNKNOWN'
    let message = 'An unknown error occurred'
    let details = ''
    let stack = ''

    if (error instanceof Error) {
      message = error.message
      stack = error.stack || ''
      details = error.name

      if (navigator.onLine === false) {
        type = ErrorType.NETWORK
        severity = ErrorSeverity.HIGH
        code = 'NETWORK_OFFLINE'
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        type = ErrorType.NETWORK
        severity = ErrorSeverity.HIGH
        code = 'NETWORK_REQUEST_FAILED'
      } else if (message.includes('401') || message.includes('Unauthorized')) {
        type = ErrorType.AUTHENTICATION
        severity = ErrorSeverity.HIGH
        code = 'AUTH_UNAUTHORIZED'
      } else if (message.includes('403') || message.includes('Forbidden')) {
        type = ErrorType.AUTHORIZATION
        severity = ErrorSeverity.HIGH
        code = 'AUTH_FORBIDDEN'
      } else if (message.includes('validation') || message.includes('Validation')) {
        type = ErrorType.VALIDATION
        severity = ErrorSeverity.LOW
        code = 'VALIDATION_ERROR'
      } else if (message.includes('business') || message.includes('Business')) {
        type = ErrorType.BUSINESS
        severity = ErrorSeverity.MEDIUM
        code = 'BUSINESS_ERROR'
      } else if (message.includes('timeout') || message.includes('Timeout')) {
        type = ErrorType.NETWORK
        severity = ErrorSeverity.HIGH
        code = 'NETWORK_TIMEOUT'
      }
    }

    return { type, severity, code, message, details, stack, timestamp }
  }

  private getUserMessage(errorInfo: ErrorInfo): string {
    const predefined = errorMessages[errorInfo.type]
    if (predefined) {
      return predefined.user
    }
    return errorInfo.message || 'An error occurred, please try again later'
  }

  handle(error: unknown, options: ErrorHandlingOptions = {}): ErrorInfo {
    const {
      showToast = false,
      logToConsole = true,
      reportToServer = false,
      customHandler,
      userMessage,
      context
    } = options

    const errorWithContext = context && !isAppError(error)
      ? toAppError(error)
      : error

    if (isAppError(errorWithContext) && context) {
      Object.assign(errorWithContext.context || {}, context)
    }

    const errorInfo = this.classifyError(errorWithContext)
    this.addToHistory(errorInfo)

    if (customHandler) {
      customHandler(errorInfo)
    }

    if (logToConsole) {
      logger.error(`[${errorInfo.type}] ${errorInfo.code}: ${errorInfo.message}`, {
        stack: errorInfo.stack,
        context: errorInfo.context
      })
    }

    if (showToast) {
      const displayMessage = userMessage || this.getUserMessage(errorInfo)
      logger.warn('User notification:', displayMessage)
    }

    if (reportToServer) {
      this.reportToServer(errorInfo)
    }

    return errorInfo
  }

  private addToHistory(error: ErrorInfo): void {
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }

  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory]
  }

  clearHistory(): void {
    this.errorHistory = []
  }

  private reportToServer(error: ErrorInfo): void {
    logger.info('[ErrorHandlingService] Error reporting disabled (open source version)', {
      type: error.type,
      code: error.code,
      message: error.message
    })
  }

  getRecentErrors(limit = 10): ErrorInfo[] {
    return this.errorHistory.slice(0, limit)
  }

  getErrorsByType(type: ErrorType): ErrorInfo[] {
    return this.errorHistory.filter(e => e.type === type)
  }

  getErrorsBySeverity(severity: ErrorSeverity): ErrorInfo[] {
    return this.errorHistory.filter(e => e.severity === severity)
  }

  hasRecentCriticalErrors(minutes = 5): boolean {
    const threshold = Date.now() - minutes * 60 * 1000
    return this.errorHistory.some(
      e => e.severity === ErrorSeverity.CRITICAL && new Date(e.timestamp).getTime() > threshold
    )
  }

  getStatistics(): { total: number; byType: Record<ErrorType, number>; bySeverity: Record<ErrorSeverity, number> } {
    const byType = {} as Record<ErrorType, number>
    const bySeverity = {} as Record<ErrorSeverity, number>

    for (const error of this.errorHistory) {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    }

    return {
      total: this.errorHistory.length,
      byType,
      bySeverity
    }
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance()

export const handleError = (error: unknown, options?: ErrorHandlingOptions): ErrorInfo => {
  return errorHandlingService.handle(error, options)
}

export const reportError = (error: unknown): ErrorInfo => {
  return errorHandlingService.handle(error, { showToast: false, logToConsole: true, reportToServer: true })
}