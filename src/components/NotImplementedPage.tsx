import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_FEATURE_NAME = 'this page'
const DEFAULT_DESCRIPTION =
  "We're still building out this experience. In the meantime, you can follow along with the roadmap or request early access."
const DEFAULT_CTA_LABEL = 'Request this feature'
const DEFAULT_CTA_URL =
  'https://github.com/dougis-org/dnd-tracker/issues/new/choose'

export interface NotImplementedPageProps {
  /**
   * Optional label for the feature or page that is not yet available.
   */
  featureName?: string
  /**
   * Override the default descriptive copy.
   */
  description?: string
  /**
   * URL the primary call-to-action should link to (defaults to GitHub issues).
   */
  ctaHref?: string
  /**
   * Override the CTA label (defaults to "Request this feature").
   */
  ctaLabel?: string
  /**
   * Additional class names to append to the wrapper.
   */
  className?: string
}

export function NotImplementedPage({
  featureName,
  description,
  ctaHref,
  ctaLabel,
  className,
}: NotImplementedPageProps) {
  const resolvedFeature = featureName ?? DEFAULT_FEATURE_NAME
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const resolvedCtaLabel = ctaLabel ?? DEFAULT_CTA_LABEL
  const resolvedCtaHref = ctaHref ?? DEFAULT_CTA_URL

  return ( // role=status ensures assistive tech announces updates when the page renders
    <section
      role="status"
      aria-live="polite"
      className={cn(
        'mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center',
        className
      )}
    >
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          On the roadmap
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {resolvedFeature === DEFAULT_FEATURE_NAME
            ? 'This page is on the roadmap'
            : `${resolvedFeature} is on the roadmap`}
        </h1>
        <p className="text-muted-foreground">{resolvedDescription}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={resolvedCtaHref} target="_blank" rel="noreferrer noopener">
            {resolvedCtaLabel}
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Return to home</Link>
        </Button>
      </div>
    </section>
  )
}
