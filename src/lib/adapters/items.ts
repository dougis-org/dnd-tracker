import { Item } from '@/types/item'
import { itemSchema } from '@/lib/schemas/item.schema'
import { sampleItems } from '@/lib/mocks/sampleItems'
import { v4 as uuidv4 } from 'uuid'

const items: Item[] = [...sampleItems]

export const itemAdapter = {
  findAll: async (): Promise<Item[]> => {
    return items
  },
  findById: async (id: string): Promise<Item | undefined> => {
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
    return validatedItem
  },
  delete: async (id: string): Promise<boolean> => {
    const itemIndex = items.findIndex((item) => item.id === id)
    if (itemIndex === -1 || items[itemIndex].isSystemItem) {
      return false
    }
    items.splice(itemIndex, 1)
    return true
  },
}
