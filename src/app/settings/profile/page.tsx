/**
 * Profile Settings Page
 * User profile management in settings
 * Server component that fetches user data and delegates to ProfileSettingsClient
 *
 * Constitutional: Max 100 lines
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import ProfileSettingsClient from './ProfileSettingsClient';

export const metadata = {
  title: 'Profile Settings | D&D Tracker',
  description: 'Manage your D&D profile settings',
};

export default async function ProfileSettingsPage() {
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
    // User doesn't exist in database
    redirect('/sign-in');
  }

  // Render client component with user data
  return <ProfileSettingsClient user={user} />;
}
