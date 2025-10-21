/**
 * Client-side user service for API interactions
 * Centralizes profile update logic to avoid duplication
 *
 * Constitutional: Max 100 lines
 */

import type { ProfileSetup } from '@/lib/validations/user';

/**
 * Update user profile via API
 * @param data - Profile data to update
 * @param errorMessage - Custom error message if request fails
 * @throws Error if API request fails
 */
export async function updateUserProfile(
  data: ProfileSetup | { profileSetupCompleted: boolean },
  errorMessage = 'Failed to update profile'
): Promise<void> {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || errorMessage);
  }
}
