import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { connectToDatabase } from '@/lib/mongodb';
import { CharacterDraft } from '@/models/schemas';
import type { CharacterFormInput } from '@/lib/validations/character';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const drafts = await db.collection('character_drafts')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { formData, name } = body;

    // Validate the input
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const draftData = {
      userId,
      name: name || formData.name || 'Unnamed Character',
      formData: formData as CharacterFormInput,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate draft data against schema
    const validatedDraft = CharacterDraft.parse(draftData);
    
    const result = await db.collection('character_drafts').insertOne(validatedDraft);
    
    const draft = await db.collection('character_drafts').findOne({ _id: result.insertedId });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}