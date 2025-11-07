/**
 * Testimonials Component - Renders testimonial cards from data
 *
 * Displays testimonials from users including author, title, rating, and text.
 * Accepts testimonial data as a prop.
 */

interface Testimonial {
  id: string;
  author: string;
  title?: string;
  text: string;
  imageUrl?: string | null;
  rating?: number;
}

interface TestimonialsProps {
  data: Testimonial[];
}

export function Testimonials({ data }: TestimonialsProps) {
  return (
    <section
      role="region"
      aria-label="Testimonials"
      className="w-full py-16 md:py-24 bg-slate-50"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by Dungeon Masters
          </h2>
          <p className="text-lg text-slate-600">
            See what other DMs think about D&D Tracker
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 bg-white rounded-lg shadow-sm border border-slate-200"
            >
              <div className="flex gap-2 mb-4">
                {Array.from({ length: testimonial.rating || 5 }).map(
                  (_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  )
                )}
              </div>
              <p className="text-slate-700 mb-4">"{testimonial.text}"</p>
              <div className="font-semibold text-slate-900">
                {testimonial.author}
              </div>
              {testimonial.title && (
                <div className="text-sm text-slate-600">
                  {testimonial.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
