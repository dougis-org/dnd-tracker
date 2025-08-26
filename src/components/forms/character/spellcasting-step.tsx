"use client";

import React, { useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles, BookOpen } from 'lucide-react';
import { DND_ABILITIES, type CharacterFormInput } from '@/lib/validations/character';
import { calculateSpellSlots, getSpellcastingInfo } from '@/lib/dnd/spellcasting-data';
import { calculateSpellcastingStats, getSpellListType, getSpellcastingDescription } from '@/lib/dnd/spellcasting-utils';
import { useSpellManagement } from './use-spell-management';

export function SpellcastingStep() {
  const form = useFormContext<CharacterFormInput>();
  const classes = form.watch('classes');
  const abilities = form.watch('abilities');

  const {
    isAddingSpell,
    setIsAddingSpell,
    newSpell,
    setNewSpell,
    handleAddSpell,
    handleRemoveSpell
  } = useSpellManagement(form);

  const primaryClass = classes[0]?.className;
  const spellcastingInfo = getSpellcastingInfo(primaryClass);
  const spellStats = useMemo(() => 
    calculateSpellcastingStats(classes, abilities), 
    [classes, abilities]
  );
  const spellSlots = useMemo(() => calculateSpellSlots(classes), [classes]);
  const spellListType = getSpellListType(primaryClass);

  // Auto-update spell attack bonus and save DC when stats change
  useEffect(() => {
    if (spellStats && spellStats.spellcastingAbility) {
      const currentValues = form.getValues('spellcasting');
      if (!currentValues) return;
      
      let hasChanges = false;
      
      if (currentValues.spellAttackBonus !== spellStats.spellAttackBonus) {
        form.setValue('spellcasting.spellAttackBonus', spellStats.spellAttackBonus, { 
          shouldTouch: false, 
          shouldValidate: false,
          shouldDirty: false
        });
        hasChanges = true;
      }
      
      if (currentValues.spellSaveDC !== spellStats.spellSaveDC) {
        form.setValue('spellcasting.spellSaveDC', spellStats.spellSaveDC, { 
          shouldTouch: false, 
          shouldValidate: false,
          shouldDirty: false
        });
        hasChanges = true;
      }
      
      if (currentValues.ability !== spellStats.spellcastingAbility) {
        form.setValue('spellcasting.ability', spellStats.spellcastingAbility, { 
          shouldTouch: false, 
          shouldValidate: false,
          shouldDirty: false
        });
        hasChanges = true;
      }
    }
  }, [spellStats, form]);

  if (!spellcastingInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Spellcasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your character doesn&apos;t have any spellcasting classes yet. Add a spellcaster class to configure spells.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentSpells = spellListType === 'known' 
    ? form.watch('spellcasting.spellsKnown') || []
    : form.watch('spellcasting.spellsPrepared') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Spellcasting Ability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="spellcasting.ability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Spellcasting Ability</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DND_ABILITIES.map((ability) => (
                      <SelectItem key={ability} value={ability}>
                        {ability.charAt(0).toUpperCase() + ability.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Recommended: {spellcastingInfo.primary} (for {primaryClass})
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="spellcasting.spellAttackBonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spell Attack Bonus</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" readOnly className="bg-muted" />
                  </FormControl>
                  <FormDescription>Auto-calculated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spellcasting.spellSaveDC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spell Save DC</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" readOnly className="bg-muted" />
                  </FormControl>
                  <FormDescription>Auto-calculated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {Object.keys(spellSlots).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spell Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(spellSlots).map(([level, total]) => (
                <div key={level} className="text-center">
                  <div className="font-semibold">{level} Level</div>
                  <div className="text-2xl font-bold text-primary">{total}</div>
                  <div className="text-xs text-muted-foreground">slots</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {spellListType === 'known' ? 'Known Spells' : 'Prepared Spells'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getSpellcastingDescription(primaryClass)}
          </p>

          <div className="flex flex-wrap gap-2">
            {currentSpells.map((spell, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {spell}
                <button
                  type="button"
                  onClick={() => handleRemoveSpell(index, primaryClass)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {isAddingSpell ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter spell name"
                value={newSpell}
                onChange={(e) => setNewSpell(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpell(primaryClass);
                  }
                  if (e.key === 'Escape') {
                    setIsAddingSpell(false);
                    setNewSpell('');
                  }
                }}
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={() => handleAddSpell(primaryClass)}
                disabled={!newSpell.trim()}
              >
                Add
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsAddingSpell(false);
                  setNewSpell('');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingSpell(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Spell
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}