/**
 * Profile Setup Page
 * First-time profile setup flow for new users
 * Server component that fetches user data and delegates to ProfileSetupWizard
 *
 * Constitutional: Max 100 lines
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import ProfileSetupClient from './ProfileSetupClient';

export const metadata = {
  title: 'Profile Setup | D&D Tracker',
  description: 'Set up your D&D profile to get started',
};

export default async function ProfileSetupPage() {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Connect to database
  await connectToDatabase();

  // Fetch user profile
  const user = await User.findByClerkId(userId);

  if (!user) {
    // User doesn't exist in database yet - this shouldn't happen
    // as they should be created via webhook, but handle gracefully
    redirect('/sign-in');
  }

  // If profile setup is already completed, redirect to dashboard
  if (user.profileSetupCompleted) {
    redirect('/dashboard');
  }

  // Render client component
  return <ProfileSetupClient />;
}
