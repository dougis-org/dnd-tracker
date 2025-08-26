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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DND_SKILLS, 
  DND_ABILITIES,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  type CharacterFormInput,
  type SkillsFormData 
} from '@/lib/validations/character';

// Skill to ability mapping
const SKILL_ABILITIES: Record<string, (typeof DND_ABILITIES)[number]> = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom'
};

// Class skill proficiencies and limits
const CLASS_SKILLS: Record<string, { available: string[]; count: number }> = {
  'Artificer': { available: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'], count: 2 },
  'Barbarian': { available: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], count: 2 },
  'Bard': { available: DND_SKILLS.slice(), count: 3 }, // All skills
  'Cleric': { available: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
  'Druid': { available: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'], count: 2 },
  'Fighter': { available: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'], count: 2 },
  'Monk': { available: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], count: 2 },
  'Paladin': { available: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
  'Ranger': { available: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], count: 3 },
  'Rogue': { available: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], count: 4 },
  'Sorcerer': { available: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], count: 2 },
  'Warlock': { available: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], count: 2 },
  'Wizard': { available: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], count: 2 }
};

// Background skill suggestions
const BACKGROUND_SKILLS: Record<string, string[]> = {
  'Acolyte': ['Insight', 'Religion'],
  'Criminal': ['Deception', 'Stealth'],
  'Folk Hero': ['Animal Handling', 'Survival'],
  'Noble': ['History', 'Persuasion'],
  'Sage': ['Arcana', 'History'],
  'Soldier': ['Athletics', 'Intimidation'],
  'Charlatan': ['Deception', 'Sleight of Hand'],
  'Entertainer': ['Acrobatics', 'Performance'],
  'Guild Artisan': ['Insight', 'Persuasion'],
  'Hermit': ['Medicine', 'Religion'],
  'Outlander': ['Athletics', 'Survival'],
  'Sailor': ['Athletics', 'Perception']
};

// Class saving throw proficiencies
const CLASS_SAVING_THROWS: Record<string, Array<(typeof DND_ABILITIES)[number]>> = {
  'Artificer': ['constitution', 'intelligence'],
  'Barbarian': ['strength', 'constitution'],
  'Bard': ['dexterity', 'charisma'],
  'Cleric': ['wisdom', 'charisma'],
  'Druid': ['intelligence', 'wisdom'],
  'Fighter': ['strength', 'constitution'],
  'Monk': ['strength', 'dexterity'],
  'Paladin': ['wisdom', 'charisma'],
  'Ranger': ['strength', 'dexterity'],
  'Rogue': ['dexterity', 'intelligence'],
  'Sorcerer': ['constitution', 'charisma'],
  'Warlock': ['wisdom', 'charisma'],
  'Wizard': ['intelligence', 'wisdom']
};

