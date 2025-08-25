import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { isValidObjectId } from 'mongoose';

export interface AuthenticatedHandler<T = any> {
  (userId: string, ...args: any[]): Promise<Response>;
}

export interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Higher-order function that handles authentication and database connection
 */
export function withAuth<T extends any[]>(
  handler: (userId: string, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await connectToDatabase();
      return handler(userId, ...args);
    } catch (error) {
      console.error('Authentication or database error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Validates ObjectId and extracts it from route params
 */
export async function validateAndExtractId(params: RouteParams['params']): Promise<string | Response> {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return Response.json({ error: 'Invalid character ID' }, { status: 400 });
  }
  return id;
}

/**
 * Higher-order function for routes that need ID validation
 */
export function withAuthAndId<T extends any[]>(
  handler: (userId: string, id: string, request?: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: Promise<{ id: string }> }, ...args: T): Promise<Response> => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await connectToDatabase();
      
      const idOrError = await validateAndExtractId(context.params);
      if (typeof idOrError !== 'string') {
        return idOrError; // Return the error response
      }
      
      return handler(userId, idOrError, request, ...args);
    } catch (error) {
      console.error('Authentication or database error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Parses JSON from request with error handling
 */
export async function parseRequestJSON(request: NextRequest): Promise<any | Response> {
  try {
    return await request.json();
  } catch (error) {
    return Response.json({ error: 'Invalid JSON data' }, { status: 400 });
  }
}

/**
 * Handles Mongoose validation errors consistently
 */
export function handleDatabaseError(error: unknown, operation: string): Response {
  console.error(`${operation} error:`, error);
  
  if (error instanceof Error && error.name === 'ValidationError') {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.json({ error: `Failed to ${operation.toLowerCase()}` }, { status: 500 });
}

/**
 * Generic not found response
 */
export function notFoundResponse(resource: string = 'Character'): Response {
  return Response.json({ error: `${resource} not found` }, { status: 404 });
}