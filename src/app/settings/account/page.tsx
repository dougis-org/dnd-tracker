/**
 * Account Settings Page
 * Displays subscription tier and account information
 * Constitutional: Max 100 lines
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { AccountClient } from './AccountClient';

/**
 * Server component that fetches account data and renders account info
 */
export default async function AccountPage() {
  // Get authenticated user
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect('/sign-in');
  }

  // Fetch user account data from database
  await connectToDatabase();
  const user = await User.findOne({ id: clerkId }).lean();

  if (!user) {
    redirect('/sign-in');
  }

  // Extract account information
  const accountInfo: {
    subscriptionTier: string;
    subscriptionStatus: string;
    currentPeriodEnd?: Date;
    createdAt: Date;
    lastLoginAt?: Date;
  } = {
    subscriptionTier: user.subscription?.tier || user.subscriptionTier || 'free',
    subscriptionStatus: user.subscription?.status || 'active',
    ...(user.subscription?.currentPeriodEnd && { currentPeriodEnd: user.subscription.currentPeriodEnd }),
    createdAt: user.createdAt,
    ...(user.lastLoginAt && { lastLoginAt: user.lastLoginAt }),
  };

  return <AccountClient accountInfo={accountInfo} userId={String(user._id)} />;
}
