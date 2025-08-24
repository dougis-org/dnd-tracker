import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CharacterModel } from '@/models/schemas';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
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
      console.error('Character query error:', error);
      return Response.json({ error: 'Failed to fetch characters' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('GET /api/characters error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data;
    try {
      data = await request.json();
    } catch (error) {
      return Response.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    await connectToDatabase();

    try {
      const character = await CharacterModel.create({
        ...data,
        userId
      });

      return Response.json(character, { status: 201 });
    } catch (error) {
      console.error('Character creation error:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return Response.json({ error: error.message }, { status: 400 });
      }
      
      return Response.json({ error: 'Failed to create character' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('POST /api/characters error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}