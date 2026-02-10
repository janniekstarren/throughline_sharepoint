// ============================================
// Utils Barrel Export
// ============================================

export {
  detectQuestion,
  detectActionRequest,
  detectDeadline,
  detectMention,
  stripHtml,
  extractPreview,
  calculateUrgencyScore,
  analyzeText,
  type TextAnalysisResult
} from './textAnalysis';

export {
  removeItemFromGroups,
  updateItemInGroups,
  snoozeItemInGroups,
  unsnoozeItemInGroups,
  countTotalItems,
  countSnoozedItems,
  dismissFromGroupedData,
  snoozeInGroupedData,
  unsnoozeInGroupedData,
  type GroupedData
} from './groupedDataUpdater';

export {
  getSmartLabel,
  isValidLabelKey,
  type LabelKey
} from './labelUtils';

export {
  computeBaseline,
  detectAnomaly,
  computeTrend,
  getWorkingHours,
  isAfterHours,
  type TemporalBaseline,
  type AnomalyResult,
  type TrendResult
} from './temporalAnalysis';

export {
  analyseCalendarDay,
  findFreeBlocks,
  computeFragmentationScore,
  type TimeBlock,
  type CalendarEvent,
  type CalendarDayAnalysis
} from './calendarAnalysis';
