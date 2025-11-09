/**
 * MonsterPicker component for Encounter Builder
 * Allows selection of monsters to add to an encounter
 * 
 * T017: Encounter integration stub
 * Usage: Pass a onSelect callback that receives the selected monster
 */

'use client';

import { useEffect, useState } from 'react';
import { Monster } from '@/types/monster';
import { monsterService } from '@/lib/services/monsterService';
import { MonsterCard } from '@/components/MonsterCard';

interface MonsterPickerProps {
  onSelect?: (monster: Monster) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
}

/**
 * Displays a list of monsters for selection to add to an encounter
 * Can be used in a modal, sidebar, or full-page context
 */
export function MonsterPicker({
  onSelect,
  onCancel,
  title = 'Select a Monster',
  className = '',
}: MonsterPickerProps) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const loadMonsters = async () => {
      try {
        setLoading(true);
        const data = await monsterService.list();
        setMonsters(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monsters');
        setMonsters([]);
      } finally {
        setLoading(false);
      }
    };

    loadMonsters();
  }, []);

  const handleSelectMonster = (monster: Monster) => {
    setSelectedId(monster.id);
    if (onSelect) {
      onSelect(monster);
    }
  };

  if (loading) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-gray-600">Loading monsters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>

      {monsters.length === 0 ? (
        <div className="p-8 text-center text-gray-600">
          <p>No monsters available</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {monsters.map((monster) => (
            <div
              key={monster.id}
              onClick={() => handleSelectMonster(monster)}
              className={`cursor-pointer transition-all ${
                selectedId === monster.id ? 'ring-2 ring-blue-600' : 'hover:shadow-md'
              }`}
            >
              <MonsterCard monster={monster} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
