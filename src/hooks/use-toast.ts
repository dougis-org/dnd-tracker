// Simple toast utility for development
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant }: ToastProps) {
  // In development, just log the toast messages
  const prefix = variant === 'destructive' ? '❌' : '✅';
  console.log(`${prefix} ${title}: ${description}`);
  
  // In production, this would trigger an actual toast notification
  // For now, we'll just use browser notifications if available
  if (typeof window !== 'undefined' && window.Notification) {
    if (Notification.permission === 'granted') {
      new Notification(title || 'DnD Tracker', {
        body: description,
        icon: variant === 'destructive' ? undefined : '/favicon.ico'
      });
    }
  }
}