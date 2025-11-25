import { execOrAwait } from '@/lib/utils/exec-or-await';

describe('execOrAwait helper', () => {
  test('calls exec() on objects with exec function', async () => {
    const value = { id: '123' };
    const q = { exec: jest.fn().mockResolvedValue(value) } as any;
    const res = await execOrAwait(q);
    expect(q.exec).toHaveBeenCalled();
    expect(res).toEqual(value);
  });

  test('awaits promise-like thenable objects', async () => {
    const value = { id: 'thenable' };
    const p = Promise.resolve(value);
    const res = await execOrAwait(p);
    expect(res).toEqual(value);
  });

  test('returns non-thenable values directly', async () => {
    const value = 42;
    const res = await execOrAwait(value as any);
    expect(res).toBe(42);
  });
});
