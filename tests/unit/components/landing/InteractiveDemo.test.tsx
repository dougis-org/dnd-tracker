import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';

describe('InteractiveDemo', () => {
  it('renders with heading and description', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('heading', { level: 2, name: /Try It Out/i })).toBeInTheDocument();
    expect(screen.getByText(/See how D&D Tracker makes campaign management effortless/i)).toBeInTheDocument();
  });

  it('renders toggle buttons for combat and character views', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('button', { name: /Combat Tracking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Character Stats/i })).toBeInTheDocument();
  });

  it('shows combat demo by default', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('heading', { name: /Combat Tracking/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/Round 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Initiative order/i)).toBeInTheDocument();
  });

  it('switches to character view when button is clicked', async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    const characterButton = screen.getByRole('button', { name: /Character Stats/i });
    await user.click(characterButton);

    expect(screen.getByRole('heading', { name: /Character Stats/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/HP/)).toBeInTheDocument();
    expect(screen.getByText(/AC/)).toBeInTheDocument();
    expect(screen.getByText(/Speed/)).toBeInTheDocument();
  });

  it('switches back to combat view when button is clicked', async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    // Switch to character view
    await user.click(screen.getByRole('button', { name: /Character Stats/i }));
    expect(screen.getByRole('heading', { name: /Character Stats/i, level: 3 })).toBeInTheDocument();

    // Switch back to combat view
    await user.click(screen.getByRole('button', { name: /Combat Tracking/i }));
    expect(screen.getByRole('heading', { name: /Combat Tracking/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/Round 1/i)).toBeInTheDocument();
  });

  it('applies active styling to selected button', async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    const combatButton = screen.getByRole('button', { name: /Combat Tracking/i });
    const characterButton = screen.getByRole('button', { name: /Character Stats/i });

    // Combat button should be active by default
    expect(combatButton).toHaveClass('bg-blue-600');
    expect(characterButton).toHaveClass('bg-slate-200');

    // Switch to character view
    await user.click(characterButton);
    expect(combatButton).toHaveClass('bg-slate-200');
    expect(characterButton).toHaveClass('bg-blue-600');
  });

  it('has region with proper aria-label', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('region', { name: /Interactive Demo/i })).toBeInTheDocument();
  });
});
