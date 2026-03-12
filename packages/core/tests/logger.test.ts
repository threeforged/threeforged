import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, createLogger, getLogger } from '../src/logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a logger with default info level', () => {
    const logger = new Logger();
    expect(logger.getLevel()).toBe('info');
  });

  it('should create a logger with specified level', () => {
    const logger = new Logger('debug');
    expect(logger.getLevel()).toBe('debug');
  });

  it('should filter messages below the current level', () => {
    const logger = new Logger('warn');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.debug('debug message');
    logger.info('info message');
    expect(logSpy).not.toHaveBeenCalled();

    logger.warn('warn message');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should log debug messages when level is debug', () => {
    const logger = new Logger('debug');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.debug('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should log error messages via console.error', () => {
    const logger = new Logger('error');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should log success messages at info level', () => {
    const logger = new Logger('info');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.success('done');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should change level dynamically', () => {
    const logger = new Logger('error');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('hidden');
    expect(spy).not.toHaveBeenCalled();
    logger.setLevel('info');
    logger.info('visible');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('createLogger / getLogger', () => {
  it('should return a singleton logger', () => {
    const logger1 = createLogger('debug');
    const logger2 = getLogger();
    expect(logger2).toBe(logger1);
  });

  it('getLogger should create a default logger if none exists', () => {
    // getLogger always returns a logger
    const logger = getLogger();
    expect(logger).toBeInstanceOf(Logger);
  });
});
