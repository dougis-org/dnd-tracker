/**
 * POST /api/auth/session endpoint
 * API Contract: contracts/auth-api.yaml:/api/auth/session POST (lines 8-45)
 * Dependencies: T012 (User schema), T013 (DB connection)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import { createHash } from 'crypto'
import { ApiErrors, formatUserProfile } from '@/lib/api/common'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken } = body

    // Validate request body
    if (!sessionToken || typeof sessionToken !== 'string') {
      return ApiErrors.badRequest('sessionToken is required and must be a string')
    }

    // Connect to database
    await connectToDatabase()

    // Verify session token with Clerk
    let clerkUser
    try {
      // Use Clerk's session verification
      const { userId } = await auth()

      if (!userId) {
        return ApiErrors.unauthorized()
      }

      // Get full user data from Clerk
      const client = await clerkClient();
      clerkUser = await client.users.getUser(userId)

      if (!clerkUser) {
        return ApiErrors.unauthorized()
      }
    } catch (clerkError) {
      console.error('Clerk session validation error:', clerkError)
      return ApiErrors.unauthorized()
    }

    // Find or create user in MongoDB
    let user = await User.findByClerkId(clerkUser.id)

    if (!user) {
      // Create new user from Clerk data
      try {
        user = await User.createFromClerkUser(clerkUser)
      } catch (createError) {
        console.error('Error creating user:', createError)
        return ApiErrors.internalError('Failed to create user profile')
      }
    }

    // Update user's last login time
    await user.updateOne({ updatedAt: new Date() })

    // Prepare session response
    const sessionResponse = {
      user: formatUserProfile(user),
      session: {
        id: createHash('sha256').update(sessionToken).digest('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
    }

    return NextResponse.json(sessionResponse, { status: 200 })

  } catch (error) {
    console.error('Session endpoint error:', error)

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return ApiErrors.badRequest('Invalid JSON in request body')
    }

    // Handle database connection errors
    if (error instanceof Error && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      console.error('Database error in session endpoint:', error)
      return ApiErrors.internalError('Database connection failed')
    }

    // Generic server error
    return ApiErrors.internalError()
  }
}

// Handle unsupported methods
export async function GET() {
  return ApiErrors.methodNotAllowed()
}

export async function PUT() {
  return ApiErrors.methodNotAllowed()
}

export async function DELETE() {
  return ApiErrors.methodNotAllowed()
}