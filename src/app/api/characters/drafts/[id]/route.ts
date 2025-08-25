import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { CharacterDraft } from '@/models/schemas';
import type { CharacterFormInput } from '@/lib/validations/character';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid draft ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const draft = await db.collection('character_drafts').findOne({
      _id: new ObjectId(params.id),
      userId
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid draft ID' }, { status: 400 });
    }

    const body = await request.json();
    const { formData, name } = body;

    // Validate the input
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const updateData = {
      name: name || formData.name || 'Unnamed Character',
      formData: formData as CharacterFormInput,
      updatedAt: new Date()
    };

    const result = await db.collection('character_drafts').findOneAndUpdate(
      { _id: new ObjectId(params.id), userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid draft ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('character_drafts').deleteOne({
      _id: new ObjectId(params.id),
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}