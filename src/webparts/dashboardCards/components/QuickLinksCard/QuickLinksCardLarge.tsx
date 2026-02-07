// ============================================
// QuickLinksCardLarge - Large card with category groups
// Displays quick links organized by category
// Supports both API and test data modes
// ============================================

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  tokens,
  makeStyles,
  Text,
  Button,
  Tooltip,
  Spinner,
  Badge,
} from '@fluentui/react-components';
import {
  LinkMultiple24Regular,
  ArrowClockwise20Regular,
  
  Globe16Regular,
  Mail24Regular,
  PeopleTeam24Regular,
  Cloud24Regular,
  ShareAndroid24Regular,
  CalendarLtr24Regular,
  Notebook24Regular,
  Link24Regular,
  BookOpen24Regular,
  QuestionCircle24Regular,
  People24Regular,
  Bookmark24Regular,
  Folder24Regular,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  QuickLinksData,
  IQuickLinksSettings,
  DEFAULT_QUICK_LINKS_SETTINGS,
  sortCategories,
} from '../../models/QuickLinks';
import { DataMode } from '../../services/testData';
import { getTestQuickLinksData } from '../../services/testData/quickLinks';
import { QuickLinksService } from '../../services/QuickLinksService';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState } from '../shared';
import { CardSize } from '../../types/CardSize';
import { useCardStyles } from '../cardStyles';

// ============================================
// Types
// ============================================

export interface QuickLinksCardLargeProps {
  /** WebPart context */
  context: WebPartContext;
  /** Graph client for API calls */
  graphClient?: MSGraphClientV3;
  /** Data mode - 'api' for real data, 'test' for mock data */
  dataMode?: DataMode;
  /** Card settings */
  settings?: IQuickLinksSettings;
  /** Card title */
  title?: string;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useQuickLinksLargeStyles = makeStyles({
  // Container for categories
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  // Category section
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  // Category header
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingBottom: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  categoryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '14px',
  },
  categoryTitle: {
    flex: 1,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  categoryCount: {
    marginLeft: 'auto',
  },
  // Horizontal scrollable link row per category
  linkRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalL,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: tokens.spacingVerticalS,
    scrollbarWidth: 'thin',
    '::-webkit-scrollbar': {
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: tokens.colorNeutralBackground2,
      borderRadius: tokens.borderRadiusSmall,
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralStroke1,
      borderRadius: tokens.borderRadiusSmall,
    },
  },
  // Individual link item - larger for full-width card
  linkItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '100px',
    maxWidth: '120px',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    transitionProperty: 'background-color, transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    flexShrink: 0,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  // Larger icon container
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
  },
  // Link title
  linkTitle: {
    textAlign: 'center' as const,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100px',
  },
  // Link description
  linkDescription: {
    textAlign: 'center' as const,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100px',
  },
  // External link indicator
  externalIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase100,
  },
});

// ============================================
// Icon Mapper Component
// ============================================

const QuickLinkIcon: React.FC<{ iconName?: string }> = ({ iconName }) => {
  switch (iconName) {
    case 'Mail':
      return <Mail24Regular />;
    case 'TeamsLogo':
      return <PeopleTeam24Regular />;
    case 'OneDrive':
      return <Cloud24Regular />;
    case 'SharepointLogo':
      return <ShareAndroid24Regular />;
    case 'PlannerLogo':
      return <CalendarLtr24Regular />;
    case 'OneNoteLogo':
      return <Notebook24Regular />;
    case 'Book':
      return <BookOpen24Regular />;
    case 'Help':
      return <QuestionCircle24Regular />;
    case 'People':
      return <People24Regular />;
    case 'Education':
      return <Bookmark24Regular />;
    case 'Globe':
      return <Globe16Regular />;
    case 'Link':
    default:
      return <Link24Regular />;
  }
};

// ============================================
// Main Component
// ============================================

