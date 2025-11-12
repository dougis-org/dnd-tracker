import React from 'react';
import { Participant } from '@/lib/schemas/combat';

interface InitiativeOrderProps {
  participants: Participant[];
  currentTurnIndex: number;
  onParticipantSelect: (participantId: string) => void;
}

const InitiativeOrder: React.FC<InitiativeOrderProps> = ({
  participants,
  currentTurnIndex,
  onParticipantSelect,
}) => {
  const getHPPercentage = (currentHP: number, maxHP: number): number => {
    if (maxHP <= 0) return 0;
    return Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  };

  const isUnconscious = (currentHP: number): boolean => currentHP <= 0;

  const handleParticipantClick = (participantId: string) => {
    onParticipantSelect(participantId);
  };

  return (
    <ul
      role="list"
      aria-label="Combat initiative order"
      className="space-y-2"
    >
      {participants.map((participant, index) => {
        const isCurrentTurn = index === currentTurnIndex;
        const hpPercentage = getHPPercentage(participant.currentHP, participant.maxHP);
        const unconscious = isUnconscious(participant.currentHP);

        return (
          <li
            key={participant.id}
            onClick={() => handleParticipantClick(participant.id)}
            aria-current={isCurrentTurn ? 'true' : 'false'}
            role="listitem"
            className={`
              p-4 rounded-lg cursor-pointer transition-all
              ${isCurrentTurn
                ? 'bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-300'
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }
              ${unconscious ? 'opacity-60' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {participant.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {participant.type} • Initiative {participant.initiativeValue}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-gray-300">
                {isCurrentTurn ? '↪ Current' : `Turn ${index + 1}`}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">
                  {unconscious ? 'Unconscious' : `HP: ${participant.currentHP}/${participant.maxHP}`}
                </span>
                <span className="text-gray-600">
                  {hpPercentage.toFixed(0)}%
                </span>
              </div>

              {/* HP Bar */}
              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    unconscious
                      ? 'bg-gray-500'
                      : hpPercentage > 50
                        ? 'bg-green-600'
                        : hpPercentage > 25
                          ? 'bg-amber-600'
                          : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.max(0, hpPercentage)}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={participant.maxHP}
                  aria-valuenow={Math.max(0, participant.currentHP)}
                  aria-label={`${participant.name} health: ${Math.max(0, participant.currentHP)} of ${participant.maxHP}`}
                />
              </div>
            </div>

            {/* Status Effects */}
            {participant.statusEffects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {participant.statusEffects.map((effect) => (
                  <span
                    key={effect.id}
                    className="inline-block text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 rounded"
                    aria-label={`${effect.name}${effect.durationInRounds ? ` for ${effect.durationInRounds} rounds` : ' (permanent)'}`}
                  >
                    {effect.name}
                    {effect.durationInRounds && ` (${effect.durationInRounds}r)`}
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default InitiativeOrder;
