"use client";

import React, { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Sparkles, BookOpen } from 'lucide-react';
import { 
  DND_ABILITIES,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  type CharacterFormInput,
} from '@/lib/validations/character';

// Spellcasting classes and their primary ability
const SPELLCASTING_CLASSES: Record<string, {
  primary: 'intelligence' | 'wisdom' | 'charisma';
  type: 'known' | 'prepared';
  description: string;
}> = {
  'Artificer': { primary: 'intelligence', type: 'prepared', description: 'Prepare INT modifier + half level spells' },
  'Bard': { primary: 'charisma', type: 'known', description: 'Learn spells from the bard spell list' },
  'Cleric': { primary: 'wisdom', type: 'prepared', description: 'Prepare WIS modifier + level spells' },
  'Druid': { primary: 'wisdom', type: 'prepared', description: 'Prepare WIS modifier + level spells' },
  'Paladin': { primary: 'charisma', type: 'prepared', description: 'Prepare CHA modifier + half level spells (min 1)' },
  'Ranger': { primary: 'wisdom', type: 'known', description: 'Learn spells from the ranger spell list' },
  'Sorcerer': { primary: 'charisma', type: 'known', description: 'Learn spells from the sorcerer spell list' },
  'Warlock': { primary: 'charisma', type: 'known', description: 'Learn spells; regain on short rest' },
  'Wizard': { primary: 'intelligence', type: 'prepared', description: 'Prepare INT modifier + level spells from spellbook' }
};

// Spell slots by class level
const SPELL_SLOTS: Record<number, Record<string, number>> = {
  1: { '1st': 2 },
  2: { '1st': 3 },
  3: { '1st': 4, '2nd': 2 },
  4: { '1st': 4, '2nd': 3 },
  5: { '1st': 4, '2nd': 3, '3rd': 2 },
  6: { '1st': 4, '2nd': 3, '3rd': 3 },
  7: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 1 },
  8: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 2 },
  9: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 1 },
  10: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2 },
  11: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1 },
  12: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1 },
  13: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1 },
  14: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1 },
  15: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1 },
  16: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1 },
  17: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1, '9th': 1 },
  18: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 1, '7th': 1, '8th': 1, '9th': 1 },
  19: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 2, '7th': 1, '8th': 1, '9th': 1 },
  20: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 2, '7th': 2, '8th': 1, '9th': 1 }
};

