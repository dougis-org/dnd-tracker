import { Party, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleJsonParsingError, EMAIL_REGEX } from '@/app/api/parties/_utils/party-api-utils';

// POST /api/parties/import - Import party from JSON
export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await authenticateUser();
    if (error) return error;

    const body = await req.json();
    const { party: importedParty } = body;

    // Validate required data
    if (!importedParty || typeof importedParty !== 'object') {
      return new NextResponse('Party data is required', { status: 400 });
    }

    if (!importedParty.name || typeof importedParty.name !== 'string' || importedParty.name.trim().length === 0) {
      return new NextResponse('Party name is required', { status: 400 });
    }

    // Sanitize and prepare party data for import using standardized logic
    const sanitizedParty = sanitizeImportData(importedParty, userId!);
    
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
    
    return handleJsonParsingError(error, 'importing party');
  }
}

/**
 * Sanitize basic party fields
 */
function sanitizeBasicFields(importedParty: any, userId: string): Partial<IParty> {
  const sanitizedParty: Partial<IParty> = {
    userId,
    name: importedParty.name.trim(),
  };

  if (importedParty.description && typeof importedParty.description === 'string') {
    sanitizedParty.description = importedParty.description.trim();
  }

  if (importedParty.campaignName && typeof importedParty.campaignName === 'string') {
    sanitizedParty.campaignName = importedParty.campaignName.trim();
  }

  if (typeof importedParty.maxSize === 'number' && importedParty.maxSize > 0) {
    sanitizedParty.maxSize = importedParty.maxSize;
  }

  return sanitizedParty;
}

/**
 * Sanitize template fields
 */
function sanitizeTemplateFields(importedParty: any): Partial<IParty> {
  const templateFields: Partial<IParty> = {};

  if (typeof importedParty.isTemplate === 'boolean') {
    templateFields.isTemplate = importedParty.isTemplate;
    
    if (importedParty.isTemplate && 
        importedParty.templateCategory && 
        typeof importedParty.templateCategory === 'string') {
      templateFields.templateCategory = importedParty.templateCategory;
    }
  }

  return templateFields;
}

/**
 * Sanitize a single character
 */
function sanitizeCharacter(char: any): Partial<IParty['characters'][0]> {
  const sanitizedChar: Partial<IParty['characters'][0]> = {
    isActive: typeof char.isActive === 'boolean' ? char.isActive : true,
  };

  if (char.playerName && typeof char.playerName === 'string') {
    sanitizedChar.playerName = char.playerName.trim();
  }

  if (char.playerEmail && typeof char.playerEmail === 'string') {
    const email = char.playerEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      throw new Error(`Invalid email format: ${char.playerEmail}`);
    }
    sanitizedChar.playerEmail = email;
  }

  return sanitizedChar;
}

/**
 * Sanitize characters array
 */
function sanitizeCharacters(importedParty: any): Partial<IParty> {
  if (!Array.isArray(importedParty.characters)) {
    return {};
  }

  return {
    characters: importedParty.characters.map(sanitizeCharacter)
  };
}

/**
 * Sanitize imported party data with validation
 */
function sanitizeImportData(importedParty: any, userId: string): Partial<IParty> {
  return {
    ...sanitizeBasicFields(importedParty, userId),
    ...sanitizeTemplateFields(importedParty),
    ...sanitizeCharacters(importedParty)
  };
}