import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CharacterModel } from '@/models/schemas';
import { isValidObjectId } from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return Response.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    try {
      // Find the original character
      const originalCharacter = await CharacterModel.findOne({ _id: id, userId });
      
      if (!originalCharacter) {
        return Response.json({ error: 'Character not found' }, { status: 404 });
      }

      // Create duplicate data (exclude MongoDB specific fields)
      const { _id, __v, createdAt, updatedAt, ...duplicateData } = originalCharacter.toObject();
      duplicateData.name = `${originalCharacter.name} (Copy)`;
      duplicateData.userId = userId;

      // Create the duplicated character
      const duplicatedCharacter = await CharacterModel.create(duplicateData);

      return Response.json(duplicatedCharacter, { status: 201 });
    } catch (error) {
      console.error('Character duplication error:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return Response.json({ error: error.message }, { status: 400 });
      }
      
      return Response.json({ error: 'Failed to duplicate character' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('POST /api/characters/[id]/duplicate error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}