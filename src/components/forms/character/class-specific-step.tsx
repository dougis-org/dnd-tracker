"use client";

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CharacterFormInput } from '@/lib/validations/character';

interface ClassSpecificStepProps {
  classesSelected?: Array<{
    className: string;
    level: number;
  }>;
}

// Class-specific data and features
const CLASS_FEATURES = {
  'Artificer': {
    subclasses: ['Alchemist', 'Armorer', 'Artillerist', 'Battle Smith'],
    keyFeatures: ['Magical Tinkering', 'Infuse Item', 'Artificer Specialist', 'Tool Expertise'],
    savingThrows: ['Constitution', 'Intelligence'],
    description: 'Masters of magical invention and engineering'
  },
  'Barbarian': {
    subclasses: ['Path of the Ancestral Guardian', 'Path of the Battlerager', 'Path of the Beast', 'Path of the Berserker', 'Path of the Storm Herald', 'Path of the Totem Warrior', 'Path of Wild Magic', 'Path of the Zealot'],
    keyFeatures: ['Rage', 'Unarmored Defense', 'Reckless Attack', 'Danger Sense'],
    savingThrows: ['Strength', 'Constitution'],
    description: 'Fierce warriors driven by primal instinct'
  },
  'Bard': {
    subclasses: ['College of Creation', 'College of Eloquence', 'College of Glamour', 'College of Lore', 'College of Spirits', 'College of Swords', 'College of Valor', 'College of Whispers'],
    keyFeatures: ['Bardic Inspiration', 'Jack of All Trades', 'Song of Rest', 'Expertise'],
    savingThrows: ['Dexterity', 'Charisma'],
    description: 'Versatile spellcasters who weave magic through music and words'
  },
  'Cleric': {
    subclasses: ['Death Domain', 'Forge Domain', 'Grave Domain', 'Knowledge Domain', 'Life Domain', 'Light Domain', 'Nature Domain', 'Order Domain', 'Peace Domain', 'Tempest Domain', 'Trickery Domain', 'Twilight Domain', 'War Domain'],
    keyFeatures: ['Divine Domain', 'Channel Divinity', 'Turn Undead', 'Divine Intervention'],
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Divine spellcasters who serve the gods'
  },
  'Druid': {
    subclasses: ['Circle of Dreams', 'Circle of the Land', 'Circle of the Moon', 'Circle of the Shepherd', 'Circle of Spores', 'Circle of Stars', 'Circle of Wildfire'],
    keyFeatures: ['Druidcraft', 'Wild Shape', 'Natural Recovery', 'Beast Speech'],
    savingThrows: ['Intelligence', 'Wisdom'],
    description: 'Nature-based spellcasters who can transform into animals'
  },
  'Fighter': {
    subclasses: ['Arcane Archer', 'Battle Master', 'Cavalier', 'Champion', 'Echo Knight', 'Eldritch Knight', 'Gunslinger', 'Psi Warrior', 'Purple Dragon Knight', 'Rune Knight', 'Samurai'],
    keyFeatures: ['Fighting Style', 'Second Wind', 'Action Surge', 'Extra Attack'],
    savingThrows: ['Strength', 'Constitution'],
    description: 'Master combatants skilled with various weapons and tactics'
  },
  'Monk': {
    subclasses: ['Way of the Ascendant Dragon', 'Way of the Astral Self', 'Way of the Drunken Master', 'Way of the Four Elements', 'Way of the Kensei', 'Way of the Long Death', 'Way of Mercy', 'Way of the Open Hand', 'Way of Shadow', 'Way of the Sun Soul'],
    keyFeatures: ['Martial Arts', 'Ki', 'Unarmored Defense', 'Unarmored Movement'],
    savingThrows: ['Strength', 'Dexterity'],
    description: 'Masters of martial arts powered by inner strength'
  },
  'Paladin': {
    subclasses: ['Oath of the Ancients', 'Oath of Conquest', 'Oath of the Crown', 'Oath of Devotion', 'Oath of Glory', 'Oath of Redemption', 'Oath of Vengeance', 'Oath of the Watchers', 'Oathbreaker'],
    keyFeatures: ['Divine Sense', 'Lay on Hands', 'Divine Smite', 'Aura of Protection'],
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Holy warriors bound by sacred oaths'
  },
  'Ranger': {
    subclasses: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Horizon Walker', 'Hunter', 'Monster Slayer', 'Swarmkeeper', 'Drakewarden'],
    keyFeatures: ['Favored Enemy', 'Natural Explorer', 'Fighting Style', 'Spellcasting'],
    savingThrows: ['Strength', 'Dexterity'],
    description: 'Skilled hunters and guardians of the wilderness'
  },
  'Rogue': {
    subclasses: ['Arcane Trickster', 'Assassin', 'Inquisitive', 'Mastermind', 'Phantom', 'Scout', 'Soulknife', 'Swashbuckler', 'Thief'],
    keyFeatures: ['Expertise', 'Sneak Attack', 'Thieves&apos; Cant', 'Cunning Action'],
    savingThrows: ['Dexterity', 'Intelligence'],
    description: 'Skilled in stealth, deception, and precise strikes'
  },
  'Sorcerer': {
    subclasses: ['Aberrant Mind', 'Clockwork Soul', 'Divine Soul', 'Draconic Bloodline', 'Shadow Magic', 'Storm Sorcery', 'Wild Magic'],
    keyFeatures: ['Sorcerous Origin', 'Font of Magic', 'Sorcery Points', 'Metamagic'],
    savingThrows: ['Constitution', 'Charisma'],
    description: 'Innate spellcasters with magic flowing through their veins'
  },
  'Warlock': {
    subclasses: ['The Archfey', 'The Celestial', 'The Fathomless', 'The Fiend', 'The Genie', 'The Great Old One', 'The Hexblade', 'The Undead', 'The Undying'],
    keyFeatures: ['Otherworldly Patron', 'Pact Magic', 'Eldritch Invocations', 'Pact Boon'],
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Spellcasters who make pacts with otherworldly beings'
  },
  'Wizard': {
    subclasses: ['School of Abjuration', 'School of Conjuration', 'School of Divination', 'School of Enchantment', 'School of Evocation', 'School of Illusion', 'School of Necromancy', 'School of Transmutation', 'War Magic', 'Order of Scribes'],
    keyFeatures: ['Arcane Recovery', 'Ritual Casting', 'Arcane Tradition', 'Spell Mastery'],
    savingThrows: ['Intelligence', 'Wisdom'],
    description: 'Scholarly spellcasters who study the arcane arts'
  }
};

