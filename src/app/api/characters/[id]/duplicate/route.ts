import { NextRequest, NextResponse } from 'next/server';

import { ApiErrors, withAuthAndDb } from '@/lib/api/common';
import { validateDuplicateCharacter } from '@/lib/validations/characters';
import { CharacterService } from '@/lib/services/characterService';

interface RouteParams {
  id: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { id } = await params;
  return withAuthAndDb(async (userId) => {
    try {
      const body = await req.json();
      const validation = validateDuplicateCharacter(body);

      if (!validation.success) {
        return ApiErrors.badRequest(
          `Validation error: ${validation.error.message}`
        );
      }

      const character = await CharacterService.duplicateCharacter({
        userId,
        characterId: id,
        ...(validation.data.newName !== undefined && {
          newName: validation.data.newName,
        }),
      });

      return NextResponse.json(character, { status: 201 });
    } catch (error) {
      if (
        error instanceof RangeError &&
        error.message === 'Character not found'
      ) {
        return ApiErrors.notFound('Character not found');
      }

      console.error('POST /api/characters/[id]/duplicate error:', error);
      throw error;
    }
  });
}
