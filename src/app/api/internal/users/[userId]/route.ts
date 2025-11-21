import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/lib/db/connection';
import UserModel from '@/lib/models/user';
import {
  validateUpdateUser,
  formatValidationErrors,
} from '@/lib/schemas/webhook.schema';

/**
 * Structured logging helper
 */
function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) {
  const log = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  };
  console.log(JSON.stringify(log));
}

/**
 * GET /api/internal/users/[userId]
 * Retrieve a user by userId
 *
 * Response: 200 OK with user object or 404 Not Found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const startTime = Date.now();

  try {
    const { userId } = await params;

    // Connect to MongoDB
    await connectToMongo();

    // Find user (exclude soft-deleted)
    const user = await UserModel.findOne({
      userId,
      deletedAt: null,
    });

    if (!user) {
      logStructured('warn', 'User not found', {
        endpoint: '/api/internal/users/[userId]',
        method: 'GET',
        userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    logStructured('info', 'User retrieved', {
      endpoint: '/api/internal/users/[userId]',
      method: 'GET',
      userId,
      duration_ms: Date.now() - startTime,
    });

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
      { status: 200 }
    );
  } catch (err) {
    logStructured('error', 'Get user error', {
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to retrieve user',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/internal/users/[userId]
 * Update a user
 *
 * Request body:
 * {
 *   displayName?: string,
 *   metadata?: Record
 * }
 *
 * Response: 200 OK with updated user object or 404 Not Found
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const startTime = Date.now();

  try {
    const { userId } = await params;

    // Parse request body
    let payload: unknown;
    try {
      payload = await req.json();
    } catch (err) {
      logStructured('warn', 'Failed to parse request body', {
        endpoint: '/api/internal/users/[userId]',
        method: 'PATCH',
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      );
    }

    // Validate schema
    const validation = validateUpdateUser(payload);
    if (!validation.success) {
      const details = formatValidationErrors(validation.error);
      logStructured('warn', 'Update user validation failed', {
        endpoint: '/api/internal/users/[userId]',
        method: 'PATCH',
        userId,
        details,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Connect to MongoDB
    await connectToMongo();

    // Find and update user (exclude soft-deleted)
    const user = await UserModel.findOne({
      userId,
      deletedAt: null,
    });

    if (!user) {
      logStructured('warn', 'User not found', {
        endpoint: '/api/internal/users/[userId]',
        method: 'PATCH',
        userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Apply updates (only displayName and metadata, userId/email are immutable)
    if (updateData.displayName !== undefined) {
      user.displayName = updateData.displayName;
    }
    if (updateData.metadata !== undefined) {
      user.metadata = updateData.metadata;
    }

    await user.save();

    logStructured('info', 'User updated', {
      endpoint: '/api/internal/users/[userId]',
      method: 'PATCH',
      userId,
      duration_ms: Date.now() - startTime,
    });

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
      { status: 200 }
    );
  } catch (err) {
    logStructured('error', 'Update user error', {
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update user',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/internal/users/[userId]
 * Soft-delete a user
 *
 * Response: 204 No Content or 404 Not Found
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const startTime = Date.now();

  try {
    const { userId } = await params;

    // Connect to MongoDB
    await connectToMongo();

    // Find user (exclude already soft-deleted)
    const user = await UserModel.findOne({
      userId,
      deletedAt: null,
    });

    if (!user) {
      logStructured('warn', 'User not found', {
        endpoint: '/api/internal/users/[userId]',
        method: 'DELETE',
        userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Soft-delete user
    user.deletedAt = new Date();
    await user.save();

    logStructured('info', 'User deleted', {
      endpoint: '/api/internal/users/[userId]',
      method: 'DELETE',
      userId,
      duration_ms: Date.now() - startTime,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logStructured('error', 'Delete user error', {
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete user',
        },
      },
      { status: 500 }
    );
  }
}
