import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage styling', () => {
  it('should have Tailwind or shadcn/ui styles applied', () => {
    render(<HomePage />);
    // Check for specific Tailwind classes that should be applied to the heading
    const heading = screen.getByRole('heading', {
      name: /d&d combat tracker/i,
    });
    // Verify specific classes are present - this ensures Tailwind CSS is working
    expect(heading.className).toContain('text-4xl');
    expect(heading.className).toContain('font-bold');
    expect(heading.className).toContain('tracking-tight');
  });
});
