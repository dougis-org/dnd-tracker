'use client';

import { useState } from 'react';

type DemoView = 'combat' | 'character';

/**
 * InteractiveDemo Component - Interactive demo showcasing D&D Tracker features
 *
 * Allows users to switch between combat and character views.
 * Demonstrates key features through interactive UI controls.
 */
export function InteractiveDemo() {
  const [activeView, setActiveView] = useState<DemoView>('combat');

  return (
    <section
      role="region"
      aria-label="Interactive Demo"
      className="w-full py-16 md:py-24 bg-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Try It Out
          </h2>
          <p className="text-lg text-slate-600">
            See how D&D Tracker makes campaign management effortless
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveView('combat')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'combat'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            Combat Tracking
          </button>
          <button
            onClick={() => setActiveView('character')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'character'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            Character Stats
          </button>
        </div>

        {/* Demo Container */}
        <div
          data-testid="demo-container"
          className="bg-slate-50 rounded-lg p-8 md:p-12 border border-slate-200"
        >
          {activeView === 'combat' && <CombatDemo />}
          {activeView === 'character' && <CharacterDemo />}
        </div>
      </div>
    </section>
  );
}

function CombatDemo() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 mb-4">Combat Tracking</h3>
      <div className="space-y-2">
        <div className="p-3 bg-white rounded border border-slate-300">
          <div className="text-sm font-medium text-slate-900">Round 1</div>
          <div className="text-xs text-slate-600">Initiative order</div>
        </div>
        <div className="p-3 bg-blue-50 rounded border-2 border-blue-400">
          <div className="text-sm font-medium text-blue-900">Player: 18</div>
          <div className="text-xs text-blue-700">Current turn</div>
        </div>
        <div className="p-3 bg-white rounded border border-slate-300">
          <div className="text-sm font-medium text-slate-900">Enemy: 12</div>
          <div className="text-xs text-slate-600">Next turn</div>
        </div>
      </div>
    </div>
  );
}

function CharacterDemo() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 mb-4">Character Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
          <span className="text-sm font-medium text-slate-700">HP</span>
          <span className="text-sm font-bold text-green-600">28 / 32</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
          <span className="text-sm font-medium text-slate-700">AC</span>
          <span className="text-sm font-bold text-slate-900">16</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
          <span className="text-sm font-medium text-slate-700">Speed</span>
          <span className="text-sm font-bold text-slate-900">30 ft</span>
        </div>
      </div>
    </div>
  );
}
