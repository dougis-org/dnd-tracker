'use client';

import React, { useState, useEffect } from 'react';
import HPBar from './HPBar';
import { Participant } from '@/lib/schemas/combat';

interface HPTrackerProps {
  participant: Participant;
  onApplyDamage: (damage: number) => void;
  onApplyHealing: (healing: number) => void;
}

export default function HPTracker({
  participant,
  onApplyDamage,
  onApplyHealing,
}: HPTrackerProps) {
  const [damageInput, setDamageInput] = useState('');
  const [healingInput, setHealingInput] = useState('');
  const [damageError, setDamageError] = useState('');
  const [healingError, setHealingError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const validateAndApplyDamage = () => {
    setDamageError('');
    setStatusMessage('');

    if (!damageInput.trim()) {
      setDamageError('Please enter a damage amount');
      return;
    }

    const damage = parseFloat(damageInput);

    if (isNaN(damage)) {
      setDamageError('Please enter a valid number');
      return;
    }

    if (damage <= 0) {
      setDamageError('Damage must be greater than 0');
      return;
    }

    onApplyDamage(damage);
    setDamageInput('');
    setStatusMessage(`${damage} damage applied to ${participant.name}`);
  };

  const validateAndApplyHealing = () => {
    setHealingError('');
    setStatusMessage('');

    if (!healingInput.trim()) {
      setHealingError('Please enter a healing amount');
      return;
    }

    const healing = parseFloat(healingInput);

    if (isNaN(healing)) {
      setHealingError('Please enter a valid number');
      return;
    }

    if (healing <= 0) {
      setHealingError('Healing must be greater than 0');
      return;
    }

    onApplyHealing(healing);
    setHealingInput('');
    setStatusMessage(`${healing} healing applied to ${participant.name}`);
  };

  const isUnconscious = participant.currentHP <= 0;

  return (
    <div className="space-y-4 border-l-4 border-slate-300 pl-4">
      {/* HP Display */}
      <div
        data-testid="hp-display"
        role="region"
        aria-label={`${participant.name} HP tracking`}
        className={isUnconscious ? 'opacity-50 grayscale' : ''}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{participant.name}</h3>
          <span className="text-sm font-mono">
            {participant.currentHP} / {participant.maxHP}
          </span>
        </div>

        {isUnconscious && <p className="text-sm text-red-600 font-medium">Unconscious</p>}

        {participant.temporaryHP > 0 && (
          <p className="text-sm text-yellow-600">
            Temp HP: <span className="font-mono">{participant.temporaryHP}</span>
          </p>
        )}

        <div className="mt-2">
          <HPBar
            currentHP={participant.currentHP}
            maxHP={participant.maxHP}
            temporaryHP={participant.temporaryHP || 0}
          />
        </div>
      </div>

      {/* Damage Input Section */}
      <div className="space-y-2">
        <label htmlFor="damage-input" className="block text-sm font-medium text-slate-700">
          Damage
        </label>
        <div className="flex gap-2">
          <input
            id="damage-input"
            type="number"
            value={damageInput}
            onChange={(e) => {
              setDamageInput(e.target.value);
              setDamageError('');
            }}
            placeholder="Damage amount"
            aria-label={`Enter damage for ${participant.name}`}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            min="0"
            step="0.5"
          />
          <button
            onClick={validateAndApplyDamage}
            disabled={!damageInput.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Damage
          </button>
        </div>
        {damageError && <p className="text-sm text-red-600">{damageError}</p>}
      </div>

      {/* Healing Input Section */}
      <div className="space-y-2">
        <label htmlFor="healing-input" className="block text-sm font-medium text-slate-700">
          Healing
        </label>
        <div className="flex gap-2">
          <input
            id="healing-input"
            type="number"
            value={healingInput}
            onChange={(e) => {
              setHealingInput(e.target.value);
              setHealingError('');
            }}
            placeholder="Healing amount"
            aria-label={`Enter healing for ${participant.name}`}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            min="0"
            step="0.5"
          />
          <button
            onClick={validateAndApplyHealing}
            disabled={!healingInput.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Healing
          </button>
        </div>
        {healingError && <p className="text-sm text-green-600">{healingError}</p>}
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-2 bg-blue-100 text-blue-800 rounded-md text-sm"
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
