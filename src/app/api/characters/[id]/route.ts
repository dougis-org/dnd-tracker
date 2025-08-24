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

export async function GET(request: NextRequest, { params }: RouteParams) {
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
      const character = await CharacterModel.findOne({ _id: id, userId });
      
      if (!character) {
        return Response.json({ error: 'Character not found' }, { status: 404 });
      }

      return Response.json(character);
    } catch (error) {
      console.error('Character fetch error:', error);
      return Response.json({ error: 'Failed to fetch character' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('GET /api/characters/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return Response.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    let data;
    try {
      data = await request.json();
    } catch (error) {
      return Response.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    await connectToDatabase();
    
    try {
      const character = await CharacterModel.findOneAndUpdate(
        { _id: id, userId },
        data,
        { new: true, runValidators: true }
      );
      
      if (!character) {
        return Response.json({ error: 'Character not found' }, { status: 404 });
      }

      return Response.json(character);
    } catch (error) {
      console.error('Character update error:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return Response.json({ error: error.message }, { status: 400 });
      }
      
      return Response.json({ error: 'Failed to update character' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('PUT /api/characters/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      const character = await CharacterModel.findOneAndDelete({ _id: id, userId });
      
      if (!character) {
        return Response.json({ error: 'Character not found' }, { status: 404 });
      }

      return Response.json({ message: 'Character deleted successfully' });
    } catch (error) {
      console.error('Character deletion error:', error);
      return Response.json({ error: 'Failed to delete character' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('DELETE /api/characters/[id] error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}