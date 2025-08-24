"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { 
  DND_ABILITIES, 
  ABILITY_SCORE_METHODS,
  calculateAbilityModifier,
  type AbilityScoreMethod,
  type AbilitiesFormData 
} from '@/lib/validations/character';

// D&D 5e Point Buy costs
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

// Standard Array values
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Ability descriptions for accessibility
const ABILITY_DESCRIPTIONS: Record<string, string> = {
  strength: 'Physical power and muscle',
  dexterity: 'Agility, reflexes, and balance',
  constitution: 'Health, stamina, and vitality',
  intelligence: 'Reasoning ability and memory',
  wisdom: 'Awareness and insight',
  charisma: 'Force of personality and leadership'
};

interface AbilityScoresStepProps {
  raceSelected?: string;
}

export function AbilityScoresStep({ raceSelected }: AbilityScoresStepProps) {
  const form = useFormContext<AbilitiesFormData>();
  const [method, setMethod] = useState<AbilityScoreMethod>('point-buy');
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<Record<string, number>>({});
  
  const currentAbilities = form.watch('abilities');

  // Calculate point buy cost and remaining points
  const { pointsUsed, pointsRemaining, isValidPointBuy } = useMemo(() => {
    if (method !== 'point-buy') return { pointsUsed: 0, pointsRemaining: 27, isValidPointBuy: true };
    
    const used = Object.values(currentAbilities).reduce((total, score) => {
      const cost = POINT_BUY_COSTS[score] ?? 0;
      return total + cost;
    }, 0);
    
    return {
      pointsUsed: used,
      pointsRemaining: 27 - used,
      isValidPointBuy: used <= 27
    };
  }, [currentAbilities, method]);

  // Apply standard array when method changes
  useEffect(() => {
    if (method === 'standard-array') {
      // Set abilities to standard array values
      const abilities = { ...currentAbilities };
      const assignedValues = [...STANDARD_ARRAY];
      
      // Assign in order: STR, DEX, CON, INT, WIS, CHA
      DND_ABILITIES.forEach((ability, index) => {
        if (assignedValues[index] !== undefined) {
          abilities[ability] = assignedValues[index];
        }
      });
      
      form.setValue('abilities', abilities);
    }
  }, [method, form, currentAbilities]);

  // Handle method change
  const handleMethodChange = (newMethod: AbilityScoreMethod) => {
    setMethod(newMethod);
    
    if (newMethod === 'point-buy') {
      // Reset to point buy starting values (8s)
      const abilities = { ...currentAbilities };
      DND_ABILITIES.forEach(ability => {
        abilities[ability] = 8;
      });
      form.setValue('abilities', abilities);
    }
  };

  // Handle individual ability score change
  const handleAbilityChange = (ability: string, value: number) => {
    if (method === 'point-buy') {
      // Validate point buy constraints
      const newScore = Math.max(8, Math.min(15, value));
      const tempAbilities = { ...currentAbilities, [ability]: newScore };
      
      // Check if new total cost is within limits
      const newCost = Object.values(tempAbilities).reduce((total, score) => {
        return total + (POINT_BUY_COSTS[score] ?? 0);
      }, 0);
      
      if (newCost <= 27) {
        form.setValue(`abilities.${ability}` as any, newScore);
      }
    } else {
      // Manual/roll method - allow full range
      const newScore = Math.max(1, Math.min(30, value));
      form.setValue(`abilities.${ability}` as any, newScore);
    }
  };

  // Get available standard array values for assignment
  const getAvailableArrayValues = () => {
    const assigned = Object.values(standardArrayAssigned);
    return STANDARD_ARRAY.filter(value => !assigned.includes(value));
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="space-y-4">
        <FormItem>
          <FormLabel>Ability Score Method</FormLabel>
          <Select
            value={method}
            onValueChange={handleMethodChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="point-buy">Point Buy</SelectItem>
              <SelectItem value="standard-array">Standard Array</SelectItem>
              <SelectItem value="roll">Manual/Rolling</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Choose how to determine your ability scores
          </FormDescription>
        </FormItem>

        {/* Method-specific information */}
        {method === 'point-buy' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Point Buy System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span>Points Used: {pointsUsed}/27</span>
                <span className={pointsRemaining < 0 ? 'text-destructive font-bold' : ''}>
                  Points Remaining: {pointsRemaining}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                All abilities start at 8. Higher scores cost more points. 
                Maximum score is 15 before racial bonuses.
              </p>
              {!isValidPointBuy && (
                <p className="text-destructive text-sm mt-2">
                  Not enough points! Reduce some ability scores.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {method === 'standard-array' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standard Array</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Standard Array values: 15, 14, 13, 12, 10, 8
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Assign these values to your abilities as desired.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ability Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DND_ABILITIES.map((ability) => {
          const score = currentAbilities[ability];
          const modifier = calculateAbilityModifier(score);
          const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          
          return (
            <FormField
              key={ability}
              control={form.control}
              name={`abilities.${ability}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {ability}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={method === 'point-buy' ? '8' : '1'}
                        max={method === 'point-buy' ? '15' : '30'}
                        step="1"
                        className="w-20"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleAbilityChange(ability, value);
                        }}
                      />
                    </FormControl>
                    <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-lg font-bold">
                        {modifierText}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        mod
                      </span>
                    </div>
                  </div>
                  <FormDescription className="text-xs">
                    {ABILITY_DESCRIPTIONS[ability]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>

      {/* Racial Bonuses Information */}
      {raceSelected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Racial Bonuses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your selected race ({raceSelected}) provides ability score bonuses.
              These bonuses are applied after determining your base scores.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Remember that racial bonuses can increase ability scores above the normal limits.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions for Point Buy */}
      {method === 'point-buy' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const abilities = { ...currentAbilities };
                DND_ABILITIES.forEach(ability => {
                  abilities[ability] = 8; // Reset to base
                });
                form.setValue('abilities', abilities);
              }}
            >
              Reset All to 8
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Set to balanced build: 13, 13, 13, 12, 10, 8
                const balanced = [13, 13, 13, 12, 10, 8];
                const abilities = { ...currentAbilities };
                DND_ABILITIES.forEach((ability, index) => {
                  abilities[ability] = balanced[index];
                });
                form.setValue('abilities', abilities);
              }}
            >
              Balanced Build
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Ability Scores:</strong> These determine your character&apos;s basic capabilities.
        </p>
        <p className="mt-1">
          Higher scores provide better bonuses. Most checks use ability modifiers, not the raw scores.
        </p>
      </div>
    </div>
  );
}