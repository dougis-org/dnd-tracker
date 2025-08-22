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
})