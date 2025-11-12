'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DataManagement() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleExport = () => {
    setShowConfirmation(true);
    // Real export functionality to be implemented in F048
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Manage your personal data and exports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Export Your Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Download a copy of your data including profiles, characters, and preferences in JSON format.
          </p>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Export Data
          </button>
        </div>

        {showConfirmation && (
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              Export functionality coming soon! Real file download will be available in a future update.
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Delete Your Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete all your data. This action cannot be undone.
          </p>
          <button
            disabled
            className="inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600 cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
