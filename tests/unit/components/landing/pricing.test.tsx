import { render, screen } from '@testing-library/react';
import { PricingTable } from '@/components/landing/PricingTable';
import pricingData from '@/app/(landing)/data/pricing.json';

describe('PricingTable Component', () => {
  it('renders pricing section', () => {
    render(<PricingTable data={pricingData} />);
    const section = screen.getByRole('region', { name: /pricing/i });
    expect(section).toBeInTheDocument();
  });

  it('renders all pricing tiers', () => {
    render(<PricingTable data={pricingData} />);
    pricingData.forEach((tier) => {
      expect(screen.getByText(tier.name)).toBeInTheDocument();
    });
  });

  it('renders pricing for each tier', () => {
    render(<PricingTable data={pricingData} />);
    pricingData.forEach((tier) => {
      expect(screen.getByText(tier.priceMonthly)).toBeInTheDocument();
    });
  });

  it('renders features for each tier', () => {
    render(<PricingTable data={pricingData} />);
    pricingData.forEach((tier) => {
      tier.features.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  it('renders CTA buttons for each tier', () => {
    render(<PricingTable data={pricingData} />);
    const links = screen.getAllByRole('link', { name: /get started/i });
    expect(links).toHaveLength(pricingData.length);
  });

  it('has accessible semantic structure', () => {
    render(<PricingTable data={pricingData} />);
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });
});
