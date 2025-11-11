import React, { ReactNode } from 'react';

interface CombatLayoutProps {
  children: ReactNode;
}

export default function CombatLayout({ children }: CombatLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {children}
    </div>
  );
}
