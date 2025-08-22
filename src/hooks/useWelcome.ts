import { WelcomeMessage } from '@/types/welcome'

export function useWelcome() {
  const message: WelcomeMessage = {
    title: 'Welcome to D&D Combat Tracker',
    description: 'Manage your D&D 5e encounters with ease'
  }
  
  return { message }
}