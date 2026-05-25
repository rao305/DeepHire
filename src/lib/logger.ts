type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    // Get log level from environment or default based on NODE_ENV
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
    const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    this.minLevel = envLevel && this.levels[envLevel] !== undefined ? envLevel : defaultLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): string {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      log.context = context;
    }

    if (error) {
      log.error = {
        message: error.message,
        name: error.name,
        // Only include stack traces in development
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      };
    }

    return JSON.stringify(log);
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatLog('error', message, context, error));
    }
  }
}

export const logger = new Logger();
