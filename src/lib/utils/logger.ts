/**
 * Structured logging utility
 * Outputs JSON logs with level, timestamp, message, and contextual data
 *
 * Behavior:
 * - Default shows info logs in non-test envs; suppress info logs in NODE_ENV=test
 *   unless TEST_VERBOSE/VERBOSE env var is set to 'true' (or LOG_LEVEL is 'info').
 * - WARN and ERROR logs always emitted unless LOG_LEVEL is set to a more restrictive level.
 * - Exposes helper to override log level for test cases: setLogLevelOverride(level)
 */
export type LoggerLevel = 'info' | 'warn' | 'error';

let overrideLevel: LoggerLevel | null = null;

function levelToNumber(level: LoggerLevel) {
  switch (level) {
    case 'error':
      return 0;
    case 'warn':
      return 1;
    case 'info':
    default:
      return 2;
  }
}

function getEnvLevel(): LoggerLevel {
  const env = (
    process.env.LOG_LEVEL ||
    process.env.LOGLEVEL ||
    ''
  ).toLowerCase();
  const verbose =
    process.env.VERBOSE === 'true' || process.env.TEST_VERBOSE === 'true';
  const validLevels: LoggerLevel[] = ['error', 'warn', 'info'];

  if (env && validLevels.includes(env as LoggerLevel)) {
    return env as LoggerLevel;
  }

  if (verbose) return 'info';
  if (process.env.NODE_ENV === 'test') return 'warn';
  return 'info';
}

function getEffectiveLevel(): LoggerLevel {
  if (overrideLevel) return overrideLevel;
  return getEnvLevel();
}

export function setLogLevelOverride(level: LoggerLevel | null) {
  overrideLevel = level;
}

export function logStructured(
  level: LoggerLevel,
  message: string,
  data?: Record<string, unknown>
) {
  const effective = getEffectiveLevel();
  const levelNum = levelToNumber(level);
  const effectiveNum = levelToNumber(effective);
  if (levelNum > effectiveNum) {
    // e.g. level is 'info'(2) but effective is 'warn'(1) -> suppress
    return;
  }

  const log = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  };

  // Use appropriate console method for severity
  if (level === 'error') {
    console.error(JSON.stringify(log));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(log));
  } else {
    console.log(JSON.stringify(log));
  }
}

/**
 * Logger object with convenience methods (info, warn, error)
 * Wraps logStructured for easier use in application code
 */
export const logger = {
  info: (message: string, data?: Record<string, unknown>) =>
    logStructured('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) =>
    logStructured('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) =>
    logStructured('error', message, data),
};
