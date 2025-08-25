"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiStepForm } from '../multi-step-form';
import { BasicInfoStep } from './basic-info-step';
import { AbilityScoresStep } from './ability-scores-step';
import { SkillsProficienciesStep } from './skills-proficiencies-step';
import { SpellcastingStep } from './spellcasting-step';
import { EquipmentFeaturesStep } from './equipment-features-step';
import { 
  characterFormSchema, 
  type CharacterFormData,
  type CharacterFormInput,
  type BasicInfoFormData,
  type AbilitiesFormData,
  type SkillsFormData
} from '@/lib/validations/character';
import type { z } from 'zod';

interface CharacterCreationFormProps {
  onComplete?: (character: { id: string }) => void;
  onCancel?: () => void;
}

interface ReviewStepProps {
  formData: CharacterFormInput;
}

function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Review Your Character</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Name:</strong> {formData.name}
            </div>
            <div>
              <strong>Race:</strong> {formData.race}
            </div>
            {formData.subrace && (
              <div>
                <strong>Subrace:</strong> {formData.subrace}
              </div>
            )}
            <div>
              <strong>Background:</strong> {formData.background}
            </div>
            <div>
              <strong>Alignment:</strong> {formData.alignment}
            </div>
            <div>
              <strong>Experience Points:</strong> {formData.experiencePoints}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ability Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(formData.abilities).map(([ability, score]) => (
              <div key={ability}>
                <strong className="capitalize">{ability}:</strong> {score}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spellcasting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.spellcasting?.ability ? (
              <>
                <div>
                  <strong>Spellcasting Ability:</strong> <span className="capitalize">{formData.spellcasting.ability}</span>
                </div>
                <div>
                  <strong>Spell Attack Bonus:</strong> {formData.spellcasting.spellAttackBonus >= 0 ? '+' : ''}{formData.spellcasting.spellAttackBonus}
                </div>
                <div>
                  <strong>Spell Save DC:</strong> {formData.spellcasting.spellSaveDC}
                </div>
                {formData.knownSpells && formData.knownSpells.length > 0 && (
                  <div>
                    <strong>Known Spells:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {formData.knownSpells.map((spell, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {spell.name} (Level {spell.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {formData.preparedSpells && formData.preparedSpells.length > 0 && (
                  <div>
                    <strong>Prepared Spells:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {formData.preparedSpells.map((spell, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {spell.name} (Level {spell.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No spellcasting abilities</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills & Proficiencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>Skill Proficiencies:</strong>
            {formData.skillProficiencies && formData.skillProficiencies.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {formData.skillProficiencies.map((skill) => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground ml-1">None selected</span>
            )}
          </div>
          <div>
            <strong>Class Features:</strong>
            <div className="text-sm text-muted-foreground mt-1">
              Saving throw proficiencies and class features will be automatically applied based on your selected class.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.equipment && formData.equipment.length > 0 ? (
              <div className="space-y-2">
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.quantity > 1 && `×${item.quantity} `}
                      <span className="capitalize">{item.category}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No equipment added</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features & Traits</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.features && formData.features.length > 0 ? (
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="text-sm">
                    {feature}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No features added</p>
            )}
          </CardContent>
        </Card>
      </div>

      {formData.notes && formData.notes.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Ready to Create:</strong> Review your character details above.
        </p>
        <p className="mt-1">
          Click &quot;Complete&quot; to create your character and add them to your campaign.
        </p>
      </div>
    </div>
  );
}

export function CharacterCreationForm({ onComplete, onCancel }: CharacterCreationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CharacterFormInput>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: '',
      race: '',
      subrace: '',
      background: '',
      alignment: '',
      classes: [
        {
          className: 'Fighter',
          level: 1,
          hitDiceSize: 10,
          hitDiceUsed: 0
        }
      ],
      abilities: {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8
      },
      hitPoints: { maximum: 10, current: 10, temporary: 0 },
      armorClass: 10,
      speed: 30,
      initiative: 0,
      passivePerception: 10,
      spellcasting: {
        ability: undefined,
        spellAttackBonus: 0,
        spellSaveDC: 8
      },
      notes: ''
    },
    mode: 'onChange'
  });

  const handleSubmit = async (data: CharacterFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create character' }));
        throw new Error(errorData.error || 'Failed to create character');
      }

      const character = await response.json();
      
      if (onComplete) {
        onComplete(character);
      } else {
        router.push('/characters');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const steps = [
    {
      title: 'Character Information',
      description: 'Basic character details',
      component: BasicInfoStep,
      validate: async () => {
        const basicInfoFields: (keyof BasicInfoFormData)[] = [
          'name', 'race', 'background', 'alignment'
        ];
        
        const isValid = await form.trigger(basicInfoFields);
        return isValid;
      }
    },
    {
      title: 'Ability Scores',
      description: 'Set your character abilities',
      component: (props: any) => <AbilityScoresStep raceSelected={form.watch('race')} {...props} />,
      validate: async () => {
        const abilityFields: (keyof AbilitiesFormData)[] = ['abilities'];
        const isValid = await form.trigger(abilityFields);
        return isValid;
      }
    },
    {
      title: 'Skills & Proficiencies',
      description: 'Choose your character skills',
      component: SkillsProficienciesStep,
      validate: async () => {
        const skillsFields: (keyof SkillsFormData)[] = ['skillProficiencies', 'savingThrowProficiencies'];
        const isValid = await form.trigger(skillsFields);
        return isValid;
      }
    },
    {
      title: 'Spellcasting',
      description: 'Spells and magical abilities',
      component: (props: any) => <SpellcastingStep
        classesSelected={form.watch('classes')}
        {...props}
      />,
      validate: async () => {
        // For non-caster classes, skip spellcasting validation
        const classes = form.getValues('classes') || [];
        const SPELLCASTING_CLASSES = ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
        const hasSpellcaster = classes.some(cls => SPELLCASTING_CLASSES.includes(cls.className));
        
        if (!hasSpellcaster) {
          return true; // Always valid for non-casters
        }
        
        const spellcastingFields = ['spellcasting', 'knownSpells', 'preparedSpells', 'spellSlots'] as const;
        const isValid = await form.trigger(spellcastingFields);
        return isValid;
      }
    },
    {
      title: 'Equipment & Features',
      description: 'Gear and special abilities',
      component: (props: any) => <EquipmentFeaturesStep 
        classesSelected={form.watch('classes')} 
        backgroundSelected={form.watch('background')} 
        {...props} 
      />,
      validate: async () => {
        const equipmentFields = ['equipment', 'features', 'notes'] as const;
        const isValid = await form.trigger(equipmentFields);
        return isValid;
      }
    },
    {
      title: 'Review & Complete',
      description: 'Review your character',
      component: (props: any) => <ReviewStep formData={form.watch()} {...props} />,
      validate: async () => {
        const isValid = await form.trigger();
        return isValid;
      }
    }
  ];

  const validateStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.validate) {
      return await step.validate();
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <MultiStepForm
            steps={steps}
            validateStep={validateStep}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel="Complete"
            submittingLabel="Completing..."
            error={error}
            form={form}
          />
        </form>
      </Form>
    </div>
  );
}