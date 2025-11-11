import Model from '../models/encounter'
import type { ParticipantDoc } from '../models/encounter'

export interface EncounterPayload {
  id?: string
  name: string
  description?: string
  participants: ParticipantDoc[]
  tags?: string[]
  template_flag?: boolean
  owner_id: string
  org_id?: string | null
  created_at?: string
  updated_at?: string
}

type EncounterModelLike = {
  findAllByOwner?: (ownerId?: string) => Promise<EncounterPayload[]>
  create?: (payload: Partial<EncounterPayload>) => Promise<EncounterPayload>
  findById?: (id: string) => Promise<EncounterPayload | null>
  update?: (id: string, patch: Partial<EncounterPayload>) => Promise<EncounterPayload | null>
  delete?: (id: string) => Promise<boolean>
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface AdapterOptions {
  model?: EncounterModelLike | null
  storage?: StorageLike | null
  now?: () => Date
  idFactory?: () => string
  memoryStore?: Record<string, EncounterPayload>
}

const STORAGE_KEY = 'dnd:encounters'
const defaultMemoryStore: Record<string, EncounterPayload> = {}
const defaultNow = () => new Date()
const defaultIdFactory = () => {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const cloneEncounter = (encounter: EncounterPayload): EncounterPayload =>
  JSON.parse(JSON.stringify(encounter))

const syncMemory = (
  target: Record<string, EncounterPayload>,
  source: Record<string, EncounterPayload>
) => {
  Object.keys(target).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      delete target[key]
    }
  })
  Object.keys(source).forEach((key) => {
    target[key] = source[key]
  })
}
export function createEncounterAdapter(options: AdapterOptions = {}) {
  const {
    model,
    storage: providedStorage,
    now = defaultNow,
    idFactory = defaultIdFactory,
    memoryStore = defaultMemoryStore,
  } = options

  const storage = providedStorage ??
    (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null)

  const useMemory = !storage
  const memory = memoryStore

  const readAll = (): Record<string, EncounterPayload> => {
    if (useMemory) {
      return { ...memory }
    }
    try {
      const raw = storage?.getItem(STORAGE_KEY)
      if (!raw) return {}
      return JSON.parse(raw) as Record<string, EncounterPayload>
    } catch {
      return {}
    }
  }

  const writeAll = (data: Record<string, EncounterPayload>) => {
    if (useMemory) {
      syncMemory(memory, data)
      return
    }
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore storage failures
    }
  }

  const resolvedModel: EncounterModelLike | null =
    (model as EncounterModelLike | null | undefined) ??
    ((Model as unknown) as EncounterModelLike | null)

  const hasModelMethod = <K extends keyof EncounterModelLike>(
    source: EncounterModelLike | null,
    key: K
  ): source is Required<Pick<EncounterModelLike, K>> =>
    !!source && typeof source[key] === 'function'

  return {
    async list(ownerId?: string) {
      if (hasModelMethod(resolvedModel, 'findAllByOwner')) {
        return resolvedModel.findAllByOwner(ownerId)
      }
      const data = readAll()
      const encounters = Object.values(data).map(cloneEncounter)
      return ownerId ? encounters.filter((enc) => enc.owner_id === ownerId) : encounters
    },
    async create(payload: Partial<EncounterPayload>) {
      if (hasModelMethod(resolvedModel, 'create')) {
        return resolvedModel.create(payload)
      }
      const data = readAll()
      const timestamp = now().toISOString()
      const id = payload.id ?? idFactory()
      const created: EncounterPayload = {
        ...payload,
        id,
        created_at: timestamp,
        updated_at: timestamp,
      } as EncounterPayload
      data[id] = cloneEncounter(created)
      writeAll(data)
      return cloneEncounter(created)
    },
    async get(id: string) {
      if (hasModelMethod(resolvedModel, 'findById')) {
        return resolvedModel.findById(id)
      }
      const data = readAll()
      const encounter = data[id]
      return encounter ? cloneEncounter(encounter) : null
    },
    async update(id: string, patch: Partial<EncounterPayload>) {
      if (hasModelMethod(resolvedModel, 'update')) {
        return resolvedModel.update(id, patch)
      }
      const data = readAll()
      const current = data[id]
      if (!current) return null
      const nextTimestamp = now().toISOString()
      const updated: EncounterPayload = {
        ...current,
        ...patch,
        id,
        created_at: current.created_at,
        updated_at: nextTimestamp,
      }
      data[id] = cloneEncounter(updated)
      writeAll(data)
      return cloneEncounter(updated)
    },
    async delete(id: string) {
      if (hasModelMethod(resolvedModel, 'delete')) {
        return resolvedModel.delete(id)
      }
      const data = readAll()
      const exists = Object.prototype.hasOwnProperty.call(data, id)
      if (!exists) {
        return false
      }
      delete data[id]
      writeAll(data)
      return true
    },
  }
}
const defaultAdapter = createEncounterAdapter()

export default defaultAdapter
