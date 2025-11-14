import { Item } from '@/types/item'
import { cn } from '@/lib/utils'
import { rarityStyles, formatWeight, formatProperties, resolveSource } from '@/lib/utils/item-formatting'

export interface ItemCardProps {
  item: Item
  className?: string
}

export function ItemCard({ item, className }: ItemCardProps) {
  const rarityClassName = rarityStyles[item.rarity]

  return (
    <article
      className={cn(
        'flex h-full flex-col justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      aria-labelledby={`item-${item.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 id={`item-${item.id}`} className="text-lg font-semibold">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>
        <span
          className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', rarityClassName)}
          aria-label={`Rarity ${item.rarity}`}
        >
          {item.rarity}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{item.description}</p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Weight</dt>
          <dd className="font-medium" data-testid="item-weight">
            {formatWeight(item.weight)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cost</dt>
          <dd className="font-medium" data-testid="item-cost">
            {item.cost ?? '—'}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Properties</dt>
          <dd className="font-medium" data-testid="item-properties">
            {formatProperties(item.properties)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="font-medium" data-testid="item-source">
            {resolveSource(item)}
          </dd>
        </div>
      </dl>

      {item.requiresAttunement ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700" aria-label="Requires Attunement">
          REQUIRES ATTUNEMENT
        </p>
      ) : null}
    </article>
  )
}
