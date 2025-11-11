import React from 'react';

interface TurnControlButtonsProps {
  onNextTurn: () => void;
  onPreviousTurn: () => void;
  canAdvance: boolean;
  canRewind: boolean;
  currentTurn: number;
  totalParticipants: number;
}

const TurnControlButtons: React.FC<TurnControlButtonsProps> = ({
  onNextTurn,
  onPreviousTurn,
  canAdvance,
  canRewind,
  currentTurn,
  totalParticipants,
}) => {
  return (
    <div className="flex gap-3">
      {/* Previous Turn Button */}
      <button
        onClick={onPreviousTurn}
        disabled={!canRewind}
        aria-label="Previous turn"
        title={canRewind ? 'Go to previous participant' : 'Cannot go further back'}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
          ${
            canRewind
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:bg-amber-300 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
          }
        `}
      >
        <span>←</span>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Turn Progress Indicator */}
      <div
        className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium"
        aria-label={`Turn ${currentTurn + 1} of ${totalParticipants}`}
      >
        <span className="text-sm">
          Turn <span className="font-bold">{currentTurn + 1}</span>
          <span className="text-gray-500"> / {totalParticipants}</span>
        </span>
      </div>

      {/* Next Turn Button */}
      <button
        onClick={onNextTurn}
        disabled={!canAdvance}
        aria-label="Next turn"
        title={canAdvance ? 'Go to next participant' : 'Cannot advance further'}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
          ${
            canAdvance
              ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
          }
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <span>→</span>
      </button>
    </div>
  );
};

export default TurnControlButtons;
