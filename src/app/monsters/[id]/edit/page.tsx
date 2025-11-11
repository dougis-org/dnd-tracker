'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MonsterForm } from '@/components/MonsterForm';
import { monsterService } from '@/lib/services/monsterService';
import type { MonsterCreateInput, Monster } from '@/types/monster';

export default function MonsterEditPage() {
  const router = useRouter();
  const params = useParams();
  const monsterId = typeof params?.id === 'string' ? params.id : '';

  const [monster, setMonster] = useState<Monster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  // Load monster data
  useEffect(() => {
    const loadMonster = async () => {
      try {
        setIsLoadingForm(true);
        const data = await monsterService.getById(monsterId);
        if (data) {
          setMonster(data);
        } else {
          setError('Monster not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monster');
      } finally {
        setIsLoadingForm(false);
      }
    };

    if (monsterId) {
      loadMonster();
    }
  }, [monsterId]);

  const handleSubmit = async (formData: MonsterCreateInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const updateData: MonsterCreateInput & { id: string } = { ...formData, id: monsterId };
      await monsterService.update(monsterId, updateData);
      router.push(`/monsters/${monsterId}`);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to update monster');
    }
  };

  const handleCancel = () => router.back();

  if (isLoadingForm) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <p>Loading monster data...</p>
      </div>
    );
  }

  if (error && !monster) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="text-red-500">
          <p>{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-400 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!monster) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <p>Monster not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Edit {monster.name}</h1>
      <MonsterForm
        monster={monster}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
