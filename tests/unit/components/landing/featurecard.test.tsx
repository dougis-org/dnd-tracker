import { render, screen } from '@testing-library/react';
import { FeatureCard } from '@/components/landing/FeatureCard';

describe('FeatureCard Component', () => {
  const defaultProps = {
    id: 'feature-1',
    title: 'Campaign Management',
    description: 'Organize and manage multiple campaigns easily',
    icon: 'LayoutGrid',
  };

  it('renders the title', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('Campaign Management')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('Organize and manage multiple campaigns easily')).toBeInTheDocument();
  });

  it('has accessible heading structure', () => {
    render(<FeatureCard {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Campaign Management');
  });

  it('renders as an article with proper semantics', () => {
    render(<FeatureCard {...defaultProps} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('applies correct ARIA labels for screen readers', () => {
    render(<FeatureCard {...defaultProps} />);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', defaultProps.title);
  });
});
