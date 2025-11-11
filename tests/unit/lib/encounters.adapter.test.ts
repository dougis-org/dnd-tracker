import { describe, expect, it, beforeEach, afterEach } from '@jest/globals'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

function createInMemoryStorage(): StorageLike & { data: Record<string, string> } {
  const data: Record<string, string> = {}
  return {
    data,
    getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
    clear: () => {
      Object.keys(data).forEach((key) => delete data[key])
    },
  }
}
describe('createEncounterAdapter fallback mode', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).window = { localStorage: createInMemoryStorage() }
  })

  afterEach(() => {
    if (originalWindow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).window = originalWindow
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window
    }
  })
  it('assigns timestamps on create/update when using local fallback', async () => {
    jest.doMock('@/lib/models/encounter', () => ({}))
    const { createEncounterAdapter } = await import('@/lib/api/encounters')
    const timestamps = [
      new Date('2025-11-10T00:00:00.000Z'),
      new Date('2025-11-10T01:00:00.000Z'),
    ]
    const adapter = createEncounterAdapter({
      model: null,
      storage: createInMemoryStorage(),
      now: () => timestamps.shift()!,
      idFactory: () => 'enc-001',
    })

    const created = await adapter.create({
      name: 'Goblin Ambush',
      participants: [{ type: 'monster', displayName: 'Goblin', quantity: 2 }],
      owner_id: 'user-123',
    })

    expect(created.id).toBe('enc-001')
    expect(created.created_at).toBe('2025-11-10T00:00:00.000Z')
    expect(created.updated_at).toBe('2025-11-10T00:00:00.000Z')

    const updated = await adapter.update('enc-001', { name: 'Goblin Ambush (Revised)' })
    expect(updated?.name).toBe('Goblin Ambush (Revised)')
    expect(updated?.created_at).toBe('2025-11-10T00:00:00.000Z')
    expect(updated?.updated_at).toBe('2025-11-10T01:00:00.000Z')
  })
  it('persists data via storage fallback for list/get/delete flows', async () => {
    jest.doMock('@/lib/models/encounter', () => ({}))
    const { createEncounterAdapter } = await import('@/lib/api/encounters')
    const storage = createInMemoryStorage()
    const adapter = createEncounterAdapter({
      model: undefined,
      storage,
      idFactory: (() => {
        const ids = ['enc-002', 'enc-003']
        return () => ids.shift() ?? 'enc-fallback'
      })(),
    })

    await adapter.create({
      name: 'Bridge Battle',
      participants: [{ type: 'monster', displayName: 'Troll', quantity: 1 }],
      owner_id: 'user-a',
    })

    await adapter.create({
      name: 'Forest Skirmish',
      participants: [{ type: 'monster', displayName: 'Bandit', quantity: 3 }],
      owner_id: 'user-b',
    })

    const forUserA = await adapter.list('user-a')
    expect(forUserA).toHaveLength(1)
    expect(forUserA[0].name).toBe('Bridge Battle')

    const retrieved = await adapter.get('enc-002')
    expect(retrieved?.name).toBe('Bridge Battle')

    const deleted = await adapter.delete('enc-002')
    expect(deleted).toBe(true)
    expect(await adapter.get('enc-002')).toBeNull()
  })
})
describe('createEncounterAdapter model delegation', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('delegates methods to provided model when available', async () => {
    const list = jest.fn().mockResolvedValue(['list-result'])
    const create = jest.fn().mockResolvedValue({ id: 'enc-model' })
    const get = jest.fn().mockResolvedValue({ id: 'enc-model' })
    const update = jest.fn().mockResolvedValue({ id: 'enc-model', name: 'Updated' })
    const remove = jest.fn().mockResolvedValue(true)

    jest.doMock('@/lib/models/encounter', () => ({
      findAllByOwner: list,
      create,
      findById: get,
      update,
      delete: remove,
    }))

    const { createEncounterAdapter } = await import('@/lib/api/encounters')
    const adapter = createEncounterAdapter()

    await adapter.list('owner')
    await adapter.create({ name: 'any', participants: [], owner_id: 'owner' })
    await adapter.get('enc-model')
    await adapter.update('enc-model', { name: 'Updated' })
    await adapter.delete('enc-model')

    expect(list).toHaveBeenCalledWith('owner')
    expect(create).toHaveBeenCalled()
    expect(get).toHaveBeenCalledWith('enc-model')
    expect(update).toHaveBeenCalledWith('enc-model', { name: 'Updated' })
    expect(remove).toHaveBeenCalledWith('enc-model')
  })
})
