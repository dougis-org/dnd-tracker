/**
 * GET/PUT /api/users/profile endpoints
 * API Contract: contracts/auth-api.yaml:/api/users/profile GET (lines 47-61)
 * API Contract: contracts/auth-api.yaml:/api/users/profile PUT (lines 63-110)
 * Dependencies: T012 (User schema), T017 (auth middleware), T018 (validation schemas)
 */
import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import User from '@/lib/db/models/User'
import { validateProfileUpdate } from '@/lib/validations/auth'
import { ApiErrors, withAuthAndDb, formatUserProfile, buildProfileUpdateObject } from '@/lib/api/common'

export async function GET() {
  return withAuthAndDb(async (userId) => {
    // Find user in database
    const user = await User.findByClerkId(userId)

    if (!user) {
      return ApiErrors.notFound('User profile not found')
    }

    // Return user profile data per schema
    return NextResponse.json(formatUserProfile(user), { status: 200 })
  })
}

export async function PUT(request: NextRequest) {
  return withAuthAndDb(async (userId) => {
    try {
      // Parse and validate request body
      const body = await request.json()

      const validation = validateProfileUpdate(body)
      if (!validation.success) {
        return ApiErrors.validationError(validation.error.message)
      }

      // Find user in database
      const user = await User.findByClerkId(userId)

      if (!user) {
        return ApiErrors.notFound('User profile not found')
      }

      // Prepare and apply update
      const updateObject = buildProfileUpdateObject(validation.data)
      await user.updateOne(updateObject)

      // Fetch updated user to return
      const updatedUser = await User.findByClerkId(userId)

      if (!updatedUser) {
        return ApiErrors.internalError('Failed to retrieve updated profile')
      }

      // Sync profileSetupCompleted to Clerk publicMetadata for middleware access
      if ('profileSetupCompleted' in updateObject) {
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              profileSetupCompleted: updatedUser.profileSetupCompleted,
            },
          });
        } catch (error) {
          console.error('Failed to sync profileSetupCompleted to Clerk:', error);
          // Don't fail the request if Clerk sync fails
        }
      }

      // Return updated user profile
      return NextResponse.json(formatUserProfile(updatedUser), { status: 200 })

    } catch (error) {
      console.error('Profile PUT endpoint error:', error)

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return ApiErrors.badRequest('Invalid JSON in request body')
      }

      // Handle validation errors from mongoose
      if (error instanceof Error && error.name === 'ValidationError') {
        return ApiErrors.validationError(error.message)
      }

      throw error // Let withAuthAndDb handle other errors
    }
  })
}

// Handle unsupported methods
export async function POST() {
  return ApiErrors.methodNotAllowed()
}

export async function DELETE() {
  return ApiErrors.methodNotAllowed()
}