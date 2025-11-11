/**
 * Unit tests for undoRedoManager state stack
 * Feature 009: Combat Tracker
 * TDD-first: tests written before implementation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { UndoRedoManager } from '../undoRedoManager';
import { mockSession } from '../../../tests/fixtures/combat-sessions';

describe('UndoRedoManager', () => {
  let manager: UndoRedoManager;

  beforeEach(() => {
    manager = new UndoRedoManager();
  });

  describe('pushState', () => {
    it('records a state in undo stack', () => {
      manager.pushState(mockSession);

      expect(manager.getUndoCount()).toBe(1);
    });

    it('clears redo stack on new push', () => {
      manager.pushState(mockSession);
      manager.undo();
      expect(manager.getRedoCount()).toBe(1);

      manager.pushState({ ...mockSession, currentRoundNumber: 5 });
      expect(manager.getRedoCount()).toBe(0);
    });

    it('maintains max depth (default 50)', () => {
      for (let i = 0; i < 60; i++) {
        manager.pushState({ ...mockSession, currentRoundNumber: i });
      }

      expect(manager.getUndoCount()).toBeLessThanOrEqual(50);
    });
  });

  describe('undo', () => {
    it('returns previous state from undo stack', () => {
      const state1 = mockSession;
      const state2 = { ...mockSession, currentRoundNumber: 2 };

      manager.pushState(state1);
      manager.pushState(state2);

      const undone = manager.undo();
      expect(undone?.currentRoundNumber).toBe(1);
    });

    it('moves state to redo stack', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });

      manager.undo();
      expect(manager.getRedoCount()).toBe(1);
      expect(manager.getUndoCount()).toBe(1);
    });

    it('returns undefined when undo stack is empty', () => {
      const result = manager.undo();
      expect(result).toBeUndefined();
    });

    it('decrements undo count', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });

      expect(manager.getUndoCount()).toBe(2);
      manager.undo();
      expect(manager.getUndoCount()).toBe(1);
    });
  });

  describe('redo', () => {
    it('returns state from redo stack', () => {
      const state1 = mockSession;
      const state2 = { ...mockSession, currentRoundNumber: 2 };

      manager.pushState(state1);
      manager.pushState(state2);
      manager.undo();

      const redone = manager.redo();
      expect(redone?.currentRoundNumber).toBe(2);
    });

    it('moves state to undo stack', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });

      manager.undo();
      manager.redo();

      expect(manager.getRedoCount()).toBe(0);
      expect(manager.getUndoCount()).toBe(2);
    });

    it('returns undefined when redo stack is empty', () => {
      manager.pushState(mockSession);

      const result = manager.redo();
      expect(result).toBeUndefined();
    });

    it('increments undo count', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });
      manager.undo();

      expect(manager.getUndoCount()).toBe(1);
      manager.redo();
      expect(manager.getUndoCount()).toBe(2);
    });
  });

  describe('getHistory', () => {
    it('returns counts for undo and redo', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });
      manager.undo();

      const history = manager.getHistory();
      expect(history.undoCount).toBe(1);
      expect(history.redoCount).toBe(1);
    });
  });

  describe('clear', () => {
    it('clears both undo and redo stacks', () => {
      manager.pushState(mockSession);
      manager.pushState({ ...mockSession, currentRoundNumber: 2 });
      manager.undo();

      manager.clear();

      expect(manager.getUndoCount()).toBe(0);
      expect(manager.getRedoCount()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles multiple undo/redo cycles', () => {
      const state1 = mockSession;
      const state2 = { ...mockSession, currentRoundNumber: 2 };
      const state3 = { ...mockSession, currentRoundNumber: 3 };

      manager.pushState(state1);
      manager.pushState(state2);
      manager.pushState(state3);

      manager.undo();
      manager.undo();
      expect(manager.getUndoCount()).toBe(1);

      manager.redo();
      expect(manager.getUndoCount()).toBe(2);
      expect(manager.getRedoCount()).toBe(1);
    });

    it('undo/redo at boundaries', () => {
      manager.pushState(mockSession);

      const undoResult = manager.undo();
      expect(undoResult).toBeDefined();

      const secondUndo = manager.undo();
      expect(secondUndo).toBeUndefined();

      const redo1 = manager.redo();
      expect(redo1).toBeDefined();

      const redo2 = manager.redo();
      expect(redo2).toBeUndefined();
    });
  });
});
