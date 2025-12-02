import { logStructured, setLogLevelOverride } from '@/lib/utils/logger';

describe('logStructured gating behavior', () => {
  const envBackup = { ...process.env };
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...envBackup };
    delete process.env.LOG_LEVEL;
    delete process.env.VERBOSE;
    delete process.env.TEST_VERBOSE;
    process.env.NODE_ENV = 'test';

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    setLogLevelOverride(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = envBackup;
    setLogLevelOverride(null);
  });

  test('suppresses info-level logs in test env by default', () => {
    logStructured('info', 'should-be-suppressed', { foo: 'bar' });
    expect(logSpy).not.toHaveBeenCalled();

    logStructured('warn', 'should-be-warn');
    expect(warnSpy).toHaveBeenCalled();

    logStructured('error', 'should-be-error');
    expect(errorSpy).toHaveBeenCalled();
  });

  test('allows info-level logs when TEST_VERBOSE is set', () => {
    process.env.TEST_VERBOSE = 'true';
    // Re-importing or just calling should respect the env var at call time
    logStructured('info', 'should-be-allowed', { test: true });
    expect(logSpy).toHaveBeenCalled();
  });

  test('setLogLevelOverride allows forcing info logs', () => {
    setLogLevelOverride('info');
    logStructured('info', 'should-be-allowed-by-override');
    expect(logSpy).toHaveBeenCalled();
  });

  test('LOG_LEVEL=error suppresses warn/info but allows error', () => {
    process.env.LOG_LEVEL = 'error';
    logStructured('info', 'suppressed-info');
    expect(logSpy).not.toHaveBeenCalled();

    logStructured('warn', 'suppressed-warn');
    expect(warnSpy).not.toHaveBeenCalled();

    logStructured('error', 'allowed-error');
    expect(errorSpy).toHaveBeenCalled();
  });

  test('setLogLevelOverride with warn level suppresses info', () => {
    setLogLevelOverride('warn');
    logStructured('info', 'should-be-suppressed');
    expect(logSpy).not.toHaveBeenCalled();

    logStructured('warn', 'should-be-allowed');
    expect(warnSpy).toHaveBeenCalled();
  });

  test('setLogLevelOverride with error level suppresses warn and info', () => {
    setLogLevelOverride('error');
    logStructured('info', 'should-be-suppressed');
    expect(logSpy).not.toHaveBeenCalled();

    logStructured('warn', 'should-be-suppressed');
    expect(warnSpy).not.toHaveBeenCalled();

    logStructured('error', 'should-be-allowed');
    expect(errorSpy).toHaveBeenCalled();
  });
});