// Fighting styles for classes that have them
const FIGHTING_STYLES = {
  'Fighter': ['Archery', 'Blessed Warrior', 'Blind Fighting', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Interception', 'Protection', 'Superior Technique', 'Thrown Weapon Fighting', 'Two-Weapon Fighting', 'Unarmed Fighting'],
  'Paladin': ['Blessed Warrior', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Protection'],
  'Ranger': ['Archery', 'Blind Fighting', 'Defense', 'Druidcraft', 'Dueling', 'Thrown Weapon Fighting', 'Two-Weapon Fighting']
};

export function ClassSpecificStep({ classesSelected = [] }: ClassSpecificStepProps) {
  const form = useFormContext<CharacterFormInput>();
  
  // Use provided classes or get from form
  const watchedClasses = classesSelected || form.watch('classes') || [];

  const primaryClass = watchedClasses?.[0];
  const hasMultipleClasses = watchedClasses.length > 1;

  if (!primaryClass) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="text-xl font-semibold mb-2">No Class Selected</h3>
        <p className="text-sm">
          Please go back to the previous step and select a character class.
        </p>
      </div>
    );
  }

  const classData = CLASS_FEATURES[primaryClass.className as keyof typeof CLASS_FEATURES];

  if (!classData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold mb-2">Unknown Class</h3>
        <p className="text-sm">
          Class-specific features for <strong>{primaryClass.className}</strong> are not yet available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Class Features</h3>
        <p className="text-muted-foreground">
          Configure your <strong>{primaryClass.className}</strong> specific abilities and features
        </p>
      </div>

      {/* Class Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{primaryClass.className} Features</span>
            <Badge variant="secondary">Level {primaryClass.level}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {classData.description}
          </p>
          
          <div>
            <strong className="text-sm">Key Class Features:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {classData.keyFeatures.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <strong className="text-sm">Saving Throw Proficiencies:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {classData.savingThrows.map((save) => (
                <Badge key={save} variant="secondary" className="text-xs">
                  {save}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subclass Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Subclass Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name={`classes.0.subclass`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {primaryClass.className} Subclass
                  {primaryClass.level >= 3 && <span className="text-destructive"> *</span>}
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={primaryClass.level < 3}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        primaryClass.level < 3 
                          ? "Available at level 3" 
                          : `Select ${primaryClass.className} subclass`
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classData.subclasses.map((subclass) => (
                      <SelectItem key={subclass} value={subclass}>
                        {subclass}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {primaryClass.level < 3
                    ? "Most classes gain their subclass at level 3"
                    : "Choose your character's specialized path within the class"
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Fighting Style (for applicable classes) */}
      {FIGHTING_STYLES[primaryClass.className as keyof typeof FIGHTING_STYLES] && (
        <Card>
          <CardHeader>
            <CardTitle>Fighting Style</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="fightingStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Choose Fighting Style
                    {primaryClass.level >= 1 && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fighting style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIGHTING_STYLES[primaryClass.className as keyof typeof FIGHTING_STYLES].map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your preferred combat style and weapon expertise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Class-Specific Features Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Class Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the class features you&apos;ve gained at your current level:
          </p>
          
          <FormField
            control={form.control}
            name="classFeatures"
            render={() => (
              <FormItem>
                <div className="space-y-3">
                  {classData.keyFeatures.map((feature) => (
                    <FormField
                      key={feature}
                      control={form.control}
                      name="classFeatures"
                      render={({ field }) => {
                        const currentFeatures = field.value || [];
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={currentFeatures.includes(feature)}
                                onCheckedChange={(checked) => {
                                  const newFeatures = checked
                                    ? [...currentFeatures, feature]
                                    : currentFeatures.filter((f: string) => f !== feature);
                                  field.onChange(newFeatures);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {feature}
                              </FormLabel>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Multiclass Information */}
      {hasMultipleClasses && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-700">Multiclass Character</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-3">
              You have multiple classes. Remember that multiclassing has specific requirements and affects feature progression.
            </p>
            
            <div className="space-y-2">
              <strong className="text-sm">Your Classes:</strong>
              {watchedClasses.map((cls, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{cls.className}</span>
                  <Badge variant="outline">Level {cls.level}</Badge>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Note:</strong> This form shows features for your primary class ({primaryClass.className}).</p>
              <p>Additional class features should be configured separately.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Class Features:</strong> The features listed here are based on your class and level.
        </p>
        <p className="mt-1">
          Some features may be automatically applied during character finalization.
        </p>
      </div>
    </div>
  );
}