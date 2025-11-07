import Link from 'next/link';

interface CallToActionProps {
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
}

/**
 * CallToAction Component - CTA button group
 *
 * Renders a pair of primary and secondary call-to-action buttons.
 * Typically used at the end of landing page sections.
 */
export function CallToAction({
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: CallToActionProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* Primary CTA Button */}
      <Link
        href={primaryHref}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-block"
      >
        {primaryText}
      </Link>

      {/* Secondary CTA Button */}
      <Link
        href={secondaryHref}
        className="px-8 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors inline-block"
      >
        {secondaryText}
      </Link>
    </div>
  );
}
