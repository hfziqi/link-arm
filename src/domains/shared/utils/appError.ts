import { ErrorType, ErrorSeverity } from '../types/error'

export interface AppErrorOptions {
  code?: string
  details?: string
  context?: Record<string, unknown>
  cause?: Error
}

export class AppError extends Error {
  readonly type: ErrorType
  readonly severity: ErrorSeverity
  readonly code: string
  readonly details?: string
  readonly context?: Record<string, unknown>
  readonly timestamp: Date

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: AppErrorOptions = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.code = options.code || 'UNKNOWN'
    this.details = options.details
    this.context = options.context
    this.timestamp = new Date()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }

    if (options.cause) {
      (this as any).cause = options.cause
    }
  }

  getUserMessage(): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network connection failed, please check your connection',
      [ErrorType.AUTHENTICATION]: 'Session expired, please login again',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action',
      [ErrorType.VALIDATION]: 'Invalid input, please check and try again',
      [ErrorType.BUSINESS]: 'Operation failed, please try again later',
      [ErrorType.SYSTEM]: 'System error, please try again later',
      [ErrorType.UNKNOWN]: 'An unknown error occurred, please try again later'
    }
    return messages[this.type] || this.message
  }

  toErrorInfo() {
    return {
      type: this.type,
      severity: this.severity,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp,
      context: this.context
    }
  }

  isRecoverable(): boolean {
    return this.severity !== ErrorSeverity.CRITICAL &&
           this.type !== ErrorType.AUTHENTICATION
  }
}

export class NetworkError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      { code: 'NETWORK_ERROR', ...options }
    )
    this.name = 'NetworkError'
  }

  static fromResponse(response: Response, context?: Record<string, unknown>): NetworkError {
    return new NetworkError(
      `Network request failed: ${response.status} ${response.statusText}`,
      {
        code: `HTTP_${response.status}`,
        context: { url: response.url, status: response.status, ...context }
      }
    )
  }

  static timeout(url?: string): NetworkError {
    return new NetworkError('Request timeout, please try again later', {
      code: 'NETWORK_TIMEOUT',
      context: url ? { url } : undefined
    })
  }

  static offline(): NetworkError {
    return new NetworkError('Network disconnected, please check your connection', {
      code: 'NETWORK_OFFLINE'
    })
  }
}

export class AuthError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      { code: 'AUTH_ERROR', ...options }
    )
    this.name = 'AuthError'
  }

  static unauthorized(context?: Record<string, unknown>): AuthError {
    return new AuthError('Session expired, please login again', {
      code: 'AUTH_UNAUTHORIZED',
      context
    })
  }

  static forbidden(resource?: string): AuthError {
    return new AuthError('You do not have permission to perform this action', {
      code: 'AUTH_FORBIDDEN',
      context: resource ? { resource } : undefined
    })
  }

  static notLoggedIn(): AuthError {
    return new AuthError('User not logged in', {
      code: 'AUTH_NOT_LOGGED_IN'
    })
  }
}

export class ValidationError extends AppError {
  readonly field?: string

  constructor(message: string, field?: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { code: 'VALIDATION_ERROR', ...options }
    )
    this.name = 'ValidationError'
    this.field = field
  }

  static required(field: string): ValidationError {
    return new ValidationError(`${field} is required`, field, {
      code: 'VALIDATION_REQUIRED'
    })
  }

  static invalidFormat(field: string, expectedFormat: string): ValidationError {
    return new ValidationError(`${field} format is incorrect, expected format: ${expectedFormat}`, field, {
      code: 'VALIDATION_FORMAT',
      context: { expectedFormat }
    })
  }
}

export class BusinessError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      { code: 'BUSINESS_ERROR', ...options }
    )
    this.name = 'BusinessError'
  }

  static resourceNotFound(resource: string, id?: string): BusinessError {
    return new BusinessError(
      id ? `${resource} "${id}" does not exist` : `${resource} does not exist`,
      { code: 'BUSINESS_RESOURCE_NOT_FOUND', context: { resource, id } }
    )
  }

  static resourceExists(resource: string, id?: string): BusinessError {
    return new BusinessError(
      id ? `${resource} "${id}" already exists` : `${resource} already exists`,
      { code: 'BUSINESS_RESOURCE_EXISTS', context: { resource, id } }
    )
  }

  static operationFailed(operation: string, reason?: string): BusinessError {
    return new BusinessError(
      reason ? `${operation} failed: ${reason}` : `${operation} failed`,
      { code: 'BUSINESS_OPERATION_FAILED', context: { operation, reason } }
    )
  }
}

export class SystemError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.SYSTEM,
      ErrorSeverity.CRITICAL,
      { code: 'SYSTEM_ERROR', ...options }
    )
    this.name = 'SystemError'
  }

  static initializationFailed(component: string, cause?: Error): SystemError {
    return new SystemError(`${component} initialization failed`, {
      code: 'SYSTEM_INIT_FAILED',
      context: { component },
      cause
    })
  }

  static unexpected(cause?: Error): SystemError {
    return new SystemError('An unexpected system error occurred', {
      code: 'SYSTEM_UNEXPECTED',
      cause
    })
  }
}

export class ToolError extends AppError {
  readonly toolName?: string

  constructor(message: string, toolName?: string, options: AppErrorOptions = {}) {
    super(
      message,
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      { code: 'TOOL_ERROR', ...options }
    )
    this.name = 'ToolError'
    this.toolName = toolName
  }

  static notFound(toolName: string): ToolError {
    return new ToolError(`Tool not found: ${toolName}`, toolName, {
      code: 'TOOL_NOT_FOUND'
    })
  }

  static disabled(toolName: string): ToolError {
    return new ToolError(`Tool disabled: ${toolName}`, toolName, {
      code: 'TOOL_DISABLED'
    })
  }

  static executionFailed(toolName: string, reason: string): ToolError {
    return new ToolError(`Tool execution failed: ${reason}`, toolName, {
      code: 'TOOL_EXECUTION_FAILED',
      context: { reason }
    })
  }

  static requiresAuth(toolName: string): ToolError {
    return new ToolError(`Tool requires authentication: ${toolName}`, toolName, {
      code: 'TOOL_REQUIRES_AUTH'
    })
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
      return new NetworkError(error.message, { cause: error })
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return AuthError.unauthorized()
    }

    if (message.includes('403') || message.includes('forbidden')) {
      return AuthError.forbidden()
    }

    if (message.includes('timeout')) {
      return NetworkError.timeout()
    }

    return new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, {
      cause: error
    })
  }

  return new AppError(
    typeof error === 'string' ? error : 'An unknown error occurred',
    ErrorType.UNKNOWN,
    ErrorSeverity.MEDIUM
  )
}
