"use client";

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { 
  DND_CLASSES, 
  type CharacterFormInput,
  type ClassData
} from '@/lib/validations/character';

// Hit dice mapping for D&D classes
const CLASS_HIT_DICE: Record<string, 6 | 8 | 10 | 12> = {
  'Barbarian': 12,
  'Bard': 8,
  'Cleric': 8,
  'Druid': 8,
  'Fighter': 10,
  'Monk': 8,
  'Paladin': 10,
  'Ranger': 10,
  'Rogue': 8,
  'Sorcerer': 6,
  'Warlock': 8,
  'Wizard': 6
};

export function ClassesStep() {
  const form = useFormContext<CharacterFormInput>();
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'classes'
  });

  const addClass = () => {
    const newClass: ClassData = {
      className: '',
      level: 1,
      hitDiceSize: 8,
      hitDiceUsed: 0
    };
    
    append(newClass);
    form.trigger('classes');
  };

  const removeClass = (index: number) => {
    remove(index);
    form.trigger('classes');
  };

  const updateClass = (index: number, field: keyof ClassData, value: any) => {
    const currentClass = fields[index];
    const updatedClass = { ...currentClass, [field]: value };
    
    // Auto-update hit dice size when class changes
    if (field === 'className' && CLASS_HIT_DICE[value]) {
      updatedClass.hitDiceSize = CLASS_HIT_DICE[value];
    }
    
    update(index, updatedClass);
    form.trigger('classes');
  };

  const totalLevel = fields.reduce((sum, cls) => sum + (cls.level || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Classes</h3>
          <p className="text-sm text-muted-foreground">
            Add and manage your character&apos;s classes. You can multiclass by adding multiple classes.
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">Total Level: {totalLevel}</div>
          <div className="text-xs text-muted-foreground">Max: 20</div>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No classes added yet. Click &ldquo;Add Class&rdquo; to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Class {index + 1}</h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeClass(index)}
                disabled={fields.length <= 1}
                aria-label={`Remove class ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Name */}
              <FormField
                control={form.control}
                name={`classes.${index}.className` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        updateClass(index, 'className', value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DND_CLASSES.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name={`classes.${index}.level` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="20"
                        step="1"
                        aria-required="true"
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 20) {
                            field.onChange(value);
                            updateClass(index, 'level', value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Level in this class (1-20)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hit Dice Size (auto-populated, read-only display) */}
              <FormItem>
                <FormLabel>Hit Dice</FormLabel>
                <FormControl>
                  <Input
                    value={`d${fields[index].hitDiceSize}`}
                    readOnly
                    disabled
                    aria-label="Hit dice size (auto-calculated)"
                  />
                </FormControl>
                <FormDescription>
                  Auto-set based on class
                </FormDescription>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subclass */}
              <FormField
                control={form.control}
                name={`classes.${index}.subclass` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subclass (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Champion, Battle Master"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateClass(index, 'subclass', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Subclass or archetype (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hit Dice Used */}
              <FormField
                control={form.control}
                name={`classes.${index}.hitDiceUsed` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hit Dice Used</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max={fields[index].level}
                        step="1"
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= fields[index].level) {
                            field.onChange(value);
                            updateClass(index, 'hitDiceUsed', value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Hit dice spent (0-{fields[index].level})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addClass}
          disabled={totalLevel >= 20}
          aria-label="Add class"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {totalLevel > 20 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">
            Total level cannot exceed 20. Please adjust your class levels.
          </div>
        </div>
      )}

      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Multiclassing:</strong> You can add multiple classes to create a multiclass character.
          Each class contributes to your total level (max 20).
        </p>
        <p className="mt-1">
          Hit dice are automatically set based on your class selection.
        </p>
      </div>
    </div>
  );
}