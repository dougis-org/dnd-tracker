import { render, screen } from '@testing-library/react';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';

describe('InteractiveDemo Component', () => {
  it('renders the demo section', () => {
    render(<InteractiveDemo />);
    const section = screen.getByRole('region', { name: /demo/i });
    expect(section).toBeInTheDocument();
  });

  it('renders demo title', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/try it out/i);
  });

  it('renders interactive demo with UI elements', () => {
    render(<InteractiveDemo />);
    // Demo should render some UI-only interactive elements
    const demoContainer = screen.getByTestId('demo-container');
    expect(demoContainer).toBeInTheDocument();
  });

  it('has accessible semantic structure', () => {
    render(<InteractiveDemo />);
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('renders descriptive text about the demo', () => {
    render(<InteractiveDemo />);
    const description = screen.getByText(/see how/i);
    expect(description).toBeInTheDocument();
  });
});
