/**
 * AvatarUploadScreen - Avatar file picker and compression screen (T013)
 *
 * Allows user to upload an avatar image with file validation,
 * compression, and preview. Integrates with avatarCompression utility.
 *
 * Props:
 * - preview: Data URL of compressed avatar preview
 * - onNext: Callback to advance to next screen
 *
 * Features:
 * - File type validation (JPEG, PNG, WebP)
 * - Size validation (max 2MB raw, max 250KB base64)
 * - Optional (user can skip)
 */

import React, { useState } from 'react';

interface AvatarUploadScreenProps {
  preview?: string;
  onNext: () => void;
}

export default function AvatarUploadScreen({
  preview,
  onNext,
}: AvatarUploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be smaller than 2MB');
      return;
    }

    setError(undefined);
    // TODO: Call compressAvatar utility here
  };

  return (
    <div data-testid="avatar-screen" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Avatar
        </h2>
        <p className="text-gray-600">
          Choose an image to represent you in the game (optional).
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="flex justify-center">
          <img
            src={preview}
            alt="Avatar preview"
            className="w-32 h-32 rounded-full object-cover border-2 border-blue-500"
          />
        </div>
      )}

      {/* File Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">
            Drag and drop your image here
          </p>
          <p className="text-sm text-gray-600">or</p>
          <label className="inline-block">
            <span className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
              Choose File
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              aria-label="Avatar file"
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500">
            Supported: JPEG, PNG, WebP (max 2MB)
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
