import pc from 'picocolors';
import type { LogLevel } from './types.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(pc.gray('[DEBUG]'), ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(pc.blue('[INFO]'), ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(pc.yellow('[WARN]'), ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(pc.red('[ERROR]'), ...args);
    }
  }

  success(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(pc.green('[OK]'), ...args);
    }
  }
}

let defaultLogger: Logger | null = null;

export function createLogger(level: LogLevel = 'info'): Logger {
  defaultLogger = new Logger(level);
  return defaultLogger;
}

export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger('info');
  }
  return defaultLogger;
}
