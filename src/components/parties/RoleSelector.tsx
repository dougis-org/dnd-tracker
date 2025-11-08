/**
 * RoleSelector Component
 * Dropdown selector for party member roles with color-coded options
 * Uses shadcn/ui Select component or native select
 */

'use client';

import React from 'react';
import { PartyRole } from '@/types/party';

interface RoleSelectorProps {
  value?: PartyRole;
  onChange: (role: PartyRole | undefined) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

// Role options with their display colors
const ROLE_OPTIONS: Array<{ value: PartyRole; label: string; colorClass: string }> = [
  { value: 'Tank', label: 'Tank', colorClass: 'text-blue-700 bg-blue-50' },
  { value: 'Healer', label: 'Healer', colorClass: 'text-green-700 bg-green-50' },
  { value: 'DPS', label: 'DPS', colorClass: 'text-red-700 bg-red-50' },
  { value: 'Support', label: 'Support', colorClass: 'text-purple-700 bg-purple-50' },
];

export function RoleSelector({
  value,
  onChange,
  disabled = false,
  label,
  required = false,
}: RoleSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedLabel = value || 'Select role';
  const currentColorClass =
    ROLE_OPTIONS.find((opt) => opt.value === value)?.colorClass || 'text-gray-700 bg-gray-50';

  const handleSelect = (role: PartyRole): void => {
    onChange(role);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div className="role-selector">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label="Select role"
          className={`
            w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-left
            text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors
          `}
        >
          <span className={currentColorClass}>{selectedLabel}</span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <ul className="py-1" role="listbox">
              {ROLE_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors
                      ${option.colorClass}
                      ${value === option.value ? 'font-semibold bg-gray-50' : ''}
                    `}
                  >
                    {option.label}
                  </button>
                </li>
              ))}

              {/* Clear option */}
              {value && (
                <>
                  <li className="border-t border-gray-200 my-1" />
                  <li>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Clear
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
