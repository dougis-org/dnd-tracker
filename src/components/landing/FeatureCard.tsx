import { LucideIcon, Users, Zap, Swords, UsersRound, MapPin, Package } from 'lucide-react';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

// Icon mapping for string icon names to Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  users: Users,
  zap: Zap,
  swords: Swords,
  'users-round': UsersRound,
  'map-pin': MapPin,
  package: Package,
};

/**
 * FeatureCard Component - Card displaying a single feature
 *
 * Renders a feature card with icon, title, and description.
 * Includes accessibility labels and semantic markup.
 */
export function FeatureCard({ title, description, icon = 'Zap' }: FeatureCardProps) {
  const IconComponent = iconMap[icon] || Zap;

  return (
    <article
      role="article"
      aria-label={title}
      className="p-6 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white"
    >
      <div className="flex flex-col gap-4">
        {/* Icon */}
        <div className="inline-flex">
          <IconComponent className="w-8 h-8 text-blue-600" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

        {/* Description */}
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </article>
  );
}
