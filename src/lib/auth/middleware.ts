/**
 * Authentication middleware with session validation
 * Security: Clerk session token validation, user context injection
 */
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/connection'
import User, { IUser } from '@/lib/db/models/User'

// Extended request interface to include user context
export interface AuthenticatedRequest extends NextRequest {
  user?: IUser
  userId?: string
}

// Middleware configuration
export interface AuthMiddlewareOptions {
  requireAuth?: boolean
  requireSubscription?: boolean
  allowedRoles?: string[]
  tierRequired?: string
}

/**
 * Authentication middleware factory
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return async function authMiddleware(
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // Get authentication from Clerk
      const { userId } = await auth()

      // Handle unauthenticated requests
      if (!userId) {
        if (options.requireAuth !== false) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        // Allow unauthenticated requests if not required
        return handler(request)
      }

      // Connect to database
      await connectToDatabase()

      // Find user in database
      const user = await User.findByClerkId(userId)

      if (!user) {
        // User exists in Clerk but not in our database
        // This could happen if user was deleted from our DB but not from Clerk
        console.warn(`User ${userId} exists in Clerk but not in database`)

        // Try to recreate user from Clerk data
        try {
          const clerkUser = await clerkClient.users.getUser(userId)
          const newUser = await User.createFromClerkUser(clerkUser)

          // Inject user context
          request.user = newUser
          request.userId = userId

        } catch (createError) {
          console.error('Failed to recreate user from Clerk:', createError)
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          )
        }
      } else {
        // Inject user context
        request.user = user
        request.userId = userId
      }

      // Role-based authorization
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        const userRole = request.user!.profile.role
        if (!options.allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }

      // Subscription tier validation
      if (options.tierRequired) {
        const tierHierarchy = ['free', 'seasoned', 'expert', 'master', 'guild']
        const requiredTierIndex = tierHierarchy.indexOf(options.tierRequired)
        const userTierIndex = tierHierarchy.indexOf(request.user!.subscription.tier)

        if (userTierIndex < requiredTierIndex) {
          return NextResponse.json(
            {
              error: 'Subscription upgrade required',
              requiredTier: options.tierRequired,
              currentTier: request.user!.subscription.tier,
            },
            { status: 403 }
          )
        }
      }

      // Check subscription status
      if (options.requireSubscription) {
        const subscription = request.user!.subscription
        if (subscription.status !== 'active' && subscription.status !== 'trial') {
          return NextResponse.json(
            {
              error: 'Active subscription required',
              subscriptionStatus: subscription.status,
            },
            { status: 403 }
          )
        }

        // Check if subscription has expired
        if (subscription.currentPeriodEnd < new Date()) {
          return NextResponse.json(
            {
              error: 'Subscription expired',
              expiredAt: subscription.currentPeriodEnd,
            },
            { status: 403 }
          )
        }
      }

      // Call the original handler with authenticated request
      return handler(request)

    } catch (error) {
      console.error('Auth middleware error:', error)

      // Handle Clerk authentication errors
      if ((error as any).message?.includes('clerk') || (error as any).status === 401) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      // Handle database errors
      if ((error as any).name === 'MongoError' || (error as any).name === 'MongooseError') {
        console.error('Database error in auth middleware:', error)
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }

      // Generic server error
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Convenience middleware presets
 */
export const requireAuth = createAuthMiddleware({ requireAuth: true })

export const requireDM = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ['dm', 'both'],
})

export const requirePaidSubscription = createAuthMiddleware({
  requireAuth: true,
  requireSubscription: true,
  tierRequired: 'seasoned',
})

/**
 * Helper function to get current user from authenticated request
 */
export function getCurrentUser(request: AuthenticatedRequest): IUser | null {
  return request.user || null
}

/**
 * Helper function to check if user can perform action based on tier limits
 */
export function checkTierLimit(
  user: IUser,
  action: 'party' | 'encounter' | 'creature' | 'participant',
  count?: number
): { allowed: boolean; limit: number; current: number } {
  const limits = user.getTierLimits()

  let limit: number
  let current: number

  switch (action) {
    case 'party':
      limit = limits.parties
      current = user.usage.partiesCount
      break
    case 'encounter':
      limit = limits.encounters
      current = user.usage.encountersCount
      break
    case 'creature':
      limit = limits.creatures
      current = user.usage.creaturesCount
      break
    case 'participant':
      limit = limits.maxParticipants
      current = count || 0
      break
    default:
      return { allowed: false, limit: 0, current: 0 }
  }

  const allowed = limit === -1 || current < limit
  return { allowed, limit, current }
}

/**
 * Middleware for tier limit validation
 */
export function createTierLimitMiddleware(
  action: 'party' | 'encounter' | 'creature' | 'participant',
  count?: number
) {
  return async function tierLimitMiddleware(request: AuthenticatedRequest): Promise<NextResponse | null> {
    if (!request.user) {
      return NextResponse.json(
        { error: 'User context not available' },
        { status: 500 }
      )
    }

    const check = checkTierLimit(request.user, action, count)

    if (!check.allowed) {
      return NextResponse.json(
        {
          error: `${action} limit exceeded`,
          limit: check.limit,
          current: check.current,
          tier: request.user.subscription.tier,
        },
        { status: 403 }
      )
    }

    return null // No error, proceed
  }
}

export default createAuthMiddleware