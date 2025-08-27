import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Party, IParty } from '@/models/Party';

/**
 * Authentication utility for party API endpoints
 */
export async function authenticateUser() {
  const { userId } = await auth();
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
 * Finds a party by ID and checks access permissions
 */
export async function findPartyWithAccess(id: string, userId: string) {
  const party = await Party.findById(id);
  
  if (!party) {
    return { party: null, error: new NextResponse('Party not found', { status: 404 }) };
  }

  if (!hasPartyAccess(party, userId)) {
    return { party: null, error: new NextResponse('Forbidden', { status: 403 }) };
  }

  return { party, error: null };
}

/**
 * Finds a party by ID and checks edit permissions
 */
export async function findPartyWithEditAccess(id: string, userId: string) {
  const party = await Party.findById(id);
  
  if (!party) {
    return { party: null, error: new NextResponse('Party not found', { status: 404 }) };
  }

  if (!hasEditPermission(party, userId)) {
    return { party: null, error: new NextResponse('Forbidden', { status: 403 }) };
  }

  return { party, error: null };
}

/**
 * Finds a party by ID and checks delete permissions
 */
export async function findPartyWithDeleteAccess(id: string, userId: string) {
  const party = await Party.findById(id);
  
  if (!party) {
    return { party: null, error: new NextResponse('Party not found', { status: 404 }) };
  }

  if (!canDeleteParty(party, userId)) {
    return { party: null, error: new NextResponse('Forbidden', { status: 403 }) };
  }

  return { party, error: null };
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