import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from '@/components/parties/DeleteConfirmModal';

/**
 * DeleteConfirmModal Component Tests
 * Tests for confirmation dialog used before deleting parties or members
 */

describe('DeleteConfirmModal Component', () => {
  const TestWrapper = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        itemName="Test Party"
        itemType="party"
      />
    );
  };

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<TestWrapper />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          isOpen={false}
          onClose={() => {}}
          onConfirm={() => {}}
          itemName="Test"
          itemType="party"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          itemName="Test"
          itemType="party"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display title with item type and name', () => {
      render(<TestWrapper />);

      expect(screen.getByText(/Delete Party/i)).toBeInTheDocument();
    });

    it('should display warning message', () => {
      render(<TestWrapper />);

      expect(screen.getByText(/Test Party/i)).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('should have Cancel button', () => {
      render(<TestWrapper />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should have Delete button with destructive styling', () => {
      render(<TestWrapper />);

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
    });
  });

  describe('interactions', () => {
    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          itemName="Test"
          itemType="party"
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call onConfirm when Delete is clicked', async () => {
      const user = userEvent.setup();
      const handleConfirm = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={handleConfirm}
          itemName="Test"
          itemType="party"
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      expect(handleConfirm).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          itemName="Test"
          itemType="party"
        />
      );

      await user.keyboard('{Escape}');

      // Dialog should be in focus or be dismissed
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside the dialog', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          itemName="Test"
          itemType="party"
        />
      );

      // Find the backdrop/overlay and click it
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      render(<TestWrapper />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have heading', () => {
      render(<TestWrapper />);

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should be keyboard focusable', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.tab();

      // Should focus first button
      expect(document.activeElement).toBe(cancelButton);
    });
  });

  describe('variants', () => {
    it('should show correct title for party type', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          itemName="Test Party"
          itemType="party"
        />
      );

      expect(screen.getByText(/Delete Party/i)).toBeInTheDocument();
    });

    it('should show correct title for member type', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          itemName="Theron"
          itemType="member"
        />
      );

      expect(screen.getByText(/Delete Member/i)).toBeInTheDocument();
    });

    it('should display item name in warning message', () => {
      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          itemName="Elara Moonwhisper"
          itemType="member"
        />
      );

      expect(screen.getByText(/Elara Moonwhisper/i)).toBeInTheDocument();
    });
  });
});
