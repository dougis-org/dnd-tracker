/**
 * User context utilities for getting user tier and permissions
 */

import { UserModel as User } from '@/models/User';
import { SubscriptionTier } from './tier-limits';

/**
 * Get user's subscription tier from database
 * Falls back to 'free' if user not found or tier not set
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  try {
    const user = await User.findOne({ clerkId: userId }).lean();
    
    if (!user?.subscription?.tier) {
      return 'free';
    }
    
    return user.subscription.tier as SubscriptionTier;
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return 'free';
  }
}

/**
 * Get user data including tier information
 */
export async function getUserWithTier(userId: string) {
  try {
    const user = await User.findOne({ clerkId: userId }).lean();
    
    return {
      user,
      tier: (user?.subscription?.tier as SubscriptionTier) || 'free',
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      user: null,
      tier: 'free' as SubscriptionTier,
    };
  }
}

/**
 * Check if user has permission to edit a party
 * User can edit if they are the owner or have editor role in shared access
 */
export function canEditParty(party: any, userId: string): boolean {
  // Owner can always edit
  if (party.userId === userId) {
    return true;
  }
  
  // Check if user has editor permissions through sharing
  const sharedAccess = party.sharedWith?.find(
    (share: any) => share.userId === userId
  );
  
  return sharedAccess?.role === 'editor';
}

/**
 * Check if user has permission to view a party
 * User can view if they are the owner or have any shared access
 */
export function canViewParty(party: any, userId: string): boolean {
  // Owner can always view
  if (party.userId === userId) {
    return true;
  }
  
  // Check if user has any shared access
  const sharedAccess = party.sharedWith?.find(
    (share: any) => share.userId === userId
  );
  
  return !!sharedAccess;
}