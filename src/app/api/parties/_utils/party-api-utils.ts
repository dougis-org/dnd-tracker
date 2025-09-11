import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Party, IParty } from '@/models/Party';

/**
 * Email validation pattern - defined as constant for security
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Authentication utility for party API endpoints
 */
export async function authenticateUser() {
  const authResult = await auth();
  const userId = authResult?.userId;
  if (!userId) {
    return { userId: null, error: new NextResponse('Unauthorized', { status: 401 }) };
  }
  return { userId, error: null };
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function validateObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { valid: false, error: new NextResponse('Invalid party ID', { status: 400 }) };
  }
  return { valid: true, error: null };
}

/**
 * Checks if a user has access to view a party (owner or shared)
 */
export function hasPartyAccess(party: IParty, userId: string): boolean {
  return party.userId === userId || 
    party.sharedWith.some((share: IParty['sharedWith'][0]) => share.userId === userId);
}

/**
 * Checks if a user has edit permission for a party (owner or editor role)
 */
export function hasEditPermission(party: IParty, userId: string): boolean {
  const isOwner = party.userId === userId;
  const hasEditorRole = party.sharedWith.some(
    (share: IParty['sharedWith'][0]) => share.userId === userId && share.role === 'editor'
  );
  return isOwner || hasEditorRole;
}

/**
 * Checks if a user can delete a party (owner only)
 */
export function canDeleteParty(party: IParty, userId: string): boolean {
  return party.userId === userId;
}

/**
 * Generic function to find party by ID and check permissions
 */
async function findPartyWithPermission(
  id: string, 
  userId: string, 
  permissionCheck: (party: IParty, userId: string) => boolean
) {
  const party = await Party.findById(id);
  
  if (!party) {
    return { party: null, error: new NextResponse('Party not found', { status: 404 }) };
  }

  if (!permissionCheck(party, userId)) {
    return { party: null, error: new NextResponse('Forbidden', { status: 403 }) };
  }

  return { party, error: null };
}

/**
 * Finds a party by ID and checks access permissions
 */
export async function findPartyWithAccess(id: string, userId: string) {
  return findPartyWithPermission(id, userId, hasPartyAccess);
}

/**
 * Finds a party by ID and checks edit permissions
 */
export async function findPartyWithEditAccess(id: string, userId: string) {
  return findPartyWithPermission(id, userId, hasEditPermission);
}

/**
 * Finds a party by ID and checks delete permissions
 */
export async function findPartyWithDeleteAccess(id: string, userId: string) {
  return findPartyWithPermission(id, userId, canDeleteParty);
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: any, operation: string): NextResponse {
  console.error(`Error ${operation}:`, error);
  
  // Handle validation errors specifically
  if (error.name === 'ValidationError') {
    return new NextResponse('Validation failed: ' + error.message, { status: 400 });
  }
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError) {
    return new NextResponse('Invalid JSON in request body', { status: 400 });
  }
  
  return new NextResponse(`Error ${operation}`, { status: 500 });
}

/**
 * Common route handler setup for party API endpoints
 */
export async function setupPartyRoute(params: Promise<{ id: string }>) {
  const { userId, error: authError } = await authenticateUser();
  if (authError) return { authError, userId: null, id: null, validationError: null };

  const { id } = await params;
  const { valid, error: validationError } = validateObjectId(id);
  if (!valid) return { validationError, userId: null, id: null, authError: null };

  return { userId: userId!, id, authError: null, validationError: null };
}

/**
 * Generic route handler wrapper 
 */
async function handlePartyOperation(
  params: Promise<{ id: string }>, 
  permissionHandler: (id: string, userId: string) => Promise<{ party: IParty | null; error: NextResponse | null }>
) {
  const setup = await setupPartyRoute(params);
  if (setup.authError) return setup.authError;
  if (setup.validationError) return setup.validationError;
  
  // At this point, we know userId and id are not null due to early returns above
  if (!setup.userId || !setup.id) {
    throw new Error('Setup should have returned valid userId and id');
  }
  
  const { party, error } = await permissionHandler(setup.id, setup.userId);
  if (error) return error;
  
  return { party, id: setup.id, error: null };
}

/**
 * Route handler wrapper for GET operations
 */
export async function handleGetParty(params: Promise<{ id: string }>) {
  return handlePartyOperation(params, findPartyWithAccess);
}

/**
 * Route handler wrapper for PUT operations  
 */
export async function handleUpdateParty(params: Promise<{ id: string }>) {
  return handlePartyOperation(params, findPartyWithEditAccess);
}

/**
 * Route handler wrapper for DELETE operations
 */
export async function handleDeleteParty(params: Promise<{ id: string }>) {
  return handlePartyOperation(params, findPartyWithDeleteAccess);
}

/**
 * Generic handler for POST requests with JSON body and error handling
 */
export async function handlePostWithJsonBody<T = any>(
  req: NextRequest,
  params: Promise<{ id: string }>,
  permissionHandler: (id: string, userId: string) => Promise<{ party: IParty | null; error: NextResponse | null }>,
  bodyHandler: (body: T, party: IParty) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const setup = await setupPartyRoute(params);
    if (setup.authError) return setup.authError;
    if (setup.validationError) return setup.validationError;

    const { party, error } = await permissionHandler(setup.id!, setup.userId!);
    if (error) return error;

    const body = await req.json();
    return await bodyHandler(body, party!);
  } catch (error: any) {
    return handleJsonParsingError(error, 'processing request');
  }
}

/**
 * Consolidated JSON parsing error handler
 */
export function handleJsonParsingError(error: any, operation: string): NextResponse {
  // Handle JSON parsing errors from req.json()
  if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
    return new NextResponse('Invalid JSON in request body', { status: 400 });
  }
  return handleApiError(error, operation);
}

/**
 * Standard handler for endpoints that require authentication but no params
 */
export async function handleAuthenticatedRequest(
  req: NextRequest,
  handler: (userId: string, body: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const { userId, error } = await authenticateUser();
    if (error) return error;

    const body = await req.json();
    return await handler(userId!, body);
  } catch (error: any) {
    return handleJsonParsingError(error, 'processing authenticated request');
  }
}

/**
 * Enhanced export data sanitization utility
 */
export function sanitizeExportData(party: IParty, userId: string) {
  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      version: '1.0'
    },
    party: {
      name: party.name,
      description: party.description,
      campaignName: party.campaignName,
      maxSize: party.maxSize,
      isTemplate: party.isTemplate,
      templateCategory: party.templateCategory,
      characters: party.characters.map((char: any) => ({
        playerName: char.playerName,
        playerEmail: char.playerEmail,
        isActive: char.isActive,
        // Note: characterId and joinedAt are not exported for security
      }))
    }
  };
}

/**
 * Generate sanitized filename from party name
 */
export function generateExportFilename(partyName: string): string {
  return partyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    || 'party-export';
}