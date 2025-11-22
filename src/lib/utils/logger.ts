/**
 * Structured logging utility
 * Outputs JSON logs with level, timestamp, message, and contextual data
 */
export function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) {
  const log = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  };
  console.log(JSON.stringify(log));
}
