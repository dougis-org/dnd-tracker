import { NextRequest } from 'next/server';
import { CharacterModel } from '@/models/schemas';
import { withAuth, handleDatabaseError, parseRequestJSON } from './_utils/route-helpers';

async function getCharacters(userId: string, request: NextRequest): Promise<Response> {
  try {
    // Parse pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await CharacterModel.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    // Get paginated characters
    const characters = await CharacterModel
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .sort('-updatedAt');

    // Return paginated response
    return Response.json({
      characters,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    return handleDatabaseError(error, 'fetch characters');
  }
}

export const GET = withAuth(getCharacters);

async function createCharacter(userId: string, request: NextRequest): Promise<Response> {
  const dataOrError = await parseRequestJSON(request);
  if (dataOrError instanceof Response) {
    return dataOrError; // Return the error response
  }

  try {
    const character = await CharacterModel.create({
      ...dataOrError,
      userId
    });

    return Response.json(character, { status: 201 });
  } catch (error) {
    return handleDatabaseError(error, 'create character');
  }
}

export const POST = withAuth(createCharacter);