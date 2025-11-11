'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Monster } from '@/types/monster';
import { monsterService } from '@/lib/services/monsterService';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterPicker } from '@/components/EncounterBuilder';

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPickerDemo, setShowPickerDemo] = useState(false);
  const [selectedForEncounter, setSelectedForEncounter] = useState<Monster | null>(null);

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

  const handleMonsterClick = (id: string) => {
    window.location.href = `/monsters/${id}`;
  };

  if (loading) {
    return <div className="p-8 text-center">Loading monsters...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Monsters</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPickerDemo(!showPickerDemo)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Demo: MonsterPicker component for encounters"
            >
              {showPickerDemo ? 'Hide' : 'Demo'} Picker
            </button>
            <Link
              href="/monsters/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Monster
            </Link>
          </div>
        </div>

        {selectedForEncounter && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-600 rounded">
            <p className="font-semibold text-blue-900">
              Selected for encounter: <span className="font-bold">{selectedForEncounter.name}</span> (CR {selectedForEncounter.cr})
            </p>
            <button
              onClick={() => setSelectedForEncounter(null)}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              Clear selection
            </button>
          </div>
        )}

        {showPickerDemo && (
          <div className="mb-8 p-6 bg-white border-2 border-green-600 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              T017 Demo: Click a monster below to add it to an encounter (shows integration pattern)
            </p>
            <MonsterPicker
              onSelect={(monster) => setSelectedForEncounter(monster)}
              onCancel={() => setShowPickerDemo(false)}
              title="Add Monster to Encounter"
              className="bg-gray-50 p-4 rounded"
            />
          </div>
        )}

        {error && <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}

        {monsters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No monsters found.</p>
            <Link href="/monsters/new" className="text-blue-600 hover:underline">
              Create your first monster
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <MonsterCard key={monster.id} monster={monster} onClick={handleMonsterClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
