/**
 * MonsterForm component for creating and editing monsters
 * T020: Monster creation form component
 *
 * Uses Zod schemas for validation and Tailwind CSS for styling
 */

'use client';
/* global HTMLFormElement, HTMLInputElement, HTMLSelectElement */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Monster, MonsterCreateInput } from '@/types/monster';
import {
  MonsterCreateSchema,
  MonsterScopeEnum,
  MonsterSizeEnum,
} from '@/lib/validation/monsterSchema';
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
type AbilityKey = keyof MonsterFormData['abilities'];
type NumericField = 'cr' | 'hp' | 'ac';
type TextField = 'name' | 'type' | 'alignment' | 'speed';
type SelectField = 'size' | 'scope';

type FieldErrorMap = Record<string, string>;

const DEFAULT_ABILITIES: MonsterFormData['abilities'] = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

const abilityKeys: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const buildInitialFormData = (monster?: Monster): MonsterFormData => ({
  name: monster?.name ?? '',
  cr: monster?.cr ?? 0,
  size: monster?.size ?? 'Medium',
  type: monster?.type ?? 'humanoid',
  alignment: monster?.alignment ?? 'Neutral',
  hp: monster?.hp ?? 10,
  ac: monster?.ac ?? 10,
  speed: typeof monster?.speed === 'string' ? monster.speed : '30 ft.',
  abilities: {
    ...DEFAULT_ABILITIES,
    ...(monster?.abilities ?? {}),
  },
  savingThrows: monster?.savingThrows ?? undefined,
  skills: monster?.skills ?? undefined,
  resistances: monster?.resistances ?? undefined,
  immunities: monster?.immunities ?? undefined,
  conditionImmunities: monster?.conditionImmunities ?? undefined,
  senses: monster?.senses ?? undefined,
  languages: monster?.languages ?? undefined,
  tags: monster?.tags ?? undefined,
  actions: monster?.actions ?? undefined,
  legendaryActions: monster?.legendaryActions ?? undefined,
  lairActions: monster?.lairActions ?? undefined,
  scope: monster?.scope ?? 'campaign',
  templateId: monster?.templateId ?? null,
});

function useMonsterFormController(
  monster: Monster | undefined,
  onSubmit: MonsterFormProps['onSubmit'],
) {
  const [formData, setFormData] = useState<MonsterFormData>(() => buildInitialFormData(monster));
  const [validationErrors, setValidationErrors] = useState<FieldErrorMap>({});

  useEffect(() => {
    setFormData(buildInitialFormData(monster));
    setValidationErrors({});
  }, [monster]);

  const resetError = useCallback((key: string) => {
    setValidationErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const updateField = useCallback(
    (field: keyof MonsterFormData, value: MonsterFormData[keyof MonsterFormData]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      resetError(field as string);
    },
    [resetError],
  );

  const updateAbility = useCallback(
    (ability: AbilityKey, value: number) => {
      setFormData((prev) => ({
        ...prev,
        abilities: {
          ...prev.abilities,
          [ability]: value,
        },
      }));
      resetError(`abilities.${ability}`);
    },
    [resetError],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setValidationErrors({});

      const result = MonsterCreateSchema.safeParse(formData);

      if (!result.success) {
        const nextErrors = result.error.issues.reduce<FieldErrorMap>((acc, issue) => {
          const path = issue.path.join('.');
          if (path) {
            acc[path] = issue.message;
          }
          return acc;
        }, {});
        setValidationErrors(nextErrors);
        return;
      }

      if (onSubmit) {
        await onSubmit(result.data);
      }
    },
    [formData, onSubmit],
  );

  return {
    formData,
    validationErrors,
    updateField,
    updateAbility,
    handleSubmit,
  };
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

function FormField({
  label,
  htmlFor,
  required,
  error,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={`block text-sm font-semibold mb-2 ${labelClassName ?? ''}`}>
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function MonsterForm({
  monster,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  successMessage = null,
}: MonsterFormProps) {
  const { formData, validationErrors, updateField, updateAbility, handleSubmit } =
    useMonsterFormController(monster, onSubmit);

  const sizeOptions = useMemo(() => MonsterSizeEnum.options, []);
  const scopeOptions = useMemo(() => MonsterScopeEnum.options, []);

  const handleNumericChange = useCallback(
    (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const parsed = value === '' ? 0 : Number(value);
      updateField(field, parsed as MonsterFormData[NumericField]);
    },
    [updateField],
  );

  const handleTextChange = useCallback(
    (field: TextField) => (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value as MonsterFormData[TextField]);
    },
    [updateField],
  );

  const handleSelectChange = useCallback(
    (field: SelectField) => (event: ChangeEvent<HTMLSelectElement>) => {
      updateField(field, event.target.value as MonsterFormData[SelectField]);
    },
    [updateField],
  );

  const handleAbilityChange = useCallback(
    (ability: AbilityKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const parsed = value === '' ? 0 : Number(value);
      updateAbility(ability, parsed);
    },
    [updateAbility],
  );

  const speedValue = typeof formData.speed === 'string' ? formData.speed : '30 ft.';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}
        {successMessage && (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">{successMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name"
            htmlFor="name"
            required
            error={validationErrors.name}
            className="col-span-2"
          >
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleTextChange('name')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </FormField>

          <FormField label="CR" htmlFor="cr" required error={validationErrors.cr}>
            <input
              id="cr"
              type="number"
              step="0.125"
              min="0"
              max="30"
              value={formData.cr}
              onChange={handleNumericChange('cr')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </FormField>

          <FormField label="HP" htmlFor="hp" required error={validationErrors.hp}>
            <input
              id="hp"
              type="number"
              min="1"
              value={formData.hp}
              onChange={handleNumericChange('hp')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </FormField>

          <FormField label="AC" htmlFor="ac" required error={validationErrors.ac}>
            <input
              id="ac"
              type="number"
              min="1"
              max="30"
              value={formData.ac}
              onChange={handleNumericChange('ac')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </FormField>

          <FormField label="Size" htmlFor="size" required error={validationErrors.size}>
            <select
              id="size"
              value={formData.size}
              onChange={handleSelectChange('size')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Type" htmlFor="type" required error={validationErrors.type}>
            <input
              id="type"
              type="text"
              value={formData.type}
              onChange={handleTextChange('type')}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </FormField>

          <FormField label="Alignment" htmlFor="alignment" error={validationErrors.alignment}>
            <input
              id="alignment"
              type="text"
              value={formData.alignment ?? ''}
              onChange={handleTextChange('alignment')}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </FormField>

          <FormField label="Speed" htmlFor="speed" error={validationErrors.speed}>
            <input
              id="speed"
              type="text"
              value={speedValue}
              onChange={handleTextChange('speed')}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </FormField>

          <FormField label="Scope" htmlFor="scope" error={validationErrors.scope}>
            <select
              id="scope"
              value={formData.scope}
              onChange={handleSelectChange('scope')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {scopeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Abilities</h3>
          <div className="grid grid-cols-3 gap-3">
            {abilityKeys.map((ability) => {
              const abilityError = validationErrors[`abilities.${ability}`];
              return (
                <FormField
                  key={ability}
                  label={ability.toUpperCase()}
                  htmlFor={ability}
                  error={abilityError}
                  labelClassName="uppercase"
                >
                  <input
                    id={ability}
                    type="number"
                    min="-5"
                    max="30"
                    value={formData.abilities[ability]}
                    onChange={handleAbilityChange(ability)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </FormField>
              );
            })}
          </div>
        </div>

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
