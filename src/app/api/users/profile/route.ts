/**
 * GET/PUT /api/users/profile endpoints
 * API Contract: contracts/auth-api.yaml:/api/users/profile GET (lines 47-61)
 * API Contract: contracts/auth-api.yaml:/api/users/profile PUT (lines 63-110)
 * Dependencies: T012 (User schema), T017 (auth middleware), T018 (validation schemas)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import { validateProfileUpdate } from '@/lib/validations/auth'

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find user in database
    const user = await User.findByClerkId(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Return user profile data per schema
    const userProfile = {
      id: user.id,
      email: user.email,
      profile: user.profile,
      subscription: user.subscription,
      usage: user.usage,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(userProfile, { status: 200 })

  } catch (error) {
    console.error('Profile GET endpoint error:', error)

    // Handle database connection errors
    if (error instanceof Error && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Handle authentication errors
    if (error instanceof Error && (error.message.includes('clerk') || error.message.includes('auth'))) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    const validation = validateProfileUpdate(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: `Validation error: ${validation.error.message}` },
        { status: 400 }
      )
    }

    const { profile, preferences } = validation.data

    // Connect to database
    await connectToDatabase()

    // Find user in database
    const user = await User.findByClerkId(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Prepare update object (only update provided fields)
    const updateObject: Record<string, unknown> = {}

    if (profile) {
      Object.keys(profile).forEach((key) => {
        const typedKey = key as keyof typeof profile
        if (profile[typedKey] !== undefined) {
          updateObject[`profile.${key}`] = profile[typedKey]
        }
      })
    }

    if (preferences) {
      Object.keys(preferences).forEach((key) => {
        const typedKey = key as keyof typeof preferences
        if (preferences[typedKey] !== undefined) {
          updateObject[`preferences.${key}`] = preferences[typedKey]
        }
      })
    }

    // Update user document
    await user.updateOne(updateObject)

    // Fetch updated user to return
    const updatedUser = await User.findByClerkId(userId)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated profile' },
        { status: 500 }
      )
    }

    // Return updated user profile
    const userProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      profile: updatedUser.profile,
      subscription: updatedUser.subscription,
      usage: updatedUser.usage,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json(userProfile, { status: 200 })

  } catch (error) {
    console.error('Profile PUT endpoint error:', error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Handle database connection errors
    if (error instanceof Error && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Handle validation errors from mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: `Validation error: ${error.message}` },
        { status: 400 }
      )
    }

    // Handle authentication errors
    if (error instanceof Error && (error.message.includes('clerk') || error.message.includes('auth'))) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
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
export async function POST() {
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