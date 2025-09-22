/**
 * POST /api/auth/session endpoint
 * API Contract: contracts/auth-api.yaml:/api/auth/session POST (lines 8-45)
 * Dependencies: T012 (User schema), T013 (DB connection)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken } = body

    // Validate request body
    if (!sessionToken || typeof sessionToken !== 'string') {
      return NextResponse.json(
        { error: 'sessionToken is required and must be a string' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Verify session token with Clerk
    let clerkUser
    try {
      // Use Clerk's session verification
      const { userId } = await auth()

      if (!userId) {
        return NextResponse.json(
          { error: 'Invalid session token' },
          { status: 401 }
        )
      }

      // Get full user data from Clerk
      clerkUser = await clerkClient.users.getUser(userId)

      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 401 }
        )
      }
    } catch (clerkError) {
      console.error('Clerk session validation error:', clerkError)
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      )
    }

    // Find or create user in MongoDB
    let user = await User.findByClerkId(clerkUser.id)

    if (!user) {
      // Create new user from Clerk data
      try {
        user = await User.createFromClerkUser(clerkUser)
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
    }

    // Update user's last login time
    await user.updateOne({ updatedAt: new Date() })

    // Prepare session response
    const sessionResponse = {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        subscription: user.subscription,
        usage: user.usage,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session: {
        id: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
    }

    return NextResponse.json(sessionResponse, { status: 200 })

  } catch (error) {
    console.error('Session endpoint error:', error)

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Handle database connection errors
    if ((error as any).name === 'MongoError' || (error as any).name === 'MongooseError') {
      console.error('Database error in session endpoint:', error)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}