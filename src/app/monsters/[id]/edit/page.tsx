'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditMonsterPage() {
  const params = useParams();
  const monsterId = params?.id as string;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/monsters/${monsterId}`} className="text-blue-600 hover:underline mb-6 block">
          ← Back to Monster
        </Link>

        <div className="bg-white rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Monster</h1>
          <p className="text-gray-600">Monster form component will be implemented in US2 (T022).</p>
        </div>
      </div>
    </div>
  );
}
