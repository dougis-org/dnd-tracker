'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MonsterForm } from '@/components/MonsterForm';
import { monsterService } from '@/lib/services/monsterService';
import type { MonsterCreateInput } from '@/types/monster';

/**
 * T021: Monster creation page
 *
 * Page for creating new monsters
 * - Uses MonsterForm component for input
 * - Calls monsterService.create on submit
 * - Redirects to detail page on success
 * - Shows error on failure
 */
export default function MonsterCreatePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: MonsterCreateInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const newMonster = await monsterService.create(formData);
      // Redirect to detail page
      router.push(`/monsters/${newMonster.id}`);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create monster';
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Monster</h1>

        <MonsterForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
