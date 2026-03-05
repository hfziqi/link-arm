export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enabled: boolean
  prefix?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

class Logger {
  private config: LoggerConfig = {
    level: 'info',
    enabled: true
  }

  constructor() {
    if (import.meta.env.PROD) {
      this.config.level = 'warn'
    }
  }

  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, prefix?: string): string {
    const timestamp = new Date().toISOString()
    const prefixStr = prefix ? `[${prefix}] ` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${prefixStr}${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }
}

export const logger = new Logger()

export function createLogger(prefix: string) {
  return {
    debug: (message: string, ...args: any[]) => logger.debug(`[${prefix}] ${message}`, ...args),
    info: (message: string, ...args: any[]) => logger.info(`[${prefix}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => logger.warn(`[${prefix}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => logger.error(`[${prefix}] ${message}`, ...args)
  }
}
