/**
 * MonsterForm component for creating and editing monsters
 * T020: Monster creation form component
 *
 * Uses Zod schemas for validation and Tailwind CSS for styling
 */

'use client';

import { useState } from 'react';
import { Monster, MonsterCreateInput } from '@/types/monster';
import { MonsterCreateSchema } from '@/lib/validation/monsterSchema';
import type { z } from 'zod';

interface MonsterFormProps {
  monster?: Monster;
  onSubmit?: (data: MonsterCreateInput) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

type MonsterFormData = z.infer<typeof MonsterCreateSchema>;

export function MonsterForm({
  monster,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  successMessage = null,
}: MonsterFormProps) {
  const [formData, setFormData] = useState<MonsterFormData>({
    name: monster?.name || '',
    cr: monster?.cr || 0,
    size: monster?.size || 'Medium',
    type: monster?.type || 'humanoid',
    alignment: monster?.alignment || 'Neutral',
    hp: monster?.hp || 10,
    ac: monster?.ac || 10,
    speed: monster?.speed || '30 ft.',
    scope: monster?.scope || 'campaign',
    abilities: monster?.abilities || {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (field === 'scope') {
        updated[field as keyof MonsterFormData] = value as never;
      } else if (field === 'abilities') {
        // abilities handled separately
      } else {
        updated[field as keyof Omit<MonsterFormData, 'abilities' | 'scope'>] = value as never;
      }
      return updated;
    });
    // Clear validation error for this field on change
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAbilityChange = (ability: keyof typeof formData.abilities, value: number) => {
    setFormData((prev) => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [ability]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validate form data
      const validatedData = MonsterCreateSchema.parse(formData);

      if (onSubmit) {
        await onSubmit(validatedData);
      }
    } catch (err) {
      if (err instanceof Error && 'errors' in err) {
        // Handle Zod validation errors
        const zodError = err as unknown as { errors?: Array<{ path: string[]; message: string }> };
        const zodErrors = zodError.errors || [];
        const newErrors: Record<string, string> = {};
        zodErrors.forEach((error) => {
          const path = error.path.join('.');
          newErrors[path] = error.message;
        });
        setValidationErrors(newErrors);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}
        {successMessage && (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">{successMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            {validationErrors.name && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* CR */}
          <div>
            <label htmlFor="cr" className="block text-sm font-semibold mb-2">
              CR <span className="text-red-600">*</span>
            </label>
            <input
              id="cr"
              type="number"
              step="0.125"
              min="0"
              max="30"
              value={formData.cr}
              onChange={(e) => handleChange('cr', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            {validationErrors.cr && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.cr}</p>
            )}
          </div>

          {/* HP */}
          <div>
            <label htmlFor="hp" className="block text-sm font-semibold mb-2">
              HP <span className="text-red-600">*</span>
            </label>
            <input
              id="hp"
              type="number"
              min="1"
              value={formData.hp}
              onChange={(e) => handleChange('hp', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* AC */}
          <div>
            <label htmlFor="ac" className="block text-sm font-semibold mb-2">
              AC <span className="text-red-600">*</span>
            </label>
            <input
              id="ac"
              type="number"
              min="1"
              max="30"
              value={formData.ac}
              onChange={(e) => handleChange('ac', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-semibold mb-2">
              Size <span className="text-red-600">*</span>
            </label>
            <select
              id="size"
              value={formData.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="Tiny">Tiny</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Huge">Huge</option>
              <option value="Gargantuan">Gargantuan</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold mb-2">
              Type <span className="text-red-600">*</span>
            </label>
            <input
              id="type"
              type="text"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Alignment */}
          <div>
            <label htmlFor="alignment" className="block text-sm font-semibold mb-2">
              Alignment
            </label>
            <input
              id="alignment"
              type="text"
              value={formData.alignment || ''}
              onChange={(e) => handleChange('alignment', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Speed */}
          <div>
            <label htmlFor="speed" className="block text-sm font-semibold mb-2">
              Speed
            </label>
            <input
              id="speed"
              type="text"
              value={typeof formData.speed === 'string' ? formData.speed : '30 ft.'}
              onChange={(e) => handleChange('speed', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Scope */}
          <div>
            <label htmlFor="scope" className="block text-sm font-semibold mb-2">
              Scope
            </label>
            <select
              id="scope"
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="campaign">Campaign</option>
              <option value="global">Global</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* Abilities */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Abilities</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
              <div key={ability}>
                <label htmlFor={ability} className="block text-sm font-semibold uppercase mb-1">
                  {ability}
                </label>
                <input
                  id={ability}
                  type="number"
                  min="1"
                  max="30"
                  value={formData.abilities[ability]}
                  onChange={(e) => handleAbilityChange(ability, parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Monster'}
          </button>
        </div>
      </form>
    </div>
  );
}
