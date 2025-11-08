import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/landing/Hero';

describe('Hero Component', () => {
  const defaultProps = {
    headline: 'Welcome to D&D Tracker',
    subhead: 'Manage your campaigns with ease',
    ctaText: 'Start Free',
    ctaHref: '/sign-up',
    imageUrl: '/hero.png',
    imageAlt: 'Hero banner',
  };

  it('renders the headline', () => {
    render(<Hero {...defaultProps} />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('Welcome to D&D Tracker');
  });

  it('renders the subheading', () => {
    render(<Hero {...defaultProps} />);
    expect(screen.getByText('Manage your campaigns with ease')).toBeInTheDocument();
  });

  it('renders the CTA button with correct text', () => {
    render(<Hero {...defaultProps} />);
    const button = screen.getByRole('link', { name: /Start Free/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/sign-up');
  });

  it('renders the hero image with alt text', () => {
    render(<Hero {...defaultProps} />);
    const image = screen.getByAltText('Hero banner');
    expect(image).toBeInTheDocument();
  });

  it('has accessible semantic structure', () => {
    render(<Hero {...defaultProps} />);
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });
});
