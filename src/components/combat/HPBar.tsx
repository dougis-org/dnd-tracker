import React from 'react';

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  temporaryHP?: number;
}

const HPBar: React.FC<HPBarProps> = ({ currentHP, maxHP, temporaryHP = 0 }) => {
  // Ensure HP doesn't exceed maxHP or go below 0 for calculation
  const actualHP = Math.max(0, Math.min(currentHP, maxHP));
  const percentage = (actualHP / maxHP) * 100;
  const widthPercentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places

  // Determine color based on percentage
  let barColor = 'bg-green-500';
  if (percentage <= 0) {
    barColor = 'bg-red-600';
  } else if (percentage < 25) {
    barColor = 'bg-red-500';
  } else if (percentage < 50) {
    barColor = 'bg-yellow-500';
  }

  const ariaLabel = `Health: ${currentHP}/${maxHP}${temporaryHP > 0 ? `, Temp HP: ${temporaryHP}` : ''}`;

  return (
    <div className="space-y-1">
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-300">
        <div
          data-testid="hp-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={maxHP}
          aria-valuenow={actualHP}
          aria-label={ariaLabel}
          className={`h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(widthPercentage, 100)}%` }}
        >
          {percentage > 10 && Math.round(percentage)}%
        </div>
      </div>

      {temporaryHP > 0 && (
        <p className="text-xs text-blue-600 font-medium">
          Temp HP: <span className="font-semibold">{temporaryHP}</span>
        </p>
      )}
    </div>
  );
};

export default HPBar;
