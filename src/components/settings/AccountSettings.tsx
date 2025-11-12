'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

interface AccountSettingsProps {
  profile?: {
    name: string;
    email: string;
    createdAt: Date;
  };
}

export default function AccountSettings({ profile }: AccountSettingsProps) {
  if (!profile) return null;

  const createdDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          View your account details. To edit your name and email, visit your profile page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <p className="text-gray-900">{profile.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <p className="text-gray-900">{profile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Created
          </label>
          <p className="text-gray-900">{createdDate}</p>
        </div>

        <div className="pt-4 border-t">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
