/**
 * MonsterForm component for creating and editing monsters
 * T020: Monster creation form component
 *
 * Uses Zod schemas for validation and Tailwind CSS for styling
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
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

type FieldErrorMap = Partial<Record<string, string>>;

const DEFAULT_SPEED = '30 ft.';
const abilityKeys: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const createDefaultAbilities = (): MonsterFormData['abilities'] => ({
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
});

const createBaseFormData = (): MonsterFormData => ({
  name: '',
  cr: 0,
  size: 'Medium',
  type: 'humanoid',
  alignment: 'Neutral',
  hp: 10,
  ac: 10,
  speed: DEFAULT_SPEED,
  abilities: createDefaultAbilities(),
  savingThrows: undefined,
  skills: undefined,
  resistances: undefined,
  immunities: undefined,
  conditionImmunities: undefined,
  senses: undefined,
  languages: undefined,
  tags: undefined,
  actions: undefined,
  legendaryActions: undefined,
  lairActions: undefined,
  scope: 'campaign',
  templateId: null,
});

const toOptional = <T,>(value: T | null | undefined): T | undefined => (value ?? undefined);

const buildInitialFormData = (monster?: Monster): MonsterFormData => {
  const base = createBaseFormData();

  if (!monster) {
    return base;
  }

  const {
    name,
    cr,
    size,
    type,
    alignment,
    hp,
    ac,
    speed,
    abilities,
    savingThrows,
    skills,
    resistances,
    immunities,
    conditionImmunities,
    senses,
    languages,
    tags,
    actions,
    legendaryActions,
    lairActions,
    scope,
    templateId,
  } = monster;

  return {
    ...base,
    name,
    cr,
    size,
    type,
    alignment: alignment ?? base.alignment,
    hp,
    ac,
    speed: typeof speed === 'string' ? speed : base.speed,
    abilities: {
      ...base.abilities,
      ...(abilities ?? {}),
    },
    savingThrows: toOptional(savingThrows),
    skills: toOptional(skills),
    resistances: toOptional(resistances),
    immunities: toOptional(immunities),
    conditionImmunities: toOptional(conditionImmunities),
    senses: toOptional(senses),
    languages: toOptional(languages),
    tags: toOptional(tags),
    actions: toOptional(actions),
    legendaryActions: toOptional(legendaryActions),
    lairActions: toOptional(lairActions),
    scope: scope ?? base.scope,
    templateId: templateId ?? null,
  };
};

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
    async (event: FormEvent<HTMLFormElement>) => {
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

interface MonsterFormAlertsProps {
  error?: string | null;
  successMessage?: string | null;
}

function MonsterFormAlerts({ error, successMessage }: MonsterFormAlertsProps) {
  if (!error && !successMessage) {
    return null;
  }

  return (
    <>
      {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}
      {successMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">{successMessage}</div>
      )}
    </>
  );
}

type PrimaryFieldConfig =
  | {
      kind: 'text';
      field: TextField;
      label: string;
      required?: boolean;
      className?: string;
    }
  | {
      kind: 'number';
      field: NumericField;
      label: string;
      required?: boolean;
      className?: string;
      min?: number;
      max?: number;
      step?: string;
    }
  | {
      kind: 'select';
      field: SelectField;
      label: string;
      required?: boolean;
      className?: string;
    };

const PRIMARY_FIELD_CONFIGS = [
  { kind: 'text', field: 'name', label: 'Name', required: true, className: 'col-span-2' },
  { kind: 'number', field: 'cr', label: 'CR', required: true, min: 0, max: 30, step: '0.125' },
  { kind: 'number', field: 'hp', label: 'HP', required: true, min: 1 },
  { kind: 'number', field: 'ac', label: 'AC', required: true, min: 1, max: 30 },
  { kind: 'select', field: 'size', label: 'Size', required: true },
  { kind: 'text', field: 'type', label: 'Type', required: true },
  { kind: 'text', field: 'alignment', label: 'Alignment' },
  { kind: 'text', field: 'speed', label: 'Speed' },
  { kind: 'select', field: 'scope', label: 'Scope' },
] satisfies PrimaryFieldConfig[];

const formatScopeLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface MonsterPrimaryFieldsProps {
  formData: MonsterFormData;
  validationErrors: FieldErrorMap;
  sizeOptions: readonly string[];
  scopeOptions: readonly string[];
  handleTextChange: (field: TextField) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleNumericChange: (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: SelectField) => (event: ChangeEvent<HTMLSelectElement>) => void;
}

function MonsterPrimaryFields({
  formData,
  validationErrors,
  sizeOptions,
  scopeOptions,
  handleTextChange,
  handleNumericChange,
  handleSelectChange,
}: MonsterPrimaryFieldsProps) {
  const getTextValue = (field: TextField) => {
    if (field === 'alignment') {
      return formData.alignment ?? '';
    }

    if (field === 'speed') {
      return typeof formData.speed === 'string' ? formData.speed : DEFAULT_SPEED;
    }

    return formData[field] as string;
  };

  const renderSelectOptions = (field: SelectField) => {
    const options = field === 'size' ? sizeOptions : scopeOptions;

    return options.map((option) => (
      <option key={option} value={option}>
        {field === 'scope' ? formatScopeLabel(option) : option}
      </option>
    ));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {PRIMARY_FIELD_CONFIGS.map((config) => (
        <FormField
          key={config.field}
          label={config.label}
          htmlFor={config.field}
          required={config.required}
          error={validationErrors[config.field]}
          className={config.className}
        >
          {config.kind === 'text' && (
            <input
              id={config.field}
              type="text"
              value={getTextValue(config.field)}
              onChange={handleTextChange(config.field)}
              className="w-full px-3 py-2 border rounded-lg"
              required={config.required}
            />
          )}

          {config.kind === 'number' && (
            <input
              id={config.field}
              type="number"
              value={formData[config.field] as number}
              onChange={handleNumericChange(config.field)}
              className="w-full px-3 py-2 border rounded-lg"
              required={config.required}
              min={config.min}
              max={config.max}
              step={config.step}
            />
          )}

          {config.kind === 'select' && (
            <select
              id={config.field}
              value={formData[config.field] as string}
              onChange={handleSelectChange(config.field)}
              className="w-full px-3 py-2 border rounded-lg"
              required={config.required}
            >
              {renderSelectOptions(config.field)}
            </select>
          )}
        </FormField>
      ))}
    </div>
  );
}

interface MonsterAbilityFieldsProps {
  formData: MonsterFormData;
  validationErrors: FieldErrorMap;
  handleAbilityChange: (ability: AbilityKey) => (event: ChangeEvent<HTMLInputElement>) => void;
}

interface AbilityInputFieldProps {
  ability: AbilityKey;
  value: number;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function AbilityInputField({ ability, value, error, onChange }: AbilityInputFieldProps) {
  return (
    <FormField
      key={ability}
      label={ability.toUpperCase()}
      htmlFor={ability}
      error={error}
      labelClassName="uppercase"
    >
      <input
        id={ability}
        type="number"
        min="-5"
        max="30"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </FormField>
  );
}

function MonsterAbilityFields({
  formData,
  validationErrors,
  handleAbilityChange,
}: MonsterAbilityFieldsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Abilities</h3>
      <div className="grid grid-cols-3 gap-3">
        {abilityKeys.map((ability) => (
          <AbilityInputField
            key={ability}
            ability={ability}
            value={formData.abilities[ability]}
            error={validationErrors[`abilities.${ability}`]}
            onChange={handleAbilityChange(ability)}
          />
        ))}
      </div>
    </div>
  );
}

interface MonsterFormActionsProps {
  onCancel?: () => void;
  isLoading: boolean;
}

function MonsterFormActions({ onCancel, isLoading }: MonsterFormActionsProps) {
  return (
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
  );
}

function useMonsterFormFieldHandlers(
  updateField: (field: keyof MonsterFormData, value: MonsterFormData[keyof MonsterFormData]) => void,
  updateAbility: (ability: AbilityKey, value: number) => void,
) {
  const handleNumericChange = useCallback(
    (field: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value === '' ? 0 : Number(event.target.value);
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
      const parsed = event.target.value === '' ? 0 : Number(event.target.value);
      updateAbility(ability, parsed);
    },
    [updateAbility],
  );

  return {
    handleNumericChange,
    handleTextChange,
    handleSelectChange,
    handleAbilityChange,
  };
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
  const { handleNumericChange, handleTextChange, handleSelectChange, handleAbilityChange } =
    useMonsterFormFieldHandlers(updateField, updateAbility);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        <MonsterFormAlerts error={error} successMessage={successMessage} />
        <MonsterPrimaryFields
          formData={formData}
          validationErrors={validationErrors}
          sizeOptions={sizeOptions}
          scopeOptions={scopeOptions}
          handleTextChange={handleTextChange}
          handleNumericChange={handleNumericChange}
          handleSelectChange={handleSelectChange}
        />
        <MonsterAbilityFields
          formData={formData}
          validationErrors={validationErrors}
          handleAbilityChange={handleAbilityChange}
        />
        <MonsterFormActions onCancel={onCancel} isLoading={isLoading} />
      </form>
    </div>
  );
}
