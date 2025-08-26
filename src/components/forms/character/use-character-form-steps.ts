import { UseFormReturn } from 'react-hook-form';
import { ClassSpecificStep } from './class-specific-step';
import { BasicInfoStep } from './basic-info-step';
import { AbilityScoresStep } from './ability-scores-step';
import { SkillsProficienciesStep } from './skills-proficiencies-step';
import { SpellcastingStep } from './spellcasting-step';
import { EquipmentFeaturesStep } from './equipment-features-step';
import { ReviewStep } from './review-step';
import type { 
  CharacterFormInput, 
  BasicInfoFormData,
  AbilitiesFormData,
  SkillsFormData,
  ClassSpecificFormData
} from '@/lib/validations/character';

const SPELLCASTING_CLASSES = [
  'Artificer', 'Bard', 'Cleric', 'Druid', 
  'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'
];

function hasSpellcastingClasses(classes: Array<{ className: string; level: number }>) {
  return classes.some(cls => SPELLCASTING_CLASSES.includes(cls.className));
}

async function validateBasicInfo(form: any) {
  const basicInfoFields: (keyof BasicInfoFormData)[] = [
    'name', 'race', 'background', 'alignment'
  ];
  return await form.trigger(basicInfoFields);
}

async function validateClassSpecific(form: any) {
  const classSpecificFields: (keyof ClassSpecificFormData)[] = [
    'fightingStyle', 'classFeatures'
  ];
  return await form.trigger(classSpecificFields);
}

async function validateAbilities(form: any) {
  const abilityFields: (keyof AbilitiesFormData)[] = ['abilities'];
  return await form.trigger(abilityFields);
}

async function validateSkills(form: any) {
  const skillsFields: (keyof SkillsFormData)[] = [
    'skillProficiencies', 'savingThrowProficiencies'
  ];
  return await form.trigger(skillsFields);
}

async function validateSpellcasting(form: any) {
  const classes = form.getValues('classes') || [];
  
  if (!hasSpellcastingClasses(classes)) {
    return true; // Always valid for non-casters
  }
  
  return await form.trigger('spellcasting');
}

async function validateEquipment(form: any) {
  const equipmentFields = ['equipment', 'features', 'notes'] as const;
  return await form.trigger(equipmentFields);
}

async function validateReview(form: any) {
  return await form.trigger();
}

export function useCharacterFormSteps(form: any) {
  return [
    {
      title: 'Character Information',
      description: 'Basic character details',
      component: BasicInfoStep,
      validate: () => validateBasicInfo(form)
    },
    {
      title: 'Class Features', 
      description: 'Configure your class abilities',
      component: ClassSpecificStep,
      validate: () => validateClassSpecific(form)
    },
    {
      title: 'Ability Scores',
      description: 'Set your character\'s abilities',
      component: AbilityScoresStep,
      validate: () => validateAbilities(form)
    },
    {
      title: 'Skills & Proficiencies',
      description: 'Choose skills and proficiencies',
      component: SkillsProficienciesStep,
      validate: () => validateSkills(form)
    },
    {
      title: 'Spellcasting',
      description: 'Configure spells and magic',
      component: SpellcastingStep,
      validate: () => validateSpellcasting(form)
    },
    {
      title: 'Equipment & Features',
      description: 'Add equipment and features',
      component: EquipmentFeaturesStep,
      validate: () => validateEquipment(form)
    },
    {
      title: 'Review & Complete',
      description: 'Review and finalize your character',
      component: (props: any) => ReviewStep({
        formData: form.watch(),
        ...props
      }),
      validate: () => validateReview(form)
    }
  ];
}