/* eslint-disable @typescript-eslint/no-explicit-any */
import Model from '../models/encounter';
import type { ParticipantDoc } from '../models/encounter';

// Simple interface for API adapter (not bound to Mongoose Document)
export interface EncounterPayload {
  id?: string;
  name: string;
  description?: string;
  participants: ParticipantDoc[];
  tags?: string[];
  template_flag?: boolean;
  owner_id: string;
  org_id?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Minimal adapter: prefer server-side model when available, otherwise use in-memory/localStorage fallback.
// This satisfies T008/T009 for the TDD-first phase.

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const STORAGE_KEY = 'dnd:encounters';

function readLocal(): Record<string, EncounterPayload> {
  try {
    if (!isBrowser) return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function writeLocal(data: Record<string, EncounterPayload>) {
  try {
    if (!isBrowser) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {
    // ignore
  }
}

const adapter = {
  async list(owner_id?: string) {
    // Use model if it exists (server environment); fallback to localStorage/memory
    if (
      Model &&
      typeof (Model as unknown as any).findAllByOwner === 'function'
    ) {
      return (Model as unknown as any).findAllByOwner(owner_id);
    }
    const data = readLocal();
    const arr = Object.values(data);
    return owner_id ? arr.filter((e) => e.owner_id === owner_id) : arr;
  },
  async create(payload: Partial<EncounterPayload>) {
    if (Model && typeof (Model as unknown as any).create === 'function') {
      return (Model as unknown as any).create(payload);
    }
    const store = readLocal();
    const id = String(Date.now());
    const created: EncounterPayload = {
      ...(payload as EncounterPayload),
      id,
    } as EncounterPayload;
    store[id] = created;
    writeLocal(store);
    return created;
  },
  async get(id: string) {
    if (Model && typeof (Model as unknown as any).findById === 'function') {
      return (Model as unknown as any).findById(id);
    }
    const store = readLocal();
    return store[id] ?? null;
  },
  async update(id: string, patch: Partial<EncounterPayload>) {
    if (Model && typeof (Model as unknown as any).update === 'function') {
      return (Model as unknown as any).update(id, patch);
    }
    const store = readLocal();
    const cur = store[id];
    if (!cur) return null;
    const updated = { ...cur, ...patch };
    store[id] = updated;
    writeLocal(store);
    return updated;
  },
  async delete(id: string) {
    if (Model && typeof (Model as unknown as any).delete === 'function') {
      return (Model as unknown as any).delete(id);
    }
    const store = readLocal();
    const exists = !!store[id];
    delete store[id];
    writeLocal(store);
    return exists;
  },
};

export default adapter;
