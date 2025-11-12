'use client';

import React from 'react';
import { StatusEffect } from '@/lib/schemas/combat';
import { X } from 'lucide-react';

interface StatusEffectPillProps {
  effect: StatusEffect;
  onRemove: (effectId: string) => void;
  currentRound: number;
}

export default function StatusEffectPill({
  effect,
  onRemove,
  currentRound,
}: StatusEffectPillProps) {
  const isPermanent = effect.durationInRounds === null;
  const remainingRounds = isPermanent
    ? null
    : Math.max(0, (effect.appliedAtRound + effect.durationInRounds!) - currentRound);
  const isExpired = remainingRounds !== null && remainingRounds <= 0;

  // Determine color based on duration
  let colorClass = 'bg-purple-900 border-purple-700';
  if (remainingRounds === 1) {
    colorClass = 'bg-red-900 border-red-700';
  } else if (isExpired && remainingRounds !== null) {
    colorClass = 'bg-slate-900 border-slate-700 opacity-50';
  }

  const durationText = isPermanent ? '∞' : `${remainingRounds}R`;
  const label = isPermanent
    ? `${effect.name}, permanent effect`
    : `${effect.name}, ${remainingRounds} rounds remaining`;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full
        border ${colorClass} text-xs font-medium text-slate-100
      `}
      role="status"
      aria-label={label}
    >
      <span>{effect.name}</span>
      <span className="text-xs text-slate-300">{durationText}</span>
      <button
        onClick={() => onRemove(effect.id)}
        className="ml-1 hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-400 rounded-full p-0.5"
        aria-label={`Remove ${effect.name}`}
        type="button"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
