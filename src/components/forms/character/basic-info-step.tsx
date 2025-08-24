"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
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
import { 
  DND_RACES, 
  DND_ALIGNMENTS, 
  type BasicInfoFormData 
} from '@/lib/validations/character';

// Common D&D backgrounds
const DND_BACKGROUNDS = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier',
  'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'
] as const;

// Subrace options based on race selection
const SUBRACE_OPTIONS: Record<string, string[]> = {
  'Elf': ['High Elf', 'Wood Elf', 'Dark Elf (Drow)'],
  'Dwarf': ['Hill Dwarf', 'Mountain Dwarf'],
  'Halfling': ['Lightfoot', 'Stout'],
  'Gnome': ['Forest Gnome', 'Rock Gnome'],
  'Dragonborn': ['Black', 'Blue', 'Brass', 'Bronze', 'Copper', 'Gold', 'Green', 'Red', 'Silver', 'White'],
  'Human': ['Variant Human']
};

export function BasicInfoStep() {
  const form = useFormContext<BasicInfoFormData>();
  const selectedRace = form.watch('race');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter character name"
                  aria-required="true"
                  maxLength={50}
                />
              </FormControl>
              <FormDescription>
                The name of your character
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Race */}
        <FormField
          control={form.control}
          name="race"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Race *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Clear subrace when race changes
                  form.setValue('subrace', undefined);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DND_RACES.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Your character&apos;s race
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subrace (conditional) */}
        <FormField
          control={form.control}
          name="subrace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subrace</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedRace || !SUBRACE_OPTIONS[selectedRace]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subrace (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedRace && SUBRACE_OPTIONS[selectedRace]?.map((subrace) => (
                    <SelectItem key={subrace} value={subrace}>
                      {subrace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional subrace variant
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Background */}
        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DND_BACKGROUNDS.map((background) => (
                    <SelectItem key={background} value={background}>
                      {background}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Your character&apos;s background
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Alignment */}
      <FormField
        control={form.control}
        name="alignment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alignment *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  className="w-full md:w-1/2"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DND_ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment} value={alignment}>
                    {alignment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Your character&apos;s moral and ethical outlook
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Experience Points */}
      <FormField
        control={form.control}
        name="experiencePoints"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience Points</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="w-full md:w-1/3"
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value)) {
                    field.onChange(0);
                  } else {
                    field.onChange(Math.max(0, Math.floor(value))); // Ensure non-negative integer
                  }
                }}
                onBlur={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 0) {
                    field.onChange(0);
                  }
                }}
              />
            </FormControl>
            <FormDescription>
              Your character&apos;s current experience points
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Getting started:</strong> Fill in your character&apos;s basic information.
          Required fields are marked with an asterisk (*).
        </p>
        <p className="mt-1">
          Subrace is optional and depends on your selected race.
        </p>
      </div>
    </div>
  );
}