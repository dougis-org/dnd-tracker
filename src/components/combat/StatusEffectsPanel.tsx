'use client';

import React from 'react';
import StatusEffectPill from '@/components/combat/StatusEffectPill';
import StatusEffectMenu from '@/components/combat/StatusEffectMenu';
import { StatusEffect } from '@/lib/schemas/combat';

interface StatusEffectsPanelProps {
  participantId: string;
  participantName: string;
  effects: StatusEffect[];
  onAddEffect: (effect: Omit<StatusEffect, 'id'>) => void;
  onRemoveEffect: (effectId: string) => void;
  currentRound: number;
}

export default function StatusEffectsPanel({
  participantId,
  participantName,
  effects,
  onAddEffect,
  onRemoveEffect,
  currentRound,
}: StatusEffectsPanelProps) {
  return (
    <div
      role="region"
      aria-label={`Status effects for ${participantName}`}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">{participantName}</h3>
      </div>

      {effects.length === 0 ? (
        <p className="text-xs text-slate-400">No active effects</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {effects.map((effect) => (
            <StatusEffectPill
              key={effect.id}
              effect={effect}
              onRemove={onRemoveEffect}
              currentRound={currentRound}
            />
          ))}
        </div>
      )}

      <StatusEffectMenu
        _participantId={participantId}
        existingEffects={effects}
        onAddEffect={onAddEffect}
        onRemoveEffect={onRemoveEffect}
        currentRound={currentRound}
      />
    </div>
  );
}
