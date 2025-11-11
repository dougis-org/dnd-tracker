'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Monster } from '@/types/monster';
import { monsterService } from '@/lib/services/monsterService';
import { MonsterStatBlock } from '@/components/MonsterStatBlock';

export default function MonsterDetailPage() {
  const params = useParams();
  const monsterId = params?.id as string;
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monsterId) return;

    const loadMonster = async () => {
      try {
        setLoading(true);
        const data = await monsterService.getById(monsterId);
        if (!data) {
          setError('Monster not found');
        } else {
          setMonster(data);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monster');
        setMonster(null);
      } finally {
        setLoading(false);
      }
    };

    loadMonster();
  }, [monsterId]);

  if (loading) {
    return <div className="p-8 text-center">Loading monster...</div>;
  }

  if (error || !monster) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/monsters" className="text-blue-600 hover:underline mb-4 block">
            ← Back to Monsters
          </Link>
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error || 'Monster not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/monsters" className="text-blue-600 hover:underline mb-6 block">
          ← Back to Monsters
        </Link>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              window.location.href = `/monsters/${monster.id}/edit`;
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>

        <MonsterStatBlock monster={monster} />
      </div>
    </div>
  );
}
