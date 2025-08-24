import { NextRequest } from 'next/server';
import { CharacterModel } from '@/models/schemas';
import { withAuthAndId, handleDatabaseError, notFoundResponse, RouteParams, parseRequestJSON } from '../_utils/route-helpers';

async function getCharacter(userId: string, id: string, request: NextRequest): Promise<Response> {
  try {
    const character = await CharacterModel.findOne({ _id: id, userId });
    
    if (!character) {
      return notFoundResponse();
    }

    return Response.json(character);
  } catch (error) {
    return handleDatabaseError(error, 'fetch character');
  }
}

export const GET = withAuthAndId(getCharacter);

async function updateCharacter(userId: string, id: string, request: NextRequest): Promise<Response> {
  const dataOrError = await parseRequestJSON(request);
  if (dataOrError instanceof Response) {
    return dataOrError; // Return the error response
  }

  try {
    const character = await CharacterModel.findOneAndUpdate(
      { _id: id, userId },
      dataOrError,
      { new: true, runValidators: true }
    );
    
    if (!character) {
      return notFoundResponse();
    }

    return Response.json(character);
  } catch (error) {
    return handleDatabaseError(error, 'update character');
  }
}

export const PUT = withAuthAndId(updateCharacter);

async function deleteCharacter(userId: string, id: string, request: NextRequest): Promise<Response> {
  try {
    const character = await CharacterModel.findOneAndDelete({ _id: id, userId });
    
    if (!character) {
      return notFoundResponse();
    }

    return Response.json({ message: 'Character deleted successfully' });
  } catch (error) {
    return handleDatabaseError(error, 'delete character');
  }
}

export const DELETE = withAuthAndId(deleteCharacter);