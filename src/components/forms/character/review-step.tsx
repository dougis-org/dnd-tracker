import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CharacterFormInput } from '@/lib/validations/character';

// Simple hash function for creating stable keys
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

interface ReviewStepProps {
  formData: CharacterFormInput;
}

export function ReviewStep({ formData }: ReviewStepProps) {
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
              <strong>Experience:</strong> {formData.experiencePoints || 0} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classes & Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.classes.map((cls, index) => (
              <div key={`class-${hashString(`${cls.className}-${cls.level}`)}`} className="flex justify-between">
                <span><strong>{cls.className}</strong></span>
                <span>Level {cls.level}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <strong>Total Level:</strong> {formData.classes.reduce((sum, cls) => sum + cls.level, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ability Scores</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Strength:</strong> {formData.abilities.strength}
            </div>
            <div>
              <strong>Dexterity:</strong> {formData.abilities.dexterity}
            </div>
            <div>
              <strong>Constitution:</strong> {formData.abilities.constitution}
            </div>
            <div>
              <strong>Intelligence:</strong> {formData.abilities.intelligence}
            </div>
            <div>
              <strong>Wisdom:</strong> {formData.abilities.wisdom}
            </div>
            <div>
              <strong>Charisma:</strong> {formData.abilities.charisma}
            </div>
          </CardContent>
        </Card>

        {formData.spellcasting && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spellcasting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.spellcasting.ability && (
                <div>
                  <strong>Spellcasting Ability:</strong> {formData.spellcasting.ability}
                </div>
              )}
              <div>
                <strong>Spell Save DC:</strong> {formData.spellcasting.spellSaveDC}
              </div>
              {formData.spellcasting.spellsKnown && formData.spellcasting.spellsKnown.length > 0 && (
                <div>
                  <strong>Known Spells:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {formData.spellcasting.spellsKnown.map((spell, index) => (
                      <span key={`known-spell-${hashString(spell)}`} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {spell}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {formData.spellcasting.spellsPrepared && formData.spellcasting.spellsPrepared.length > 0 && (
                <div>
                  <strong>Prepared Spells:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {formData.spellcasting.spellsPrepared.map((spell, index) => (
                      <span key={`prepared-spell-${hashString(spell)}`} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {spell}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {(formData.skillProficiencies && formData.skillProficiencies.length > 0) ||
       (formData.savingThrowProficiencies && formData.savingThrowProficiencies.length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proficiencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.skillProficiencies && formData.skillProficiencies.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {formData.skillProficiencies.map((skill, index) => (
                    <span key={`skill-${hashString(skill)}`} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.savingThrowProficiencies && formData.savingThrowProficiencies.length > 0 && (
              <div>
                <strong>Saving Throws:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {formData.savingThrowProficiencies.map((save, index) => (
                    <span key={`saving-throw-${hashString(save)}`} className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      {save}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {((formData.equipment && formData.equipment.length > 0) ||
        (formData.features && formData.features.length > 0) ||
        (formData.notes && formData.notes.trim())) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipment & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.equipment && formData.equipment.length > 0 && (
              <div>
                <strong>Equipment:</strong>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {formData.equipment.map((item, index) => (
                    <li key={`equipment-${hashString(`${item.name}-${item.quantity}-${item.category || ''}`)}`}>
                      {item.name} {item.quantity && item.quantity > 1 && `(${item.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.features && formData.features.length > 0 && (
              <div>
                <strong>Features:</strong>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {formData.features.map((feature, index) => (
                    <li key={`feature-${hashString(feature)}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.notes && formData.notes.trim() && (
              <div>
                <strong>Notes:</strong>
                <p className="mt-1 text-sm text-gray-600">{formData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}