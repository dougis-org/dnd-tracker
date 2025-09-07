import { Party, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from '@/app/api/parties/_utils/party-api-utils';

// POST /api/parties/import - Import party from JSON
export async function POST(req: NextRequest) {
  const { userId, error } = await authenticateUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { party: importedParty } = body;

    // Validate required data
    if (!importedParty || typeof importedParty !== 'object') {
      return new NextResponse('Party data is required', { status: 400 });
    }

    if (!importedParty.name || typeof importedParty.name !== 'string' || importedParty.name.trim().length === 0) {
      return new NextResponse('Party name is required', { status: 400 });
    }

    // Sanitize and prepare party data for import
    const sanitizedParty: Partial<IParty> = {
      userId: userId!, // Always set to authenticated user
      name: importedParty.name.trim(),
    };

    // Optional fields with validation
    if (importedParty.description && typeof importedParty.description === 'string') {
      sanitizedParty.description = importedParty.description.trim();
    }

    if (importedParty.campaignName && typeof importedParty.campaignName === 'string') {
      sanitizedParty.campaignName = importedParty.campaignName.trim();
    }

    if (typeof importedParty.maxSize === 'number' && importedParty.maxSize > 0) {
      sanitizedParty.maxSize = importedParty.maxSize;
    }

    if (typeof importedParty.isTemplate === 'boolean') {
      sanitizedParty.isTemplate = importedParty.isTemplate;
      
      if (importedParty.isTemplate && 
          importedParty.templateCategory && 
          typeof importedParty.templateCategory === 'string') {
        sanitizedParty.templateCategory = importedParty.templateCategory;
      }
    }

    // Import characters (sanitized)
    if (Array.isArray(importedParty.characters)) {
      sanitizedParty.characters = importedParty.characters.map((char: any) => {
        const sanitizedChar: Partial<IParty['characters'][0]> = {
          isActive: typeof char.isActive === 'boolean' ? char.isActive : true,
        };

        if (char.playerName && typeof char.playerName === 'string') {
          sanitizedChar.playerName = char.playerName.trim();
        }

        if (char.playerEmail && typeof char.playerEmail === 'string') {
          const email = char.playerEmail.trim().toLowerCase();
          // Validate email format
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error(`Invalid email format: ${char.playerEmail}`);
          }
          sanitizedChar.playerEmail = email;
        }

        // Note: characterId and joinedAt are not imported for security
        return sanitizedChar;
      });
    }

    // Note: sharedWith is not imported for security reasons
    // Note: _id, createdAt, updatedAt are not imported (will be generated)

    const newParty = new Party(sanitizedParty);
    const savedParty = await newParty.save();
    
    return NextResponse.json(savedParty, { status: 201 });
    
  } catch (error: any) {
    // Handle JSON parsing errors from req.json()
    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    
    // Handle validation errors (including email validation)
    if (error.message?.includes('Invalid email format') || error.name === 'ValidationError') {
      return new NextResponse('Validation failed: ' + error.message, { status: 400 });
    }
    
    return handleApiError(error, 'importing party');
  }
}