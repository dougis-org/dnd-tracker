/**
 * Mock adapter for Monster CRUD operations
 * Stores data in localStorage for frontend-first development
 * Will be replaced by real API calls when backend is available
 */

import {
  Monster,
  MonsterCreateInput,
  MonsterUpdateInput,
} from '@/types/monster';
import { generateSampleMonsters } from './sampleMonsters';

const STORAGE_KEY = 'dnd-tracker:monsters';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class MonsterAdapter {
  private cache: Map<string, Monster> = new Map();
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const stored = this.getStorageData();
    if (stored && stored.length > 0) {
      stored.forEach((monster: Monster) => this.cache.set(monster.id, monster));
    } else {
      // Initialize with sample monsters on first run
      const samples = generateSampleMonsters(200);
      samples.forEach((monster) => this.cache.set(monster.id, monster));
      this.persistToStorage();
    }

    this.initialized = true;
  }

  private getStorageData(): Monster[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error('Failed to read monster data from localStorage');
      return [];
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.cache.values());
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.error('Failed to persist monster data to localStorage');
    }
  }

  async list(filters?: {
    cr?: { min?: number; max?: number };
    type?: string;
    scope?: string;
  }): Promise<Monster[]> {
    await this.ensureInitialized();

    let result = Array.from(this.cache.values());

    if (filters?.cr?.min !== undefined) {
      result = result.filter((m) => m.cr >= filters.cr!.min!);
    }
    if (filters?.cr?.max !== undefined) {
      result = result.filter((m) => m.cr <= filters.cr!.max!);
    }
    if (filters?.type) {
      result = result.filter((m) =>
        m.type.toLowerCase().includes(filters.type!.toLowerCase())
      );
    }
    if (filters?.scope) {
      result = result.filter((m) => m.scope === filters.scope);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(id: string): Promise<Monster | null> {
    await this.ensureInitialized();
    return this.cache.get(id) || null;
  }

  async create(input: MonsterCreateInput, userId: string): Promise<Monster> {
    await this.ensureInitialized();

    const id = generateId();
    const now = new Date().toISOString();

    const monster: Monster = {
      ...input,
      id,
      ownerId: userId,
      createdBy: userId,
      isPublic: false,
      scope: input.scope || 'campaign',
      createdAt: now,
      updatedAt: now,
    };

    this.cache.set(id, monster);
    this.persistToStorage();

    return monster;
  }

  async update(
    id: string,
    input: MonsterUpdateInput,
    _userId: string
  ): Promise<Monster | null> {
    await this.ensureInitialized();

    const existing = this.cache.get(id);
    if (!existing) return null;

    const updated: Monster = {
      ...existing,
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(id, updated);
    this.persistToStorage();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.cache.has(id)) return false;

    this.cache.delete(id);
    this.persistToStorage();

    return true;
  }

  async search(query: string): Promise<Monster[]> {
    await this.ensureInitialized();

    const q = query.toLowerCase();
    return Array.from(this.cache.values())
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async reset(): Promise<void> {
    this.cache.clear();
    this.initialized = false;

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const monsterAdapter = new MonsterAdapter();
