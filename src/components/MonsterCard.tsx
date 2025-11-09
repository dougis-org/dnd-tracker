/**
 * MonsterCard component
 * Displays a summary card of a monster (used in list views)
 */

import { Monster } from '@/types/monster';

interface MonsterCardProps {
  monster: Monster;
  onClick?: (id: string) => void;
  className?: string;
}

export function MonsterCard({ monster, onClick, className = '' }: MonsterCardProps) {
  return (
    <div
      className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={() => onClick?.(monster.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(monster.id);
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{monster.name}</h3>
          <p className="text-sm text-gray-600">
            {monster.size} {monster.type}
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">CR {monster.cr}</div>
          <p className="text-sm text-gray-600">{monster.hp} HP</p>
        </div>
      </div>
      <div className="mt-2 flex gap-2 text-sm">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">AC {monster.ac}</span>
        {(monster.tags ?? []).length > 0 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">{monster.tags?.[0]}</span>
        )}
      </div>
    </div>
  );
}
