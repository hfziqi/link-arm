export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  code?: string
  message: string
  details?: string
  stack?: string
  timestamp: Date
  context?: Record<string, unknown>
}

export interface ErrorHandlingOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToServer?: boolean
  retry?: boolean
  customHandler?: (error: ErrorInfo) => void
  userMessage?: string
  context?: Record<string, unknown>
}
