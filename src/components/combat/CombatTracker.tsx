import React, { useState, useEffect } from 'react';
import { CombatSession } from '@/lib/schemas/combat';
import { combatSessionAdapter } from '@/lib/combat/combatSessionAdapter';
import { undoRedoManager } from '@/lib/combat/undoRedoManager';
import { advanceTurn, rewindTurn } from '@/lib/combat/combatHelpers';
import InitiativeOrder from './InitiativeOrder';
import RoundTurnCounter from './RoundTurnCounter';
import TurnControlButtons from './TurnControlButtons';
import ErrorBoundary from './ErrorBoundary';

interface CombatTrackerProps {
  sessionId: string;
}

const CombatTracker: React.FC<CombatTrackerProps> = ({ sessionId }) => {
  const [session, setSession] = useState<CombatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedSession = await combatSessionAdapter.loadSession(sessionId);
        setSession(loadedSession);

        // Initialize undo/redo manager with current session state
        undoRedoManager.clear();
        undoRedoManager.pushState(loadedSession);
        updateUndoRedoState();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
        setError(errorMessage);
        console.error('Error loading combat session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const updateUndoRedoState = () => {
    setUndoCount(undoRedoManager.getUndoCount());
    setRedoCount(undoRedoManager.getRedoCount());
  };

  const _saveSession = async (updatedSession: CombatSession) => {
    try {
      await combatSessionAdapter.saveSession(updatedSession);
      setSession(updatedSession);
      undoRedoManager.pushState(updatedSession);
      updateUndoRedoState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save session';
      setError(errorMessage);
      console.error('Error saving combat session:', err);
    }
  };

  const handleUndo = () => {
    const previousState = undoRedoManager.undo();
    if (previousState) {
      setSession(previousState);
      updateUndoRedoState();
    }
  };

  const handleRedo = () => {
    const nextState = undoRedoManager.redo();
    if (nextState) {
      setSession(nextState);
      updateUndoRedoState();
    }
  };

  const handleParticipantSelect = (participantId: string) => {
    // Will be used in future user stories for HP/damage tracking
    console.log('Selected participant:', participantId);
  };

  const handleNextTurn = async () => {
    if (!session) return;
    try {
      const updatedSession = advanceTurn(session);
      await _saveSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to advance turn';
      setError(errorMessage);
      console.error('Error advancing turn:', err);
    }
  };

  const handlePreviousTurn = async () => {
    if (!session) return;
    try {
      const updatedSession = rewindTurn(session);
      await _saveSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rewind turn';
      setError(errorMessage);
      console.error('Error rewinding turn:', err);
    }
  };

  const canAdvanceTurn = session && session.participants.length > 0;
  const canRewindTurn = session && session.currentRoundNumber > 1 || (session && session.currentTurnIndex > 0);

  if (loading) {
    return (
      <main
        role="main"
        aria-label="Combat tracker loading"
        className="p-6 flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main
        role="main"
        aria-label="Combat tracker error"
        className="p-6"
      >
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Session</h2>
          <p className="text-red-700 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <main
        role="main"
        aria-label="Combat tracker for active session"
        className="p-6 max-w-6xl mx-auto"
      >
        <div className="space-y-6">
          {/* Header with Controls */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Combat Tracker</h1>
              <p className="text-gray-600 mt-1">Session: {sessionId}</p>
            </div>

            {/* Undo/Redo Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={undoCount === 0}
                aria-label="Undo last action"
                title={`Undo (${undoCount} available)`}
                className={`px-3 py-2 rounded font-medium transition ${
                  undoCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                ↶ Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={redoCount === 0}
                aria-label="Redo last undone action"
                title={`Redo (${redoCount} available)`}
                className={`px-3 py-2 rounded font-medium transition ${
                  redoCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                ↷ Redo
              </button>
            </div>
          </div>

          {/* Round/Turn Counter */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <RoundTurnCounter
              currentRound={session.currentRoundNumber}
              currentTurnIndex={session.currentTurnIndex}
              totalParticipants={session.participants.length}
            />
          </div>

          {/* Initiative Order */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Initiative Order</h2>
            <InitiativeOrder
              participants={session.participants}
              currentTurnIndex={session.currentTurnIndex}
              onParticipantSelect={handleParticipantSelect}
            />
          </div>

          {/* Turn Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Turn Management</h2>
            <TurnControlButtons
              onNextTurn={handleNextTurn}
              onPreviousTurn={handlePreviousTurn}
              canAdvance={!!canAdvanceTurn}
              canRewind={!!canRewindTurn}
              currentTurn={session.currentTurnIndex}
              totalParticipants={session.participants.length}
            />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
};

export default CombatTracker;
