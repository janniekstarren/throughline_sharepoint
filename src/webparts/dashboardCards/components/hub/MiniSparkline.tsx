/**
 * MiniSparkline - Pure SVG sparkline component
 *
 * Renders a compact polyline sparkline with gradient fill below.
 * Used in HubMetricTiles for trend visualisation. Fully memoized.
 *
 * Props:
 * - data: number[] — data points (at least 2)
 * - width: number — SVG width (default 60)
 * - height: number — SVG height (default 24)
 * - color: string — line/fill colour (CSS colour string)
 */

import * as React from 'react';

export interface IMiniSparklineProps {
  /** Array of numeric data points (at least 2) */
  data: number[];
  /** SVG width in pixels */
  width?: number;
  /** SVG height in pixels */
  height?: number;
  /** Line and fill colour */
  color: string;
}

/**
 * Normalise data points to SVG viewBox coordinates.
 * Returns an array of [x, y] pairs.
 */
function normalisePoints(
  data: number[],
  width: number,
  height: number,
  padding: number = 2
): [number, number][] {
  if (data.length < 2) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;
  const stepX = drawWidth / (data.length - 1);

  return data.map((value, index) => [
    padding + index * stepX,
    padding + drawHeight - ((value - min) / range) * drawHeight,
  ]);
}

export const MiniSparkline: React.FC<IMiniSparklineProps> = React.memo(({
  data,
  width = 60,
  height = 24,
  color,
}) => {
  if (!data || data.length < 2) return null;

  const gradientId = React.useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const points = normalisePoints(data, width, height);
  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(' ');

  // Polygon points: line points + bottom-right + bottom-left (for filled area)
  const polygonPoints = [
    ...points.map(([x, y]) => `${x},${y}`),
    `${points[points.length - 1][0]},${height}`,
    `${points[0][0]},${height}`,
  ].join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Gradient fill area */}
      <polygon
        points={polygonPoints}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

MiniSparkline.displayName = 'MiniSparkline';
