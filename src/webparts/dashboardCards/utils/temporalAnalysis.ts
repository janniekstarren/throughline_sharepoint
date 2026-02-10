// ============================================
// Temporal / Baseline Analysis Utilities
// Shared utilities for Productivity Patterns cards
// ============================================

// ============================================
// Interfaces
// ============================================

export interface TemporalBaseline {
  period: 'daily' | 'weekly' | 'monthly';
  values: number[];
  mean: number;
  stdDev: number;
  percentile25: number;
  percentile75: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  direction: 'above' | 'below' | 'normal';
  zScore: number;
}

export interface TrendResult {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
}

// ============================================
// Baseline Computation
// ============================================

/**
 * Compute a statistical baseline from a set of numeric values.
 * Returns mean, standard deviation, and IQR boundaries.
 *
 * @param values - Array of numeric observations
 * @returns TemporalBaseline with computed statistics
 */
export function computeBaseline(values: number[]): TemporalBaseline {
  if (values.length === 0) {
    return { period: 'daily', values: [], mean: 0, stdDev: 0, percentile25: 0, percentile75: 0 };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const sorted = [...values].sort((a, b) => a - b);
  const p25Index = Math.floor(sorted.length * 0.25);
  const p75Index = Math.floor(sorted.length * 0.75);

  return {
    period: 'daily',
    values,
    mean: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    percentile25: sorted[p25Index] ?? 0,
    percentile75: sorted[p75Index] ?? 0,
  };
}

// ============================================
// Anomaly Detection
// ============================================

/**
 * Detect whether a value is anomalous relative to its baseline.
 * Uses z-score against a configurable sensitivity multiplier (default 2.0).
 *
 * @param currentValue - The value to test
 * @param baseline - Pre-computed baseline statistics
 * @param sensitivityMultiplier - Number of standard deviations for threshold (default 2.0)
 * @returns AnomalyResult with direction and z-score
 */
export function detectAnomaly(
  currentValue: number,
  baseline: TemporalBaseline,
  sensitivityMultiplier: number = 2.0
): AnomalyResult {
  if (baseline.stdDev === 0) {
    return { isAnomaly: false, direction: 'normal', zScore: 0 };
  }

  const zScore = (currentValue - baseline.mean) / baseline.stdDev;
  const isAnomaly = Math.abs(zScore) >= sensitivityMultiplier;

  const direction: AnomalyResult['direction'] = zScore >= sensitivityMultiplier
    ? 'above'
    : zScore <= -sensitivityMultiplier
      ? 'below'
      : 'normal';

  return { isAnomaly, direction, zScore: Math.round(zScore * 10) / 10 };
}

// ============================================
// Trend Computation (Linear Regression)
// ============================================

/**
 * Compute a linear trend over a series of date/value pairs.
 * Uses ordinary least-squares regression and returns direction,
 * slope, and an R-squared confidence measure.
 *
 * @param values - Array of { date, value } observations (sorted by date)
 * @param _windowDays - Reserved for future windowed analysis
 * @returns TrendResult with direction, slope, and confidence
 */
export function computeTrend(
  values: { date: Date; value: number }[],
  _windowDays: number = 7
): TrendResult {
  if (values.length < 2) {
    return { direction: 'stable', slope: 0, confidence: 0 };
  }

  // Simple linear regression
  const n = values.length;
  const xValues = values.map((_, i) => i);
  const yValues = values.map(v => v.value);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // R-squared for confidence
  const meanY = sumY / n;
  const ssRes = yValues.reduce(
    (sum, y, i) => sum + Math.pow(y - (meanY + slope * (xValues[i] - sumX / n)), 2),
    0
  );
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  const direction: TrendResult['direction'] =
    slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';

  return {
    direction,
    slope: Math.round(slope * 100) / 100,
    confidence: Math.round(Math.max(0, Math.min(1, rSquared)) * 100) / 100,
  };
}

// ============================================
// Working Hours Helpers
// ============================================

/**
 * Get default working hours boundaries.
 *
 * @param _timezone - Reserved for future timezone-aware logic
 * @returns Object with start and end hours (24-hour clock)
 */
export function getWorkingHours(_timezone?: string): { start: number; end: number } {
  return { start: 9, end: 17 };
}

/**
 * Determine whether a timestamp falls outside working hours.
 * Weekends (Saturday/Sunday) are always considered after-hours.
 *
 * @param timestamp - The Date to evaluate
 * @param workingHours - Optional custom working hours (defaults to 09:00-17:00)
 * @returns true if the timestamp is outside working hours
 */
export function isAfterHours(
  timestamp: Date,
  workingHours?: { start: number; end: number }
): boolean {
  const hours = workingHours ?? getWorkingHours();
  const hour = timestamp.getHours();
  const day = timestamp.getDay();

  // Weekend
  if (day === 0 || day === 6) return true;

  // Before or after working hours
  return hour < hours.start || hour >= hours.end;
}
