import { NextRequest } from 'next/server';
import { CharacterModel } from '@/models/schemas';
import { withAuthAndId, handleDatabaseError, notFoundResponse, RouteParams } from '../../_utils/route-helpers';

async function duplicateCharacter(userId: string, id: string, request?: NextRequest): Promise<Response> {
  try {
    // Find the original character
    const originalCharacter = await CharacterModel.findOne({ _id: id, userId });
    
    if (!originalCharacter) {
      return notFoundResponse();
    }

    const originalObject = typeof originalCharacter.toObject === 'function' ? originalCharacter.toObject() : originalCharacter;
    // Exclude MongoDB-specific fields and fields that should be regenerated
    const { _id, createdAt, updatedAt, __v, ...rest } = originalObject;

    // Create duplicate data, ensuring all fields from the original are carried over
    const duplicateData = {
      ...rest,
      userId,
      name: `${originalCharacter.name} (Copy)`,
    };

    // Create the duplicated character
    const duplicatedCharacter = await CharacterModel.create(duplicateData);

    return Response.json(duplicatedCharacter, { status: 201 });
  } catch (error) {
    return handleDatabaseError(error, 'duplicate character');
  }
}

export const POST = withAuthAndId(duplicateCharacter);