/**
 * Monster service layer
 * Abstracts the adapter (mock or real API) from components
 * Components use this service and never directly call the adapter
 */

import {
  Monster,
  MonsterCreateInput,
  MonsterUpdateInput,
} from '@/types/monster';
import { monsterAdapter } from '@/lib/mocks/monsterAdapter';

class MonsterService {
  /**
   * List all monsters with optional filtering
   */
  async list(filters?: {
    cr?: { min?: number; max?: number };
    type?: string;
    scope?: string;
  }): Promise<Monster[]> {
    return monsterAdapter.list(filters);
  }

  /**
   * Get a single monster by ID
   */
  async getById(id: string): Promise<Monster | null> {
    return monsterAdapter.getById(id);
  }

  /**
   * Create a new monster
   */
  async create(
    input: MonsterCreateInput,
    userId = 'current-user'
  ): Promise<Monster> {
    return monsterAdapter.create(input, userId);
  }

  /**
   * Update an existing monster
   */
  async update(
    id: string,
    input: MonsterUpdateInput,
    userId = 'current-user'
  ): Promise<Monster | null> {
    return monsterAdapter.update(id, input, userId);
  }

  /**
   * Delete a monster by ID
   */
  async delete(id: string): Promise<boolean> {
    return monsterAdapter.delete(id);
  }

  /**
   * Search monsters by name or type
   */
  async search(query: string): Promise<Monster[]> {
    return monsterAdapter.search(query);
  }

  /**
   * Reset all monsters (for testing)
   */
  async reset(): Promise<void> {
    return monsterAdapter.reset();
  }
}

export const monsterService = new MonsterService();
