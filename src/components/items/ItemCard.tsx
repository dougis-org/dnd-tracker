import { Item, ItemRarity } from '@/types/item'
import { cn } from '@/lib/utils'

export interface ItemCardProps {
  item: Item
  className?: string
}

const rarityStyles: Record<ItemRarity, string> = {
  [ItemRarity.Common]: 'bg-slate-100 text-slate-800 border border-slate-200',
  [ItemRarity.Uncommon]: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  [ItemRarity.Rare]: 'bg-sky-100 text-sky-800 border border-sky-200',
  [ItemRarity.VeryRare]: 'bg-purple-100 text-purple-800 border border-purple-200',
  [ItemRarity.Legendary]: 'bg-amber-100 text-amber-900 border border-amber-200',
  [ItemRarity.Artifact]: 'bg-rose-100 text-rose-800 border border-rose-200',
}

function formatWeight(weight?: number | null): string {
  if (weight === null || typeof weight === 'undefined') {
    return '—'
  }
  const roundedWeight = Number.isInteger(weight) ? weight : Number(weight.toFixed(1))
  return `${roundedWeight} lb${roundedWeight === 1 ? '' : 's'}`
}

function formatProperties(properties?: string[]): string {
  if (!properties || properties.length === 0) {
    return 'No special properties'
  }

  if (properties.length === 1) {
    return properties[0]
  }

  return `${properties[0]} +${properties.length - 1} more`
}

function resolveSource(item: Item): string {
  if (!item.isSystemItem) {
    return 'User Created'
  }
  return item.source ?? 'System Catalog'
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
