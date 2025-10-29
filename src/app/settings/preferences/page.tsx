/**
 * Preferences Settings Page
 * Allows users to manage application preferences
 * Constitutional: Max 80 lines
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { PreferencesClient } from './PreferencesClient';

/**
 * Server component that fetches preferences and renders preferences form
 */
export default async function PreferencesPage() {
  // Get authenticated user
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect('/sign-in');
  }

  // Fetch user preferences from database
  await connectToDatabase();
  const user = await User.findOne({ clerkId }).lean();

  if (!user) {
    redirect('/sign-in');
  }

  // Extract preferences with defaults
  const preferences = {
    theme: (user.preferences?.theme || 'system') as 'light' | 'dark' | 'system',
    emailNotifications: user.preferences?.emailNotifications ?? true,
    browserNotifications: user.preferences?.browserNotifications ?? false,
    timezone: user.preferences?.timezone || 'UTC',
    language: user.preferences?.language || 'en',
    diceRollAnimations: user.preferences?.diceRollAnimations ?? true,
    autoSaveEncounters: user.preferences?.autoSaveEncounters ?? true,
  };

  return <PreferencesClient preferences={preferences} userId={String(user._id)} />;
}
