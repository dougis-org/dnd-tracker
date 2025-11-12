/* eslint-disable no-undef */
/**
 * Combat Session Adapter for localStorage persistence
 * Feature 009: Combat Tracker
 * Provides abstraction layer for session data loading/saving
 * 
 * NOTE: This file uses browser APIs (localStorage) and should only
 * be imported on the client side
 */

import { CombatSession, CombatSessionSchema, Participant } from '../schemas/combat';

/**
 * Adapter for persisting combat sessions to localStorage
 * Future Feature 036 will replace this with backend API
 */
export class CombatSessionAdapter {
  private readonly storagePrefix = 'combatSession-';

  /**
   * Save a combat session to localStorage
   * @throws Error if quota exceeded or storage unavailable
   */
  async saveSession(session: CombatSession): Promise<void> {
    try {
      const key = `${this.storagePrefix}${session.id}`;
      const serialized = JSON.stringify(session);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if ((error as { name: string }).name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Load a combat session from localStorage
   * @param sessionId - The session ID to load
   * @throws Error if session not found or data is invalid
   */
  async loadSession(sessionId: string): Promise<CombatSession> {
    const key = `${this.storagePrefix}${sessionId}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    try {
      const parsed = JSON.parse(stored);
      const validated = CombatSessionSchema.parse(parsed);
      return validated;
    } catch (error) {
      throw new Error(`Failed to load session: invalid data (${String(error)})`);
    }
  }

  /**
   * Update a single participant in a session
   * @param sessionId - The session ID
   * @param participantId - The participant ID to update
   * @param updates - Partial participant object
   * @throws Error if session or participant not found
   */
  async updateParticipant(
    sessionId: string,
    participantId: string,
    updates: Partial<Participant>
  ): Promise<CombatSession> {
    const session = await this.loadSession(sessionId);

    const updatedParticipants = session.participants.map(p =>
      p.id === participantId ? { ...p, ...updates } : p
    );

    const participantFound = updatedParticipants.some(p => p.id === participantId);
    if (!participantFound) {
      throw new Error(`Participant not found: ${participantId}`);
    }

    const updated: CombatSession = {
      ...session,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    await this.saveSession(updated);
    return updated;
  }

  /**
   * Delete a session from localStorage
   * @param sessionId - The session ID to delete
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.storagePrefix}${sessionId}`;
    localStorage.removeItem(key);
  }

  /**
   * List all session IDs stored in localStorage
   * @returns Array of session IDs
   */
  async listSessions(): Promise<string[]> {
    const sessionIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        const sessionId = key.substring(this.storagePrefix.length);
        sessionIds.push(sessionId);
      }
    }

    return sessionIds;
  }
}

/**
 * Singleton instance of adapter for use throughout app
 */
export const combatSessionAdapter = new CombatSessionAdapter();
