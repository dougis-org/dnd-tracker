import { Item } from '@/types/item'
import { itemSchema } from '@/lib/schemas/item.schema'
import { sampleItems } from '@/lib/mocks/sampleItems'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'dnd-tracker-items'

const getStoredItems = (): Item[] => {
  if (typeof window === 'undefined') return [...sampleItems]
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : [...sampleItems]
  } catch {
    return [...sampleItems]
  }
}

const persistItems = (items: Item[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    console.warn('Failed to persist items to localStorage')
  }
}

// Let is necessary since this is reassigned when items are modified
let items: Item[] = getStoredItems()

export const itemAdapter = {
  findAll: async (): Promise<Item[]> => {
    items = getStoredItems()
    return items
  },
  findById: async (id: string): Promise<Item | undefined> => {
    items = getStoredItems()
    return items.find((item) => item.id === id)
  },
  create: async (itemData: Omit<Item, 'id' | 'isSystemItem'>): Promise<Item> => {
    const newItem: Item = {
      ...itemData,
      id: uuidv4(),
      isSystemItem: false,
    }
    const validatedItem = itemSchema.parse(newItem)
    items.push(validatedItem)
    persistItems(items)
    return validatedItem
  },
  update: async (
    id: string,
    itemData: Partial<Omit<Item, 'id' | 'isSystemItem'>>
  ): Promise<Item | undefined> => {
    const itemIndex = items.findIndex((item) => item.id === id)
    if (itemIndex === -1 || items[itemIndex].isSystemItem) {
      return undefined
    }
    const updatedItem = { ...items[itemIndex], ...itemData }
    const validatedItem = itemSchema.parse(updatedItem)
    items[itemIndex] = validatedItem
    persistItems(items)
    return validatedItem
  },
  delete: async (id: string): Promise<boolean> => {
    const itemIndex = items.findIndex((item) => item.id === id)
    if (itemIndex === -1 || items[itemIndex].isSystemItem) {
      return false
    }
    items.splice(itemIndex, 1)
    persistItems(items)
    return true
  },
}
