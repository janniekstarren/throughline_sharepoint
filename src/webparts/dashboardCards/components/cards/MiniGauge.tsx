// ============================================
// MiniGauge - SVG Semicircular Arc Gauge
// ============================================
// Renders a compact semicircular gauge with colour zones
// based on thresholds (green/amber/red).
// Used in SmallCard hero area for gauge-type data viz hints.

import * as React from 'react';
import { tokens } from '@fluentui/react-components';

// ============================================
// Props
// ============================================

export interface IMiniGaugeProps {
  /** Current value (0-100) */
  value: number;
  /** Threshold where colour changes to warning (amber) */
  warningThreshold?: number;
  /** Threshold where colour changes to critical (red) */
  criticalThreshold?: number;
  /** SVG size in pixels (width = size, height = size/2 + padding) */
  size?: number;
}

// ============================================
// Component
// ============================================

export const MiniGauge: React.FC<IMiniGaugeProps> = React.memo(({
  value,
  warningThreshold = 60,
  criticalThreshold = 80,
  size = 48,
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Determine colour based on thresholds
  let color: string;
  if (clampedValue >= criticalThreshold) {
    color = tokens.colorPaletteRedForeground1;
  } else if (clampedValue >= warningThreshold) {
    color = tokens.colorPaletteYellowForeground1;
  } else {
    color = tokens.colorPaletteGreenForeground1;
  }

  // Arc geometry
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 4; // 4px padding
  const strokeWidth = 4;

  // Semicircle: from 180° to 0° (left to right)
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°
  const sweepAngle = startAngle - (startAngle - endAngle) * (clampedValue / 100);

  // Background arc (full semicircle)
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy - radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);

  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 0 1 ${bgX2} ${bgY2}`;

  // Value arc
  const valX2 = cx + radius * Math.cos(sweepAngle);
  const valY2 = cy - radius * Math.sin(sweepAngle);
  const largeArc = clampedValue > 50 ? 1 : 0;
  const valPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${largeArc} 1 ${valX2} ${valY2}`;

  return (
    <svg
      width={size}
      height={Math.ceil(size / 2) + 4}
      viewBox={`0 0 ${size} ${Math.ceil(size / 2) + 4}`}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke={tokens.colorNeutralStroke2}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Value arc */}
      {clampedValue > 0 && (
        <path
          d={valPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
});

MiniGauge.displayName = 'MiniGauge';
