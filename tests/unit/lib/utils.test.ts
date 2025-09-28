import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(cn(null, undefined, 'class1')).toBe('class1')
    })

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('should handle objects', () => {
      expect(cn({ class1: true, class2: false })).toBe('class1')
    })
  })
})