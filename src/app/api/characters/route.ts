import { NextRequest } from 'next/server';
import { CharacterModel } from '@/models/schemas';
import { withAuth, handleDatabaseError, parseRequestJSON } from './_utils/route-helpers';

async function getCharacters(userId: string, request: NextRequest): Promise<Response> {
  try {
    // Parse pagination and filter parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100); // Max 100 per page
    const skip = (page - 1) * limit;
    const sortBy = url.searchParams.get('sortBy') || 'updatedAt';
    const filterClass = url.searchParams.get('class');
    const filterLevel = url.searchParams.get('level');

    // Build query filters
    const query: any = { userId };
    
    // Filter by class (case-insensitive)
    if (filterClass) {
      query['classes.className'] = { $regex: new RegExp(filterClass, 'i') };
    }
    
    // Filter by level
    if (filterLevel) {
      const level = parseInt(filterLevel);
      if (!isNaN(level)) {
        query.totalLevel = level;
      }
    }

    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'level':
        sortOptions = { totalLevel: -1 };
        break;
      case 'updated':
      default:
        sortOptions = { updatedAt: -1 };
        break;
    }

    // Get total count for pagination
    const total = await CharacterModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get paginated characters with filters and sorting
    const characters = await CharacterModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

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