export function SkillsProficienciesStep() {
  const form = useFormContext<CharacterFormInput>();
  
  const formData = form.watch();
  const { abilities, classes, background, skillProficiencies = [], savingThrowProficiencies = [] } = formData;
  
  // Calculate total character level for proficiency bonus
  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
  const proficiencyBonus = calculateProficiencyBonus(totalLevel);
  
  // Get class-based skill restrictions
  const primaryClass = classes[0]?.className;
  const classSkillData = primaryClass ? CLASS_SKILLS[primaryClass] : null;
  
  // Get background skill suggestions
  const backgroundSkills = background ? BACKGROUND_SKILLS[background] || [] : [];
  
  // Get class saving throw proficiencies
  const classSavingThrows = useMemo(() => {
    return primaryClass ? CLASS_SAVING_THROWS[primaryClass] || [] : [];
  }, [primaryClass]);

  // Auto-update saving throw proficiencies when class changes
  useEffect(() => {
    const currentSavingThrows = form.getValues('savingThrowProficiencies');
    
    // Avoid unnecessary re-renders if the value is already correct
    if (JSON.stringify(currentSavingThrows) !== JSON.stringify(classSavingThrows)) {
      form.setValue('savingThrowProficiencies', classSavingThrows, { shouldValidate: true });
    }
  }, [primaryClass, form, classSavingThrows]);
  
  // Calculate skill bonus for display
  const getSkillBonus = (skill: string): number => {
    const ability = SKILL_ABILITIES[skill];
    const abilityModifier = calculateAbilityModifier(abilities[ability]);
    const isProficient = skillProficiencies.includes(skill);
    return abilityModifier + (isProficient ? proficiencyBonus : 0);
  };
  
  // Format bonus for display
  const formatBonus = (bonus: number): string => {
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  };
  
  // Check if we can select more skills
  const canSelectMoreSkills = useMemo(() => {
    if (!classSkillData) return true;
    return skillProficiencies.length < classSkillData.count;
  }, [skillProficiencies, classSkillData]);
  
  // Handle skill proficiency toggle
  const handleSkillToggle = (skill: string, checked: boolean) => {
    const currentSkills = skillProficiencies || [];
    let newSkills: string[];
    
    if (checked) {
      // Check class restrictions
      if (classSkillData && !classSkillData.available.includes(skill)) {
        return; // Can't select this skill for this class
      }
      
      // Check skill limit
      if (classSkillData && currentSkills.length >= classSkillData.count) {
        return; // Already at skill limit
      }
      
      newSkills = [...currentSkills, skill];
    } else {
      newSkills = currentSkills.filter(s => s !== skill);
    }
    
    form.setValue('skillProficiencies', newSkills);
  };
  
  return (
    <div className="space-y-6">
      {/* Class Information */}
      {primaryClass && classSkillData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Class Skill Proficiencies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As a <strong>{primaryClass}</strong>, you can choose <strong>{classSkillData.count}</strong> skill(s) from the following:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {classSkillData.available.map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            {skillProficiencies.length > 0 && (
              <p className="text-sm mt-2">
                Selected: <strong>{skillProficiencies.length}</strong> of <strong>{classSkillData.count}</strong>
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Background Skills */}
      {backgroundSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Background Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your <strong>{background}</strong> background typically provides proficiency in:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {backgroundSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Skill Proficiencies */}
      <div>
        <FormField
          control={form.control}
          name="skillProficiencies"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base font-semibold">Skill Proficiencies</FormLabel>
                <FormDescription>
                  Choose your character&apos;s skill proficiencies. Proficient skills add your proficiency bonus.
                </FormDescription>
              </div>
              <FormControl>
                <div role="group" aria-labelledby="skill-proficiencies-label" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DND_SKILLS.map((skill) => {
                    const isSelected = skillProficiencies.includes(skill);
                    const ability = SKILL_ABILITIES[skill];
                    const skillBonus = getSkillBonus(skill);
                    const isAvailable = !classSkillData || classSkillData.available.includes(skill);
                    const canSelect = isAvailable && (isSelected || canSelectMoreSkills);
                    
                    return (
                      <div key={skill} className="flex items-center space-x-3">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={isSelected}
                          disabled={!canSelect}
                          onCheckedChange={(checked) => handleSkillToggle(skill, checked as boolean)}
                          aria-describedby={`skill-${skill}-description`}
                        />
                        <div className="grid grid-cols-1 gap-1 flex-1">
                          <FormLabel 
                            htmlFor={`skill-${skill}`}
                            className={`text-sm font-medium cursor-pointer flex justify-between items-center ${!canSelect && !isSelected ? 'text-muted-foreground' : ''}`}
                          >
                            <span>{skill}</span>
                            <span className={`text-xs font-mono ${isSelected ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                              {formatBonus(skillBonus)}
                            </span>
                          </FormLabel>
                          <div id={`skill-${skill}-description`} className="text-xs text-muted-foreground capitalize">
                            {ability} based
                            {backgroundSkills.includes(skill) && (
                              <Badge variant="secondary" className="ml-1 text-xs py-0 px-1">background</Badge>
                            )}
                            {!isAvailable && classSkillData && (
                              <Badge variant="destructive" className="ml-1 text-xs py-0 px-1">unavailable</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Skill Limit Warning */}
      {classSkillData && !canSelectMoreSkills && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800">
              <strong>Skill Limit Reached:</strong> You have selected the maximum number of skills for your class.
              Deselect a skill to choose a different one.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Saving Throw Proficiencies */}
      <div>
        <FormField
          control={form.control}
          name="savingThrowProficiencies"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base font-semibold">Saving Throw Proficiencies</FormLabel>
                <FormDescription>
                  These are determined by your class and cannot be changed.
                </FormDescription>
              </div>
              <FormControl>
                <div role="group" aria-labelledby="saving-throws-label" className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DND_ABILITIES.map((ability) => {
                    const isProficient = classSavingThrows.includes(ability);
                    const abilityScore = abilities[ability];
                    const modifier = calculateAbilityModifier(abilityScore);
                    const savingThrowBonus = modifier + (isProficient ? proficiencyBonus : 0);
                    
                    return (
                      <div key={ability} className={`p-3 border rounded-md ${isProficient ? 'bg-primary/5 border-primary' : 'bg-muted/30'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{ability}</span>
                          <span className={`text-sm font-mono ${isProficient ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                            {formatBonus(savingThrowBonus)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {isProficient && <Badge variant="default" className="text-xs py-0 px-1">proficient</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Skill Proficiencies:</strong> These represent your character&apos;s training and expertise.
        </p>
        <p className="mt-1">
          Proficient skills add your proficiency bonus (+{proficiencyBonus}) to ability checks.
        </p>
      </div>
    </div>
  );
}