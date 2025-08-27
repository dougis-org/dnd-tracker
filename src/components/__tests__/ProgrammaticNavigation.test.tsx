
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import ProgrammaticNavigator from '../ProgrammaticNavigator';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('ProgrammaticNavigator', () => {
  it('should call router.push with the correct path when the button is clicked', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    const targetPath = '/dashboard';
    const buttonText = 'Go to Dashboard';

    render(<ProgrammaticNavigator targetPath={targetPath} buttonText={buttonText} />);

    const button = screen.getByRole('button', { name: buttonText });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(targetPath);
  });
});
