'use client';

import Link from 'next/link';

export default function NewMonsterPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/monsters" className="text-blue-600 hover:underline mb-6 block">
          ← Back to Monsters
        </Link>

        <div className="bg-white rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Create New Monster</h1>
          <p className="text-gray-600">Monster form component will be implemented in US2 (T020).</p>
        </div>
      </div>
    </div>
  );
}
