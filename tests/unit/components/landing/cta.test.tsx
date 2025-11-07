import { render, screen } from '@testing-library/react';
import { CallToAction } from '@/components/landing/CallToAction';

describe('CallToAction Component', () => {
  const defaultProps = {
    primaryText: 'Get Started',
    primaryHref: '/sign-up',
    secondaryText: 'Learn More',
    secondaryHref: '/help',
  };

  it('renders the primary CTA button', () => {
    render(<CallToAction {...defaultProps} />);
    const primaryButton = screen.getByRole('link', { name: /Get Started/i });
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', '/sign-up');
  });

  it('renders the secondary CTA button', () => {
    render(<CallToAction {...defaultProps} />);
    const secondaryButton = screen.getByRole('link', { name: /Learn More/i });
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', '/help');
  });

  it('has accessible button names', () => {
    render(<CallToAction {...defaultProps} />);
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn More/i })).toBeInTheDocument();
  });

  it('renders buttons in correct order', () => {
    render(<CallToAction {...defaultProps} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('Get Started');
    expect(links[1]).toHaveTextContent('Learn More');
  });
});
