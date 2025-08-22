'use client'

import { useWelcome } from '@/hooks/useWelcome'

export function Welcome() {
  const { message } = useWelcome()
  
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">{message.title}</h2>
      <p className="text-gray-600">{message.description}</p>
    </div>
  )
}