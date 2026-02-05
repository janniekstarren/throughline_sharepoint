// ============================================
// Shared Components - Barrel Export
// ============================================

export { BaseCard } from './BaseCard';
export type { IBaseCardProps } from './BaseCard';

export { CardHeader } from './CardHeader';
export type { ICardHeaderProps, BadgeVariant } from './CardHeader';

export { EmptyState } from './EmptyState';
export type { IEmptyStateProps } from './EmptyState';

export { ErrorBoundary } from './ErrorBoundary';

export { ListItem } from './ListItem';
export type { IListItemProps, ListItemHighlight } from './ListItem';

export { MasterDetailCard } from './MasterDetailCard';
export type { IMasterDetailCardProps } from './MasterDetailCard';

// Chart components
export { TrendBarChart, DonutChart, StatsGrid, TopItemsList, ChartCarousel } from './charts';
export type {
  TrendBarChartProps,
  TrendDataPoint,
  DonutChartProps,
  DonutSegment,
  StatsGridProps,
  StatItem,
  StatColor,
  TopItemsListProps,
  TopItem,
  BadgeColor,
  ChartCarouselProps,
} from './charts';

// AI Demo Mode components
export {
  AIInsightBanner,
  AIBadge,
  AIScore,
  AIInsightChip,
  AIInsightItem,
  AIInsightsPanel,
  AIOnboardingDialog,
  AIModeHeader,
} from './AIComponents';
export type {
  IAIInsightBannerProps,
  IAIBadgeProps,
  IAIScoreProps,
  IAIInsightChipProps,
  IAIInsightItemProps,
  IAIInsightsPanelProps,
  IAIOnboardingDialogProps,
  IAIModeHeaderProps,
} from './AIComponents';