export const QuickLinksCardLarge: React.FC<QuickLinksCardLargeProps> = ({
  context,
  graphClient,
  dataMode = 'api',
  settings = DEFAULT_QUICK_LINKS_SETTINGS,
  title = 'Quick Links',
  onSizeChange,
}) => {
  const styles = useCardStyles();
  const quickLinksStyles = useQuickLinksLargeStyles();

  // State
  const [data, setData] = useState<QuickLinksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Service ref
  const serviceRef = React.useRef<QuickLinksService | null>(null);

  // Initialize service
  React.useEffect(() => {
    if (graphClient && dataMode === 'api') {
      serviceRef.current = new QuickLinksService(graphClient, context, settings);
    }
  }, [graphClient, context, dataMode, settings]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (dataMode === 'test') {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData(getTestQuickLinksData());
      } else if (serviceRef.current) {
        const result = await serviceRef.current.getData();
        setData(result);
      } else if (graphClient) {
        const service = new QuickLinksService(graphClient, context, settings);
        serviceRef.current = service;
        const result = await service.getData();
        setData(result);
      } else {
        // Fall back to test data
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData(getTestQuickLinksData());
      }
    } catch (err) {
      console.error('Failed to load quick links:', err);
      setError('Failed to load links');
      // Fall back to test data on error
      try {
        setData(getTestQuickLinksData());
      } catch {
        // Ignore fallback error
      }
    } finally {
      setLoading(false);
    }
  }, [dataMode, graphClient, context, settings]);

  // Initial load
  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    void loadData();
  }, [loadData]);

  // Sorted categories
  const sortedCategories = useMemo(() => {
    if (!data?.byCategory) return [];
    const categories = Object.keys(data.byCategory);
    return sortCategories(categories);
  }, [data]);

  // Check if we should show categories
  const showCategories = settings.showCategories && sortedCategories.length > 1;

  // Header actions
  const headerActions = (
    <>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={loading ? <Spinner size="tiny" /> : <ArrowClockwise20Regular />}
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Refresh links"
        />
      </Tooltip>
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </>
  );

  // Loading state
  if (loading && !data) {
    return (
      <BaseCard large loading loadingMessage="Loading links..." testId="quick-links-card-large">{null}</BaseCard>
    );
  }

  // Error state (with no fallback data)
  if (error && !data) {
    return (
      <BaseCard large error={error} testId="quick-links-card-large">{null}</BaseCard>
    );
  }

  // Empty state
  if (!data || data.links.length === 0) {
    return (
      <BaseCard large testId="quick-links-card-large">
        <CardHeader
          icon={<LinkMultiple24Regular />}
          title={title}
          cardId="quickLinks"
          actions={headerActions}
        />
        <EmptyState
          icon={<LinkMultiple24Regular />}
          title="No links configured"
          description="Add quick links to access your favorite resources quickly"
        />
      </BaseCard>
    );
  }

  // Normal state - with or without categories
  return (
    <BaseCard large testId="quick-links-card-large">
      <CardHeader
        icon={<LinkMultiple24Regular />}
        title={title}
        cardId="quickLinks"
        badge={data.totalCount}
        actions={headerActions}
      />
      <div className={styles.cardContent}>
        {showCategories ? (
          // Grouped by category
          <div className={quickLinksStyles.container}>
            {sortedCategories.map((category) => {
              const categoryLinks = data.byCategory[category] || [];
              if (categoryLinks.length === 0) return null;

              return (
                <div key={category} className={quickLinksStyles.categorySection}>
                  <div className={quickLinksStyles.categoryHeader}>
                    <div className={quickLinksStyles.categoryIcon}>
                      <Folder24Regular />
                    </div>
                    <Text className={quickLinksStyles.categoryTitle}>{category}</Text>
                    <Badge
                      appearance="tint"
                      color="informative"
                      size="small"
                      className={quickLinksStyles.categoryCount}
                    >
                      {categoryLinks.length}
                    </Badge>
                  </div>
                  <div
                    className={quickLinksStyles.linkRow}
                    role="toolbar"
                    aria-label={`${category} links`}
                  >
                    {categoryLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={quickLinksStyles.linkItem}
                        aria-label={`${link.title} - opens in new tab`}
                      >
                        <div className={quickLinksStyles.linkIcon}>
                          <QuickLinkIcon iconName={link.icon} />
                        </div>
                        <Text className={quickLinksStyles.linkTitle}>{link.title}</Text>
                        {settings.showDescriptions && link.description && (
                          <Text className={quickLinksStyles.linkDescription}>
                            {link.description}
                          </Text>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Single flat list (no categories)
          <div
            className={quickLinksStyles.linkRow}
            role="toolbar"
            aria-label="Quick links"
          >
            {data.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={quickLinksStyles.linkItem}
                aria-label={`${link.title} - opens in new tab`}
              >
                <div className={quickLinksStyles.linkIcon}>
                  <QuickLinkIcon iconName={link.icon} />
                </div>
                <Text className={quickLinksStyles.linkTitle}>{link.title}</Text>
                {settings.showDescriptions && link.description && (
                  <Text className={quickLinksStyles.linkDescription}>
                    {link.description}
                  </Text>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default QuickLinksCardLarge;
