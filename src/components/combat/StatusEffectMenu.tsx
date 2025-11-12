'use client';

import React, { useState } from 'react';
import StatusEffectPill from '@/components/combat/StatusEffectPill';
import { StatusEffect } from '@/lib/schemas/combat';
import { Plus } from 'lucide-react';

interface StatusEffectMenuProps {
  _participantId: string;
  existingEffects: StatusEffect[];
  onAddEffect: (effect: Omit<StatusEffect, 'id'>) => void;
  onRemoveEffect: (effectId: string) => void;
  currentRound: number;
}

const PRESET_EFFECTS = [
  { name: 'Poisoned', description: 'Disadvantage on attacks' },
  { name: 'Stunned', description: 'Incapacitated, can\'t move or speak' },
  { name: 'Blinded', description: 'Unable to see' },
  { name: 'Restrained', description: 'Speed becomes 0' },
  { name: 'Charmed', description: 'Cannot attack the charmer' },
  { name: 'Frightened', description: 'Disadvantage on ability checks' },
];

export default function StatusEffectMenu({
  _participantId,
  existingEffects,
  onAddEffect,
  onRemoveEffect,
  currentRound,
}: StatusEffectMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddEffect = () => {
    if (!selectedEffect) {
      setMessage('Please select an effect');
      return;
    }

    // Check for duplicate permanent effects
    const existingPermanent = existingEffects.some(
      (e) => e.name === selectedEffect && e.durationInRounds === null
    );
    if (isPermanent && existingPermanent) {
      setMessage(`${selectedEffect} is already applied as permanent`);
      return;
    }

    const newEffect: Omit<StatusEffect, 'id'> = {
      name: selectedEffect,
      durationInRounds: isPermanent ? null : (duration as number) || 1,
      appliedAtRound: currentRound,
    };

    onAddEffect(newEffect);
    resetDialog();
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setSelectedEffect('');
    setDuration('');
    setIsPermanent(false);
    setMessage('');
  };

  return (
    <div
      className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700"
      role="region"
      aria-label="Status Effects"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Active Effects</h3>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition-colors"
          aria-label="Add Effect"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {existingEffects.length === 0 ? (
        <p className="text-xs text-slate-400">No effects</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {existingEffects.map((effect) => (
            <div key={effect.id} className="relative">
              <StatusEffectPill
                effect={effect}
                onRemove={() => onRemoveEffect(effect.id)}
                currentRound={currentRound}
              />
            </div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.currentTarget === e.target && resetDialog()}
        >
          <div
            className="bg-slate-800 p-6 rounded-lg border border-slate-600 max-w-sm w-full mx-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add Status Effect"
          >
            <h2 className="text-lg font-bold text-slate-100 mb-4">Add Effect</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="effect-select" className="block text-xs font-medium text-slate-300 mb-2">
                  Effect Type
                </label>
                <select
                  id="effect-select"
                  value={selectedEffect}
                  onChange={(e) => setSelectedEffect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="">Select an effect...</option>
                  {PRESET_EFFECTS.map((preset) => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration-input" className="block text-xs font-medium text-slate-300 mb-2">
                  Duration (rounds)
                </label>
                <input
                  id="duration-input"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="5"
                  disabled={isPermanent}
                  className="w-full px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm disabled:opacity-50"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Permanent effect</span>
              </label>

              {message && (
                <div
                  className="p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-xs text-red-300"
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={resetDialog}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEffect}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    </div>
  );
}
