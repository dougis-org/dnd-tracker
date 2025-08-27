import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage styling', () => {
  it('should have Tailwind or shadcn/ui styles applied', () => {
    render(<HomePage />);
    // Example: check for a Tailwind class on a heading
    const heading = screen.getByRole('heading', {
      name: /d&d combat tracker/i,
    });
    // This will fail if only default browser styles are present
    expect(heading.className).toMatch(
      /text-[2-9]xl|font-bold|tracking-tight|shadcn|tailwind/i
    );
  });
});
