/**
 * Dashboard Header Component
 * Displays personalized welcome message for authenticated user
 * Constitutional: Max 50 lines per function
 */

interface DashboardHeaderProps {
  displayName: string;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const userName = displayName || 'Dungeon Master';

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {userName}. Ready for your next adventure?
      </p>
    </div>
  );
}
