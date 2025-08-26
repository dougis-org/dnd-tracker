import { UseFormReturn } from 'react-hook-form';
import { BasicInfoStep } from './basic-info-step';
import { ClassesStep } from './classes-step';
import { AbilityScoresStep } from './ability-scores-step';
import { SkillsProficienciesStep } from './skills-proficiencies-step';
import { SpellcastingStep } from './spellcasting-step';
import { EquipmentFeaturesStep } from './equipment-features-step';
import { ReviewStep } from './review-step';
import { CHARACTER_FORM_STEPS } from '@/constants/character-form-steps';
import type { 
  CharacterFormInput, 
  BasicInfoFormData,
  AbilitiesFormData,
  SkillsFormData
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

async function validateClasses(form: any) {
  return await form.trigger('classes');
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
      title: CHARACTER_FORM_STEPS.BASIC_INFO.title,
      description: CHARACTER_FORM_STEPS.BASIC_INFO.description,
      component: BasicInfoStep,
      validate: () => validateBasicInfo(form)
    },
    {
      title: CHARACTER_FORM_STEPS.CLASSES.title,
      description: CHARACTER_FORM_STEPS.CLASSES.description,
      component: ClassesStep,
      validate: () => validateClasses(form)
    },
    {
      title: CHARACTER_FORM_STEPS.ABILITY_SCORES.title,
      description: CHARACTER_FORM_STEPS.ABILITY_SCORES.description,
      component: AbilityScoresStep,
      validate: () => validateAbilities(form)
    },
    {
      title: CHARACTER_FORM_STEPS.SKILLS_PROFICIENCIES.title,
      description: CHARACTER_FORM_STEPS.SKILLS_PROFICIENCIES.description,
      component: SkillsProficienciesStep,
      validate: () => validateSkills(form)
    },
    {
      title: CHARACTER_FORM_STEPS.SPELLCASTING.title,
      description: CHARACTER_FORM_STEPS.SPELLCASTING.description,
      component: SpellcastingStep,
      validate: () => validateSpellcasting(form)
    },
    {
      title: CHARACTER_FORM_STEPS.EQUIPMENT_FEATURES.title,
      description: CHARACTER_FORM_STEPS.EQUIPMENT_FEATURES.description,
      component: EquipmentFeaturesStep,
      validate: () => validateEquipment(form)
    },
    {
      title: CHARACTER_FORM_STEPS.REVIEW_COMPLETE.title,
      description: CHARACTER_FORM_STEPS.REVIEW_COMPLETE.description,
      component: (props: any) => ReviewStep({
        formData: form.watch(),
        ...props
      }),
      validate: () => validateReview(form)
    }
  ];
}