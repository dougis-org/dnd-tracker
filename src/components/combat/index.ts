/**
 * Combat components barrel export
 * Feature 009: Combat Tracker Page
 */

// Core components (Phase 3 implemented)
export { default as CombatTracker } from './CombatTracker';
export { default as InitiativeOrder } from './InitiativeOrder';
export { default as RoundTurnCounter } from './RoundTurnCounter';
export { default as ParticipantStatusBadges } from './ParticipantStatusBadges';

// Phase 4 components (turn advancement - implemented)
export { default as TurnControlButtons } from './TurnControlButtons';

// Phase 5 components (HP tracking - implemented)
export { default as HPTracker } from './HPTracker';
export { default as HPBar } from './HPBar';

// Phase 6 components (status effects - implemented)
export { default as StatusEffectsPanel } from './StatusEffectsPanel';
export { default as StatusEffectMenu } from './StatusEffectMenu';
export { default as StatusEffectPill } from './StatusEffectPill';

// Planned components (to be implemented in Phase 7-10)
// export { default as CombatLog } from './CombatLog';
// export { default as CombatLogEntry } from './CombatLogEntry';
// export { default as LairActionNotification } from './LairActionNotification';

// Error boundary (implemented)
export { default as ErrorBoundary } from './ErrorBoundary';
