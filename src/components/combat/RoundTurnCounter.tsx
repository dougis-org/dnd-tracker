import React from 'react';

interface RoundTurnCounterProps {
  currentRound: number;
  currentTurnIndex: number;
  totalParticipants: number;
}

const RoundTurnCounter: React.FC<RoundTurnCounterProps> = ({
  currentRound,
  currentTurnIndex,
  totalParticipants,
}) => {
  const currentTurnNumber = currentTurnIndex + 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Round Display */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Round</p>
          <p className="text-4xl font-bold text-purple-900">{currentRound}</p>
        </div>

        <div className="text-gray-300 text-2xl hidden sm:block">•</div>

        {/* Turn Display */}
        <div className="text-center">
          <p className="text-sm font-semibold text-pink-700 uppercase tracking-wide">Turn</p>
          <p className="text-4xl font-bold text-pink-900">
            {currentTurnNumber} <span className="text-lg text-gray-600">/ {totalParticipants}</span>
          </p>
        </div>
      </div>

      {/* Status Text */}
      <div
        aria-label={`Round ${currentRound}, Turn ${currentTurnNumber} of ${totalParticipants}`}
        className="text-center sm:text-right"
      >
        <p className="text-lg font-medium text-gray-800">
          Round <span className="font-bold text-purple-900">{currentRound}</span>, Turn{' '}
          <span className="font-bold text-pink-900">{currentTurnNumber}/{totalParticipants}</span>
        </p>
      </div>
    </div>
  );
};

export default RoundTurnCounter;
