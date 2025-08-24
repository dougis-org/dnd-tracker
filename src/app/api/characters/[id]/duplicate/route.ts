import { NextRequest } from 'next/server';
import { CharacterModel } from '@/models/schemas';
import { withAuthAndId, handleDatabaseError, notFoundResponse, RouteParams } from '../../_utils/route-helpers';

async function duplicateCharacter(userId: string, id: string, request: NextRequest): Promise<Response> {
  try {
    // Find the original character
    const originalCharacter = await CharacterModel.findOne({ _id: id, userId });
    
    if (!originalCharacter) {
      return notFoundResponse();
    }

    // Create duplicate data (exclude MongoDB specific fields)
    const duplicateData = {
      userId,
      name: `${originalCharacter.name} (Copy)`,
      race: originalCharacter.race,
      subrace: originalCharacter.subrace,
      background: originalCharacter.background,
      alignment: originalCharacter.alignment,
      experiencePoints: originalCharacter.experiencePoints,
      classes: originalCharacter.classes,
      abilities: originalCharacter.abilities,
      skillProficiencies: originalCharacter.skillProficiencies,
      savingThrowProficiencies: originalCharacter.savingThrowProficiencies,
      hitPoints: originalCharacter.hitPoints,
      armorClass: originalCharacter.armorClass,
      speed: originalCharacter.speed,
      initiative: originalCharacter.initiative,
      passivePerception: originalCharacter.passivePerception,
      spellcasting: originalCharacter.spellcasting,
      equipment: originalCharacter.equipment,
      features: originalCharacter.features,
      notes: originalCharacter.notes
    };

    // Create the duplicated character
    const duplicatedCharacter = await CharacterModel.create(duplicateData);

    return Response.json(duplicatedCharacter, { status: 201 });
  } catch (error) {
    return handleDatabaseError(error, 'duplicate character');
  }
}

export const POST = withAuthAndId(duplicateCharacter);