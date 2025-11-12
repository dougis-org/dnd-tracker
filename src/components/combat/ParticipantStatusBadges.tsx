import React from 'react';
import { StatusEffect } from '@/lib/schemas/combat';

interface ParticipantStatusBadgesProps {
  statusEffects: StatusEffect[];
  onRemoveEffect?: (effectId: string) => void;
  maxWidth?: string;
}

const statusEffectColors: Record<string, { bg: string; text: string; border: string }> = {
  Prone: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  Stunned: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' },
  Charmed: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-300' },
  Blinded: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300' },
  Deafened: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300' },
  Frightened: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
  Restrained: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  Poisoned: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  Paralyzed: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
  Petrified: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300' },
  Invisible: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300' },
  Blessed: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
};

const getEffectColors = (effectName: string) => {
  return statusEffectColors[effectName] || {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
  };
};

const ParticipantStatusBadges: React.FC<ParticipantStatusBadgesProps> = ({
  statusEffects,
  onRemoveEffect,
  maxWidth = 'max-w-full',
}) => {
  if (statusEffects.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${maxWidth}`}>
      {statusEffects.map((effect) => {
        const colors = getEffectColors(effect.name);
        const durationText =
          effect.durationInRounds === null
            ? 'permanent'
            : effect.durationInRounds === 1
              ? '1 round'
              : `${effect.durationInRounds} rounds`;

        return (
          <div
            key={effect.id}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border} text-sm font-medium`}
            aria-label={`${effect.name}: ${durationText}`}
          >
            <span>{effect.name}</span>
            {effect.durationInRounds !== null && (
              <span className="text-xs opacity-75">({effect.durationInRounds}r)</span>
            )}
            {onRemoveEffect && (
              <button
                onClick={() => onRemoveEffect(effect.id)}
                aria-label={`Remove ${effect.name}`}
                className="ml-1 hover:opacity-70 transition"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ParticipantStatusBadges;
