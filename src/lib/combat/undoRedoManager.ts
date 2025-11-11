/**
 * Undo/Redo Manager for combat state
 * Feature 009: Combat Tracker
 * Maintains separate stacks for undo and redo operations
 */

import { CombatSession } from '../schemas/combat';

/**
 * Stack-based undo/redo manager for combat sessions
 * Limits history depth to prevent memory bloat
 */
export class UndoRedoManager {
  private undoStack: CombatSession[] = [];
  private redoStack: CombatSession[] = [];
  private readonly maxDepth: number = 50; // Max undo depth

  /**
   * Record a state in the undo stack
   * Clears redo stack on new push (standard undo/redo behavior)
   */
  pushState(state: CombatSession): void {
    this.undoStack.push(state);
    this.redoStack = []; // Clear redo stack on new action

    // Trim undo stack if it exceeds max depth
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack = this.undoStack.slice(-this.maxDepth);
    }
  }

  /**
   * Undo to previous state
   * Returns the previous state or undefined if none available
   */
  undo(): CombatSession | undefined {
    if (this.undoStack.length === 0) return undefined;

    const state = this.undoStack.pop();
    if (state) {
      this.redoStack.push(state);
    }
    return state;
  }

  /**
   * Redo to next state
   * Returns the next state or undefined if none available
   */
  redo(): CombatSession | undefined {
    if (this.redoStack.length === 0) return undefined;

    const state = this.redoStack.pop();
    if (state) {
      this.undoStack.push(state);
    }
    return state;
  }

  /**
   * Get current undo/redo history counts
   */
  getHistory(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Clear both undo and redo stacks
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