export function SpellcastingStep() {
  const form = useFormContext<CharacterFormInput>();
  const [isAddingSpell, setIsAddingSpell] = useState(false);
  const [newSpell, setNewSpell] = useState('');
  
  const formData = form.watch();
  const { abilities, classes, spellcasting } = formData;
  
  // Calculate total character level for proficiency bonus
  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
  const proficiencyBonus = calculateProficiencyBonus(totalLevel);
  
  // Determine if character has spellcasting
  const primaryClass = classes[0]?.className;
  const spellcastingClass = primaryClass ? SPELLCASTING_CLASSES[primaryClass] : null;
  
  // Calculate spell attack bonus and save DC
  const spellcastingAbility = spellcasting?.ability;
  const abilityModifier = spellcastingAbility ? calculateAbilityModifier(abilities[spellcastingAbility]) : 0;
  const spellAttackBonus = abilityModifier + proficiencyBonus;
  const spellSaveDC = 8 + abilityModifier + proficiencyBonus;
  
  // Get spell slots for current level
  const spellSlots = useMemo(() => {
    if (!spellcastingClass) return {};
    
    // For half-casters (Paladin, Ranger), use half level for spell slots
    const effectiveLevel = ['Paladin', 'Ranger'].includes(primaryClass) 
      ? Math.floor(totalLevel / 2) 
      : totalLevel;
    
    return SPELL_SLOTS[Math.min(effectiveLevel, 20)] || {};
  }, [spellcastingClass, primaryClass, totalLevel]);
  
  // Handle adding new spell
  const handleAddSpell = () => {
    if (newSpell.trim()) {
      const currentSpells = spellcastingClass?.type === 'known' 
        ? form.getValues('spellcasting.spellsKnown') || []
        : form.getValues('spellcasting.spellsPrepared') || [];
      
      const updatedSpells = [...currentSpells, newSpell.trim()];
      
      if (spellcastingClass?.type === 'known') {
        form.setValue('spellcasting.spellsKnown', updatedSpells);
      } else {
        form.setValue('spellcasting.spellsPrepared', updatedSpells);
      }
      
      setNewSpell('');
      setIsAddingSpell(false);
    }
  };
  
  // Handle removing spell
  const handleRemoveSpell = (index: number) => {
    const fieldName = spellcastingClass?.type === 'known' 
      ? 'spellcasting.spellsKnown' 
      : 'spellcasting.spellsPrepared';
    const currentSpells = form.getValues(fieldName) || [];
    const updatedSpells = currentSpells.filter((_, i) => i !== index);
    form.setValue(fieldName, updatedSpells);
  };
  
  // Update spell attack bonus and save DC when ability changes
  React.useEffect(() => {
    if (spellcastingAbility) {
      // Only update if the values have actually changed to prevent infinite loops
      const currentAttackBonus = form.getValues('spellcasting.spellAttackBonus');
      const currentSaveDC = form.getValues('spellcasting.spellSaveDC');
      
      if (currentAttackBonus !== spellAttackBonus) {
        form.setValue('spellcasting.spellAttackBonus', spellAttackBonus);
      }
      if (currentSaveDC !== spellSaveDC) {
        form.setValue('spellcasting.spellSaveDC', spellSaveDC);
      }
    }
  }, [spellcastingAbility, spellAttackBonus, spellSaveDC, form]);
  
  if (!spellcastingClass) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Spellcasting</h3>
          <p>
            <strong>{primaryClass}</strong> is not a spellcaster class.
          </p>
          <p className="text-sm mt-2">
            Spellcasting will be available if you multiclass into a caster class.
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
          <p>
            <strong>Spellcasting Classes:</strong> Artificer, Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Spellcasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            As a <strong>{primaryClass}</strong>, {spellcastingClass.description.toLowerCase()}.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spellcasting Ability */}
            <div>
              <FormField
                control={form.control}
                name="spellcasting.ability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spellcasting Ability</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DND_ABILITIES.map((ability) => (
                          <SelectItem key={ability} value={ability}>
                            <span className="capitalize">{ability}</span>
                            {ability === spellcastingClass.primary && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Primary
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {primaryClass} typically uses {spellcastingClass.primary} for spellcasting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Spell Attack & Save DC */}
            <div className="space-y-3">
              <h4 className="font-medium">Spell Attack & Save DC</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">Spell Attack Bonus:</span>
                  <span className="font-mono font-bold">
                    {spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">Spell Save DC:</span>
                  <span className="font-mono font-bold">DC {spellSaveDC}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                8 + ability modifier + proficiency bonus
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Spell Slots */}
      {Object.keys(spellSlots).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spell Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(spellSlots).map(([level, slots]) => (
                <div key={level} className="text-center p-3 border rounded-lg">
                  <div className="text-sm font-medium">{level} Level</div>
                  <div className="text-2xl font-bold text-primary mt-1">{slots}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Spell slots refresh on a long rest (short rest for Warlocks).
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Spells Known/Prepared */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {spellcastingClass.type === 'known' ? 'Known Spells' : 'Prepared Spells'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {spellcastingClass.type === 'known' 
                ? 'Spells you have learned permanently' 
                : 'Spells you have prepared for today'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingSpell(true)}
            disabled={isAddingSpell}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Spell
          </Button>
        </div>

        {/* Add Spell Form */}
        {isAddingSpell && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div>
                <FormLabel htmlFor="new-spell">Spell Name</FormLabel>
                <Input
                  id="new-spell"
                  placeholder="Enter spell name (e.g., 'Magic Missile', 'Cure Wounds')"
                  value={newSpell}
                  onChange={(e) => setNewSpell(e.target.value)}
                  maxLength={100}
                  className="mt-1"
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSpell}
                    disabled={!newSpell.trim()}
                  >
                    Save Spell
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spells List */}
        {(() => {
          const spells = spellcastingClass?.type === 'known' 
            ? spellcasting?.spellsKnown || []
            : spellcasting?.spellsPrepared || [];
          
          return spells.length > 0 ? (
            <div className="space-y-2">
              {spells.map((spell, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{spell}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpell(index)}
                    className="ml-2 flex-shrink-0"
                    aria-label="Remove spell"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : !isAddingSpell ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No spells {spellcastingClass?.type === 'known' ? 'known' : 'prepared'} yet.</p>
              <p className="text-sm">Add spells from your class spell list.</p>
            </div>
          ) : null;
        })()}
      </div>
      
      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Spellcasting:</strong> Configure your magical abilities and spell repertoire.
        </p>
        <p className="mt-1">
          Spell attack bonus and save DC are calculated automatically based on your ability scores.
        </p>
      </div>
    </div>
  );
}