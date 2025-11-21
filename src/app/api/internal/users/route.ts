import { NextRequest, NextResponse } from 'next/server'
import { connectToMongo } from '@/lib/db/connection'
import UserModel from '@/lib/models/user'
import { validateCreateUser, formatValidationErrors } from '@/lib/schemas/webhook.schema'

/**
 * Structured logging helper
 */
function logStructured(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const log = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  }
  console.log(JSON.stringify(log))
}

/**
 * POST /api/internal/users
 * Create a new user
 *
 * Request body:
 * {
 *   userId: string,
 *   email: string,
 *   displayName?: string,
 *   metadata?: Record
 * }
 *
 * Response: 201 Created with user object
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    let payload: unknown
    try {
      payload = await req.json()
    } catch (err) {
      logStructured('warn', 'Failed to parse request body', {
        endpoint: '/api/internal/users',
        method: 'POST',
        error: err instanceof Error ? err.message : String(err),
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      )
    }

    // Validate schema
    const validation = validateCreateUser(payload)
    if (!validation.success) {
      const details = formatValidationErrors(validation.error)
      logStructured('warn', 'Create user validation failed', {
        endpoint: '/api/internal/users',
        method: 'POST',
        details,
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details,
          },
        },
        { status: 400 }
      )
    }

    const userData = validation.data

    // Connect to MongoDB
    await connectToMongo()

    // Create user
    try {
      const user = await UserModel.create({
        userId: userData.userId,
        email: userData.email,
        displayName: userData.displayName || '',
        metadata: userData.metadata || {},
      })

      logStructured('info', 'User created', {
        endpoint: '/api/internal/users',
        method: 'POST',
        userId: user.userId,
        duration_ms: Date.now() - startTime,
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            metadata: user.metadata,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 201 }
      )
    } catch (err) {
      // Handle duplicate key errors
      const mongoErr = err as { code?: number; keyPattern?: { [key: string]: number } }

      if (mongoErr.code === 11000) {
        const keyPattern = mongoErr.keyPattern || {}
        const field = Object.keys(keyPattern)[0] || 'unknown'

        logStructured('warn', 'Duplicate key error', {
          endpoint: '/api/internal/users',
          method: 'POST',
          field,
          userId: userData.userId,
        })

        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${field} already exists`,
              field,
            },
          },
          { status: 409 }
        )
      }

      throw err
    }
  } catch (err) {
    logStructured('error', 'Create user error', {
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create user',
        },
      },
      { status: 500 }
    )
  }
}
