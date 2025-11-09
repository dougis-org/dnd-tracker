/**
 * MonsterStatBlock component
 * Displays detailed stat block of a monster (used in detail views)
 */

import { Monster } from '@/types/monster';

interface MonsterStatBlockProps {
  monster: Monster;
  className?: string;
}

function scoreToModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function MonsterStatBlock({ monster, className = '' }: MonsterStatBlockProps) {
  return (
    <div className={`bg-white border-2 border-gray-800 rounded p-6 max-w-2xl mx-auto ${className}`}>
      {/* Name and Type */}
      <div className="mb-4 pb-3 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold">{monster.name}</h1>
        <p className="text-sm italic text-gray-700">
          {monster.size} {monster.type}
          {monster.alignment && `, ${monster.alignment}`}
        </p>
      </div>

      {/* HP and AC */}
      <div className="mb-4 pb-3 border-b-2 border-gray-800">
        <div className="flex justify-between mb-2">
          <span>
            <strong>Armor Class</strong> {monster.ac}
          </span>
          <span>
            <strong>Hit Points</strong> {monster.hp}
          </span>
          <span>
            <strong>CR</strong> {monster.cr}
          </span>
        </div>
      </div>

      {/* Abilities */}
      <div className="mb-4 pb-3 border-b-2 border-gray-800">
        <div className="flex gap-4 justify-between">
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
            <div key={ability} className="text-center">
              <div className="text-xs font-bold uppercase">{ability}</div>
              <div className="font-bold">{monster.abilities[ability]}</div>
              <div className="text-xs text-gray-600">{scoreToModifier(monster.abilities[ability])}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Traits */}
      {(monster.senses ?? []).length > 0 && (
        <div className="mb-2">
          <strong>Senses:</strong> {(monster.senses ?? []).join(', ')}
        </div>
      )}

      {(monster.languages ?? []).length > 0 && (
        <div className="mb-2">
          <strong>Languages:</strong> {(monster.languages ?? []).join(', ')}
        </div>
      )}

      {(monster.resistances ?? []).length > 0 && (
        <div className="mb-2">
          <strong>Resistances:</strong> {(monster.resistances ?? []).join(', ')}
        </div>
      )}

      {(monster.immunities ?? []).length > 0 && (
        <div className="mb-2">
          <strong>Immunities:</strong> {(monster.immunities ?? []).join(', ')}
        </div>
      )}

      {/* Actions */}
      {(monster.actions ?? []).length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-gray-800">
          <h3 className="font-bold mb-2">Actions</h3>
          {(monster.actions ?? []).map((action) => (
            <div key={action.id} className="mb-2">
              <div className="font-bold">{action.name}.</div>
              <div className="text-sm">{action.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
