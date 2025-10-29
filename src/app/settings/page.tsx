/**
 * Settings Index Page
 * Redirects to profile settings as default
 * Constitutional: Max 20 lines
 */

import { redirect } from 'next/navigation';

/**
 * Default settings page redirects to profile tab
 */
export default function SettingsPage() {
  redirect('/settings/profile');
}
