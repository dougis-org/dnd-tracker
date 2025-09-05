import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Party } from '@/models/Party';
import { CharacterModel as Character } from '@/models/schemas';
import { canAddCharacterToParty } from '@/lib/utils/tier-limits';
import { getUserTier, canEditParty } from '@/lib/utils/user-context';
import { Types } from 'mongoose';

interface AddCharacterRequest {
  characterId: string;
  playerName?: string;
  playerEmail?: string;
}

/**
 * POST /api/parties/[id]/characters
 * Add a character to a party
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partyId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Validate party ID format
    if (!Types.ObjectId.isValid(partyId)) {
      return new NextResponse('Invalid party ID format', { status: 400 });
    }

    const body: AddCharacterRequest = await req.json();
    const { characterId, playerName, playerEmail } = body;

    // Validate required fields
    if (!characterId) {
      return new NextResponse('Character ID is required', { status: 400 });
    }

    // Validate character ID format
    if (!Types.ObjectId.isValid(characterId)) {
      return new NextResponse('Invalid character ID format', { status: 400 });
    }

    // Find the party
    const party = await Party.findById(partyId);
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Check if user can edit this party
    if (!canEditParty(party, userId)) {
      return new NextResponse('Insufficient permissions to edit this party', { 
        status: 403 
      });
    }

    // Check if character exists and user has access to it
    const character = await Character.findById(characterId);
    if (!character) {
      return new NextResponse('Character not found', { status: 404 });
    }

    // Check if user owns the character (for now, only allow own characters)
    if (character.userId !== userId) {
      return new NextResponse('You can only add your own characters to parties', { 
        status: 403 
      });
    }

    // Check if character is already in the party
    const existingAssignment = party.characters.find(
      (char: any) => char.characterId.toString() === characterId
    );
    if (existingAssignment) {
      return new NextResponse('Character is already in this party', { 
        status: 409 
      });
    }

    // Get user's tier and check party size limits
    const userTier = await getUserTier(party.userId); // Use party owner's tier for limits
    const currentCharacterCount = party.characters.length;

    if (!canAddCharacterToParty(userTier, currentCharacterCount)) {
      return new NextResponse(
        `Party size limit exceeded for ${userTier} tier. Maximum ${
          currentCharacterCount
        } characters allowed.`,
        { status: 403 }
      );
    }

    // Validate email if provided
    if (playerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(playerEmail)) {
        return new NextResponse('Invalid email format', { status: 400 });
      }
    }

    // Add character to party
    const newAssignment = {
      characterId: new Types.ObjectId(characterId),
      playerName: playerName?.trim() || character.name,
      playerEmail: playerEmail?.trim().toLowerCase(),
      isActive: true,
      joinedAt: new Date(),
    };

    party.characters.push(newAssignment);
    await party.save();

    // Return updated party with populated character data
    const updatedParty = await Party.findById(partyId).populate(
      'characters.characterId'
    );

    return NextResponse.json(updatedParty, { status: 200 });
  } catch (error) {
    console.error('Error adding character to party:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}