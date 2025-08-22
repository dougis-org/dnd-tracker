import { renderHook } from '@testing-library/react'
import { useWelcome } from '../useWelcome'

describe('useWelcome Hook', () => {
  it('returns the correct welcome message', () => {
    const { result } = renderHook(() => useWelcome())
    
    expect(result.current.message).toEqual({
      title: 'Welcome to D&D Combat Tracker',
      description: 'Manage your D&D 5e encounters with ease'
    })
  })

  it('message has required properties', () => {
    const { result } = renderHook(() => useWelcome())
    
    expect(result.current.message).toHaveProperty('title')
    expect(result.current.message).toHaveProperty('description')
    expect(typeof result.current.message.title).toBe('string')
    expect(typeof result.current.message.description).toBe('string')
  })

  it('message title is not empty', () => {
    const { result } = renderHook(() => useWelcome())
    
    expect(result.current.message.title.length).toBeGreaterThan(0)
    expect(result.current.message.description.length).toBeGreaterThan(0)
  })
})