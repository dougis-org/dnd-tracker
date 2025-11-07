import { render, screen } from '@testing-library/react';
import { Testimonials } from '@/components/landing/Testimonials';
import testimonialsData from '@/app/(landing)/data/testimonials.json';

describe('Testimonials Component', () => {
  it('renders testimonials section', () => {
    render(<Testimonials data={testimonialsData} />);
    const section = screen.getByRole('region', { name: /testimonials/i });
    expect(section).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<Testimonials data={testimonialsData} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBeTruthy();
  });

  it('renders all testimonials', () => {
    render(<Testimonials data={testimonialsData} />);
    testimonialsData.forEach((testimonial) => {
      expect(screen.getByText(testimonial.author)).toBeInTheDocument();
      expect(
        screen.getByText((text) =>
          text.includes(testimonial.text.substring(0, 20))
        )
      ).toBeInTheDocument();
    });
  });

  it('renders testimonial author names', () => {
    render(<Testimonials data={testimonialsData} />);
    testimonialsData.forEach((testimonial) => {
      expect(screen.getByText(testimonial.author)).toBeInTheDocument();
    });
  });

  it('renders testimonial titles when provided', () => {
    render(<Testimonials data={testimonialsData} />);
    testimonialsData.forEach((testimonial) => {
      if (testimonial.title) {
        expect(screen.getByText(testimonial.title)).toBeInTheDocument();
      }
    });
  });

  it('renders star ratings', () => {
    render(<Testimonials data={testimonialsData} />);
    // Verify each testimonial has the correct number of stars
    testimonialsData.forEach((testimonial) => {
      const card = screen.getByTestId(`testimonial-${testimonial.id}`);
      const starCount = Array.from(card.querySelectorAll('span')).filter(
        (span) => span.textContent === '★'
      ).length;
      expect(starCount).toBe(testimonial.rating || 5);
    });
  });

  it('has accessible semantic structure', () => {
    render(<Testimonials data={testimonialsData} />);
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });
});
