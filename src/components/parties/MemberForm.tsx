import React, { useState } from 'react';
import { PartyMember, DnDClass, DnDRace, PartyRole } from '@/types/party';
import { RoleSelector } from './RoleSelector';
import {
  validateMemberForm,
  MemberFormErrors,
  createDefaultFormData,
} from '@/lib/utils/memberFormHelpers';

const CLASS_OPTIONS: DnDClass[] = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

const RACE_OPTIONS: DnDRace[] = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Dragonborn',
  'Gnome',
  'Half-Orc',
  'Half-Elf',
  'Tiefling',
];

export interface MemberFormProps {
  member?: PartyMember;
  onSubmit: (member: Partial<PartyMember>) => void;
  onCancel: () => void;
}

interface FormData {
  characterName: string;
  class: DnDClass | '';
  race: DnDRace | '';
  level: number;
  ac: number;
  hp: number;
  role: PartyRole | undefined;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps): React.ReactElement {
  const initialData = createDefaultFormData(member) as FormData;
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<MemberFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateMemberForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        characterName: formData.characterName,
        class: formData.class as DnDClass,
        race: formData.race as DnDRace,
        level: formData.level,
        ac: formData.ac,
        hp: formData.hp,
        role: formData.role,
      });
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">
        {member ? 'Edit Member' : 'Add Member'}
      </h2>

      <div>
        <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 mb-1">
          Character Name
        </label>
        <input
          id="characterName"
          type="text"
          value={formData.characterName}
          onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.characterName && (
          <p className="text-red-600 text-sm mt-1" role="alert">
            {errors.characterName}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            id="class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value as DnDClass })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select class...</option>
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          {errors.class && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {errors.class}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="race" className="block text-sm font-medium text-gray-700 mb-1">
            Race
          </label>
          <select
            id="race"
            value={formData.race}
            onChange={(e) => setFormData({ ...formData, race: e.target.value as DnDRace })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select race...</option>
            {RACE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.race && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {errors.race}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <input
            id="level"
            type="number"
            min="1"
            max="20"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.level && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {errors.level}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ac" className="block text-sm font-medium text-gray-700 mb-1">
            AC
          </label>
          <input
            id="ac"
            type="number"
            min="1"
            max="30"
            value={formData.ac}
            onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.ac && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {errors.ac}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="hp" className="block text-sm font-medium text-gray-700 mb-1">
            HP
          </label>
          <input
            id="hp"
            type="number"
            min="1"
            value={formData.hp}
            onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.hp && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {errors.hp}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <RoleSelector
          value={formData.role}
          onChange={(role) => setFormData({ ...formData, role })}
          label="Select role..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
