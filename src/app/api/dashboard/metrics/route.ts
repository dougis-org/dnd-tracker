/**
 * Dashboard Metrics API Route
 * GET /api/dashboard/metrics - Returns dashboard metrics for authenticated user
 * Constitutional: Max 100 lines, proper error handling
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import { getDashboardMetrics } from '@/lib/services/dashboardService';
import User from '@/lib/db/models/User';

/**
 * GET /api/dashboard/metrics
 * Returns complete dashboard metrics for the authenticated user
 *
 * @returns Dashboard metrics object or error
 */
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access dashboard metrics' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by Clerk ID
    const user = await User.findByClerkId(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'Your user profile could not be found' },
        { status: 404 }
      );
    }

    // Get dashboard metrics using service (pass user object to avoid redundant query)
    const metrics = await getDashboardMetrics(user);

    // Return metrics
    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Dashboard metrics API error:', error);

    // Handle specific error types
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found', message: 'Your user profile could not be found' },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
