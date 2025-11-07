/**
 * InteractiveDemo Component - Mock interactive demo for landing page
 *
 * Renders a UI-only interactive demo showcasing D&D Tracker features.
 * This is a mock implementation with no backend calls.
 */
export function InteractiveDemo() {
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

        <div
          data-testid="demo-container"
          className="bg-slate-50 rounded-lg p-8 md:p-12 border border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo UI - Combat Tracker Mock */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 mb-4">Combat Tracking</h3>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded border border-slate-300">
                  <div className="text-sm font-medium text-slate-900">
                    Round 1
                  </div>
                  <div className="text-xs text-slate-600">Initiative order</div>
                </div>
                <div className="p-3 bg-blue-50 rounded border-2 border-blue-400">
                  <div className="text-sm font-medium text-blue-900">
                    Player: 18
                  </div>
                  <div className="text-xs text-blue-700">Current turn</div>
                </div>
                <div className="p-3 bg-white rounded border border-slate-300">
                  <div className="text-sm font-medium text-slate-900">
                    Enemy: 12
                  </div>
                  <div className="text-xs text-slate-600">Next turn</div>
                </div>
              </div>
            </div>

            {/* Demo UI - Character Sheet Mock */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 mb-4">Character Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
                  <span className="text-sm font-medium text-slate-700">
                    HP
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    28 / 32
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
                  <span className="text-sm font-medium text-slate-700">
                    AC
                  </span>
                  <span className="text-sm font-bold text-slate-900">16</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-300">
                  <span className="text-sm font-medium text-slate-700">
                    Speed
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    30 ft
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-300 text-center">
            <p className="text-slate-600 text-sm mb-4">
              This is a simplified preview. Full app includes much more!
            </p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Explore Full Features
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
