import React, { useEffect } from 'react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'party' | 'member';
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteConfirmModalProps): React.ReactElement | null {
  useEffect(() => {
    // Handle escape key press
    const handleEscape = (e: unknown) => {
      const keyEvent = e as Record<string, unknown>;
      if (keyEvent.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.addEventListener('keydown', handleEscape as any);
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.removeEventListener('keydown', handleEscape as any);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const itemTypeLabel = itemType === 'party' ? 'Party' : 'Member';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Delete {itemTypeLabel}
        </h2>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This
          action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
